import { useCallback, useEffect, useRef, useState } from 'react'
import { Metric, Points } from './Parts'

// 대표 이력 한 항목 = 모션 그래픽 무대 + 이력 텍스트 패널.
// 무대는 public/motion/<id>/index.html 을 같은 출처 iframe(?embed)으로 띄우고,
// 섹션 안에서의 스크롤 진행도(0–1)를 영상 시간 t로 바꿔 renderAt(t)를 직접 호출한다.
// 각 모션 페이지는 모든 프레임이 t의 순수 함수라 앞뒤로 자유롭게 문질러도 된다.

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))

export default function MotionSection({ s, n, flip, tall }) {
  const secRef = useRef(null)
  const stageRef = useRef(null)
  const barRef = useRef(null)
  const st = useRef({ target: 0, shown: -1, dur: 0, win: null, raf: 0, q: 1, live: false })
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const layout = tall ? 'tall' : 'wide'
  const base = `motion/${s.id}/`

  // 한 프레임씩 목표 시간으로 부드럽게 따라간다 (스크롤 휠의 계단감을 지움)
  const kick = useCallback(() => {
    const S = st.current
    if (S.raf) return
    const tick = () => {
      S.raf = 0
      if (!S.win) return
      const d = S.target - S.shown
      const next = S.shown < 0 || Math.abs(d) < 0.02 ? S.target : S.shown + d * 0.28
      if (next !== S.shown) {
        S.shown = next
        try {
          S.win.renderAt(next)
        } catch {
          /* 페이지가 내려가는 중 */
        }
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${S.dur ? next / S.dur : 0})`
      if (S.shown !== S.target) S.raf = requestAnimationFrame(tick)
    }
    S.raf = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const el = secRef.current
    const S = st.current
    const onScroll = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // 가까워지면 띄우고, 멀어지면 내린다(WebGL 컨텍스트 수를 2–3개로 유지)
      const near = r.bottom > -vh * 1.2 && r.top < vh * 2.2
      const far = r.bottom < -vh * 3 || r.top > vh * 4
      if (near) {
        if (!S.live && stageRef.current) {
          const px = stageRef.current.clientWidth * (window.devicePixelRatio || 1)
          S.q = Math.round(clamp(px / (tall ? 1080 : 1920), 0.5, 1) * 10) / 10
        }
        S.live = true
        setMounted(true)
      } else if (far) {
        S.live = false
        setMounted(false)
      }
      S.target = clamp(-r.top / Math.max(1, r.height - vh)) * S.dur
      kick()
    }
    S.onScroll = onScroll
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [kick, tall])

  // 레이아웃(가로/세로)이 바뀌거나 내려가면 연결을 끊는다
  useEffect(() => {
    const S = st.current
    S.win = null
    S.shown = -1
    setReady(false)
  }, [layout, mounted])

  const onLoad = async (e) => {
    const S = st.current
    const win = e.currentTarget.contentWindow
    try {
      for (let i = 0; i < 50 && !win.ready; i++) await new Promise((r) => setTimeout(r, 40))
      await win.ready
      S.dur = win.DURATION || 0
      S.win = win
      S.shown = -1
      setReady(true)
      S.onScroll?.()
    } catch {
      /* 로드 실패 시 포스터가 남는다 */
    }
  }

  const poster = base + (tall ? 'poster-tall.jpg' : 'poster.jpg')
  const solo = `${base}index.html${tall ? '?layout=tall' : ''}`
  const mp4 = `${base}${s.id}${tall ? '-tall' : ''}.mp4`

  // 공유: 이 항목으로 바로 오는 링크(interactive.html#<id>).
  // 폰은 시스템 공유 시트, 그 밖에는 링크 복사.
  const [shared, setShared] = useState('')
  const share = async () => {
    const url = `${location.origin}${location.pathname}#${s.id}`
    const title = `${s.title} — 오정록 모션 그래픽 이력서`
    window.gtag?.('event', 'share_click', { scene: s.id })
    if (navigator.share) {
      try {
        await navigator.share({ title, text: s.hook || s.title, url })
        return
      } catch (e) {
        if (e && e.name === 'AbortError') return
      }
    }
    let ok = false
    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      ta.remove()
    }
    setShared(ok ? '링크 복사됨' : url)
    setTimeout(() => setShared(''), ok ? 1800 : 6000)
  }

  return (
    <section className={`ms${flip ? ' flip' : ''}`} ref={secRef} id={s.id} data-sid={s.id} data-now={s.title}>
      <div className="ms-pin">
        <div className="ms-media">
          <div className={`ms-stage ${layout}`} ref={stageRef}>
            <img className={`ms-poster${ready ? ' off' : ''}`} src={poster} alt="" loading="lazy" decoding="async" />
            {mounted && (
              <iframe
                key={layout}
                src={`${base}index.html?embed&layout=${layout}&q=${st.current.q}`}
                title={`${s.title} — 모션 그래픽`}
                tabIndex={-1}
                onLoad={onLoad}
              />
            )}
          </div>
          <div className="ms-under">
            <span className="ms-track" aria-hidden="true">
              <i ref={barRef} />
            </span>
            <button type="button" className="ms-share" onClick={share} aria-label={`${s.title} 공유`}>
              {shared || '공유'}
            </button>
            <a href={mp4} target="_blank" rel="noreferrer">
              MP4
            </a>
            <a href={solo} target="_blank" rel="noreferrer">
              따로 재생 ↗
            </a>
          </div>
        </div>
        <div className="ms-panel">
          <p className="kicker">
            <span className="num">{String(n).padStart(2, '0')}</span> {s.kicker}
          </p>
          <h2 className="title">{s.title}</h2>
          <Metric metric={s.metric} />
          <Points points={s.points} />
        </div>
        <div className="ms-tail" aria-hidden="true" />
      </div>
    </section>
  )
}
