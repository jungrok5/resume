import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const PACKETS = 30
const X_IN = -6
const X_OUT = 4.6
const STAGES = [-4.2, -1.4, 1.4] // ingest / transform / validate gates

// Scene 03 — automated data pipeline. Packets stream through gates, changing
// color as they are transformed, and land in the store at the end.
export default function DataPipelineScene({ index, total }) {
  const g = useRef()
  const mesh = useRef()
  const store = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const c = useMemo(() => new THREE.Color(), [])

  const data = useMemo(
    () => Array.from({ length: PACKETS }, (_, i) => ({ off: i / PACKETS, spd: 0.12 + (i % 5) * 0.015, lane: (i % 3) - 1 })),
    [],
  )
  const stops = useMemo(
    () => [new THREE.Color(C.blue), new THREE.Color(C.cyan), new THREE.Color(C.green), new THREE.Color(C.amber)],
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)

    let landing = 0
    for (let i = 0; i < PACKETS; i++) {
      const d = data[i]
      const u = (t * d.spd + d.off) % 1
      const x = X_IN + (X_OUT - X_IN) * u
      dummy.position.set(x, 1.2 + d.lane * 0.42 + Math.sin(t * 2 + i) * 0.03, d.lane * 0.5)
      dummy.rotation.set(t + i, t * 0.7, 0)
      const s = (u > 0.97 ? (1 - u) / 0.03 : 1) * 0.14 * fade + 0.0001
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)

      // color by how many stages passed
      let stage = 0
      for (let k = 0; k < STAGES.length; k++) if (x > STAGES[k]) stage = k + 1
      c.copy(stops[stage])
      mesh.current.setColorAt(i, c)
      if (u > 0.9) landing += 1
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true

    if (store.current) {
      const pulse = 1 + Math.min(landing, 4) * 0.06 + Math.sin(t * 5) * 0.03
      store.current.scale.set(pulse, 1, pulse)
      store.current.material.emissiveIntensity = 0.6 + Math.min(landing, 5) * 0.15
    }
  })

  return (
    <group ref={g}>
      {/* flow rail */}
      <mesh position={[(X_IN + X_OUT) / 2, 1.2, 0]}>
        <boxGeometry args={[X_OUT - X_IN, 0.02, 0.02]} />
        <meshBasicMaterial color={'#2a3a66'} toneMapped={false} />
      </mesh>

      {/* stage gates */}
      {STAGES.map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.7, 0.04, 12, 32]} />
          <meshStandardMaterial color={stops[i + 1]} emissive={stops[i + 1]} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      ))}

      {/* packets */}
      <instancedMesh ref={mesh} args={[undefined, undefined, PACKETS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* store (DB) */}
      <mesh ref={store} position={[X_OUT + 0.4, 1.0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 1.4, 28]} />
        <meshStandardMaterial color={'#12203f'} emissive={C.amber} emissiveIntensity={0.7} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  )
}
