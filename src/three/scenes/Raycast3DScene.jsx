import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const M = 24 // forward-cone sample rays
const RAY_LEN = 3.4
const LOOP_SEC = 40 // 폐곡선 한 바퀴 시간

// Scene 12 — 3D 비행 내비게이션 (연출).
// 기체 한 대가 장애물 사이를 매끄럽게 누비는 폐곡선을 따라 난다(결정론).
// 장애물은 경로 옆에 절차적으로 배치되어 항상 스칠 듯 지나가고, 전방 원뿔
// 레이는 매 프레임 실제로 교차 검사한다 — 막힌 쪽이 붉게 물들 때 기체가
// 열린 방향으로 꺾이는 "레이로 피해가는" 모습이 부드럽게 읽힌다.
export default function Raycast3DScene({ index, total }) {
  const g = useRef()
  const agent = useRef()

  const world = useMemo(() => {
    // 장애물 밭을 좌우로 위빙하며 도는 폐곡선
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-4.0, 1.4, 4.6),
        new THREE.Vector3(-1.0, 2.2, 3.4),
        new THREE.Vector3(2.6, 1.2, 4.2),
        new THREE.Vector3(3.6, 1.9, 1.2),
        new THREE.Vector3(1.2, 2.4, -0.8),
        new THREE.Vector3(3.0, 1.0, -3.6),
        new THREE.Vector3(0.2, 1.7, -5.0),
        new THREE.Vector3(-2.8, 2.2, -3.8),
        new THREE.Vector3(-1.2, 1.0, -1.2),
        new THREE.Vector3(-3.8, 1.6, 0.8),
      ],
      true,
      'catmullrom',
      0.5,
    )

    // 장애물을 경로 접선의 법선 방향으로 좌우 번갈아 배치 —
    // 경로와의 간격이 보장되면서(뚫고 가지 않음) 레이는 자주 스친다
    const up = new THREE.Vector3(0, 1, 0)
    const obstacles = []
    for (let i = 0; i < 10; i++) {
      const u = (i + 0.5) / 10
      const pt = curve.getPoint(u)
      const tan = curve.getTangent(u)
      const nrm = new THREE.Vector3().crossVectors(tan, up).normalize()
      const side = i % 2 === 0 ? 1 : -1
      const c = pt.clone().addScaledVector(nrm, 1.5 * side)
      c.y = THREE.MathUtils.clamp(c.y + ((i % 3) - 1) * 0.35, 0.75, 2.8)
      obstacles.push({ c, r: 0.85 })
    }

    // 진행 방향 기준 원뿔(구면 캡) 레이 방향 — 골든앵글 분포
    const cap = THREE.MathUtils.degToRad(30)
    const ga = Math.PI * (3 - Math.sqrt(5))
    const dirs = []
    for (let i = 0; i < M; i++) {
      const tt = (i + 0.5) / M
      const phi = Math.acos(1 - tt * (1 - Math.cos(cap)))
      const th = i * ga
      dirs.push(new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)))
    }
    return { curve, obstacles, dirs }
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
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      z: new THREE.Vector3(0, 0, 1),
      dir: new THREE.Vector3(),
      oc: new THREE.Vector3(),
      end: new THREE.Vector3(),
      cyan: new THREE.Color(C.cyan),
      red: new THREE.Color(C.red),
    }),
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const fade = clamp01((p - 0.03) / 0.15)

    // 시간 기반 폐곡선 순항 — 매끄럽고 결정론적
    const u = (state.clock.elapsedTime / LOOP_SEC) % 1
    world.curve.getPoint(u, tmp.pos)
    world.curve.getTangent(u, tmp.tan).normalize()
    tmp.q.setFromUnitVectors(tmp.z, tmp.tan)

    const posArr = rays.geometry.attributes.position.array
    const colArr = rays.geometry.attributes.color.array

    for (let i = 0; i < M; i++) {
      tmp.dir.copy(world.dirs[i]).applyQuaternion(tmp.q)
      let minT = RAY_LEN
      let hit = false
      for (const o of world.obstacles) {
        tmp.oc.subVectors(o.c, tmp.pos)
        const tca = tmp.oc.dot(tmp.dir)
        if (tca < 0) continue
        const d2 = tmp.oc.lengthSq() - tca * tca
        const r2 = o.r * o.r
        if (d2 > r2) continue
        const tHit = tca - Math.sqrt(r2 - d2)
        if (tHit > 0 && tHit < minT) { minT = tHit; hit = true }
      }
      tmp.end.copy(tmp.dir).multiplyScalar(minT).add(tmp.pos)
      const a = i * 6
      posArr[a] = tmp.pos.x; posArr[a + 1] = tmp.pos.y; posArr[a + 2] = tmp.pos.z
      posArr[a + 3] = tmp.end.x; posArr[a + 4] = tmp.end.y; posArr[a + 5] = tmp.end.z
      const col = hit ? tmp.red : tmp.cyan
      for (let k = 0; k < 2; k++) {
        colArr[a + k * 3] = col.r; colArr[a + k * 3 + 1] = col.g; colArr[a + k * 3 + 2] = col.b
      }
    }
    rays.geometry.attributes.position.needsUpdate = true
    rays.geometry.attributes.color.needsUpdate = true
    rays.material.opacity = 0.85 * fade

    if (agent.current) {
      agent.current.position.copy(tmp.pos)
      agent.current.quaternion.copy(tmp.q)
      agent.current.scale.setScalar(fade + 0.0001)
    }
  })

  return (
    <group ref={g} position={[0, 0, 0]}>
      <primitive object={rays} />

      <mesh ref={agent}>
        {/* cone pre-rotated to point along +Z */}
        <coneGeometry args={[0.22, 0.7, 16]} onUpdate={(geo) => geo.rotateX(Math.PI / 2)} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.6} roughness={0.3} />
      </mesh>

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
