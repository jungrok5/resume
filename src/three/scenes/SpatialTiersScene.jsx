import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

// Scene — 3단 공간 분할 · 시야 기반 전송 (Miniverse UE5).
// 읽히는 서사: 바닥에 세 단계 격자(집터<청크<셀)가 겹쳐 있고, 플레이어가
// 이동하면 시야 반경 안의 청크만 밝게 '스트리밍'된다. 한 번 지나간 청크는
// 은은한 초록으로 남는다(SightIn — 재진입해도 재전송 없음). 어두운 칸=아직
// 보낸 적 없음. '총량이 아니라 활성량만 처리'가 색으로 보인다.
const G = 12 // 청크 수(한 변)
const SP = 1.0 // 청크 간격
const SIGHT = 2.3 // 시야 반경

export default function SpatialTiersScene({ index, total }) {
  const g = useRef()
  const tiles = useRef()
  const player = useRef()
  const ring = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const model = useMemo(() => {
    const chunks = []
    for (let r = 0; r < G; r++)
      for (let c = 0; c < G; c++) {
        chunks.push({
          x: (c - (G - 1) / 2) * SP,
          z: (r - (G - 1) / 2) * SP,
          visitedAt: -1, // 처음 시야에 든 시각 (-1 = 미전송)
        })
      }

    // 셀 경계(청크 4×4 = 셀) — 굵은 상위 격자
    const cellGeo = new THREE.BufferGeometry()
    const pts = []
    const half = (G * SP) / 2
    for (let i = 0; i <= G; i += 4) {
      const v = -half + i * SP
      pts.push(v, 0.02, -half, v, 0.02, half)
      pts.push(-half, 0.02, v, half, 0.02, v)
    }
    cellGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    const cellLines = new THREE.LineSegments(
      cellGeo,
      new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.5 }),
    )
    return { chunks, cellLines }
  }, [])

  const dark = useMemo(() => new THREE.Color('#0b0f1c'), [])
  const sent = useMemo(() => new THREE.Color('#123527'), [])
  const live = useMemo(() => new THREE.Color(C.cyan), [])
  const flash = useMemo(() => new THREE.Color('#eafcff'), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01((p - 0.03) / 0.15)

    // 플레이어: 필드를 고루 도는 리사주 경로
    const px = Math.sin(t * 0.32) * 4.6
    const pz = Math.sin(t * 0.21 + 1.2) * 4.6
    if (player.current) {
      player.current.position.set(px, 0.34, pz)
      player.current.scale.setScalar(0.2 * fade + 0.0001)
    }
    if (ring.current) {
      ring.current.position.set(px, 0.04, pz)
      ring.current.scale.set(SIGHT * fade + 0.001, SIGHT * fade + 0.001, 1)
      ring.current.material.opacity = 0.75 * fade
    }

    for (let i = 0; i < model.chunks.length; i++) {
      const ch = model.chunks[i]
      const inSight = Math.hypot(ch.x - px, ch.z - pz) < SIGHT
      if (inSight && ch.visitedAt < 0) ch.visitedAt = t // 최초 진입 = 이때만 전송

      // 상태별 색: 스트리밍 중(시안) > 방금 전송(흰 플래시) > 전송됨(초록 딤) > 미전송(어둠)
      const justSent = ch.visitedAt >= 0 ? clamp01(1 - (t - ch.visitedAt) / 0.6) : 0
      if (inSight) tmpc.copy(live)
      else if (ch.visitedAt >= 0) tmpc.copy(sent)
      else tmpc.copy(dark)
      if (justSent > 0) tmpc.lerp(flash, justSent * 0.9)
      tiles.current.setColorAt(i, tmpc)

      const lift = inSight ? 0.09 : 0
      dummy.position.set(ch.x, 0.02 + lift, ch.z)
      dummy.scale.set(0.88 * fade + 0.0001, 0.06 + justSent * 0.16 + 0.0001, 0.88 * fade + 0.0001)
      dummy.updateMatrix()
      tiles.current.setMatrixAt(i, dummy.matrix)
    }
    tiles.current.instanceMatrix.needsUpdate = true
    if (tiles.current.instanceColor) tiles.current.instanceColor.needsUpdate = true

    model.cellLines.material.opacity = 0.5 * fade
  })

  return (
    <group ref={g}>
      {/* 집터(최하위) 미세 격자 */}
      <gridHelper args={[G * SP, G * 3, '#141c33', '#0f1526']} />
      {/* 셀(최상위) 굵은 격자 */}
      <primitive object={model.cellLines} />

      {/* 청크 타일 — 전송 상태가 색으로 남는 주인공 */}
      <instancedMesh ref={tiles} args={[undefined, undefined, G * G]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={'#0a1420'} emissiveIntensity={0.55} roughness={0.5} />
      </instancedMesh>

      {/* 플레이어와 시야 반경 */}
      <mesh ref={player}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={1.4} roughness={0.3} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.96, 1, 64]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.75} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
