import { useReducedMotion } from './hooks/useReducedMotion'
import Experience from './components/Experience'
import Chrome from './components/Chrome'
import FallbackDoc from './components/FallbackDoc'

export default function App() {
  const reduced = useReducedMotion()

  // Accessibility: users who ask the OS to reduce motion get a clean,
  // fully-readable static document instead of the scroll-driven WebGL show.
  if (reduced) return <FallbackDoc />

  return (
    <>
      <Experience />
      <Chrome />
    </>
  )
}
