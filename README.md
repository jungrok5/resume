# Résumé site

My résumé, hosted on GitHub Pages in two forms:

| Path | What |
|------|------|
| `/` (`index.html`) | **Document résumé** — 기본 · 출력 · 상세 views, dark mode, print. Static HTML, ATS-friendly. Default landing. |
| `/interactive.html` | **3D résumé** — the same content visualized as 17 scroll-driven WebGL scenes, one per section. |

Both pages share one fixed top bar (tabs · current-section label · scroll
gauge), so switching feels like a single site.

## Tech stack

- **Document page** — hand-written static HTML/CSS/JS, no framework: the three
  views + a print stylesheet in one self-contained file.
- **3D page** — React 18 · Vite 5 · three.js · @react-three/fiber ·
  @react-three/drei (`ScrollControls`) · @react-three/postprocessing
  (Bloom/Vignette, desktop-only, lazy-loaded).
- **Content SSOT** — [`src/data/resume.js`](src/data/resume.js): sections,
  bullets, metrics, timeline. Overlay, fallback, and scenes all derive from it.
- Analytics, SEO / `llms.txt`, and the GitHub Actions → Pages deploy are set up
  separately — see [`SETUP.md`](SETUP.md).

## Structure

```
index.html                document résumé (3 views, self-contained)
interactive.html          3D entry point
linkedin.html             copy-paste helper (noindex)
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

## Optimization

The 3D page aims to stay smooth (steady frame rate, no scroll stutter) on
mobile as well as desktop.

- **Draw calls** — GPU instancing for every high-count element (each dense
  scene collapses to a single draw call); the dense-combat link web is one
  `LineSegments` with positions rewritten in place; one material per mesh,
  per-instance color via `instanceColor`, no textures.
- **Culling** — all 17 scenes stay mounted but only the active 1–2 render
  (`group.visible`); the rest early-return before touching the GPU. Fog + a
  tight far plane bound overdraw.
- **Shading / fillrate** — no shadow maps (emissive + bloom art style),
  `AdaptiveDpr` + capped DPR (mobile ≤ 1.5), desktop MSAA off (the composer
  renders offscreen), no `backdrop-filter`.
- **CPU / GC** — allocation-free frame loops (temp vectors reused, no literals
  in hot paths); zero React re-renders while scrolling (external store publishes
  only on section change, gauge driven by a compositor-only `transform`); scene
  models precomputed once.
- **Loading** — `<Preload all />` compiles shaders up front (no mid-scroll
  hitches); `three` / `r3f` / `react` split into cache-stable chunks so a
  content edit re-ships only the ~62 KB app chunk; post-processing is a lazy
  chunk, never downloaded on mobile.
- **Scroll** — native scroll input with a damped camera/overlay follow; a
  scrollbar-width-compensated top bar for zero layout shift between pages;
  panel centers measured at runtime and remapped through a piecewise-linear
  timewarp so each scene peaks as its text reaches screen center, on any
  viewport.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173  (interactive page at /interactive.html)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for scene-authoring conventions and
verification workflow.
