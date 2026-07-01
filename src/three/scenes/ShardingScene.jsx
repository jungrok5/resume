import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const NSHARD = 5
const ENTITIES = 32
const SHARD_COLORS = [C.cyan, C.violet, C.green, C.amber, C.blue]

// Scene 04 — key-based sharding. Entities stream from a router and are hashed to
// one of N shards; each shard pulses as its partition fills.
export default function ShardingScene({ index, total }) {
  const g = useRef()
  const mesh = useRef()
  const pillars = useRef(Array.from({ length: NSHARD }, () => null))
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const source = useMemo(() => new THREE.Vector3(0, 3.4, -1.4), [])
  const shardPos = useMemo(
    () => Array.from({ length: NSHARD }, (_, k) => new THREE.Vector3((k - (NSHARD - 1) / 2) * 2.2, 0.7, 0.6)),
    [],
  )
  const cols = useMemo(() => SHARD_COLORS.map((h) => new THREE.Color(h)), [])
  const data = useMemo(
    () =>
      Array.from({ length: ENTITIES }, (_, i) => ({
        shard: (i * 7 + ((i * i) % 5)) % NSHARD, // pseudo-hash
        off: i / ENTITIES,
        spd: 0.18 + (i % 4) * 0.02,
      })),
    [],
  )

  const links = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const arr = new Float32Array(NSHARD * 2 * 3)
    for (let k = 0; k < NSHARD; k++) {
      arr.set([0, 3.4, -1.4, shardPos[k].x, shardPos[k].y, shardPos[k].z], k * 6)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#2a3a66', transparent: true, opacity: 0.35 }))
  }, [shardPos])

  const tmpA = useMemo(() => new THREE.Vector3(), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)
    const load = new Array(NSHARD).fill(0)

    for (let i = 0; i < ENTITIES; i++) {
      const d = data[i]
      const u = (t * d.spd + d.off) % 1
      const target = shardPos[d.shard]
      tmpA.lerpVectors(source, target, u)
      tmpA.y += Math.sin(u * Math.PI) * 1.0 // arc
      const s = (u > 0.95 ? (1 - u) / 0.05 : 1) * 0.15 * fade + 0.0001
      dummy.position.copy(tmpA)
      dummy.rotation.set(t + i, t * 0.6, 0)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, cols[d.shard])
      if (u > 0.8) load[d.shard] += 1
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true

    links.material.opacity = 0.32 * fade

    for (let k = 0; k < NSHARD; k++) {
      const pil = pillars.current[k]
      if (pil) {
        const h = 0.6 + Math.min(load[k], 4) * 0.28
        pil.scale.set(fade, h * fade + 0.001, fade)
        pil.position.y = (h * fade) / 2
        pil.material.emissiveIntensity = 0.5 + Math.min(load[k], 4) * 0.35 + Math.sin(t * 4 + k) * 0.1
      }
    }
  })

  return (
    <group ref={g}>
      <primitive object={links} />

      {/* router source */}
      <mesh position={[0, 3.4, -1.4]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={'#0e1836'} emissive={C.cyan} emissiveIntensity={1} flatShading roughness={0.3} />
      </mesh>

      {/* entities */}
      <instancedMesh ref={mesh} args={[undefined, undefined, ENTITIES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* shard pillars */}
      {shardPos.map((sp, k) => (
        <mesh key={k} ref={(el) => (pillars.current[k] = el)} position={[sp.x, 0, sp.z]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 24]} />
          <meshStandardMaterial
            color={'#12203f'}
            emissive={SHARD_COLORS[k]}
            emissiveIntensity={0.6}
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
