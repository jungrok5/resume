import { useEffect, useState } from 'react'

// Respect the OS "reduce motion" setting. When on, we render the static
// document fallback instead of the scroll-driven WebGL experience.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  return reduced
}
