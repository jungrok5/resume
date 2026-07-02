import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, smoothstep } from '../lib/util'

const N = 110

// Scene 06 — 1,000-player dense combat. Naive all-to-all broadcast (dense red
// web, O(n^2)) crossfades into grid-based interest management (sparse green,
// local neighborhoods). 4x throughput.
export default function DenseCombatScene({ index, total }) {
  const g = useRef()
  const agents = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const model = useMemo(() => {
    const base = []
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2
      const rad = Math.sqrt(Math.random()) * 5.2
      base.push(new THREE.Vector3(Math.cos(a) * rad, 0.4, Math.sin(a) * rad))
    }
    // dense: each agent -> 9 random others (implies all-to-all blowup)
    const dense = []
    for (let i = 0; i < N; i++)
      for (let k = 0; k < 9; k++) dense.push([i, (i + 1 + ((Math.random() * (N - 1)) | 0)) % N])
    // sparse: grid interest management, connect within cell
    const cs = 1.7
    const cells = new Map()
    base.forEach((v, i) => {
      const key = `${Math.floor(v.x / cs)},${Math.floor(v.z / cs)}`
      if (!cells.has(key)) cells.set(key, [])
      cells.get(key).push(i)
    })
    const sparse = []
    for (const arr of cells.values())
      for (let k = 0; k < arr.length; k++) sparse.push([arr[k], arr[(k + 1) % arr.length]])

    const make = (pairs, color) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3))
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 })
      return { obj: new THREE.LineSegments(geo, mat), pairs }
    }
    return { base, denseL: make(dense, C.red), sparseL: make(sparse, C.green) }
  }, [])

  const pos = useMemo(() => model.base.map((v) => v.clone()), [model])

  const fill = (L) => {
    // 배열 리터럴 없이 직접 기록 — 프레임당 수천 개의 임시 배열 할당(GC 히치) 방지
    const arr = L.obj.geometry.attributes.position.array
    for (let i = 0; i < L.pairs.length; i++) {
      const a = pos[L.pairs[i][0]]
      const b = pos[L.pairs[i][1]]
      const o = i * 6
      arr[o] = a.x
      arr[o + 1] = a.y
      arr[o + 2] = a.z
      arr[o + 3] = b.x
      arr[o + 4] = b.y
      arr[o + 5] = b.z
    }
    L.obj.geometry.attributes.position.needsUpdate = true
  }

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)
    const opt = smoothstep(clamp01((p - 0.25) / 0.45))

    for (let i = 0; i < N; i++) {
      pos[i].set(
        model.base[i].x + Math.sin(t * 3 + i) * 0.12,
        0.4,
        model.base[i].z + Math.cos(t * 2.6 + i * 1.3) * 0.12,
      )
      dummy.position.copy(pos[i])
      dummy.scale.setScalar(0.16 * fade + 0.0001)
      dummy.updateMatrix()
      agents.current.setMatrixAt(i, dummy.matrix)
    }
    agents.current.instanceMatrix.needsUpdate = true

    fill(model.denseL)
    fill(model.sparseL)
    model.denseL.obj.material.opacity = (1 - opt) * 0.5 * fade
    model.sparseL.obj.material.opacity = opt * 0.85 * fade
  })

  return (
    <group ref={g}>
      <gridHelper args={[16, 20, '#1b2540', '#12182c']} />
      <primitive object={model.denseL.obj} />
      <primitive object={model.sparseL.obj} />
      <instancedMesh ref={agents} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.8} roughness={0.4} />
      </instancedMesh>
    </group>
  )
}
