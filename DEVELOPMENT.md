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

A Korean résumé for a 20-year MMO server architect, in two pages: the document
(`index.html`) and the motion page (`interactive.html`). On the motion page,
thirteen headline projects (twelve from work, one personal) are explained as scroll-scrubbed motion graphics, each
next to its résumé bullets. **Content is primary** — every résumé fact (company,
role, period, education, awards, stack) stays present as text.

The motion pieces follow the explainer approach from the
`jungrok5/mmo-server-explained` repo: a "style" is a way of explaining (open it up,
make the flow visible, real artifacts in space, in-game replay …), and the look
of each piece comes from its own subject. Numbers on screen come only from the
résumé; anything illustrative is labelled 개념도 or 예시.

## Architecture

```
src/
  data/resume.js        SSOT: sections[], highlights[], profile, timeline, projects, stack
  App.jsx               reduced-motion switch → Experience vs. static FallbackDoc
  components/
    Experience.jsx      the page; also updates the top bar, gauge and GA events on scroll
    MotionSection.jsx   one highlight: sticky stage (iframe) + text panel
    Parts.jsx           Metric, Points, Timeline, Contact, Summary
    Chrome.jsx          fixed top bar (reads lib/scrollStore)
    FallbackDoc.jsx     static résumé (prefers-reduced-motion)
public/motion/
  <id>/index.html       one piece per highlight id (self-contained)
  <id>/poster.jpg       16:9 first frame, <id>/poster-tall.jpg 4:5 first frame
  <id>/<id>.mp4         baked video, 1280×720 · <id>/<id>-tall.mp4 864×1080 (linked under each stage)
  assets/               vendored three.js 0.170 + Pretendard / JetBrains Mono
```

## The thirteen pieces (in page order)

| id | Résumé item | Approach |
|---|---|---|
| `combat` | AION2 channel-less 1,000 vs 1,000, 13M packets/s | make the flow visible |
| `giant` | AION2 giant NPC combat (research) | in-game replay |
| `collision` | AION2 server character collision, 20,000-agent test | open it up |
| `raycast` | AION2 3D flight navigation, 2.5D → 3D voxels, 10K × 10K | open it up |
| `trickster` | TricksterM dispatch, stable CCU 2,000 → 8,000 | open it up |
| `densebuild` | 50M props full tick + 2,000 builders, single dispatcher | make the flow visible |
| `spatial` | 51억 props / 422 GB → 집터 · 청크 · 셀 + SightIn | open it up |
| `renderopt` | draw calls 20,967 → 503, FPS 16.5 → 47.4 | in-game replay |
| `navmesh` | server dynamic navmesh, affected tiles only (수~수십 ms) | in-game replay (Godot viewer look) |
| `ownership` | client-delegated NPC simulation, ownership migration | make the flow visible |
| `pipeline` | proto single source → code · CSV · validation | real artifacts in space |
| `ai` | in-house MCP server, agent team, local LLM | real artifacts in space |
| `collab` | personal project: 5 AI tools → one AGENTS.md, same checks, 2 human decisions | make the flow visible (`git log --graph` look) |

### Piece contract

- `window.DURATION` (s), `window.ready` (Promise), `window.renderAt(t)`; every
  frame is a pure function of `t` (seeded randomness, no frame-to-frame state),
  so scrolling backward works.
- `?embed` → canvas only, no player, no loop of its own. `?layout=tall` → 1080×1350
  composition (default 1920×1080). `?q=0.4–1` → internal resolution scale.
  `?render` → no player (used by the render script).
- t = 0 is a meaningful frame (it is the poster); the last ~3 s hold the result.

### Add or replace a piece

1. Build `public/motion/<id>/index.html` to the contract above (copy an
   existing piece's engine section), plus `poster.jpg` and `poster-tall.jpg` (JPEG, ~100–350 KB).
2. Add `<id>` to `highlights` in `src/data/resume.js` (the section with that id
   provides the text panel; give it a one-line `hook`).
3. Stills / MP4: `node <mmo-server-explained>/scripts/render.mjs public/motion/<id>/index.html out/ --stills 0,10,20`
   (add `--query layout=tall --size 1080x1350` for the phone composition), run from this repo's root.
4. MP4: render in short segments with the same script and join them with ffmpeg, e.g.
   `--query "embed&q=0.6667" --from 0 --to 6 --crf 16` (wide → 1280×720) or
   `--query "embed&layout=tall&q=0.8" --size 1080x1350` (tall → 864×1080), then concat and re-encode at CRF 24.
   Re-bake a piece's MP4s whenever its index.html changes.

## Conventions & gotchas (hard-won — keep these)

- **`base: './'`** in `vite.config.js` so the same build works at a domain root
  (Vercel) and under `/<repo>/` (GitHub Pages). Don't hardcode an absolute base.
- **Scroll goes to the page, not the iframe**: stage iframes have
  `pointer-events: none`; keep it, or wheel/touch scrolling stops over the stage.
- Korean font: Noto Sans KR (loaded in `index.html`); Latin uses Space Grotesk.

## Verifying

- `npm run build` catches compile/import errors.
- Screenshot the built page at desktop and phone widths with Playwright: scroll
  to a highlight, wait for `.ms-poster.off` (the piece is live), then capture.
  Headless Chromium needs software WebGL (`--use-angle=swiftshader`). The stage
  eases toward the scroll target with requestAnimationFrame, so a hidden or
  background tab does not update; use a normal headless page.
