import { useSyncExternalStore } from 'react'

// Tiny external store so DOM chrome *outside* the R3F Canvas (progress rail,
// active-section indicator) can read the scroll offset that lives *inside*
// drei's <ScrollControls>. A bridge component inside the Canvas writes here.

let state = { index: 0, atTop: true, total: 1, el: null }
const subs = new Set()

export const scrollStore = {
  get: () => state,
  set(patch) {
    state = { ...state, ...patch }
    subs.forEach((f) => f())
  },
  subscribe(f) {
    subs.add(f)
    return () => subs.delete(f)
  },
  // scroll the ScrollControls host to a given section index
  scrollTo(index) {
    const { el, total } = state
    if (!el || total < 2) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTo({ top: (index / (total - 1)) * max, behavior: 'smooth' })
  },
}

export function useScrollState() {
  return useSyncExternalStore(scrollStore.subscribe, scrollStore.get, scrollStore.get)
}
