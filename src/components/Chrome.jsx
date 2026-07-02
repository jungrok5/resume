import { profile } from '../data/resume'
import { useScrollState } from '../lib/scrollStore'

// Fixed DOM chrome layered over the canvas: back link, brand, links,
// scroll hint. Reads scroll state from the external store.
export default function Chrome() {
  const { atTop } = useScrollState()

  return (
    <>
      {/* 좌상단: 문서형 이력서로 돌아가는 링크 + 브랜드를 한 줄로 (겹침 방지) */}
      <div className="topbar3d">
        <a className="backlink" href="./" aria-label="문서형 이력서로 돌아가기">
          ← 이력서
        </a>
        <div className="brandmark">
          <b>Jeongrok Oh</b> · MMO Server Architect
        </div>
      </div>

      <div className="toplinks">
        <a href={`mailto:${profile.email}`}>EMAIL</a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GITHUB
        </a>
      </div>

      {atTop && <div className="scrollhint">Scroll ↓</div>}
    </>
  )
}
