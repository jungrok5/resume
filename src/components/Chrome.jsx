import { profile, sections } from '../data/resume'
import { scrollStore, useScrollState } from '../lib/scrollStore'

// Fixed DOM chrome layered over the canvas: brand, links, progress rail,
// scroll hint. Reads the scroll offset from the external store.
export default function Chrome() {
  const { offset, total } = useScrollState()
  const active = Math.round(offset * (total - 1))

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

      <nav className="rail" aria-label="Sections">
        {sections.map((s, i) => (
          <button
            key={s.id}
            data-active={i === active}
            onClick={() => scrollStore.scrollTo(i)}
            aria-label={s.title || s.id}
            title={s.title || s.kicker}
          />
        ))}
      </nav>

      {active === 0 && <div className="scrollhint">Scroll ↓</div>}
    </>
  )
}
