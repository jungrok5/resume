import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

// Scene 04 — Orleans virtual actors. Grains cluster per silo, pass messages
// across the cluster, and a fourth silo scales out as you scroll.
const CLUSTERS = [
  { center: [-3.2, 1.2, 0.4], color: C.violet, always: true },
  { center: [3.0, 1.4, -0.6], color: C.cyan, always: true },
  { center: [0.2, 1.0, -3.0], color: C.blue, always: true },
  { center: [0.6, 1.6, 3.0], color: C.green, always: false }, // scale-out
]
const PER = 11
const NODES = CLUSTERS.length * PER
const MSGS = 34

export default function ActorModelScene({ index, total }) {
  const g = useRef()
  const nodesM = useRef()
  const msgsM = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpc = useMemo(() => new THREE.Color(), [])

  const model = useMemo(() => {
    const nodes = []
    const hubs = []
    CLUSTERS.forEach((cl, ci) => {
      const center = new THREE.Vector3(...cl.center)
      hubs.push({ pos: center.clone(), ci })
      for (let k = 0; k < PER; k++) {
        const pos =
          k === 0
            ? center.clone()
            : center
                .clone()
                .add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2.0))
        nodes.push({ pos, ci, hub: k === 0, ph: Math.random() * 6.28 })
      }
    })
    const edges = []
    CLUSTERS.forEach((cl, ci) => {
      const hubIdx = ci * PER
      for (let k = 1; k < PER; k++) edges.push([hubIdx, ci * PER + k])
    })
    for (let i = 0; i < CLUSTERS.length; i++)
      for (let j = i + 1; j < CLUSTERS.length; j++) edges.push([i * PER, j * PER])

    const lineGeo = new THREE.BufferGeometry()
    const lpos = new Float32Array(edges.length * 2 * 3)
    edges.forEach((e, i) => {
      const a = nodes[e[0]].pos
      const b = nodes[e[1]].pos
      lpos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6)
    })
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3))
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: '#2a3a66', transparent: true, opacity: 0.4 }),
    )

    const msgs = Array.from({ length: MSGS }, (_, i) => {
      const e = edges[i % edges.length]
      return { a: nodes[e[0]].pos, b: nodes[e[1]].pos, ci: nodes[e[1]].ci, off: Math.random(), spd: 0.4 + Math.random() * 0.6 }
    })
    return { nodes, edges, lines, msgs }
  }, [])

  const clusterCol = useMemo(() => CLUSTERS.map((c) => new THREE.Color(c.color)), [])
  const dark = useMemo(() => new THREE.Color('#0a1020'), [])

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return
    const t = state.clock.elapsedTime
    const fade = clamp01(p / 0.22)
    const scaleOut = clamp01((p - 0.38) / 0.4)

    for (let i = 0; i < NODES; i++) {
      const nd = model.nodes[i]
      const vis = CLUSTERS[nd.ci].always ? 1 : scaleOut
      const pulse = 0.5 + 0.5 * Math.sin(t * 2 + nd.ph)
      const s = (nd.hub ? 0.34 : 0.19) * vis * fade + 0.0001
      dummy.position.copy(nd.pos)
      dummy.position.y += Math.sin(t * 0.8 + nd.ph) * 0.05
      dummy.scale.setScalar(s * (0.85 + pulse * 0.3))
      dummy.rotation.set(t * 0.3 + nd.ph, t * 0.2, 0)
      dummy.updateMatrix()
      nodesM.current.setMatrixAt(i, dummy.matrix)
      tmpc.copy(dark).lerp(clusterCol[nd.ci], 0.35 + pulse * 0.65)
      nodesM.current.setColorAt(i, tmpc)
    }
    nodesM.current.instanceMatrix.needsUpdate = true
    if (nodesM.current.instanceColor) nodesM.current.instanceColor.needsUpdate = true

    for (let i = 0; i < MSGS; i++) {
      const m = model.msgs[i]
      const u = (t * m.spd + m.off) % 1
      const vis = CLUSTERS[m.ci].always ? 1 : scaleOut
      dummy.position.lerpVectors(m.a, m.b, u)
      dummy.scale.setScalar(0.12 * vis * fade + 0.0001)
      dummy.updateMatrix()
      msgsM.current.setMatrixAt(i, dummy.matrix)
      msgsM.current.setColorAt(i, clusterCol[m.ci])
    }
    msgsM.current.instanceMatrix.needsUpdate = true
    if (msgsM.current.instanceColor) msgsM.current.instanceColor.needsUpdate = true

    model.lines.material.opacity = 0.4 * fade
  })

  return (
    <group ref={g}>
      <primitive object={model.lines} />
      <instancedMesh ref={nodesM} args={[undefined, undefined, NODES]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={0.4} roughness={0.3} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={msgsM} args={[undefined, undefined, MSGS]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
