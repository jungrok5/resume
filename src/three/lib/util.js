// Small math helpers shared across scenes.

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
// ease helpers
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)

// map global scroll offset -> local 0..1 progress for a section slot.
// 패널 i가 화면 중앙에 오는 스크롤 지점은 offset = i/(total-1) 격자다.
// 씬 윈도우를 그 격자 기준 [i-0.5, i+0.5]로 잡아 '패널이 중앙일 때 p=0.5'가
// 모든 섹션에서 성립하게 한다 — 텍스트와 씬의 박자가 어긋나지 않는다.
// (기존 i/total 격자는 섹션이 뒤로 갈수록 씬이 텍스트보다 늦게/이르게 어긋났다)
export function localProgress(offset, index, total) {
  const v = offset * (total - 1)
  const s = Math.max(0, index - 0.5)
  const e = Math.min(total - 1, index + 0.5)
  return clamp01((v - s) / (e - s || 1))
}

// is a section slot active (with padding so intro/outro can overlap)
export function isActive(offset, index, total, pad = 0.34) {
  const v = offset * (total - 1)
  const s = Math.max(0, index - 0.5)
  const e = Math.min(total - 1, index + 0.5)
  const span = e - s
  return v >= s - span * pad && v <= e + span * pad
}

// frame-rate independent damping toward a target
export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}
