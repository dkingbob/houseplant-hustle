# Houseplant Hustle — Progress Checkpoint

---

## Project Rules (apply to all groups)
1. **PERFORMANCE** — Buttery smooth scroll. Zero lag. rAF properly, no layout thrashing, lazy load where possible. #1 priority.
2. **ORGANIZATION** — Split into multiple files. Separate CSS / JS / assets.
3. **NO LIMITS** — No line count limits. If a feature needs 500 lines, write 500.
4. **CLEAN CODE** — Comment clearly. Sensible file/function names. Maintainable.
5. **BEAUTIFUL CODE** — Readable, elegant, consistent formatting. Meaningful variable names.

---

## STATUS OVERVIEW

| Group | Topic | Status |
|-------|-------|--------|
| 1 | Bug Fixes & Cleanup | ✅ DONE |
| 2 | Animation Fixes | ✅ DONE |
| 3 | Mode Buttons & Hologram | ✅ DONE |
| 4 | 3D Plant Asset (.glb) | ✅ DONE |
| 5 | File Organization | ✅ DONE |
| 6 | Storyboard / Scroll Narrative | ✅ DONE |
| 7 | Interactive Details | 🔄 IN PROGRESS |
| 8 | Endless Loop | ⬜ PENDING |
| 9 | Cool JS Integrations | ⬜ PENDING |
| 10 | Audio | ⬜ PENDING |

---

## WHERE WE ARE RIGHT NOW

**Completed through**: GROUP 6 — Full 9-phase storyboard rebuild (2026-05-22).
**Next up**: GROUP 7 — Interactive Details (leaf react to hover/touch, annotation hover effects).

---

## GROUP 1: BUG FIXES & CLEANUP — ✅ DONE (2026-05-22)
- [x] Remove fake stock ticker — HTML, CSS, JS removed
- [x] Remove Succy AI cactus chatbot — HTML, CSS, JS removed
- [x] Remove orange debug text — hero metric rotator, market alert all removed
- [x] Remove hero-glow (mouse-following green band)
- [x] Hide native cursor — `cursor:none` on all elements
- [x] Fix starting text cut off — hero padding increased to 8vh
- [x] Hero reveal — cinematic timing (1.6s duration, 0.2 stagger)
- [x] Nav z-index bumped to 9000 — always on top
- [x] Cursor visual artifacts fixed — now orange ring/dot, no mix-blend-mode
- [x] ROI section color blend — gradient overlays at section edges

---

## GROUP 2: ANIMATION FIXES — ✅ DONE (2026-05-22)

### Round 1 fixes
- [x] Scrub overlay → 3-column grid (left text | plant center | right heading)
- [x] Stat counter re-animation threshold: 85% → 65% (fires earlier on scroll back)
- [x] Slower scroll speed: multiplier .9→.65, lerp .08→.065
- [x] Section edge blending via gradient backgrounds (no visible page boundaries)
- [x] Palette lightened from near-black to readable green

### Round 2 fixes
- [x] Word hover: one effect per heading section, different effects per section (not mixed per word)
- [x] Water effect — wave pulse across words on hover
- [x] Rubber effect — elastic skew/scale on mouse move
- [x] Orange trail — mouse leaves orange color on words for 1.3s, no blur/glow
- [x] Remove 3D viewer (Three.js) — looked bad, taken out entirely
- [x] Fix stack card animation — replaced broken GSAP pin with Locomotive scroll event
- [x] Fix text overflow ("Chlorophyll Is Your North Star") — font-size reduced for 3-column layout
- [x] Remove clip-path section dividers — were causing visible hard edges

### Round 3 fixes (2026-05-22)
- [x] **Plant canvas opacity bug** — plant was always opacity:0, never shown; fixed in scrub block + ambient loop
- [x] **Stack cards y-offset bug** — cards snapped wrong at start; now blend from stacked position to fly-out
- [x] **Blog horizontal scroll** — was broken (GSAP pin:true incompatible with Locomotive Scroll); replaced with loco.on('scroll') event + data-scroll-sticky wrapper
- [x] **Paint hover re-trigger** — forced remove+reflow before re-adding class so re-entering same word always fires
- [x] **Rubber drag** — mousedown to start drag, stretch follows cursor, mouseup snaps back with elastic spring
- [x] **Effect hints** — small label injected below each interactive heading (e.g. "↑ hover & drag — stretch")
- [x] **Invert flash** — brief mix-blend-mode:difference white overlay fires as user scrolls past hero
- [x] **Brighter background** — CSS vars bumped: `--black:#1e2e20`, `--deep:#172518`, `--mid:#223326`, `--lift:#2c4430`
- [x] **Ambient plant always present** — alpha raised, fadeout extended to 9 viewport-heights post-scrub
- [x] **roi-output palette** — replaced hardcoded `#0d1a0f` with `var(--deep)` for consistency

---

## GROUP 3: MODE BUTTONS & HOLOGRAM — ✅ DONE (2026-05-22)

- [x] Mode buttons (Standard, Thermal, X-Ray, Wireframe) in Phase 7 panel, all functional
- [x] Each mode switches material on the Three.js plant in real time
- [x] Phase 6 replaced with Design Sketch Overlay (pencil/charcoal lines, hover → green glow)
- [x] Phase 7: Green scan line follows mouse Y; mode buttons active
- [x] Phase 8: Free drag-to-rotate (OrbitControls), pre-order CTA + mini testimonials
- [x] Phase 9: Loop transition — camera rises back to Phase 1 top-down angle

---

## GROUP 4: 3D PLANT ASSET — ⬜ PENDING

- [ ] Replace current canvas plant with proper 3D `.glb` plant + terracotta pot
- [ ] Viewport-locked persistent 3D hero object — stays in frame entire scroll
- [ ] High quality, not blurry
- [ ] Plant must not appear before its intended reveal moment
- **Note**: User has a `.glb` file ready to share — just send the file path

---

## GROUP 5: FILE ORGANIZATION — ✅ DONE (2026-05-22)
- [x] Split single `index.html` (4870 lines) into `index.html` / `styles.css` / `main.js`
- [x] All functionality identical
- [x] Vercel deployment confirmed working
- Current line counts: `index.html` ~835, `styles.css` ~1540, `main.js` ~1883

---

## GROUP 6: STORYBOARD — SCROLL NARRATIVE — ✅ DONE (2026-05-22)
- [x] Phase 1: Desk top-down, terracotta pot + plant centered, all desk items visible
- [x] Phase 2: Camera tilts from top-down to 3/4 to front, desk items fade
- [x] Phase 3: Front view, pot + plant, info text + annotations on side
- [x] Phase 4: Pot becomes semi-transparent (opacity 0.18), soil + roots visible
- [x] Phase 5: Pot dissolved, soil particles fall with physics, bare roots
- [x] Phase 6: Design sketch overlay — pencil/charcoal lines of plant, hover → green glow
- [x] Phase 7: Green scan line follows mouse Y, mode toggles (Standard/Thermal/X-Ray/Wireframe)
- [x] Phase 8: Free drag-to-rotate, CTA button, satirical mini testimonials
- [x] Phase 9: Loop transition — camera rises back toward Phase 1 top-down view
- [x] Mouse desk tilt in Phase 1 (camera follows cursor subtly)
- [x] Scene background fixed to match CSS --black (#1e2e20) — no color seam
- [x] Persistent Three.js canvas inside Locomotive sticky throughout 900vh scroll

---

## GROUP 7: INTERACTIVE DETAILS — ⬜ PENDING
- [ ] Leaves react to hover/touch — bend or sway
- [ ] Post-scan: mouse vertical movement over hologram triggers scanning animation + sci-fi sound
- [ ] Side text annotations with lines pointing to plant parts
- [ ] Hover on annotation → text glows + corresponding leaf moves

---

## GROUP 8: ENDLESS LOOP — ⬜ PENDING
- [ ] After free rotation at bottom, transition back to Phase 1
- [ ] Phase 1 scroll-locked — cannot scroll backwards from start
- [ ] Infinite loop feel

---

## GROUP 9: COOL JS INTEGRATION — ⬜ PENDING (snippets to be provided by user)
- [ ] Virtual scroll + marquee scrub (smooth lerped scroll with horizontal marquee)
- [ ] Per-word scroll-color text reveal (each word changes color individually as you scroll)
- [ ] Circle-scale + text-slide on scroll (circle grows 0→25x while text slides)
- [ ] Spiral `.glb` asset as portal transition between phases (asset downloaded)

---

## GROUP 10: AUDIO — ⬜ PENDING
- [ ] Scroll-synced sound effects per phase
- [ ] Crossfade between sounds using Howler.js
- [ ] Mute toggle button

---

## Repo & Deploy
- GitHub: https://github.com/dkingbob/houseplant-hustle (branch: **master**)
- Live: https://houseplant-hustle.vercel.app
- Files: `index.html` / `styles.css` / `main.js` (3 separate files)
- Deploy: `npx vercel --prod` from project root
- Push: `git push origin master` (NOT main)

---

## Key Technical Context
- Locomotive Scroll 4.1.4 + GSAP 3.12.5 ScrollTrigger proxy pattern
- All ScrollTriggers need `scroller:'[data-scroll-container]'`
- `window._loco` — exposed Locomotive instance
- `window._plantFrames` — 120 pre-rendered canvas frames for scrub
- `window._plantScrubMode` / `window._plantAmbient` — plant canvas state flags
- CSS vars: `--black:#1e2e20`, `--deep:#172518`, `--mid:#223326`, `--lift:#2c4430`, `--surface:#1f3022`, `--orange:#e07830`, `--green:#58f066`
- `.rv` / `.rf` — reveal classes, start `opacity:0,y:40`, animated by ScrollTrigger
- `.lw span` — line-wrap word spans, animated with `translateY(105%)` reveal
- `#blog-sticky` — Locomotive sticky wrapper for horizontal blog scroll
- `#stack-sticky` — Locomotive sticky wrapper for stack card reveal
- Stack + blog scroll: driven by `loco.on('scroll', ...)` with manual progress calc
- Rubber drag: `_rbActive` per-section closure, global window mousemove/mouseup
- `#inv-flash` — fixed invert overlay for section transition flash
- `.fx-hint` — small hint label injected below interactive headings
