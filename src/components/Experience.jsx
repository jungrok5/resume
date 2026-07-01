import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, Preload, AdaptiveDpr } from '@react-three/drei'
import { sections } from '../data/resume'
import { useIsMobile } from '../hooks/useIsMobile'
import { C } from '../three/lib/palette'
import CameraRig from '../three/CameraRig'
import ScrollBridge from '../three/ScrollBridge'
import SceneRig from '../three/SceneRig'
import Effects from '../three/Effects'
import Overlay from './Overlay'

export default function Experience() {
  const mobile = useIsMobile()

  // R3F sizes the canvas from a ResizeObserver on its container. In some
  // environments the first measurement is 0×0 and the observer doesn't fire on
  // initial layout, leaving the root uninitialized. Nudge a resize post-mount.
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event('resize'))
    kick()
    const raf = requestAnimationFrame(kick)
    const t = setTimeout(kick, 80)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [])

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 46, near: 0.1, far: 200, position: [0, 2.4, 10] }}
    >
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 18, 52]} />

      {/* global lighting; scenes add their own accent lights */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#8aa2ff', '#05060a', 0.5]} />
      <directionalLight position={[6, 12, 8]} intensity={1.05} color="#dce6ff" />

      <Suspense fallback={null}>
        <ScrollControls pages={sections.length} damping={0.3} distance={1}>
          <CameraRig />
          <ScrollBridge />
          <SceneRig mobile={mobile} />

          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>

        {!mobile && <Effects />}
        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
