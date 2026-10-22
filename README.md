# Résumé site

My résumé, hosted on GitHub Pages in two forms:

| Path | What |
|------|------|
| `/` (`index.html`) | **Document résumé** — 기본 · 출력 · 상세 views, dark mode, print. Static HTML, ATS-friendly. Default landing. |
| `/interactive.html` | **Motion résumé (모션 tab)** — thirteen headline projects (twelve from work, one personal) explained as scroll-scrubbed motion graphics, plus the rest of the résumé as cards. |

Both pages share one fixed top bar (tabs · current-section label · scroll
gauge), so switching feels like a single site.

## Tech stack

- **Document page** — hand-written static HTML/CSS/JS, no framework: the three
  views + a print stylesheet in one self-contained file.
- **Motion page** — React 18 · Vite 5 for the page; each motion piece is a
  self-contained HTML page in `public/motion/<id>/` (three.js 0.170 vendored,
  canvas 2D overlay) whose every frame is a pure function of time `t`.
- **Content SSOT** — [`src/data/resume.js`](src/data/resume.js): sections,
  bullets, metrics, timeline, and `highlights` (which items get a motion piece, in order).
- Analytics, SEO / `llms.txt`, and the GitHub Actions → Pages deploy are set up
  separately — see [`SETUP.md`](SETUP.md).

## Structure

```
index.html                document résumé (3 views, self-contained)
interactive.html          motion résumé entry point
linkedin.html             copy-paste helper (noindex)
public/                   robots.txt · sitemap.xml · llms.txt · og.png
  motion/<id>/            one motion piece per highlight (index.html + poster.jpg + poster-tall.jpg)
  motion/assets/          shared three.js build and fonts for the pieces
src/
  data/resume.js          ← content SSOT (edit here)
  App.jsx                 reduced-motion switch: Experience vs. static FallbackDoc
  components/
    Experience.jsx        page: hero + index, career, highlights, other work, contact
    MotionSection.jsx     sticky stage + text panel; scroll progress → piece time t
    Parts.jsx             metric / bullets / timeline / contact / summary blocks
    Chrome.jsx            fixed top bar (current block, tabs, scroll gauge)
    FallbackDoc.jsx       static résumé for prefers-reduced-motion
```

## How the motion page works

- Each highlight section is ~3 screens tall. Its stage sticks to the screen and
  the scroll position inside the section maps to `t ∈ [0, DURATION]`.
- The stage is a same-origin iframe: `motion/<id>/index.html?embed&layout=wide|tall&q=…`.
  The page waits for `contentWindow.ready`, then calls `contentWindow.renderAt(t)`
  only when `t` changes (eased toward the scroll target). No animation loop runs
  while you are not scrolling.
- Desktop uses the 16:9 composition (`layout=wide`, 1920×1080); phones (≤ 820 px)
  use the 4:5 composition (`layout=tall`, 1080×1350) with the text scrolling
  under the stuck stage.
- `q` lowers the piece's internal resolution to what the stage actually shows.
- Only stages within about two screens are mounted, so at most 2–3 WebGL
  contexts exist at a time; the rest show `poster.jpg`.
- Every piece also plays on its own (open `motion/<id>/` directly): player,
  chapters, a short note, and a link back.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173  (interactive page at /interactive.html)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for scene-authoring conventions and
verification workflow.
