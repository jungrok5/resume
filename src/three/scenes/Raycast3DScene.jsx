import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const M = 24 // forward-cone sample rays (main agent만 시각화)
const RAY_LEN = 3.4
const SPEED = 2.1
const NA = 3 // agents — 0번이 메인(레이 표시), 나머지는 상호 회피 시연

// Scene 12 — 3D 비행 내비게이션 (실제 조향 시뮬레이션).
// 기체는 경로를 재생하는 게 아니라 매 프레임 조향해서 난다:
//  · 장애물 회피 = 컨텍스트 스티어링 — 전방 원뿔 레이를 샘플링해 막힌
//    방향(danger)을 밀어내고 목표 방향(interest)으로 트는 방식. 레이
//    히트는 구 장애물과 실제로 교차 검사한다(붉은 레이 = 실측 히트).
//  · 에이전트 간 회피 = ORCA식 상호 회피 — 가까워지면 서로 절반씩 양보.
export default function Raycast3DScene({ index, total }) {
  const g = useRef()
  const agentRefs = useRef([])

  const world = useMemo(() => {
    const obstacles = [
      [-2.4, 1.4, 3.2], [1.2, 2.0, 2.0], [2.6, 0.9, 0.2], [-1.0, 2.4, -0.6],
      [0.4, 1.1, -1.8], [-2.6, 1.0, -2.6], [2.2, 2.2, -3.4], [-0.6, 0.6, -4.6],
      [1.6, 1.6, 4.4], [-3.0, 2.0, 0.8],
    ].map(([x, y, z]) => ({ c: new THREE.Vector3(x, y, z), r: 0.85 }))

    // 장애물 밭을 계속 누비도록 순환하는 목표 지점들
    const goals = [
      new THREE.Vector3(-4.4, 1.2, 4.8),
      new THREE.Vector3(2.8, 2.3, 3.2),
      new THREE.Vector3(-3.0, 0.9, 0.4),
      new THREE.Vector3(3.4, 1.3, -1.8),
      new THREE.Vector3(-1.8, 2.5, -4.8),
      new THREE.Vector3(2.2, 1.0, -5.0),
    ]

    // 진행 방향 기준 원뿔(구면 캡) 방향 샘플 — 골든앵글 분포
    const cap = THREE.MathUtils.degToRad(30)
    const ga = Math.PI * (3 - Math.sqrt(5))
    const dirs = []
    for (let i = 0; i < M; i++) {
      const tt = (i + 0.5) / M
      const phi = Math.acos(1 - tt * (1 - Math.cos(cap)))
      const th = i * ga
      dirs.push(new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)))
    }

    const agents = Array.from({ length: NA }, (_, j) => ({
      pos: goals[(j * 2) % goals.length].clone().addScalar(j * 0.3),
      vel: new THREE.Vector3(0.6, 0, -1).normalize().multiplyScalar(SPEED),
      goal: (j * 2 + 1) % goals.length,
    }))

    return { obstacles, goals, dirs, agents }
  }, [])

  const rays = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(M * 2 * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(M * 2 * 3), 3))
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  const tmp = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      z: new THREE.Vector3(0, 0, 1),
      vdir: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      steer: new THREE.Vector3(),
      dirW: new THREE.Vector3(),
      oc: new THREE.Vector3(),
      end: new THREE.Vector3(),
      away: new THREE.Vector3(),
      target: new THREE.Vector3(),
      cyan: new THREE.Color(C.cyan),
      red: new THREE.Color(C.red),
    }),
    [],
  )

  useScene(index, total, (p, active, state, dt) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const step = Math.min(dt || 0.016, 0.05)
    const fade = clamp01((p - 0.03) / 0.15)

    const posArr = rays.geometry.attributes.position.array
    const colArr = rays.geometry.attributes.color.array

    for (let j = 0; j < NA; j++) {
      const a = world.agents[j]

      // 목표 도착 시 다음 목표로 (계속 누비기)
      tmp.desired.subVectors(world.goals[a.goal], a.pos)
      if (tmp.desired.lengthSq() < 1.2) {
        a.goal = (a.goal + 1) % world.goals.length
        tmp.desired.subVectors(world.goals[a.goal], a.pos)
      }
      tmp.desired.normalize()

      // 조향 프레임 = 현재 속도 방향
      tmp.vdir.copy(a.vel).normalize()
      tmp.q.setFromUnitVectors(tmp.z, tmp.vdir)

      // 컨텍스트 스티어링: interest(목표 방향) − danger(막힌 레이 방향)
      tmp.steer.copy(tmp.desired).multiplyScalar(1.1)
      for (let i = 0; i < M; i++) {
        tmp.dirW.copy(world.dirs[i]).applyQuaternion(tmp.q)
        let minT = RAY_LEN
        let hit = false
        for (const o of world.obstacles) {
          tmp.oc.subVectors(o.c, a.pos)
          const tca = tmp.oc.dot(tmp.dirW)
          if (tca < 0) continue
          const d2 = tmp.oc.lengthSq() - tca * tca
          const r2 = o.r * o.r
          if (d2 > r2) continue
          const tHit = tca - Math.sqrt(r2 - d2)
          if (tHit > 0 && tHit < minT) { minT = tHit; hit = true }
        }
        if (hit) {
          // 막힌 방향은 가까울수록 강하게 배제 → 열린 레이 쪽으로 자연히 튼다
          tmp.steer.addScaledVector(tmp.dirW, -2.2 * (1 - minT / RAY_LEN))
        }

        if (j === 0) {
          // 메인 기체만 레이 시각화 (히트 = 실측)
          tmp.end.copy(tmp.dirW).multiplyScalar(minT).add(a.pos)
          const at = i * 6
          posArr[at] = a.pos.x; posArr[at + 1] = a.pos.y; posArr[at + 2] = a.pos.z
          posArr[at + 3] = tmp.end.x; posArr[at + 4] = tmp.end.y; posArr[at + 5] = tmp.end.z
          const col = hit ? tmp.red : tmp.cyan
          for (let k = 0; k < 2; k++) {
            colArr[at + k * 3] = col.r; colArr[at + k * 3 + 1] = col.g; colArr[at + k * 3 + 2] = col.b
          }
        }
      }

      // ORCA식 상호 회피: 가까워진 에이전트끼리 서로 절반씩 양보
      for (let k = 0; k < NA; k++) {
        if (k === j) continue
        tmp.away.subVectors(a.pos, world.agents[k].pos)
        const d = tmp.away.length()
        if (d > 0.001 && d < 2.4) {
          tmp.steer.addScaledVector(tmp.away.normalize(), (1 - d / 2.4) * 1.5)
        }
      }

      // 고도 소프트 리밋 (바닥/천장으로 새지 않게)
      if (a.pos.y < 0.7) tmp.steer.y += (0.7 - a.pos.y) * 2.5
      if (a.pos.y > 3.4) tmp.steer.y -= (a.pos.y - 3.4) * 2.5

      // 속도를 조향 방향으로 감쇠 수렴시키며 적분 — 경로 재생이 아니라 항법
      tmp.steer.normalize().multiplyScalar(SPEED)
      a.vel.lerp(tmp.steer, 1 - Math.exp(-3.4 * step))
      a.pos.addScaledVector(a.vel, step)

      const mesh = agentRefs.current[j]
      if (mesh) {
        mesh.position.copy(a.pos)
        tmp.vdir.copy(a.vel).normalize()
        mesh.quaternion.setFromUnitVectors(tmp.z, tmp.vdir)
        mesh.scale.setScalar(fade + 0.0001)
      }
    }

    rays.geometry.attributes.position.needsUpdate = true
    rays.geometry.attributes.color.needsUpdate = true
    rays.material.opacity = 0.85 * fade
  })

  const agentColors = [C.cyan, C.amber, C.violet]
  return (
    <group ref={g} position={[0, 0, 0]}>
      <primitive object={rays} />

      {Array.from({ length: NA }, (_, j) => (
        <mesh key={j} ref={(el) => (agentRefs.current[j] = el)}>
          {/* cone pre-rotated to point along +Z */}
          <coneGeometry args={[j === 0 ? 0.22 : 0.16, j === 0 ? 0.7 : 0.5, 16]} onUpdate={(geo) => geo.rotateX(Math.PI / 2)} />
          <meshStandardMaterial
            color={agentColors[j]}
            emissive={agentColors[j]}
            emissiveIntensity={j === 0 ? 1.6 : 1.1}
            roughness={0.3}
          />
        </mesh>
      ))}

      {world.obstacles.map((o, i) => (
        <mesh key={i} position={o.c}>
          <icosahedronGeometry args={[o.r, 0]} />
          <meshStandardMaterial
            color={'#20305a'}
            emissive={C.blue}
            emissiveIntensity={0.25}
            metalness={0.2}
            roughness={0.5}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}
