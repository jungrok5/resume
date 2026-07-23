import { sections, profile, timeline, stack, projects } from '../data/resume'

function Metric({ metric }) {
  if (!metric) return null
  if (metric.pairs) {
    return (
      <div className="pairs">
        {metric.pairs.map((p) => (
          <div className="pair" key={p.label}>
            <span className="lbl">{p.label}</span>
            <span className="vals">
              <s>{p.from}</s>
              <em>→</em>
              <b>{p.to}</b>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="metric">
      <span className="big">{metric.big}</span>
      <span className="cap">{metric.cap}</span>
    </div>
  )
}

// 이력서 핵심 요약 불릿 — 씬이 '어떻게'를 보여주고, 여기가 '무엇을'을 말한다.
function Points({ points }) {
  if (!points?.length) return null
  return (
    <ul className="points">
      {points.map((pt) => (
        <li key={pt}>{pt}</li>
      ))}
    </ul>
  )
}

function Summary() {
  return (
    <div className="summary">
      <div>
        <h3>개인 프로젝트 (GitHub)</h3>
        <p style={{ color: 'var(--ink-faint)', margin: '0 0 8px', fontSize: '.86em' }}>
          AI·모델을 도구로, 각 도메인에서 어디까지 만들 수 있는지 실험해 본 프로젝트들.
        </p>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              ·{' '}
              {p.private ? (
                <b>
                  {p.name} <span title="비공개 저장소">🔒</span>
                </b>
              ) : (
                <a href={p.href} target="_blank" rel="noreferrer">
                  <b>{p.name}</b>
                </a>
              )}{' '}
              — {p.tag} <span style={{ color: 'var(--ink-faint)' }}>({p.metric})</span>
            </li>
          ))}
        </ul>
        {/* 프로젝트 실측 캡처/녹화 — media 필드가 있는 프로젝트만 (현재 Hellfarm 1개) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 12, maxWidth: 560 }}>
          {projects.flatMap((p) => p.media || []).map((m) => (
            <a key={m.src} href={m.src} target="_blank" rel="noreferrer">
              <img
                src={m.src}
                alt={m.cap}
                loading="lazy"
                style={{ width: '100%', display: 'block', borderRadius: 8, background: '#000', imageRendering: 'pixelated' }}
              />
              <span style={{ display: 'block', marginTop: 4, fontSize: 11, lineHeight: 1.5, color: 'var(--ink-faint)' }}>
                {m.cap}
              </span>
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3>기술 스택</h3>
        <div style={{ display: 'grid', gap: 6 }}>
          {Object.entries(stack).map(([group, items]) => (
            <div className="stackrow" key={group}>
              <b>{group}</b>
              <span>{items.join(' · ')}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>수상 · 활동</h3>
        <ul>
          {profile.recognition.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>학력</h3>
        <p>{profile.education}</p>
      </div>
    </div>
  )
}

function Panel({ s }) {
  if (s.id === 'hero') {
    return (
      <div className="panel panel--hero">
        <p className="kicker">{s.kicker}</p>
        <h1 className="hero-name">
          {s.name}
          <span className="sub">{s.sub}</span>
        </h1>
      </div>
    )
  }

  return (
    <div className="panel">
      <p className="kicker">
        {s.num && <span className="num">{s.num}</span>} {s.kicker}
      </p>
      <h2 className="title">{s.title}</h2>
      <Metric metric={s.metric} />
      <Points points={s.points} />

      {s.isTimeline && (
        <div className="tl">
          {timeline.map(([when, org, what]) => (
            <div className="tl-row" key={org}>
              <span className="tl-when">{when}</span>
              <span>
                <div className="tl-org">{org}</div>
                <div className="tl-what">{what}</div>
              </span>
            </div>
          ))}
        </div>
      )}

      {s.contact && (
        <div className="cta">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            github.com/jungrok5
          </a>
        </div>
      )}

      {s.summary && <Summary />}
    </div>
  )
}

export default function Overlay() {
  return (
    <>
      {sections.map((s) => (
        <section className={`section ${s.align || 'left'}`} key={s.id}>
          <Panel s={s} />
        </section>
      ))}
    </>
  )
}
