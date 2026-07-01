import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const PROPS = 6 // props per game arena
const ARENAS = [
  { x: -3.7, color: C.green, rot: 0.5 }, // survival
  { x: 0, color: C.amber, rot: -0.4 }, // paintman (team battle)
  { x: 3.7, color: C.cyan, rot: 0.6 }, // third game
]
const RAD = 1.0
const CY = 1.4
const NPROP = ARENAS.length * PROPS
const NMSG = ARENAS.length * PROPS // one message per prop->next edge

// Scene 10 — UGC prop mini-games. Three games run in one space; within each,
// props exchange messages (survival / paintman / more), driven purely by prop
// scripting.
export default function PropGamesScene({ index, total }) {
  const g = useRef()
  const propsM = useRef()
  const msgM = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const arenaCol = useMemo(() => ARENAS.map((a) => new THREE.Color(a.color)), [])
  const bright = useMemo(() => ARENAS.map((a) => new THREE.Color(a.color).lerp(new THREE.Color('#ffffff'), 0.4)), [])
  const propPos = useMemo(() => Array.from({ length: NPROP }, () => new THREE.Vector3()), [])
  const msgs = useMemo(
    () =>
      Array.from({ length: NMSG }, (_, i) => ({
        arena: (i / PROPS) | 0,
        from: i % PROPS,
        off: (i % PROPS) / PROPS + Math.random() * 0.1,
        spd: 0.5 + (i % 3) * 0.15,
      })),
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)

    // prop positions (rotating ring per arena)
    for (let a = 0; a < ARENAS.length; a++) {
      for (let j = 0; j < PROPS; j++) {
        const idx = a * PROPS + j
        const ang = (j / PROPS) * Math.PI * 2 + t * ARENAS[a].rot
        propPos[idx].set(
          ARENAS[a].x + Math.cos(ang) * RAD,
          CY + Math.sin(ang) * RAD,
          Math.sin(ang * 2) * 0.35,
        )
        dummy.position.copy(propPos[idx])
        dummy.rotation.set(t + idx, t * 0.7, 0)
        dummy.scale.setScalar(0.2 * fade + 0.0001)
        dummy.updateMatrix()
        propsM.current.setMatrixAt(idx, dummy.matrix)
        propsM.current.setColorAt(idx, arenaCol[a])
      }
    }
    propsM.current.instanceMatrix.needsUpdate = true
    if (propsM.current.instanceColor) propsM.current.instanceColor.needsUpdate = true

    // messages traveling prop -> next prop within the same arena
    for (let i = 0; i < NMSG; i++) {
      const m = msgs[i]
      const u = (t * m.spd + m.off) % 1
      const a = m.arena
      const from = propPos[a * PROPS + m.from]
      const to = propPos[a * PROPS + ((m.from + 1) % PROPS)]
      dummy.position.lerpVectors(from, to, u)
      dummy.scale.setScalar(0.09 * fade + 0.0001)
      dummy.updateMatrix()
      msgM.current.setMatrixAt(i, dummy.matrix)
      msgM.current.setColorAt(i, bright[a])
    }
    msgM.current.instanceMatrix.needsUpdate = true
    if (msgM.current.instanceColor) msgM.current.instanceColor.needsUpdate = true
  })

  return (
    <group ref={g}>
      {/* game-zone boundaries */}
      {ARENAS.map((a, i) => (
        <mesh key={i} position={[a.x, CY, 0]}>
          <torusGeometry args={[RAD + 0.35, 0.02, 10, 40]} />
          <meshBasicMaterial color={a.color} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ))}

      <instancedMesh ref={propsM} args={[undefined, undefined, NPROP]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={0.5} roughness={0.35} />
      </instancedMesh>

      <instancedMesh ref={msgM} args={[undefined, undefined, NMSG]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
