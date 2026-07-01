import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, smoothstep } from '../lib/util'

// Hero: a glowing voxel cluster (a "world" / "server") that slowly rotates,
// then disperses into scattered cubes as you scroll away.
export default function HeroScene({ index, total }) {
  const g = useRef()
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colored = useRef(false)

  const data = useMemo(() => {
    const arr = []
    const n = 7
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++)
        for (let z = 0; z < n; z++) {
          const base = new THREE.Vector3(
            (x - (n - 1) / 2) * 0.6,
            (y - (n - 1) / 2) * 0.6,
            (z - (n - 1) / 2) * 0.6,
          )
          if (base.length() > 2.15) continue // carve to a rounded cluster
          const dir = base
            .clone()
            .normalize()
            .add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.7))
          arr.push({ base, dir, scale: 0.4 + Math.random() * 0.18, ph: Math.random() * Math.PI * 2 })
        }
    return arr
  }, [])

  useScene(index, total, (p, active, state) => {
    if (!g.current || !mesh.current) return
    g.current.visible = active
    if (!active) return

    if (!colored.current) {
      const c = new THREE.Color()
      const a = new THREE.Color(C.cyan)
      const b = new THREE.Color(C.violet)
      for (let i = 0; i < data.length; i++) {
        c.copy(a).lerp(b, clamp01((data[i].base.y + 2.1) / 4.2))
        mesh.current.setColorAt(i, c)
      }
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
      colored.current = true
    }

    const t = state.clock.elapsedTime
    const disperse = smoothstep(p)
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      dummy.position.set(
        d.base.x + d.dir.x * disperse * 3.4,
        d.base.y + d.dir.y * disperse * 3.4 + Math.sin(t * 0.8 + d.ph) * 0.05,
        d.base.z + d.dir.z * disperse * 3.4,
      )
      dummy.rotation.set(t * 0.2 + d.ph, t * 0.16 + d.ph, 0)
      dummy.scale.setScalar(d.scale * (1 - 0.45 * disperse))
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    g.current.rotation.y = t * 0.12
  })

  return (
    <group ref={g} position={[0, 0.8, 0]}>
      <pointLight position={[0, 0, 3]} intensity={12} distance={12} color={C.cyan} />
      <instancedMesh ref={mesh} args={[undefined, undefined, data.length]} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial metalness={0.25} roughness={0.35} emissive={'#0a0d16'} />
      </instancedMesh>
    </group>
  )
}
