import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { scrollStore } from '../lib/scrollStore'
import { sections } from '../data/resume'

// Lives inside the Canvas/ScrollControls. Publishes scroll offset + the
// scroll host element to the external store so DOM chrome can read it.
export default function ScrollBridge() {
  const data = useScroll()

  useEffect(() => {
    scrollStore.set({ el: data.el, total: sections.length })
  }, [data.el])

  useFrame(() => {
    // 스크롤 중 매 프레임 React 리렌더를 피한다 — DOM 크롬이 실제로 쓰는 값
    // (활성 섹션 index, 최상단 여부)이 바뀔 때만 발행
    const o = data.offset
    const index = Math.round(o * (sections.length - 1))
    const atTop = o < 0.02
    const s = scrollStore.get()
    if (index !== s.index || atTop !== s.atTop) scrollStore.set({ index, atTop })
  })

  return null
}
