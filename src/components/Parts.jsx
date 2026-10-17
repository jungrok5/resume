import { profile, timeline, stack, projects } from '../data/resume'

// 이력 텍스트 조각들. 모션 그래픽이 '어떻게'를 보여주고, 여기가 '무엇을 했는지'를 말한다.

export function Metric({ metric }) {
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

export function Points({ points }) {
  if (!points?.length) return null
  return (
    <ul className="points">
      {points.map((pt) => (
        <li key={pt}>{pt}</li>
      ))}
    </ul>
  )
}

export function Timeline() {
  return (
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
  )
}

export function Contact() {
  return (
    <div className="cta">
      <a href={`mailto:${profile.email}`}>{profile.email}</a>
      <a href={profile.github} target="_blank" rel="noreferrer">
        github.com/jungrok5
      </a>
      <a href={profile.linkedin} target="_blank" rel="noreferrer">
        linkedin.com/in/jungrok5
      </a>
    </div>
  )
}

// 마지막 블록: 개인 프로젝트 · 기술 스택 · 수상 · 학력
export function Summary() {
  return (
    <div className="summary">
      <div>
        <h3>개인 프로젝트 (GitHub)</h3>
        {/* 프로젝트 실측 녹화 — media 필드가 있는 프로젝트만 (현재 Hellfarm 1개), 목록보다 먼저 */}
        <div className="summary-media">
          {projects.flatMap((p) => p.media || []).map((m) => (
            <figure key={m.src}>
              <video src={m.src} poster={m.poster} autoPlay loop muted playsInline controls preload="none" />
              <figcaption>{m.cap}</figcaption>
            </figure>
          ))}
        </div>
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
              · {p.tag} <span className="faint">({p.metric})</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>기술 스택</h3>
        <div className="stack">
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
