import { useSyncExternalStore } from 'react'

// 스크롤 위치에서 나온 값(지금 보는 블록, 최상단 여부)을 상단바(Chrome)에 전달하는 작은 저장소.
// 값이 바뀔 때만 발행해 스크롤 중 매 프레임 리렌더를 피한다.

let state = { id: 'hero', now: '', atTop: true }
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
}

export function useScrollState() {
  return useSyncExternalStore(scrollStore.subscribe, scrollStore.get, scrollStore.get)
}
