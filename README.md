# Résumé — Jeongrok Oh (오정록)

**Technical Director · MMO Server Architect — 20 years.** Building MMO server
frameworks from scratch: networking, lock-free concurrency, navigation, server
physics, virtual-actor distributed backends. Optimization across server /
client / DB is the throughline.

This repository *is* part of the résumé. The interactive page renders **17
scroll-driven WebGL scenes** and is deliberately engineered to the same
optimization discipline the résumé describes — so it holds a steady frame and a
jank-free scroll on a phone, not just a desktop GPU. The performance section
below is the point; everything else is scaffolding.

| Path | What |
|------|------|
| `/` (`index.html`) | **Document résumé** — 3 views (기본 · 출력 · 상세), dark mode, print. Static, fast, ATS-friendly. Default landing. |
| `/interactive.html` | **Interactive 3D résumé** — 17 WebGL scenes, one per career section. Heavy bundles load only here. |

Both pages share one fixed top bar (tabs · current-section label · scroll
gauge), so switching feels like a single site.

## Performance

The interactive page targets **60 fps and zero scroll stutter on mobile**. The
techniques are the web equivalents of shipping a 3D game client — the same
budget-per-frame thinking, applied to a browser.

**Draw-call batching**
- GPU instancing for every high-count element — a whole prop city (≈1,300
  cubes), the render-opt field (1,600 boxes), combat agents (110) each collapse
  to **one draw call**
- The dense-combat broadcast web (~1,100 links) is a **single `LineSegments`**;
  vertex positions are rewritten in place each frame, never reallocated
- One material per instanced mesh, per-instance color via `instanceColor` (no
  material variants), **zero textures** — geometry is procedural, color is
  vertex data

**Culling / visibility**
- Scroll-range scene culling: all 17 scenes stay mounted, but only the active
  1–2 actually render (`group.visible`); the rest early-return before touching
  the GPU
- Fog + a tight far plane bound overdraw; `frustumCulled = false` on instanced
  meshes is deliberate (instances move every frame and the active scene always
  fills the view — per-frame frustum tests would only cost)

**Shading / fillrate**
- **No shadow maps** — the emissive + bloom art style doubles as the
  optimization (no depth pre-pass, no shadow cascades)
- `AdaptiveDpr` drops resolution on frame dips; DPR is capped (mobile ≤ 1.5)
- Desktop MSAA is off on purpose — the post composer renders offscreen, so
  canvas AA never reached the screen and was pure cost
- UI is DOM, not WebGL — text panels cost the 3D scene nothing, and there is
  **no `backdrop-filter` anywhere** (re-blurring a canvas every frame is
  expensive)

**CPU frame budget / GC**
- **Allocation-free frame loops** — temp vectors/colors are reused and there
  are no array/object literals in hot paths, so the render loop produces no GC
  spikes
- **Zero React re-renders while scrolling** — DOM chrome subscribes to an
  external store that only publishes on section change; the scroll gauge is
  driven imperatively with a compositor-only `transform: scaleX`
- Scene models (paths, tower layouts, ray directions) are precomputed once, not
  rebuilt per frame

**Loading (PSO-precache analog)**
- `<Preload all />` compiles every scene's shaders up front — no mid-scroll
  shader-compile hitches (the browser equivalent of PSO precaching)
- Split chunks: `three` (683 KB) / `r3f` (287 KB) / `react` are cache-stable, so
  a content edit re-ships only the **~62 KB app chunk**. Post-processing lives in
  its own lazy chunk and is **never downloaded on mobile**
- Fonts load non-blocking (preload + media swap); analytics loads async

**Scroll feel**
- Document page: native scroll; the only scroll-path work is a rAF-throttled
  passive listener doing a compositor-only transform
- 3D page: native scroll input with a damped (0.15) camera/overlay follow;
  unified custom scrollbars and a scrollbar-width-compensated top bar mean
  **zero layout shift** when switching pages
- **Scene ↔ text sync**: panel centers are measured at runtime and the scroll
  offset is remapped through a piecewise-linear timewarp, so each scene peaks
  exactly as its panel reaches screen center — on any viewport, even when long
  panels stretch the layout on mobile (falls back to a uniform grid before
  measurement)

## Tech stack

- **Document page** — hand-written static HTML/CSS/JS, no framework: 3
  switchable views + a print stylesheet in one self-contained file.
- **3D page** — React 18 · Vite 5 · three.js · @react-three/fiber ·
  @react-three/drei (`ScrollControls`) · @react-three/postprocessing
  (Bloom/Vignette, desktop-only, lazy-loaded).
- **Content SSOT** — [`src/data/resume.js`](src/data/resume.js): sections,
  bullets, metrics, timeline. Overlay, fallback, and scenes all derive from it.
- Analytics, SEO/`llms.txt`, and the GitHub Actions → Pages deploy are wired up
  but kept out of the way — see [`SETUP.md`](SETUP.md).

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
