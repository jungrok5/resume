import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, smoothstep, lerp } from '../lib/util'

// Scene 13 — 트릭스터M 최적화 파견: 안정 동접 2,000 → 8,000 (같은 하드웨어 4배).
// 읽히는 서사: ① 수용 한계 링(레드) 안에 유저 점들이 버글버글 포화, 바깥엔
// 대기 유저들이 링에 막혀 맴돈다 ② 최적화 펄스와 함께 링이 4배 면적으로 확장
// (레드→그린) ③ 대기 유저가 안으로 흘러들고, 옛 한계선은 잔상으로 남아
// "원래는 여기까지였다"를 대비시킨다. 안/밖 비율도 실제 수치와 같은 1:4.
export default function TricksterScene({ index, total, mobile }) {
  const g = useRef()
  const agents = useRef()
  const capRing = useRef()
  const oldRing = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const N = mobile ? 280 : 480 // 전체 유저 수 (안:밖 = 1:3 → 최종 4배)
  const RES = N / 4 // 최적화 전 수용 인원 (=2,000에 해당)
  const R1 = 2.3 // 원래 수용 반경
  const R2 = 4.6 // 최적화 후 (면적 4배)

  const model = useMemo(() => {
    const arr = []
    for (let i = 0; i < N; i++) {
      arr.push({
        a: Math.random() * Math.PI * 2,
        rf: Math.sqrt(Math.random()), // 균일 원판 분포
        spin: 0.05 + Math.random() * 0.12,
        ph: Math.random() * 6.28,
        queue: 1 + ((i * 7) % 3) * 0.55, // 대기열 링 (3겹)
        enterJit: Math.random() * 0.25,
      })
    }
    return arr
  }, [N])

  const red = useMemo(() => new THREE.Color(C.red), [])
  const green = useMemo(() => new THREE.Color(C.green), [])
  const amber = useMemo(() => new THREE.Color(C.amber), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.16)
    const opt = smoothstep(clamp01((p - 0.32) / 0.34)) // 최적화 진행도
    const R = lerp(R1, R2, opt) // 현재 수용 반경

    for (let i = 0; i < N; i++) {
      const m = model[i]
      const inside0 = i < RES
      // 개별 입장 시점: 최적화가 진행되며 대기 유저가 순차 유입
      const enter = inside0 ? 1 : smoothstep(clamp01((opt - (i - RES) / (N - RES) * 0.7 - m.enterJit * 0.3) / 0.18))

      const ang = m.a + t * m.spin
      // 포화 상태(최적화 전)일수록 안쪽 지터가 심하다 = 과부하
      const crowd = inside0 ? (1 - opt) * 0.16 : 0
      const rIn = m.rf * R * 0.94
      const rQueue = R1 + m.queue + Math.sin(t * 1.6 + m.ph) * 0.12 // 링 밖 대기열
      const rad = lerp(rQueue, rIn, enter)
      const x = Math.cos(ang) * rad + Math.sin(t * 7 + m.ph) * crowd
      const z = Math.sin(ang) * rad + Math.cos(t * 6.3 + m.ph) * crowd
      const y = 0.22 + Math.sin(t * 3 + m.ph) * 0.05

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(0.11 * fade + 0.0001)
      dummy.updateMatrix()
      agents.current.setMatrixAt(i, dummy.matrix)

      // 색: 포화된 내부/막힌 대기열 = 레드 계열 → 입장·안정화되면 그린
      if (inside0) tmpc.copy(red).lerp(green, opt)
      else tmpc.copy(amber).lerp(red, 0.45 * (1 - enter)).lerp(green, enter)
      agents.current.setColorAt(i, tmpc)
    }
    agents.current.instanceMatrix.needsUpdate = true
    if (agents.current.instanceColor) agents.current.instanceColor.needsUpdate = true

    // 수용 한계 링: 확장 + 레드→그린
    if (capRing.current) {
      capRing.current.scale.set(R, R, 1)
      capRing.current.material.color.copy(red).lerp(green, opt)
      capRing.current.material.opacity = (0.75 + 0.25 * Math.sin(t * 4) * (1 - opt)) * fade
    }
    // 옛 한계선 잔상: 확장된 뒤에만 안쪽에 남아 "원래 한계"를 대비
    if (oldRing.current) {
      oldRing.current.scale.set(R1, R1, 1)
      oldRing.current.material.opacity = opt * 0.28 * fade
    }
  })

  return (
    <group ref={g}>
      <gridHelper args={[16, 20, '#1b2540', '#12182c']} />

      {/* 유저 에이전트 */}
      <instancedMesh ref={agents} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial emissive={'#0a0d16'} emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>

      {/* 수용 한계 링 (확장) */}
      <mesh ref={capRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.965, 1, 96]} />
        <meshBasicMaterial color={C.red} transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* 원래 한계선 잔상 */}
      <mesh ref={oldRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[0.97, 1, 96]} />
        <meshBasicMaterial color={C.faint} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
