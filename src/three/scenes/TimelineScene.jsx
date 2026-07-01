import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01, lerp } from '../lib/util'

const X0 = -6.5
const X1 = 6.5
// milestone x positions + bar heights (older -> newer, rising seniority)
const MILES = [
  { x: -6.0, h: 1.0, color: C.blue },
  { x: -2.2, h: 1.7, color: C.amber },
  { x: 1.6, h: 1.5, color: C.green },
  { x: 5.2, h: 2.2, color: C.violet },
]

// Scene 01 — 20-year career timeline. A playhead sweeps the axis; each career
// milestone lights and its bar rises as the head passes.
export default function TimelineScene({ index, total }) {
  const g = useRef()
  const head = useRef()
  const fill = useRef()
  const refs = useRef(MILES.map(() => ({ node: null, bar: null })))

  const cols = useMemo(() => MILES.map((m) => new THREE.Color(m.color)), [])
  const dark = useMemo(() => new THREE.Color('#12203f'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const sweep = clamp01((p - 0.08) / 0.8)
    const hx = lerp(X0, X1, sweep)

    if (head.current) {
      head.current.position.x = hx
      head.current.material.emissiveIntensity = 1.6 + Math.sin(t * 6) * 0.4
    }
    if (fill.current) {
      const len = hx - X0
      fill.current.scale.x = Math.max(len, 0.001)
      fill.current.position.x = X0 + len / 2
    }

    MILES.forEach((m, i) => {
      const passed = clamp01((hx - m.x + 0.4) / 0.8)
      const r = refs.current[i]
      if (r.node) {
        const s = 0.16 + passed * 0.24
        r.node.scale.setScalar(s + Math.sin(t * 3 + i) * 0.01 * passed)
        tmp.copy(dark).lerp(cols[i], passed)
        r.node.material.color.copy(tmp)
        r.node.material.emissive.copy(cols[i])
        r.node.material.emissiveIntensity = passed * 1.4
      }
      if (r.bar) {
        r.bar.scale.y = Math.max(m.h * passed, 0.001)
        r.bar.position.y = 0.5 + (m.h * passed) / 2
        r.bar.material.opacity = 0.25 + passed * 0.5
      }
    })
  })

  return (
    <group ref={g}>
      {/* axis */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[X1 - X0, 0.03, 0.03]} />
        <meshBasicMaterial color={'#2a3a66'} toneMapped={false} />
      </mesh>
      {/* progress fill */}
      <mesh ref={fill} position={[X0, 0.5, 0]}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
      {/* playhead */}
      <mesh ref={head} position={[X0, 0.5, 0]}>
        <boxGeometry args={[0.06, 1.4, 0.06]} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      {MILES.map((m, i) => (
        <group key={i} position={[m.x, 0, 0]}>
          <mesh
            ref={(el) => (refs.current[i].bar = el)}
            position={[0, 0.5, 0]}
          >
            <boxGeometry args={[0.34, 1, 0.34]} />
            <meshStandardMaterial
              color={m.color}
              emissive={m.color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.4}
              roughness={0.3}
            />
          </mesh>
          <mesh ref={(el) => (refs.current[i].node = el)} position={[0, 0.5, 0]}>
            <sphereGeometry args={[1, 18, 18]} />
            <meshStandardMaterial roughness={0.3} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
