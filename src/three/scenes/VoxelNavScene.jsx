import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, lerp } from '../lib/util'

const N = 16
const SP = 0.66
const TW = 0.6
const IC = 8 // impact tile col
const IR = 7 // impact tile row
const CRATER = 2.7 // crater radius in tiles

function walk(wps) {
  const out = []
  let [c, r] = wps[0]
  out.push([c, r])
  for (let i = 1; i < wps.length; i++) {
    const [tc, tr] = wps[i]
    while (c !== tc) { c += Math.sign(tc - c); out.push([c, r]) }
    while (r !== tr) { r += Math.sign(tr - r); out.push([c, r]) }
  }
  return out
}
const key = (c, r) => r * N + c

// Scene 05 — dynamic voxel navmesh.
// Terrain voxelizes and a walkable navmesh lights up; a projectile flies in and
// destroys a crater; ONLY the affected voxels' navmesh regenerates, and the
// agent's path reroutes around the hole in real time.
export default function VoxelNavScene({ index, total }) {
  const g = useRef()
  const tiles = useRef()
  const agent = useRef()
  const proj = useRef()
  const ring = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])

  const model = useMemo(() => {
    const height = new Float32Array(N * N)
    const dimpact = new Float32Array(N * N)
    const dcenter = new Float32Array(N * N)
    let maxDc = 1
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const i = key(c, r)
        height[i] = 0.2 + 0.4 * (Math.sin(c * 0.55) * 0.5 + 0.5) + 0.4 * (Math.cos(r * 0.5) * 0.5 + 0.5)
        dimpact[i] = Math.hypot(c - IC, r - IR)
        dcenter[i] = Math.hypot(c - (N - 1) / 2, r - (N - 1) / 2)
        maxDc = Math.max(maxDc, dcenter[i])
      }
    const pathA = walk([[2, 3], [8, 7], [13, 11]]) // straight through the impact zone
    const pathB = walk([[2, 3], [8, 3], [13, 11]]) // reroute above the crater
    const setA = new Map(pathA.map(([c, r], k) => [key(c, r), k]))
    const setB = new Map(pathB.map(([c, r], k) => [key(c, r), k]))
    return { height, dimpact, dcenter, maxDc, pathA, pathB, setA, setB }
  }, [])

  const pos = (c, r) => [(c - (N - 1) / 2) * SP, (r - (N - 1) / 2) * SP]
  const impactPos = useMemo(() => {
    const [x, z] = pos(IC, IR)
    return new THREE.Vector3(x, 0.4, z)
  }, [])

  const cBase = useMemo(() => new THREE.Color('#0f1836'), [])
  const cCyan = useMemo(() => new THREE.Color(C.cyan), [])
  const cWhite = useMemo(() => new THREE.Color('#dffbff'), [])
  const cAmber = useMemo(() => new THREE.Color(C.amber), [])
  const cDead = useMemo(() => new THREE.Color('#05070d'), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current || !tiles.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const m = model

    const rise = clamp01(p / 0.22)
    const nav = clamp01((p - 0.1) / 0.28) // navmesh glow reveal
    const dp = clamp01((p - 0.5) / 0.07) // destruction
    const rp = clamp01((p - 0.58) / 0.24) // navmesh regeneration around crater
    const blend = clamp01((p - 0.6) / 0.18) // pathA -> pathB
    const reveal = clamp01((p - 0.18) / 0.3)

    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const i = key(c, r)
        const inCrater = m.dimpact[i] < CRATER
        const craterT = inCrater ? clamp01(1 - m.dimpact[i] / CRATER) : 0
        const sink = inCrater ? dp * craterT : 0

        const tileRise = clamp01(rise * 1.5 - (m.dcenter[i] / m.maxDc) * 0.9)
        const h = (0.08 + m.height[i] * tileRise) * (1 - 0.92 * sink)
        const [x, z] = pos(c, r)
        dummy.position.set(x, h / 2 - sink * 0.5, z)
        dummy.scale.set(TW, Math.max(h, 0.02), TW)
        dummy.updateMatrix()
        tiles.current.setMatrixAt(i, dummy.matrix)

        // color
        col.copy(cBase).lerp(cCyan, nav * 0.4) // walkable navmesh glow

        if (inCrater && dp > 0) {
          col.lerp(cDead, dp * (0.5 + craterT * 0.5))
          // regenerated rim: amber pulse settling to cyan
          const rim = m.dimpact[i] > CRATER - 1.1
          if (rim && rp > 0) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 8 + i)
            col.lerp(cAmber, (1 - rp) * pulse * 0.9)
            col.lerp(cCyan, rp * 0.6)
          }
        }

        // path (crossfade A -> B)
        const ka = m.setA.get(i)
        const kb = m.setB.get(i)
        let pathLit = 0
        if (ka !== undefined && ka / m.pathA.length <= reveal) pathLit = Math.max(pathLit, 1 - blend)
        if (kb !== undefined && kb / m.pathB.length <= reveal) pathLit = Math.max(pathLit, blend)
        if (pathLit > 0 && !(inCrater && dp > 0.5)) col.lerp(cWhite, pathLit * 0.85)

        tiles.current.setColorAt(i, col)
      }
    tiles.current.instanceMatrix.needsUpdate = true
    if (tiles.current.instanceColor) tiles.current.instanceColor.needsUpdate = true

    // agent walks the blended path
    const ap = clamp01((p - 0.2) / 0.75)
    const ia = Math.min(m.pathA.length - 1, Math.floor(ap * (m.pathA.length - 1)))
    const ib = Math.min(m.pathB.length - 1, Math.floor(ap * (m.pathB.length - 1)))
    const [ax, az] = pos(...m.pathA[ia])
    const [bx, bz] = pos(...m.pathB[ib])
    if (agent.current) {
      agent.current.visible = reveal > 0.02
      agent.current.position.set(lerp(ax, bx, blend), 0.55 + Math.sin(t * 3) * 0.04, lerp(az, bz, blend))
      agent.current.rotation.y = t * 1.5
    }

    // projectile arc (fly in -> impact)
    const fp = clamp01((p - 0.3) / 0.2)
    if (proj.current) {
      proj.current.visible = fp > 0.001 && fp < 0.999
      const sx = impactPos.x - 4.5, sz = impactPos.z - 5.5, sy = 8.5
      proj.current.position.set(
        lerp(sx, impactPos.x, fp),
        lerp(sy, 0.5, fp) + Math.sin(fp * Math.PI) * 1.6,
        lerp(sz, impactPos.z, fp),
      )
    }

    // impact shockwave ring
    if (ring.current) {
      const kp = clamp01((p - 0.5) / 0.14)
      ring.current.visible = kp > 0.001 && kp < 0.999
      const s = 0.2 + kp * CRATER * SP * 1.6
      ring.current.scale.set(s, s, s)
      ring.current.position.set(impactPos.x, 0.12, impactPos.z)
      ring.current.material.opacity = (1 - kp) * 0.9
    }
  })

  return (
    <group ref={g}>
      <instancedMesh ref={tiles} args={[undefined, undefined, N * N]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.6} emissive={'#0a1226'} emissiveIntensity={0.4} />
      </instancedMesh>

      <mesh ref={agent} position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.4} roughness={0.3} />
      </mesh>

      <mesh ref={proj}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={2} roughness={0.2} />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1, 48]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
