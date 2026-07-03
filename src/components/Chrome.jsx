import { sections } from '../data/resume'
import { useScrollState } from '../lib/scrollStore'

// 문서형 페이지와 같은 형태의 고정 상단바:
// [현재 섹션(좌)] … [기본·출력·상세·3D 탭(우)] + 화면 최상단 진행 게이지.
// 게이지(#gauge3d)는 ScrollBridge가 매 프레임 scaleX로 직접 갱신한다(리렌더 없음).
export default function Chrome() {
  const { index, atTop } = useScrollState()
  const s = sections[index] || sections[0]
  const now = s.title || s.name || '오정록'

  return (
    <>
      <header className="bar3d">
        <div className="bar3d-progress" aria-hidden="true">
          <i id="gauge3d" />
        </div>
        <div className="bar3d-inner">
          {/* key로 리마운트해 교체 애니메이션 재생 */}
          <div className="bar3d-now" key={now}>
            {now}
          </div>
          <nav className="switcher3d" aria-label="이력서 뷰">
            {/* ?view= 명시 — 없으면 문서 페이지가 '마지막에 봤던 뷰'를 복원해버린다 */}
            <a href="./?view=design">기본</a>
            <a href="./?view=ats">출력</a>
            <a href="./?view=detail">상세</a>
            <span className="on">3D</span>
          </nav>
          <span className="toggle3d" aria-hidden="true" title="3D 뷰는 다크 테마 고정">
            {/* 문서 페이지 토글과 같은 SVG 달 아이콘 (딤드) */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.2 14.7A8.6 8.6 0 0 1 9.3 3.8a8.6 8.6 0 1 0 10.9 10.9z" />
            </svg>
          </span>
        </div>
      </header>

      {atTop && <div className="scrollhint">Scroll ↓</div>}
    </>
  )
}
