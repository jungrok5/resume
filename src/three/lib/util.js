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
// 읽기는 패널이 '진입할 때'(중앙 -0.5 부근) 시작되므로, 씬 윈도우를
// LEAD만큼 앞당긴 [i-0.5-LEAD, i+0.5-LEAD]로 잡는다 — 패널이 들어오는
// 순간 씬이 이미 형성돼 있고(p≈0.4), 중앙에서 완성(p≈0.85)된다.
export const LEAD = 0.35

export function sceneWindow(index, total) {
  const s = Math.max(0, index - 0.5 - LEAD)
  const e = Math.min(total - 1, index + 0.5 - LEAD)
  return [s, e]
}

export function localProgress(offset, index, total) {
  const v = offset * (total - 1)
  const [s, e] = sceneWindow(index, total)
  return clamp01((v - s) / (e - s || 1))
}

// is a section slot active (with padding so intro/outro can overlap)
export function isActive(offset, index, total, pad = 0.34) {
  const v = offset * (total - 1)
  const [s, e] = sceneWindow(index, total)
  const span = e - s
  return v >= s - span * pad && v <= e + span * pad
}

// frame-rate independent damping toward a target
export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}
