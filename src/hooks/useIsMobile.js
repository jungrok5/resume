import { useEffect, useState } from 'react'

// Coarse pointer / narrow viewport => scale down particle counts and DPR.
export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return mobile
}
