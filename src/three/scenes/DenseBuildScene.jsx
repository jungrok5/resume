import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, smoothstep, lerp } from '../lib/util'

// Scene 05 — 5,000만 프랍 · 2,000명 밀집 건축 (Miniverse UE5).
// 읽히는 서사: ① 인스턴스 큐브 도시가 층 단위(타임랩스)로 솟아오르고
// ② 빌더(앰버 점)들이 건축 전선 위를 떠다니며 동시에 쌓으며
// ③ 중앙 디스패처 기둥이 zero-copy 브로드캐스트 링을 모두에게 퍼뜨린다.
// → "수많은 유저가 동시에 쌓아도, 쓰기는 하나의 디스패처로 직렬화된다"가 보이게.
export default function DenseBuildScene({ index, total, mobile }) {
  const g = useRef()
  const mesh = useRef()
  const builders = useRef()
  const core = useRef()
  const rings = useRef([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const G = mobile ? 13 : 18 // tower sites per side
  const B = mobile ? 12 : 22 // concurrent builders
  const SP = 0.62
  const CH = 0.34 // cube height

  // 사이트별 목표 높이(스카이라인) + 층 단위 빌드 순서(도시가 파도처럼 상승)
  const model = useMemo(() => {
    const sites = []
    for (let r = 0; r < G; r++)
      for (let c = 0; c < G; c++) {
        const x = (c - (G - 1) / 2) * SP
        const z = (r - (G - 1) / 2) * SP
        const d = Math.hypot(x, z)
        if (d < 1.1) continue // 중앙은 디스패처 자리
        const rnd = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1
        sites.push({ x, z, h: 1 + Math.floor(rnd * 6 * Math.exp(-d * 0.16)) })
      }
    const maxH = Math.max(...sites.map((s) => s.h))
    // 층 우선 순서: layer 0 전체 → layer 1 전체 → ... (+사이트별 지터)
    const cubes = []
    for (let layer = 0; layer < maxH; layer++)
      for (let si = 0; si < sites.length; si++) {
        const s = sites[si]
        if (layer < s.h) cubes.push({ x: s.x, z: s.z, y: layer * CH + CH / 2, layer, jit: (si * 7919) % 23 })
      }
    return { sites, cubes, maxH }
  }, [G])

  const COUNT = model.cubes.length

  const green = useMemo(() => new THREE.Color(C.green), [])
  const cyan = useMemo(() => new THREE.Color(C.cyan), [])
  const dimc = useMemo(() => new THREE.Color('#1d3a4e'), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.15)
    const growth = smoothstep(clamp01((p - 0.06) / 0.78)) // 타임랩스 진행도
    const front = growth * COUNT // 건축 전선 (이 인덱스 근처가 "지금 쌓이는 중")

    for (let i = 0; i < COUNT; i++) {
      const cb = model.cubes[i]
      const pop = clamp01((front - (i + cb.jit * 0.4)) / 26) // 설치 순간 스케일-팝
      const s = 0.5 * SP * smoothstep(pop) * fade
      dummy.position.set(cb.x, cb.y, cb.z)
      dummy.scale.set(s + 0.0001, CH * smoothstep(pop) * fade + 0.0001, s + 0.0001)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)

      // 갓 설치된 큐브는 시안으로 번쩍, 자리 잡으면 층별 그린 톤으로
      const fresh = clamp01(1 - Math.abs(front - i) / 40)
      tmpc.copy(dimc).lerp(green, 0.25 + 0.55 * (cb.layer / model.maxH))
      if (pop > 0 && pop < 1) tmpc.lerp(cyan, 0.85)
      else tmpc.lerp(cyan, fresh * 0.35)
      mesh.current.setColorAt(i, tmpc)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true

    // 빌더들: 건축 전선 높이 위를 리사주 궤적으로 떠다니며 "쌓는 중"
    const topY = (front / COUNT) * model.maxH * CH
    for (let j = 0; j < B; j++) {
      const ph = j * 2.399
      const bx = Math.sin(t * 0.5 + ph) * (G * SP * 0.42)
      const bz = Math.cos(t * 0.37 + ph * 1.7) * (G * SP * 0.42)
      const by = topY + 0.55 + Math.sin(t * 5 + ph) * 0.12 // 블록 놓는 바운스
      dummy.position.set(bx, by, bz)
      dummy.scale.setScalar(0.12 * fade + 0.0001)
      dummy.updateMatrix()
      builders.current.setMatrixAt(j, dummy.matrix)
    }
    builders.current.instanceMatrix.needsUpdate = true

    // 중앙 디스패처: 틱마다 펄스 + 브로드캐스트 링 확산
    if (core.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6)
      core.current.scale.set(1, 1 + topY * 1.1 + pulse * 0.06, 1)
      core.current.material.emissiveIntensity = 1.2 + pulse * 1.4
      core.current.visible = fade > 0.05
    }
    rings.current.forEach((r, k) => {
      if (!r) return
      const cyc = (t * 0.55 + k / 3) % 1 // 3개 링이 번갈아 확산
      const rad = lerp(0.6, G * SP * 0.62, cyc)
      r.scale.set(rad, rad, 1)
      r.material.opacity = (1 - cyc) * 0.5 * fade * clamp01(growth * 3)
      r.visible = active
    })
  })

  return (
    <group ref={g}>
      <gridHelper args={[16, 22, '#1b2540', '#12182c']} />

      {/* 프랍 도시 (인스턴싱) */}
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={'#0a1a14'} emissiveIntensity={0.35} roughness={0.5} metalness={0.1} />
      </instancedMesh>

      {/* 동시 건축 중인 빌더들 */}
      <instancedMesh ref={builders} args={[undefined, undefined, B]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={1.1} roughness={0.35} />
      </instancedMesh>

      {/* 공간당 단일 디스패처 (중앙 코어) */}
      <mesh ref={core} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.34, 1, 0.34]} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.6} roughness={0.25} />
      </mesh>

      {/* zero-copy 브로드캐스트 링 */}
      {[0, 1, 2].map((k) => (
        <mesh
          key={k}
          ref={(el) => (rings.current[k] = el)}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.06, 0]}
        >
          <ringGeometry args={[0.96, 1, 72]} />
          <meshBasicMaterial color={C.cyan} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
