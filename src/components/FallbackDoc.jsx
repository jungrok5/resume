import { profile, sections, timeline, stack } from '../data/resume'

// Static, fully-readable document shown when the user prefers reduced motion.
// No WebGL, no scroll-jacking — same content, plain markup.
export default function FallbackDoc() {
  return (
    <div className="fallback">
      <a className="backlink" href="./" style={{ display: 'inline-flex', marginBottom: 28 }}>
        ← 이력서
      </a>
      <header style={{ marginBottom: 48 }}>
        <p className="kicker">{profile.title} · 경력 {profile.years}년</p>
        <h1 style={{ fontSize: 'clamp(34px,7vw,64px)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          {profile.name} <span style={{ color: 'var(--ink-faint)', fontSize: '0.5em' }}>{profile.nameEn}</span>
        </h1>
        <p className="cta" style={{ marginTop: 20 }}>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            github.com/jungrok5
          </a>
        </p>
      </header>

      {sections
        .filter((s) => s.id !== 'hero')
        .map((s) => (
          <article key={s.id} style={{ padding: '26px 0', borderTop: '1px solid var(--line)' }}>
            <p className="kicker" style={{ marginBottom: 10 }}>
              {s.num && <span className="num">{s.num}</span>} {s.kicker}
            </p>
            <h2 style={{ fontSize: 'clamp(22px,3.4vw,32px)', margin: '0 0 10px' }}>{s.title}</h2>
            {s.metric?.pairs && (
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', margin: '0 0 14px' }}>
                {s.metric.pairs.map((p) => `${p.label}: ${p.from} → ${p.to}`).join('   ·   ')}
              </p>
            )}
            {s.points && (
              <ul className="points" style={{ margin: '0 0 6px' }}>
                {s.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
            {s.isTimeline &&
              timeline.map(([when, org, what]) => (
                <div key={org} style={{ display: 'flex', gap: 16, margin: '12px 0 0' }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)', minWidth: 96 }}>{when}</span>
                  <span>
                    <b>{org}</b> — <span style={{ color: 'var(--ink-dim)' }}>{what}</span>
                  </span>
                </div>
              ))}
          </article>
        ))}

      <article style={{ padding: '26px 0 80px', borderTop: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: 24, margin: '0 0 16px' }}>학력 · 수상 · 스택</h2>
        <p style={{ color: 'var(--ink-dim)' }}>{profile.education}</p>
        <ul className="points" style={{ margin: '0 0 18px' }}>
          {profile.recognition.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        {Object.entries(stack).map(([group, items]) => (
          <div key={group} style={{ margin: '0 0 14px' }}>
            <div className="year" style={{ marginBottom: 8 }}>
              {group}
            </div>
            <div className="tags">
              {items.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </article>
    </div>
  )
}
