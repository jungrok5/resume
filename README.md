# Résumé — Jeongrok Oh (오정록)

One GitHub Pages site, two ways to read the same résumé:

| Path | What | Notes |
|------|------|-------|
| `/` (`index.html`) | **Document résumé** — 3 views (기본 · 출력 · 상세) + dark mode + print | Static HTML, fast, SEO/ATS-friendly. **Default landing.** |
| `/interactive.html` | **Interactive 3D résumé** — 17 scroll-driven WebGL scenes | Heavy bundles load only here; postprocessing only on desktop. |

Both pages share an identical fixed top bar (tabs · current-section label ·
scroll gauge), so switching feels like one site. See [`SETUP.md`](SETUP.md)
for GitHub Pages, Search Console, and analytics setup.

## Site tech stack

- **Document page**: hand-written static HTML/CSS/JS — no framework, no build
  step for content. 3 switchable views + print stylesheet in one file.
- **3D page**: React 18 · Vite 5 · three.js · @react-three/fiber ·
  @react-three/drei (`ScrollControls`) · @react-three/postprocessing
  (Bloom/Vignette, desktop only, lazy-loaded)
- **Content SSOT**: [`src/data/resume.js`](src/data/resume.js) — sections,
  bullets, metrics, timeline; overlay/fallback/scenes all derive from it.
- **Analytics**: GA4 (custom behavior events — per-section/scene view & dwell,
  scroll depth, tab switches, contact clicks, JS errors, Web Vitals) +
  Microsoft Clarity (heatmaps, session replay, session tags).
- **SEO / AI**: JSON-LD (`ProfilePage`/`Person`), OG image (1200×630),
  `sitemap.xml`, `robots.txt` (AI crawlers explicitly allowed), `llms.txt`
  (structured summary for LLM crawlers).
- **Deploy**: GitHub Actions → GitHub Pages on every push to `main`
  (auto-retries once on the intermittent Pages backend flake).

## Optimization techniques used

**Draw calls / submission**
- GPU instancing for every high-count element (prop city ≈1,300 cubes = 1 call,
  render-opt field 1,600 = 1, combat agents 110 = 1, …)
- Merged line geometry — the dense-combat broadcast web (~1,100 segments) is a
  single `LineSegments` draw; positions written in-place each frame
- One material per instanced mesh; per-instance color via `instanceColor`
  (no material variants), zero textures (procedural geometry + vertex color)

**Visibility**
- Scroll-range scene culling: all 17 scenes stay mounted but only the active
  1–2 render (`group.visible`), the rest early-return per frame
- Fog + tight far plane; `frustumCulled=false` on instanced meshes is
  deliberate (moving instances + always-on-screen scenes)

**Shading / fillrate**
- No shadow maps at all — emissive + bloom art style doubles as optimization
- `AdaptiveDpr` (dynamic resolution on frame drops), DPR caps (mobile 1.5)
- Mobile tier: postprocessing disabled **and never downloaded** (lazy chunk),
  reduced instance counts per scene
- Desktop canvas MSAA off (the composer renders offscreen, so it never applied)
- UI is DOM, not WebGL — text panels cost the GPU scene nothing; no
  `backdrop-filter` anywhere (continuous re-blur over a canvas is expensive)

**CPU frame cost**
- Allocation-free frame loops — temp vectors/colors reused, no array literals
  in hot paths (GC-spike free)
- Zero React re-renders while scrolling: DOM chrome subscribes to an external
  store that only publishes on section change; the scroll gauge is updated
  imperatively via compositor-only `transform: scaleX`
- Scene models (paths, tower layouts, ray directions) precomputed once

**Loading**
- `<Preload all />` compiles every scene's shaders up front — no mid-scroll
  compile hitches (the web equivalent of PSO precaching)
- Code splitting: `three` (683 KB) / `r3f` (287 KB) / `react` vendor chunks are
  cache-stable across content deploys — a content edit re-ships only the
  ~62 KB app chunk; postprocessing lives in its own lazy chunk (never
  downloaded on mobile)
- Web fonts load non-blocking (preload + media swap), GA/Clarity async

**Scroll feel**
- Document page: native scrolling; the only scroll-path work is a
  rAF-throttled passive listener doing compositor-only transforms
- 3D page: native scroll input, damped (0.15) camera/overlay follow; unified
  custom scrollbars and a scrollbar-width-compensated top bar so switching
  pages causes zero layout shift
- Scene↔text sync: panel centers are measured at runtime and scroll offset is
  remapped through a piecewise-linear timewarp, so each scene peaks exactly as
  its panel reaches screen center — on any viewport, even when long panels
  stretch the layout (mobile). Falls back to a uniform grid pre-measurement

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173  (interactive page at /interactive.html)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

## Structure

```
index.html                document résumé (3 views, self-contained)
interactive.html          3D entry point
linkedin.html             private copy-paste helper (noindex)
public/                   robots.txt · sitemap.xml · llms.txt · og.png
src/
  data/resume.js          ← content SSOT (edit here)
  App.jsx                 reduced-motion switch: Experience vs. static FallbackDoc
  components/             Experience (Canvas+ScrollControls) · Overlay · Chrome · FallbackDoc
  three/
    SceneRig.jsx          scene registry; each scene culls itself by scroll range
    CameraRig.jsx         per-section camera keyframes (lib/cameras.js)
    ScrollBridge.jsx      scroll → store/gauge/GA bridge (no re-renders)
    lib/scrollMap.js      measured panel centers → scroll-offset timewarp (scene sync)
    scenes/               one file per section (17)
```

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for scene-authoring conventions,
verification workflow, and gotchas.
