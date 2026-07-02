# Résumé — Jeongrok Oh (오정록)

One GitHub Pages site, two ways to read the same résumé:

| Path | What | Notes |
|------|------|-------|
| `/` (`index.html`) | **Document résumé** — 4 views (기본 · ATS · 링크드인 · 상세) + dark mode + print | Static HTML, fast, SEO/ATS-friendly. **Default landing.** |
| `/interactive.html` | **Interactive 3D résumé** — scroll-driven WebGL experience | Heavy Three.js bundle loads only here. |

The document view's top switcher has a **`✨ 3D`** tab that opens the interactive
page; the interactive page has a **`← 이력서`** link back. See
[`SETUP.md`](SETUP.md) for GitHub Pages, Google Search Console, and Analytics setup.

## The interactive 3D view

A scroll-driven WebGL résumé that visualizes 20 years of MMO server engineering.
Each section pairs a text panel with a simplified, animated 3D scene of the
underlying server technique — voxel navigation, distributed actors, dense-combat
broadcast optimization, and more.

> The 3D animations are **visual mocks** (GSAP-style timelines driven by scroll),
> not real solvers — e.g. the A\* frontier and broadcast web are choreographed to
> _look_ like the real thing without running the real computation every frame.
> The one exception: the 3D raycast scene actually tests its cone rays against
> obstacle spheres, so ray hits are genuinely reactive.

## Stack

- **React 18** + **Vite**
- **three.js** + **@react-three/fiber** + **@react-three/drei** (`ScrollControls`)
- **@react-three/postprocessing** (Bloom / Vignette)
- Content and scene metadata live in one place: [`src/data/resume.js`](src/data/resume.js)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

The build uses `base: './'` (relative asset paths), so the same `dist/` works
both at a domain root (Vercel) and under a subpath (`/<repo>/` on GitHub Pages).

### GitHub Pages (included workflow)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

1. Create a GitHub repo and push this folder to it (`main` branch).
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push. The site publishes at `https://<user>.github.io/<repo>/`.

Manual alternative (no Actions): `npm run build && npx gh-pages -d dist`.

### Vercel

Vite is a first-class Vercel target (a `vercel.json` for the SPA rewrite is
included).

```bash
npm i -g vercel
vercel --prod     # or push to GitHub and "Import Project" in the dashboard
```

The existing site at `resume.jungrok5.workers.dev` is untouched — either option
deploys as a separate project.

## Structure

```
src/
  data/resume.js          # ← all content + per-section scene config (edit here)
  App.jsx                 # reduced-motion switch: Experience vs. static FallbackDoc
  components/
    Experience.jsx        # <Canvas> + ScrollControls + postprocessing
    Overlay.jsx           # HTML section panels (rendered over the 3D via <Scroll html>)
    Chrome.jsx            # fixed brand / links / progress rail
    FallbackDoc.jsx       # static, fully-readable résumé (prefers-reduced-motion)
  three/
    CameraRig.jsx         # cinematic camera, keyframes per scene (lib/cameras.js)
    SceneRig.jsx          # mounts all scenes; each culls itself by scroll range
    ScrollBridge.jsx      # publishes scroll offset to DOM chrome
    Effects.jsx           # Bloom + Vignette
    scenes/               # one file per section (9 scenes)
    lib/                  # palette, math utils, useScene hook, camera keyframes
```

### Editing

- **Text / metrics / tags / order:** edit the `sections` array in
  [`src/data/resume.js`](src/data/resume.js). The overlay, progress rail, and
  fallback doc all derive from it.
- **A scene's look:** each scene is self-contained under `src/three/scenes/`.
  Tune counts, colors (`three/lib/palette.js`), and timing constants at the top.
- **Camera framing / motion:** [`src/three/lib/cameras.js`](src/three/lib/cameras.js) —
  `[localProgress, [pos], [target]]` keyframes per section id.

## Notes

- **No `React.StrictMode`.** Its dev-only double-mount makes drei's
  `ScrollControls` call `createRoot()` twice on the same container. This is the
  conventional setup for R3F/drei apps.
- **Accessibility:** users with `prefers-reduced-motion` get `FallbackDoc` — the
  same content as a plain, scrollable document with no WebGL.
- **Mobile:** particle/instance counts and DPR are reduced, and postprocessing is
  disabled below 768px (`useIsMobile`).
