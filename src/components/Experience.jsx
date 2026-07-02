import { Suspense, useEffect, useRef, useState } from 'react'
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

  // 모바일에서 긴 패널이 100svh 슬롯을 넘으면(패널 내부 스크롤 없음) 전체
  // 오버레이가 pages*svh보다 길어져 끝이 잘린다. 실제 오버레이 높이를 재서
  // pages를 넉넉히 보정한다. (데스크톱은 모든 패널이 한 화면에 들어와 그대로)
  const overlayRef = useRef(null)
  const [pages, setPages] = useState(sections.length)
  useEffect(() => {
    const measure = () => {
      const el = overlayRef.current
      const vh = window.innerHeight || 1
      if (!el) return
      const h = el.getBoundingClientRect().height
      if (h > 0) setPages(Math.max(sections.length, h / vh))
    }
    measure()
    const t1 = setTimeout(measure, 350) // 폰트 로드/레이아웃 안정 후 재측정
    const t2 = setTimeout(measure, 1500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [])

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
        <ScrollControls pages={pages} damping={0.3} distance={1}>
          <CameraRig />
          <ScrollBridge />
          <SceneRig mobile={mobile} />

          <Scroll html style={{ width: '100%' }}>
            <div ref={overlayRef}>
              <Overlay />
            </div>
          </Scroll>
        </ScrollControls>

        {!mobile && <Effects />}
        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
