# Development notes

Context for continuing this project in a fresh session (Codespaces / remote /
new clone). Everything needed lives in the repo — `npm ci` restores deps,
`dist/` and `node_modules/` are gitignored and regenerated.

## Quick start

```bash
npm install          # or: npm ci
npm run dev          # http://localhost:5173
npm run build        # -> dist/  (validates the whole module graph)
npm run preview      # serve the production build
```

Push to `main` → GitHub Actions builds & deploys to
https://jungrok5.github.io/resume/ (see `.github/workflows/deploy.yml`).

## What this is

A Korean, scroll-driven 3D résumé for a 20-year MMO server architect. A fixed
full-screen WebGL canvas sits behind HTML panels; scrolling drives which scene
is active plus a cinematic camera. **Content is primary, visualization is
supporting** — every résumé fact (company, role, period, education, awards,
stack) must stay present even as scenes come and go.

## Architecture

```
src/
  data/resume.js        SSOT: `sections[]` drives overlay, progress rail, fallback.
                        profile / timeline / stack live here too. EDIT CONTENT HERE.
  App.jsx               reduced-motion switch → Experience vs. static FallbackDoc
  components/
    Experience.jsx      <Canvas> + drei <ScrollControls pages={sections.length}>
                        + postprocessing. Holds the mount-time resize kick.
    Overlay.jsx         HTML panels rendered over 3D via <Scroll html>.
                        Special cases: hero (no glass card), isTimeline (career
                        list), summary (education/awards/stack on the last panel).
    Chrome.jsx          fixed brand / links / progress rail (reads scrollStore)
    FallbackDoc.jsx     static, fully-readable résumé (prefers-reduced-motion)
  three/
    SceneRig.jsx        REGISTRY maps section.scene → component; mounts all,
                        each scene culls itself by scroll range.
    CameraRig.jsx       interpolates per-section camera keyframes (lib/cameras.js)
    ScrollBridge.jsx    publishes drei scroll offset to scrollStore (for Chrome)
    Effects.jsx         Bloom + Vignette (disabled on mobile)
    scenes/             one file per section (15)
    lib/                palette.js (colors), util.js (math), useScene.js
                        (per-scene frame hook: gives localProgress + active),
                        cameras.js (keyframes keyed by section id)
```

Data flow: `useScene(index, total, (p, active, state, dt) => …)` runs every
frame, hands each scene its local progress `p` (0..1 within its scroll slot) and
whether it's `active`; the scene toggles `group.visible` and animates by `p`.

## The 15 scenes (résumé order)

hero · career timeline · Orleans actors (Pantera) · proto pipeline (Pantera) ·
sharding+load-test (Pantera) · dense build 50M props (Miniverse UE5) ·
render/physics opt · dynamic voxel navmesh · client-delegated distributed sim ·
web collab 1000+ cursors (Miniverse Web) · prop mini-games · channel-less
1000v1000 (AION2, NCDP 2019) · 3D flight navigation (AION2) · TricksterM 2k→8k ·
AI-driven dev (MCP) + contact/summary. Order mirrors the document résumé
(기본 뷰), newest first, grouped by company/period.

All animations are **scroll-driven visual mocks** (choreographed to *look* like
the real algorithm) — the one exception is the flight-nav scene, which runs a
real steering sim: context steering (cone ray sampling vs obstacle spheres,
hits are genuine) plus ORCA-style mutual avoidance between 3 agents.

### Add / edit a scene

1. Content: add or edit an entry in `sections[]` in `src/data/resume.js`
   (`id`, `scene`, `align`, `accent`, `kicker`, `title`, `year`, `blurb`,
   `metric`, `tags`). Omit `scene` for a text-only section.
2. Scene component: `src/three/scenes/XxxScene.jsx`, signature
   `({ index, total }) `, use `useScene(...)`; keep counts modest and animate by
   `p` (see existing scenes as templates).
3. Register it in `src/three/SceneRig.jsx` `REGISTRY`.
4. Camera: add a keyframe entry under the section `id` in
   `src/three/lib/cameras.js` (`[localProgress, [pos], [target]]`).

## Conventions & gotchas (hard-won — keep these)

- **No `React.StrictMode`** (`src/main.jsx`). Its dev double-mount makes drei's
  `<ScrollControls>` call `createRoot()` twice on the same container and throw.
- **Mount-time resize kick** in `Experience.jsx`. R3F sometimes measures its
  container as 0×0 on mount and never fires the observer; we dispatch a `resize`
  on mount (+rAF +timeout). Harmless in real browsers, required in some headless
  environments. Don't remove it.
- **`base: './'`** in `vite.config.js` so the same build works at a domain root
  (Vercel) and under `/<repo>/` (GitHub Pages). Don't hardcode an absolute base.
- **Legibility**: text panels use a dark glass card (`.panel` in `theme.css`) so
  gray text stays readable over bright scenes. Hero is the exception (`.panel--hero`).
- Accent colors: `src/three/lib/palette.js` (JS) mirrors the CSS vars in
  `theme.css`. Change both if you add a color.
- Korean font: Noto Sans KR (loaded in `index.html`); Latin uses Space Grotesk.

## Verifying scenes without a visible browser

Scroll-driven WebGL is awkward to screenshot in a headless/background preview:
a hidden tab pauses `requestAnimationFrame`, so R3F's loop never advances and
the canvas reads black even though the code is fine. To verify anyway:

- Temporarily expose R3F state from a component inside `<Canvas>`:
  `const s = useThree(); window.__advance = s.advance; window.__three = s;`
  and `const scroll = useScroll(); window.__scroll = scroll;`.
- If the viewport is 0×0, force size: set `width/height` on
  `documentElement`/`body`/`#root` and dispatch `resize`.
- Drive it: set `window.__scroll.offset` directly (programmatic `scrollTop`
  doesn't update drei's offset in a hidden tab), then call
  `window.__advance(ts, true)` ~20× with an increasing timestamp.
- Read `window.__three.gl.info.render.calls / .triangles` per offset to confirm
  each scene renders distinct geometry, or `drawImage` the canvas to a 2D canvas
  for a thumbnail (needs `gl={{ preserveDrawingBuffer: true }}` while capturing).
- Remove all of that before committing. A plain `npm run build` catches
  compile/import errors across every scene.

## Polish / TODO backlog (iterative)

- **Verify the newer scenes against real experience.** timeline / data pipeline /
  sharding / prop mini-games were built from the résumé + a short brief; wording
  and specifics may need the owner's corrections.
- Per-scene aesthetic tuning: camera framing, timing, particle/instance counts,
  bloom strength. Each scene file is self-contained — tune the constants at top.
- Mobile pass: `useIsMobile` lowers counts/DPR and drops postprocessing < 768px;
  test on a real device and tune.
- Bundle is ~1 MB (Three.js). Fine for a portfolio; if desired, code-split with
  `manualChunks` or lazy-load heavier scenes.
- GH Actions logs a Node-20 deprecation warning (non-blocking); bump
  `actions/*` versions when convenient.
- Optional: a nicer Korean display font (e.g. Pretendard) for headings.
