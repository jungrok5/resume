import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, smoothstep, lerp } from '../lib/util'

const G = 40
const COUNT = G * G
const SP = 0.5
const R = 3.4 // physics chunk radius

// Scene 05 — rendering & physics optimization. A "draw-call storm" of jittering
// red props settles into a clean instanced field, and a physics chunk follows a
// player so only nearby bodies simulate. (drawcalls 20,967->503, FPS 16.5->47.4)
export default function RenderOptScene({ index, total }) {
  const g = useRef()
  const mesh = useRef()
  const ring = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const base = useMemo(() => {
    const arr = []
    for (let r = 0; r < G; r++)
      for (let c = 0; c < G; c++) {
        arr.push({
          x: (c - (G - 1) / 2) * SP,
          z: (r - (G - 1) / 2) * SP,
          h: 0.2 + Math.random() * 0.5,
          ph: Math.random() * 6.28,
        })
      }
    return arr
  }, [])

  const red = useMemo(() => new THREE.Color(C.red), [])
  const green = useMemo(() => new THREE.Color(C.green), [])
  const cyan = useMemo(() => new THREE.Color(C.cyan), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.18)
    const opt = smoothstep(clamp01((p - 0.15) / 0.5)) // 0 before -> 1 after

    const cx = Math.sin(t * 0.5) * 6
    const cz = Math.cos(t * 0.42) * 6

    for (let i = 0; i < COUNT; i++) {
      const b = base[i]
      const near = Math.hypot(b.x - cx, b.z - cz) < R
      const jitter = (1 - opt) * 0.35 * Math.sin(t * 6 + b.ph)
      const bob = near ? opt * Math.sin(t * 4 + b.ph) * 0.18 : 0
      const h = b.h
      const y = h / 2 + jitter + bob
      const flick = 1 - (1 - opt) * 0.25 * (0.5 + 0.5 * Math.sin(t * 20 + b.ph))
      dummy.position.set(b.x, y, b.z)
      dummy.scale.set(0.34 * flick * fade + 0.0001, h * fade + 0.0001, 0.34 * flick * fade + 0.0001)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)

      tmpc.copy(red).lerp(green, opt)
      if (near && opt > 0.2) tmpc.lerp(cyan, 0.6)
      mesh.current.setColorAt(i, tmpc)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true

    if (ring.current) {
      ring.current.visible = opt > 0.25
      ring.current.position.set(cx, 0.05, cz)
      ring.current.material.opacity = clamp01((opt - 0.25) / 0.3) * 0.9
    }
  })

  return (
    <group ref={g}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={'#0a0d16'} emissiveIntensity={0.3} roughness={0.5} metalness={0.15} />
      </instancedMesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[R - 0.08, R, 64]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
