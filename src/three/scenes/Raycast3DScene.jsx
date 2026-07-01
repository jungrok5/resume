import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../lib/useScene'
import { C } from '../lib/palette'
import { clamp01 } from '../lib/util'

const M = 24 // rays in the forward cone
const RAY_LEN = 3.4

// Scene 02 — 3D raycast steering. The agent flies a weaving 3D path; a forward
// cone of ~24 rays is *actually* tested against obstacle spheres each frame,
// so rays that hit really do turn red. (Path is authored; hits are computed.)
export default function Raycast3DScene({ index, total }) {
  const g = useRef()
  const agent = useRef()

  const M_ = useMemo(() => {
    const obstacles = [
      [-2.4, 1.4, 3.2], [1.2, 2.0, 2.0], [2.6, 0.9, 0.2], [-1.0, 2.4, -0.6],
      [0.4, 1.1, -1.8], [-2.6, 1.0, -2.6], [2.2, 2.2, -3.4], [-0.6, 0.6, -4.6],
      [1.6, 1.6, 4.4], [-3.0, 2.0, 0.8],
    ].map(([x, y, z]) => ({ c: new THREE.Vector3(x, y, z), r: 0.85 }))

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.2, 1.2, 5.2),
      new THREE.Vector3(-1.6, 1.9, 3.0),
      new THREE.Vector3(1.7, 1.1, 1.0),
      new THREE.Vector3(-0.8, 2.4, -1.2),
      new THREE.Vector3(2.4, 1.5, -3.2),
      new THREE.Vector3(-1.2, 1.3, -5.4),
    ])

    const cap = THREE.MathUtils.degToRad(30)
    const ga = Math.PI * (3 - Math.sqrt(5))
    const dirs = []
    for (let i = 0; i < M; i++) {
      const tt = (i + 0.5) / M
      const phi = Math.acos(1 - tt * (1 - Math.cos(cap)))
      const th = i * ga
      dirs.push(new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)))
    }
    return { obstacles, curve, dirs }
  }, [])

  const rays = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(M * 2 * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(M * 2 * 3), 3))
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      z: new THREE.Vector3(0, 0, 1),
      dir: new THREE.Vector3(),
      oc: new THREE.Vector3(),
      end: new THREE.Vector3(),
      cyan: new THREE.Color(C.cyan),
      red: new THREE.Color(C.red),
    }),
    [],
  )

  useScene(index, total, (p, active, state) => {
    if (!g.current) return
    g.current.visible = active
    if (!active) return

    const ap = clamp01((p - 0.05) / 0.9)
    M_.curve.getPoint(ap, tmp.pos)
    M_.curve.getTangent(ap, tmp.tan).normalize()
    tmp.q.setFromUnitVectors(tmp.z, tmp.tan)

    const posArr = rays.geometry.attributes.position.array
    const colArr = rays.geometry.attributes.color.array

    for (let i = 0; i < M; i++) {
      tmp.dir.copy(M_.dirs[i]).applyQuaternion(tmp.q)
      let minT = RAY_LEN
      let hit = false
      for (const o of M_.obstacles) {
        tmp.oc.subVectors(o.c, tmp.pos)
        const tca = tmp.oc.dot(tmp.dir)
        if (tca < 0) continue
        const d2 = tmp.oc.lengthSq() - tca * tca
        const r2 = o.r * o.r
        if (d2 > r2) continue
        const tHit = tca - Math.sqrt(r2 - d2)
        if (tHit > 0 && tHit < minT) { minT = tHit; hit = true }
      }
      tmp.end.copy(tmp.dir).multiplyScalar(minT).add(tmp.pos)
      const a = i * 6
      posArr[a] = tmp.pos.x; posArr[a + 1] = tmp.pos.y; posArr[a + 2] = tmp.pos.z
      posArr[a + 3] = tmp.end.x; posArr[a + 4] = tmp.end.y; posArr[a + 5] = tmp.end.z
      const col = hit ? tmp.red : tmp.cyan
      for (let k = 0; k < 2; k++) {
        colArr[a + k * 3] = col.r; colArr[a + k * 3 + 1] = col.g; colArr[a + k * 3 + 2] = col.b
      }
    }
    rays.geometry.attributes.position.needsUpdate = true
    rays.geometry.attributes.color.needsUpdate = true
    rays.material.opacity = 0.15 + 0.7 * clamp01(ap * 6)

    if (agent.current) {
      agent.current.position.copy(tmp.pos)
      agent.current.quaternion.copy(tmp.q)
    }
  })

  return (
    <group ref={g} position={[0, 0, 0]}>
      <primitive object={rays} />

      <mesh ref={agent}>
        {/* cone pre-rotated to point along +Z */}
        <coneGeometry args={[0.22, 0.7, 16]} onUpdate={(geo) => geo.rotateX(Math.PI / 2)} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.6} roughness={0.3} />
      </mesh>

      {M_.obstacles.map((o, i) => (
        <mesh key={i} position={o.c}>
          <icosahedronGeometry args={[o.r, 0]} />
          <meshStandardMaterial
            color={'#20305a'}
            emissive={C.blue}
            emissiveIntensity={0.25}
            metalness={0.2}
            roughness={0.5}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}
