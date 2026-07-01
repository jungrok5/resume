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
    const o = data.offset
    if (Math.abs(o - scrollStore.get().offset) > 0.0015) {
      scrollStore.set({ offset: o, index: Math.round(o * (sections.length - 1)) })
    }
  })

  return null
}
