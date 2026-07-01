import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const CURSORS = 220
const CURSOR_COLORS = [C.cyan, C.violet, C.green, C.amber, C.blue, C.red]

// Scene 07 — real-time web metaverse. 1,000+ live cursors sweep a shared board
// (represented by 220 instances), while three UGC mini-game "bubbles" run
// simultaneously in one space.
export default function WebCollabScene({ index, total }) {
  const g = useRef()
  const cursors = useRef()
  const bubbles = [useRef(), useRef(), useRef()]
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(
    () =>
      Array.from({ length: CURSORS }, (_, i) => ({
        sx: 0.2 + Math.random() * 0.6,
        sy: 0.2 + Math.random() * 0.6,
        px: Math.random() * 6.28,
        py: Math.random() * 6.28,
        col: new THREE.Color(CURSOR_COLORS[i % CURSOR_COLORS.length]),
      })),
    [],
  )
  const bubbleDefs = useMemo(
    () => [
      { pos: [-3.4, 1.4, 2.2], color: C.cyan },
      { pos: [0, 1.9, 1.2], color: C.amber },
      { pos: [3.4, 1.2, 2.4], color: C.green },
    ],
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)

    for (let i = 0; i < CURSORS; i++) {
      const d = data[i]
      dummy.position.set(Math.sin(t * d.sx + d.px) * 5.6, 1.6 + Math.sin(t * d.sy + d.py) * 1.5, Math.cos(t * d.sx * 0.6 + d.px) * 0.4)
      dummy.rotation.z = Math.PI + Math.sin(t + i) * 0.2
      dummy.scale.setScalar(0.12 * fade + 0.0001)
      dummy.updateMatrix()
      cursors.current.setMatrixAt(i, dummy.matrix)
      cursors.current.setColorAt(i, d.col)
    }
    cursors.current.instanceMatrix.needsUpdate = true
    if (cursors.current.instanceColor) cursors.current.instanceColor.needsUpdate = true

    bubbles.forEach((b, i) => {
      if (b.current) {
        b.current.rotation.y = t * (0.5 + i * 0.15)
        b.current.rotation.x = Math.sin(t * 0.3 + i) * 0.2
        const s = fade
        b.current.scale.setScalar(s + 0.0001)
      }
    })
  })

  return (
    <group ref={g}>
      {/* shared board */}
      <mesh position={[0, 1.6, -0.6]}>
        <planeGeometry args={[13, 5]} />
        <meshBasicMaterial color={'#0a1020'} transparent opacity={0.55} />
      </mesh>

      <instancedMesh ref={cursors} args={[undefined, undefined, CURSORS]} frustumCulled={false}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {bubbleDefs.map((bd, i) => (
        <group key={i} position={bd.pos}>
          <mesh>
            <icosahedronGeometry args={[0.95, 0]} />
            <meshBasicMaterial color={bd.color} transparent opacity={0.12} />
          </mesh>
          <group ref={bubbles[i]}>
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2
              return (
                <mesh key={k} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, Math.sin(a * 2) * 0.3]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color={bd.color} emissive={bd.color} emissiveIntensity={1.1} roughness={0.3} />
                </mesh>
              )
            })}
          </group>
        </group>
      ))}
    </group>
  )
}
