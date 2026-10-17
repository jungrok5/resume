import { useEffect } from 'react'
import { sections, highlights, profile } from '../data/resume'
import { useIsMobile } from '../hooks/useIsMobile'
import { scrollStore } from '../lib/scrollStore'
import MotionSection from './MotionSection'
import { Contact, Metric, Points, Summary, Timeline } from './Parts'

// 인터랙티브 이력서: 대표 이력 8개를 모션 그래픽으로, 스크롤로 넘기며 본다.
// 일반 문서 스크롤 위에 섹션마다 sticky 무대를 두는 구조(스크롤 가로채기 없음).

const byId = Object.fromEntries(sections.map((s) => [s.id, s]))
const hero = byId.hero
const career = byId.career
const shown = highlights.map((id) => byId[id]).filter(Boolean)
const others = sections.filter((s) => !highlights.includes(s.id) && s.id !== 'hero' && s.id !== 'career')

function short(m) {
  if (!m) return ''
  if (m.pairs) return m.pairs.map((p) => `${p.from} → ${p.to}`).join(' · ')
  return m.big
}

function useChromeTracking() {
  useEffect(() => {
    let raf = 0
    let gauge = null
    const track = { id: null, t: 0 }
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      const o = Math.min(1, window.scrollY / max)
      if (!gauge) gauge = document.getElementById('gauge3d')
      if (gauge) gauge.style.transform = `scaleX(${o})`

      // 화면 가운데 줄에 걸친 블록이 '지금 보는 곳'
      const mid = window.innerHeight * 0.45
      let cur = null
      for (const el of document.querySelectorAll('[data-sid]')) {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) {
          cur = el
          break
        }
      }
      const id = cur ? cur.dataset.sid : 'hero'
      const now = cur ? cur.dataset.now : profile.name
      const atTop = window.scrollY < 40
      const s = scrollStore.get()
      if (id !== s.id || atTop !== s.atTop) {
        scrollStore.set({ id, now, atTop })
        // GA: 어떤 장면까지 봤고(scene_view) 각 장면에 얼마나 머물렀는지(scene_dwell)
        if (id !== track.id && window.gtag) {
          const nowMs = performance.now()
          if (track.id) {
            window.gtag('event', 'scene_dwell', {
              scene: track.id,
              seconds: Math.min(Math.round((nowMs - track.t) / 1000), 600),
            })
          }
          window.gtag('event', 'scene_view', { scene: id })
          track.id = id
          track.t = nowMs
        }
        if (window.clarity) window.clarity('set', 'scene', id)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
}

export default function Experience() {
  const tall = useIsMobile(821)
  useChromeTracking()

  const jump = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="mx">
      <section className="block hero" data-sid="hero" data-now={profile.name}>
        <p className="kicker">{hero.kicker}</p>
        <h1 className="hero-name">{hero.name}</h1>
        <p className="hero-sub">{hero.sub}</p>
        <p className="hero-how">대표 작업 8개를 모션 그래픽으로 정리했습니다. 스크롤하면 각 장면이 진행됩니다.</p>
        <ol className="hl-index">
          {shown.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={jump(s.id)}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t">{s.title}</span>
                <span className="m">{s.hook || short(s.metric)}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="block career" data-sid="career" data-now="경력">
        <p className="kicker">{career.kicker}</p>
        <h2 className="title">{career.title}</h2>
        <Points points={career.points} />
        <Timeline />
      </section>

      {shown.map((s, i) => (
        <MotionSection key={s.id} s={s} n={i + 1} flip={i % 2 === 1} tall={tall} />
      ))}

      <section className="block more" data-sid="more" data-now="그 밖의 주요 작업">
        <p className="kicker">More</p>
        <h2 className="title">그 밖의 주요 작업</h2>
        <div className="cards">
          {others.map((s) => (
            <article className="card" key={s.id}>
              <p className="kicker">{s.kicker}</p>
              <h3>{s.title}</h3>
              <Metric metric={s.metric} />
              <Points points={s.points} />
            </article>
          ))}
        </div>
      </section>

      <section className="block final" data-sid="contact" data-now="연락처 · 프로젝트">
        <p className="kicker">Contact</p>
        <h2 className="title">연락처</h2>
        <Contact />
        <Summary />
      </section>
    </main>
  )
}
