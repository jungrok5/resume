// 스크롤 오프셋 → 패널 공간 좌표(v) 보정 맵.
// 씬 진행도는 '패널 i가 화면 중앙에 올 때 v=i'를 전제로 하는데, 긴 패널이
// 섹션을 늘리면(특히 모바일) 실제 패널 위치가 균등 격자에서 벗어나 뒤로
// 갈수록 박자가 어긋난다. Experience가 실측한 패널 중앙 scrollTop 배열로
// 구간별 선형 보간(타임워프)해 어떤 레이아웃에서도 v=i를 보장한다.
let centers = null // 패널 i가 화면 중앙에 오는 scrollTop(px)
let scrollLen = 1 // 스크롤 가능 길이(px)

export function setScrollMap(c, len) {
  centers = c && c.length > 1 ? c : null
  scrollLen = len > 0 ? len : 1
}

export function offsetToV(offset, total) {
  if (!centers || centers.length !== total) return offset * (total - 1) // 보정 전 폴백(균등 격자)
  const st = offset * scrollLen
  let i = 0
  while (i < centers.length - 2 && st > centers[i + 1]) i++
  const a = centers[i]
  const b = centers[i + 1]
  const t = (st - a) / (b - a || 1)
  return i + (t < 0 ? 0 : t > 1 ? 1 : t)
}
