import { useMemo, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { sections } from '../data/resume'
import { CAMERAS } from './lib/cameras'
import { clamp, clamp01, easeInOut } from './lib/util'

// Cinematic camera driven by scroll. Expands per-scene keyframes to global
// offsets and interpolates position + look-at target with easing + damping.
export default function CameraRig() {
  const scroll = useScroll()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0.8, 0))
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpTgt = useMemo(() => new THREE.Vector3(), [])

  const keys = useMemo(() => {
    const total = sections.length
    const out = []
    sections.forEach((sec, i) => {
      const s = i / total
      const span = 1 / total
      const arr = CAMERAS[sec.id] || [[0.5, [0, 2.4, 10], [0, 0.8, 0]]]
      arr.forEach(([p, pos, tgt]) =>
        out.push({
          at: s + p * span,
          pos: new THREE.Vector3(...pos),
          tgt: new THREE.Vector3(...tgt),
        }),
      )
    })
    out.sort((a, b) => a.at - b.at)
    return out
  }, [])

  useFrame((_, dt) => {
    const last = keys.length - 1
    const o = clamp(scroll.offset, keys[0].at, keys[last].at)

    let i = 0
    while (i < last - 1 && o > keys[i + 1].at) i++
    const a = keys[i]
    const b = keys[Math.min(i + 1, last)]
    const span = b.at - a.at || 1
    const t = easeInOut(clamp01((o - a.at) / span))

    tmpPos.copy(a.pos).lerp(b.pos, t)
    tmpTgt.copy(a.tgt).lerp(b.tgt, t)

    const k = 1 - Math.exp(-6 * dt)
    camera.position.lerp(tmpPos, k)
    target.current.lerp(tmpTgt, k)
    camera.lookAt(target.current)
  })

  return null
}
