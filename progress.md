# Houseplant Hustle — Progress Checkpoint

## Repo & Deploy
- GitHub: https://github.com/dkingbob/houseplant-hustle (branch: **master**)
- Live: https://houseplant-hustle.vercel.app
- Single file: `index.html` (~175KB, all CSS/JS inline)
- Deploy command: `npx vercel --prod` from project root
- Git push: `git push origin master` (NOT main)

---

## What's Built

### Core Sections (top → bottom)
1. Preloader — countdown % with cinematic clip-path wipe exit
2. Hero — massive rotating word (BUILT FOR BUSINESS/MARKETS/etc), particle canvas, live metric tag
3. Tagline — 3 animated stat counters (847%, 12K, 47Y), bleed "847" bg number
4. Scroll Scrub — 320vh, 120 pre-rendered plant frames, 4 visual modes
5. Stack Reveal — 400vh pin, 5 mode cards peel off
6. Blueprint — holographic canvas overlay
7. AI Engine — particle canvas + feature list
8. 3D Viewer — Three.js procedural plant, drag/zoom
9. ROI Calculator — 4 sliders, animated GSAP counter outputs
10. Comparison Table — Us vs Spreadsheets vs Consultants vs Gut Feeling
11. Pricing — Seed $0 / Series A $847 / Enterprise (Talk to Gerald)
12. Gotcha — satirical reveal ("we got your attention")
13. **[REEL BAND]** — orange skewed marquee with satirical tech text
14. Team — Gerald (CEO Fern), Brenda (Legal Cactus), Patricia (CFO Orchid), Marcus (Growth Monstera)
15. Press Logos — infinite marquee
16. CTA / Sold-Out — waitlist button, live viewer count, **countdown timer**
17. Blog — horizontal scroll, 4 cards with 3D tilt
18. Testimonials — carousel with dots/arrows, auto-advance (3 slides)
19. FAQ — 6 satirical accordion items
20. **[REEL REVERSE]** — dark reverse-direction marquee before newsletter
21. Newsletter — email input with animated confirm
22. Footer — share link, IPO teaser, Gerald certified badge

### Fixed UI Elements
- Scroll progress bar (top, 2px orange gradient)
- Nav blur + **compression** on scroll (padding reduces)
- Section dots nav (right side, 6 dots)
- HHPL fake stock widget (top-right, trends up biased)
- Cookie banner ("Accept All Fronds" / "Reject (Betray Brenda)")
- Bottom news ticker (scrolling satirical headlines)
- Audio button (ambient drone, Web Audio API)
- Chatbot — Succy AI (🌵, with witty responses)
- Custom cursor with ring + orange particle trail
- Legal modal (Terms of Foliage, Brenda approved)
- Konami code easter egg (↑↑↓↓←→←→BA)
- **Back-to-top button** (appears after 600px scroll, smooth loco scroll)
- **Social proof toasts** (rotate through 8 fake join/upgrade notifications, every 14s)

### Interactions
- Magnetic GSAP elastic buttons
- Text scramble on eyebrow labels (.eyb)
- Blog card 3D perspective tilt
- Nav logo glitch on hover
- Hero word rotation every 2.6s
- Hero live metric rotator (Chlorophyll%, Stem Velocity, etc.)
- Page title cycles through satirical headlines
- Konami first-key hint toast
- **Confetti burst** (emoji particles) on waitlist join click
- **Team card hover** — emoji glow + bio opacity up
- **Pricing card hover** — lift + shadow
- **FAQ open/close** — smooth padding transition

---

## What's Working
Everything deployed and confirmed live. Last significant deploy: session 2026-05-22.

### Recent Additions (this session, in order)
1. Price card hover lift + box-shadow
2. FAQ smooth open/close transitions
3. Back-to-top button (fixed, appears after scroll)
4. Nav height compression on scroll (`padding` transition)
5. Mobile responsive fixes:
   - Comparison table → `overflow-x:auto` with min-width
   - Newsletter form stacks vertically
   - Chatbot + audio button repositioned for mobile ticker
   - 500px breakpoint for nav, FAQ, pricing padding
6. Section dividers (clip-path triangles between tagline/team/nl sections)
7. Orange reel marquee band (skewY -1.5deg) — between gotcha and team
8. Reverse dark reel band — before newsletter
9. Social proof toasts (left bottom, slide in every 14s)
10. Team card hover — green emoji glow
11. CTA countdown timer (3-5h random, counts down in real-time)
12. Pricing card border-radius 4px → 16px
13. Confetti burst (GSAP emoji particles) on waitlist join
14. Gerald Certified™ badge in footer
15. Pricing feature items stagger x-slide on scroll enter

---

## What's NOT Done Yet
- **User feedback** — user said they have "a lot" — still not collected
- Testimonial carousel only has 3 slides — adding 2 more was in progress
- Asymmetric section layouts (from original plan) — partially skipped
- Mobile QA on a real device — browser emulation only so far
- The hero shows text on mid-animation in Playwright screenshots (normal)

---

## Next Steps (continue here)
1. **Add 2 more testimonial slides** — find the `.tes-track` div and add slides 4+5 with new satirical quotes, then update the dots HTML to add 2 more `.tes-dot` buttons
2. **Smooth FAQ details animation** — add JS to animate `<details>` height
3. **Hero floating badge** — small floating card near hero bottom with live "plants monitored" counter
4. **More Succy AI responses** — expand the SR._ array with more jokes
5. **Press logos variety** — they're all text, could add subtle animation
6. **Collect user feedback** — user has "a lot" of feedback, ask when done

---

## Key Technical Context
- Locomotive Scroll 4.1.4 + GSAP ScrollTrigger proxy pattern
- `window._loco` — exposed loco instance (for nav dots scroll-to)
- `window._plantFrames` — pre-rendered 120 canvas frames for scrub
- `window._plantMode` / `window._plantScrubMode` / `window._plantAmbient`
- Three.js r128 UMD via CDN for 3D viewer
- CSS vars: `--black:#070e08`, `--deep:#050c06`, `--mid:#0f1a10`, `--lift:#1a2e1c`, `--surface:#0c1a0d`, `--orange:#e07830`, `--green:#58f066`
- All sections have `data-scroll-section` for Locomotive Scroll
- ScrollTrigger uses `scroller:'[data-scroll-container]'` (the loco proxy)
- `.rv` class = "reveal" — elements start at `opacity:0,y:30` and are animated in by ScrollTrigger batch
- Social proof toast: `#sp-toast` element, `.show` class added/removed by JS timer
- Back-to-top: `#btt` element, `.vis` class toggled when scroll.y > 600
- Countdown: `#cd-h`, `#cd-m`, `#cd-s` span elements, ticked by setInterval
- Reel bands: `.reel` / `.reel-rev` — CSS animation `reelRun` / `reelRunRev`

## CSS Architecture (key rules)
- `.btn` — already pill-shaped (`border-radius:100px`)
- `#nav` — `padding:1.75rem var(--px)`, compresses to `1rem` on `.scrolled`
- `#nav.scrolled` — `background:rgba(5,12,6,.72)`, `backdrop-filter:blur(16px)`
- `#btt` — `position:fixed;bottom:8rem;right:2.5rem`, `.vis` → `opacity:1`
- `#sp-toast` — `position:fixed;bottom:9rem;left:2rem`, `.show` → `translateX(0)`
- `.reel` — `background:var(--orange);transform:skewY(-1.5deg);margin:0 -5vw`
- `.price-card` — `border-radius:16px`, hover: `translateY(-6px)+box-shadow`

## Line Count Reference (approximate)
- Total lines: ~3600+
- CSS ends around line ~1480 (closing `</style>`)
- HTML body starts ~line 1490
- JavaScript starts around line ~2800 (inside `<script>`)
- ScrollTrigger blocks: lines ~3180–3300
- Social proof toast JS: ~line 3504
- CTA countdown JS: ~line 3640
- Testimonials carousel JS: ~line 3466
- Back-to-top JS: ~line 3457
- Waitlist button + confetti JS: ~line 3610
