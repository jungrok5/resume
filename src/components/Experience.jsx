import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, Preload, AdaptiveDpr } from '@react-three/drei'
import { sections } from '../data/resume'
import { useIsMobile } from '../hooks/useIsMobile'
import { setScrollMap } from '../three/lib/scrollMap'
import { C } from '../three/lib/palette'
import CameraRig from '../three/CameraRig'
import ScrollBridge from '../three/ScrollBridge'
import SceneRig from '../three/SceneRig'
import Overlay from './Overlay'

// 포스트프로세싱(Bloom/Vignette)은 데스크톱 전용 — 별도 청크로 분리해서
// 모바일은 postprocessing 라이브러리를 아예 다운로드하지 않는다.
const Effects = lazy(() => import('../three/Effects'))

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
      if (h <= 0) return
      const pgs = Math.max(sections.length, h / vh)
      setPages(pgs)

      // 각 패널이 화면 중앙에 오는 지점을 실측해 씬 타이밍 보정 맵을 갱신.
      // drei의 html 오버레이는 offset × vh×(pages−1) 만큼 이동하므로(스크롤
      // 컨테이너 길이와 다르다!) 같은 스케일로 패널 중앙 좌표를 넘긴다 —
      // 긴 패널이 격자를 밀어내는 레이아웃에서도 '패널 중앙 = v=i'가 성립.
      const secs = el.querySelectorAll('section.section')
      if (secs.length === sections.length) {
        const centers = Array.from(secs).map(
          (s) => s.offsetTop + s.offsetHeight / 2 - vh / 2,
        )
        setScrollMap(centers, vh * (pgs - 1))
      }
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
      /* 데스크톱은 EffectComposer가 오프스크린 FBO에 렌더하므로 캔버스 MSAA가
         화면에 적용되지 않는다(비용만 지불) → 컴포저 없는 모바일에서만 AA */
      gl={{ antialias: mobile, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 46, near: 0.1, far: 200, position: [0, 2.4, 10] }}
    >
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 18, 52]} />

      {/* global lighting; scenes add their own accent lights */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#8aa2ff', '#05060a', 0.5]} />
      <directionalLight position={[6, 12, 8]} intensity={1.05} color="#dce6ff" />

      <Suspense fallback={null}>
        {/* damping을 낮춰 스크롤 반응을 빠릿하게 (0.3 → 0.15) */}
        <ScrollControls pages={pages} damping={0.15} distance={1}>
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
