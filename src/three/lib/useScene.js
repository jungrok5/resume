import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { localProgress, isActive } from './util'

// Per-scene frame hook. Calls back with (localProgress 0..1, active, state, dt)
// every frame so a scene can animate by scroll and cull itself when off-screen.
export function useScene(index, total, onFrame) {
  const scroll = useScroll()
  useFrame((state, dt) => {
    const o = scroll.offset
    onFrame(localProgress(o, index, total), isActive(o, index, total), state, dt, o)
  })
}
