import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

// Scene — 전기 회로 로직 키트 (Miniverse UE5 하우징).
// 읽히는 서사: 두 개의 스위치가 각자 주기로 켜지고, 신호가 와이어 노드를
// 따라 '한 방향으로' 단계 전파되어 OR 램프는 어느 한쪽만 켜져도, AND 게이트
// 뒤의 도어·램프는 둘 다 켜질 때만 작동한다 — 레드스톤류 회로가 순환 없이
// 굴러가는 모습이 그대로 보인다. (전파 지연 = 노드 깊이 × 상수)
const STEP = 0.09 // 노드당 신호 전파 지연(초)

export default function CircuitKitScene({ index, total }) {
  const g = useRef()
  const wires = useRef()
  const swA = useRef()
  const swB = useRef()
  const gate = useRef()
  const lampOr = useRef()
  const lampAnd = useRef()
  const door = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const model = useMemo(() => {
    // 격자 위 폴리라인을 노드 나열로 변환
    const path = (pts, circuit, depth0 = 0) => {
      const nodes = []
      let depth = depth0
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, az] = pts[i]
        const [bx, bz] = pts[i + 1]
        const steps = Math.round(Math.max(Math.abs(bx - ax), Math.abs(bz - az)) / 0.5)
        for (let k = i === 0 ? 0 : 1; k <= steps; k++) {
          const u = k / steps
          nodes.push({ x: ax + (bx - ax) * u, z: az + (bz - az) * u, depth: depth++, circuit })
        }
      }
      return { nodes, endDepth: depth }
    }

    // 스위치 A(-5,2) → 분기점(-1,2): 위로는 OR 램프, 오른쪽은 AND 게이트로
    const wireA = path([[-4.4, 2], [-1, 2]], 'A')
    const wireAtoOr = path([[-1, 2], [-1, 3.6], [1.6, 3.6]], 'A', wireA.endDepth)
    const wireAtoAnd = path([[-1, 2], [-1, 0.6], [1.0, 0.6]], 'A', wireA.endDepth)
    // 스위치 B(-5,-1.4) → AND 게이트
    const wireB = path([[-4.4, -1.4], [1.0, -1.4], [1.0, 0.0]], 'B')
    // AND 게이트(1.0,0.6) 출력 → 램프·도어
    const andOutDepth = Math.max(wireAtoAnd.endDepth, wireB.endDepth) + 2
    const wireOut = path([[1.8, 0.6], [3.6, 0.6]], 'AND', andOutDepth)

    const nodes = [...wireA.nodes, ...wireAtoOr.nodes, ...wireAtoAnd.nodes, ...wireB.nodes, ...wireOut.nodes]
    return {
      nodes,
      orDepth: wireAtoOr.endDepth,
      andDepth: andOutDepth,
      outEnd: wireOut.endDepth,
    }
  }, [])

  const off = useMemo(() => new THREE.Color('#232c44'), [])
  const amber = useMemo(() => new THREE.Color(C.amber), [])

  // 스위치 상태(주기가 달라 AND가 켜지는 순간이 드문드문 온다)와
  // '과거 시점' 상태 조회 — 깊이만큼 지연된 신호가 곧 전파 연출이 된다
  const sA = (t) => Math.sin(t * 0.9) > -0.2
  const sB = (t) => Math.sin(t * 0.53 + 1.3) > 0.15

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01((p - 0.03) / 0.15)

    for (let i = 0; i < model.nodes.length; i++) {
      const n = model.nodes[i]
      const td = t - n.depth * STEP // 이 노드에 '도착해 있는' 신호의 발신 시점
      let powered
      if (n.circuit === 'A') powered = sA(td)
      else if (n.circuit === 'B') powered = sB(td)
      else powered = sA(td) && sB(td) // AND 출력 와이어

      dummy.position.set(n.x, 0.14, n.z)
      dummy.scale.setScalar((powered ? 0.16 : 0.11) * fade + 0.0001)
      dummy.updateMatrix()
      wires.current.setMatrixAt(i, dummy.matrix)
      tmpc.copy(powered ? amber : off)
      wires.current.setColorAt(i, tmpc)
    }
    wires.current.instanceMatrix.needsUpdate = true
    if (wires.current.instanceColor) wires.current.instanceColor.needsUpdate = true

    // 스위치·게이트·출력 기기들
    const aNow = sA(t)
    const bNow = sB(t)
    const orOn = sA(t - model.orDepth * STEP)
    const andOn = sA(t - model.andDepth * STEP) && sB(t - model.andDepth * STEP)
    const outOn = sA(t - model.outEnd * STEP) && sB(t - model.outEnd * STEP)

    if (swA.current) swA.current.material.emissiveIntensity = aNow ? 1.6 : 0.25
    if (swB.current) swB.current.material.emissiveIntensity = bNow ? 1.6 : 0.25
    if (gate.current) {
      gate.current.material.emissiveIntensity = andOn ? 1.4 : 0.3
      gate.current.rotation.y = t * 0.4
    }
    if (lampOr.current) {
      lampOr.current.material.emissiveIntensity = orOn ? 2.2 : 0.15
      lampOr.current.scale.setScalar((orOn ? 0.34 : 0.26) * fade + 0.0001)
    }
    if (lampAnd.current) {
      lampAnd.current.material.emissiveIntensity = outOn ? 2.2 : 0.15
      lampAnd.current.scale.setScalar((outOn ? 0.34 : 0.26) * fade + 0.0001)
    }
    if (door.current) {
      // 전원이 오면 도어가 옆으로 열린다 (감쇠 슬라이드)
      const target = 0.6 + (outOn ? 1.05 : 0)
      door.current.position.z = THREE.MathUtils.lerp(door.current.position.z, target, 0.08)
      door.current.material.emissiveIntensity = outOn ? 0.8 : 0.2
    }
    g.current.scale.setScalar(0.9 + 0.1 * fade)
  })

  return (
    <group ref={g} position={[0.4, 0, 0]}>
      <gridHelper args={[14, 18, '#1b2540', '#12182c']} />

      {/* 와이어 노드 (신호가 단계 전파되는 게 보이는 주인공) —
          플랫 컬러 + 톤매핑 해제로 켜진 노드가 블룸을 받아 또렷하게 빛난다 */}
      <instancedMesh ref={wires} args={[undefined, undefined, model.nodes.length]} frustumCulled={false}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* 스위치 A/B */}
      <mesh ref={swA} position={[-4.8, 0.3, 2]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color={'#12203f'} emissive={C.cyan} emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
      <mesh ref={swB} position={[-4.8, 0.3, -1.4]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color={'#12203f'} emissive={C.violet} emissiveIntensity={0.3} roughness={0.35} />
      </mesh>

      {/* AND 게이트 */}
      <mesh ref={gate} position={[1.4, 0.45, 0.6]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={'#0e1836'} emissive={C.amber} emissiveIntensity={0.3} flatShading roughness={0.3} />
      </mesh>

      {/* 출력: OR 램프(한쪽만 켜져도), AND 램프(둘 다일 때만) */}
      <mesh ref={lampOr} position={[2.1, 0.4, 3.6]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color={'#0e1a2c'} emissive={C.cyan} emissiveIntensity={0.15} roughness={0.3} />
      </mesh>
      <mesh ref={lampAnd} position={[4.2, 0.4, 0.6]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color={'#0e1a2c'} emissive={C.green} emissiveIntensity={0.15} roughness={0.3} />
      </mesh>

      {/* AND 전원으로 열리는 도어 */}
      <group position={[4.2, 0, -1.6]}>
        <mesh position={[0, 0.75, -0.65]}>
          <boxGeometry args={[0.24, 1.5, 0.3]} />
          <meshStandardMaterial color={'#1a2340'} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.75, 2.05]}>
          <boxGeometry args={[0.24, 1.5, 0.3]} />
          <meshStandardMaterial color={'#1a2340'} roughness={0.5} />
        </mesh>
        <mesh ref={door} position={[0, 0.75, 0.6]}>
          <boxGeometry args={[0.16, 1.4, 1.2]} />
          <meshStandardMaterial color={'#14305a'} emissive={C.green} emissiveIntensity={0.2} roughness={0.35} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  )
}
