import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const P = 5 // players
const Q = 9 // NPCs
const OWNER_COLORS = [C.cyan, C.violet, C.green, C.amber, C.blue]

// Scene 03 — client-delegated NPC ownership. Each NPC is owned by the nearest
// player (link + color follow that player); as players move, ownership hands
// off to whoever is now closest. Nearest-search is real; motion is authored.
export default function ClientNpcScene({ index, total }) {
  const g = useRef()
  const players = useRef()
  const npcs = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const owner = useRef(new Int8Array(Q).fill(-1))
  const flash = useRef(new Float32Array(Q))

  const grid = useMemo(() => {
    const arr = []
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) arr.push([(c - 1) * 3, (r - 1) * 3])
    return arr
  }, [])
  const pcol = useMemo(() => OWNER_COLORS.map((h) => new THREE.Color(h)), [])
  const white = useMemo(() => new THREE.Color('#ffffff'), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const links = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Q * 2 * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(Q * 2 * 3), 3))
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  const ppos = useMemo(() => Array.from({ length: P }, () => new THREE.Vector3()), [])
  const qpos = useMemo(() => Array.from({ length: Q }, () => new THREE.Vector3()), [])

  useScene(index, total, (p, active, state, dt) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.25) * clamp01((1 - p) / 0.2 + 0.5)

    // players (colored)
    for (let i = 0; i < P; i++) {
      ppos[i].set(
        Math.cos(t * 0.32 + i) * 3.4 + Math.sin(t * 0.17 + i * 2) * 0.8,
        0.5,
        Math.sin(t * 0.27 + i * 1.3) * 3.4 + Math.cos(t * 0.19 + i) * 0.8,
      )
      dummy.position.copy(ppos[i])
      dummy.scale.setScalar(0.42 * fade + 0.001)
      dummy.updateMatrix()
      players.current.setMatrixAt(i, dummy.matrix)
      players.current.setColorAt(i, pcol[i])
    }
    players.current.instanceMatrix.needsUpdate = true
    if (players.current.instanceColor) players.current.instanceColor.needsUpdate = true

    const posArr = links.geometry.attributes.position.array
    const colArr = links.geometry.attributes.color.array

    for (let j = 0; j < Q; j++) {
      qpos[j].set(grid[j][0] + Math.sin(t * 0.4 + j) * 0.6, 0.36, grid[j][1] + Math.cos(t * 0.35 + j * 1.7) * 0.6)
      // nearest player
      let best = 0
      let bd = Infinity
      for (let i = 0; i < P; i++) {
        const d = qpos[j].distanceToSquared(ppos[i])
        if (d < bd) { bd = d; best = i }
      }
      if (owner.current[j] !== best) { owner.current[j] = best; flash.current[j] = 1 }
      flash.current[j] = Math.max(0, flash.current[j] - dt * 2.5)

      tmpc.copy(pcol[best]).lerp(white, flash.current[j] * 0.8)
      dummy.position.copy(qpos[j])
      dummy.scale.setScalar((0.3 + flash.current[j] * 0.12) * fade + 0.001)
      dummy.rotation.set(t * 0.6 + j, t * 0.5, 0)
      dummy.updateMatrix()
      npcs.current.setMatrixAt(j, dummy.matrix)
      npcs.current.setColorAt(j, tmpc)

      const a = j * 6
      posArr[a] = qpos[j].x; posArr[a + 1] = qpos[j].y; posArr[a + 2] = qpos[j].z
      posArr[a + 3] = ppos[best].x; posArr[a + 4] = ppos[best].y; posArr[a + 5] = ppos[best].z
      for (let k = 0; k < 2; k++) {
        colArr[a + k * 3] = tmpc.r; colArr[a + k * 3 + 1] = tmpc.g; colArr[a + k * 3 + 2] = tmpc.b
      }
    }
    npcs.current.instanceMatrix.needsUpdate = true
    if (npcs.current.instanceColor) npcs.current.instanceColor.needsUpdate = true
    links.geometry.attributes.position.needsUpdate = true
    links.geometry.attributes.color.needsUpdate = true
    links.material.opacity = 0.55 * fade
  })

  return (
    <group ref={g}>
      <gridHelper args={[16, 16, '#1b2540', '#12182c']} position={[0, 0, 0]} />
      <primitive object={links} />
      <instancedMesh ref={players} args={[undefined, undefined, P]} frustumCulled={false}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={0.35} roughness={0.3} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={npcs} args={[undefined, undefined, Q]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={0.3} roughness={0.4} />
      </instancedMesh>
    </group>
  )
}
