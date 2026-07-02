import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const A = 8 // agent nodes
const MSG = 24

// Scene 08 — AI-driven development. A central codebase core ringed by MCP/agent
// nodes; messages (reviews, tests) pulse back and forth along the spokes.
export default function AiDevScene({ index, total }) {
  const g = useRef()
  const core = useRef()
  const agentsM = useRef()
  const msgsM = useRef()
  const spokes = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const agentCol = useMemo(
    () => Array.from({ length: A }, (_, i) => new THREE.Color([C.cyan, C.violet, C.green, C.amber, C.blue][i % 5])),
    [],
  )
  const center = useMemo(() => new THREE.Vector3(0, 1.1, 0), [])
  const apos = useMemo(() => Array.from({ length: A }, () => new THREE.Vector3()), [])

  const lines = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(A * 6), 3))
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#2a3a66', transparent: true, opacity: 0.5 }))
  }, [])

  const msgDefs = useMemo(
    () => Array.from({ length: MSG }, (_, i) => ({ a: i % A, off: Math.random(), spd: 0.4 + Math.random() * 0.5, dir: i % 2 })),
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.2)

    if (core.current) {
      const pl = 1 + Math.sin(t * 2) * 0.08
      core.current.scale.setScalar(pl * fade + 0.0001)
      core.current.rotation.y = t * 0.4
      core.current.rotation.x = t * 0.2
    }

    const R = 3.2
    for (let i = 0; i < A; i++) {
      const a = (i / A) * Math.PI * 2 + t * 0.25
      apos[i].set(Math.cos(a) * R, 1.1 + Math.sin(t * 0.8 + i) * 0.3, Math.sin(a) * R)
      dummy.position.copy(apos[i])
      dummy.rotation.set(t * 0.5 + i, t * 0.3, 0)
      dummy.scale.setScalar(0.28 * fade + 0.0001)
      dummy.updateMatrix()
      agentsM.current.setMatrixAt(i, dummy.matrix)
      agentsM.current.setColorAt(i, agentCol[i])
    }
    agentsM.current.instanceMatrix.needsUpdate = true
    if (agentsM.current.instanceColor) agentsM.current.instanceColor.needsUpdate = true

    const lp = lines.geometry.attributes.position.array
    for (let i = 0; i < A; i++) {
      const o = i * 6
      lp[o] = center.x
      lp[o + 1] = center.y
      lp[o + 2] = center.z
      lp[o + 3] = apos[i].x
      lp[o + 4] = apos[i].y
      lp[o + 5] = apos[i].z
    }
    lines.geometry.attributes.position.needsUpdate = true
    lines.material.opacity = 0.5 * fade

    for (let i = 0; i < MSG; i++) {
      const m = msgDefs[i]
      let u = (t * m.spd + m.off) % 1
      if (m.dir) u = 1 - u
      dummy.position.lerpVectors(center, apos[m.a], u)
      dummy.scale.setScalar(0.11 * fade + 0.0001)
      dummy.updateMatrix()
      msgsM.current.setMatrixAt(i, dummy.matrix)
      msgsM.current.setColorAt(i, agentCol[m.a])
    }
    msgsM.current.instanceMatrix.needsUpdate = true
    if (msgsM.current.instanceColor) msgsM.current.instanceColor.needsUpdate = true
  })

  return (
    <group ref={g}>
      <primitive object={lines} />
      <mesh ref={core} position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color={'#0e1836'} emissive={C.cyan} emissiveIntensity={0.9} roughness={0.25} metalness={0.4} flatShading />
      </mesh>
      <instancedMesh ref={agentsM} args={[undefined, undefined, A]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={0.45} roughness={0.3} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={msgsM} args={[undefined, undefined, MSG]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
