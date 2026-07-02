import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { scrollStore } from '../lib/scrollStore'
import { sections } from '../data/resume'

// Lives inside the Canvas/ScrollControls. Publishes scroll offset + the
// scroll host element to the external store so DOM chrome can read it.
export default function ScrollBridge() {
  const data = useScroll()
  const track = useRef({ idx: -1, t: 0 }) // GA 씬 도달/체류 추적
  let gauge = null // 상단 진행 게이지 DOM 캐시

  useEffect(() => {
    scrollStore.set({ el: data.el, total: sections.length })

    // 스크롤 컨테이너의 스크롤바 폭을 재서 상단바가 그만큼 양보하게 한다
    // (문서 페이지의 윈도우 스크롤바와 같은 기하 — 페이지 전환 시 흔들림 없음)
    const setSbw = () => {
      const sbw = data.el ? data.el.offsetWidth - data.el.clientWidth : 0
      document.documentElement.style.setProperty('--sbw', `${sbw}px`)
    }
    setSbw()
    window.addEventListener('resize', setSbw)
    return () => window.removeEventListener('resize', setSbw)
  }, [data.el])

  useFrame(() => {
    const o = data.offset

    // 진행 게이지는 React를 거치지 않고 매 프레임 transform만 갱신 (레이아웃 없음)
    if (!gauge) gauge = document.getElementById('gauge3d')
    if (gauge) gauge.style.transform = `scaleX(${o})`

    // 스크롤 중 매 프레임 React 리렌더를 피한다 — DOM 크롬이 실제로 쓰는 값
    // (활성 섹션 index, 최상단 여부)이 바뀔 때만 발행
    const index = Math.round(o * (sections.length - 1))
    const atTop = o < 0.02
    const s = scrollStore.get()
    if (index !== s.index || atTop !== s.atTop) {
      scrollStore.set({ index, atTop })

      // GA: 어떤 씬까지 봤고(scene_view) 각 씬에 얼마나 머물렀는지(scene_dwell)
      if (index !== track.current.idx && window.gtag) {
        const tr = track.current
        const nowMs = performance.now()
        if (tr.idx >= 0 && sections[tr.idx]) {
          window.gtag('event', 'scene_dwell', {
            scene: sections[tr.idx].id,
            seconds: Math.min(Math.round((nowMs - tr.t) / 1000), 600),
          })
        }
        window.gtag('event', 'scene_view', { scene: sections[index] ? sections[index].id : index })
        tr.idx = index
        tr.t = nowMs
      }
      // Clarity 세션 태그: 이 방문자가 어느 씬까지 도달했는지 (녹화 필터용)
      if (window.clarity && sections[index]) window.clarity('set', 'scene', sections[index].id)
    }
  })

  return null
}
