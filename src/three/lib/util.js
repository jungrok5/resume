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

// map global scroll offset -> local 0..1 progress for a section slot
export function localProgress(offset, index, total) {
  const s = index / total
  const e = (index + 1) / total
  return clamp01((offset - s) / (e - s))
}

// is a section slot active (with padding so intro/outro can overlap)
export function isActive(offset, index, total, pad = 0.34) {
  const s = index / total
  const e = (index + 1) / total
  const span = e - s
  return offset >= s - span * pad && offset <= e + span * pad
}

// frame-rate independent damping toward a target
export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}
