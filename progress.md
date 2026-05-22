# Houseplant Hustle — Progress Checkpoint

## Repo & Deploy
- GitHub: https://github.com/dkingbob/houseplant-hustle (branch: **master**)
- Live: https://houseplant-hustle.vercel.app
- Single file: `index.html` (~210KB, all CSS/JS inline)
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
9. ROI Calculator — 4 sliders, animated GSAP counter outputs + **Gerald's Approval meter**
10. Comparison Table — Us vs Spreadsheets vs Consultants vs Gut Feeling (with **tooltips**)
11. Pricing — Seed $0 / Series A $847 / Enterprise (Talk to Gerald) + **Brenda's Notes**
12. Gotcha — satirical reveal ("we got your attention")
13. **[REEL BAND]** — orange skewed marquee with satirical tech text
14. Team — Gerald, Brenda, Patricia, Marcus, **Vera Aloevera (VP Engineering)** — 5 cards
15. Press Logos — infinite marquee with **color-tinted hover glow**
16. CTA / Sold-Out — waitlist button, live viewer count, countdown timer, **referral code on join**
17. Blog — horizontal scroll, **5 cards** with 3D tilt
18. Testimonials — carousel with dots/arrows, auto-advance (5 slides)
19. FAQ — **8 satirical accordion items**
20. **[REEL REVERSE]** — dark reverse-direction marquee before newsletter
21. Newsletter — email input with animated confirm + confetti
22. Footer — share link, IPO teaser, Gerald certified badge, **Plant of the Day**, **Gerald Certificate modal**

### Fixed UI Elements
- Scroll progress bar (top, 2px orange gradient)
- Nav blur + compression on scroll + **Gerald's watching timer** (desktop, fades in after 5s)
- Section dots nav (right side, 6 dots)
- HHPL fake stock widget (top-right, **with SVG sparkline chart**, trends up biased)
- Cookie banner ("Accept All Fronds" / "Reject (Betray Brenda)")
- Bottom news ticker (scrolling satirical headlines — **14 unique headlines**)
- Audio button (ambient drone, Web Audio API)
- Chatbot — Succy AI (🌵, with witty responses, **typing indicator**, **unprompted notification at 35s**, **green notification dot**)
- Custom cursor with ring + orange particle trail
- Legal modal (Terms of Foliage, Brenda approved)
- Konami code easter egg (↑↑↓↓←→←→BA)
- Back-to-top button (appears after 600px scroll, smooth loco scroll)
- Social proof toasts (rotate through 8 fake join/upgrade notifications, every 14s)
- **Scroll milestone achievement toasts** (appear as user reaches new sections, top-right)
- **HHPL market alert notification** (fires at 60s, left side, orange)
- **Mobile hamburger menu** (CSS clip-path reveal, 6 links)
- **Custom scrollbar** (green-tinted, webkit only)

### Interactions
- Magnetic GSAP elastic buttons
- Text scramble on eyebrow labels (.eyb)
- Blog card 3D perspective tilt
- Nav logo glitch on hover
- Hero word rotation every 2.6s
- Hero live metric rotator (Chlorophyll%, Stem Velocity, etc.)
- Page title cycles through **9 satirical headlines** + tab-hide message
- Konami first-key hint toast
- Confetti burst (emoji particles) on waitlist join click
- Team card hover — emoji glow + bio opacity up
- Pricing card hover — lift + shadow
- FAQ open/close — smooth padding transition
- **Comparison table row hover** — green left border + background
- **Tooltip system** (`[data-tip]` attr) — comparison table feature labels
- **Press logo hover** — color-tinted glow (6 rotating colors)
- **Gerald Approval meter** in ROI output — progress bar with Gerald verdicts
- **Keyboard shortcuts overlay** (press `?`) — shows all shortcuts
  - `/` or `c` → open Succy AI
  - `t` → back to top
  - `p` → go to pricing
  - `?` → show shortcuts
  - `↑↑↓↓←→←→BA` → Konami Easter egg
  - `Esc` → close all overlays
- **Gerald Certificate modal** (click Gerald Certified™ badge in footer)
- **Plant of the Day** in footer (rotates by day of week — 7 plants)
- **CTA button pulsing glow animation**

---

## What's Working
Everything deployed and confirmed live. Last significant deploy: session 2026-05-22.

### Additions This Extended Session (in order)
1. Mobile hamburger menu JS toggle + `closeMob()` + hide desktop CTA on mobile
2. Press logo color-tinted hover glow (6 cycling colors)
3. Scroll milestone achievement toasts (top-right, fires per section)
4. Custom scrollbar (webkit, green-tinted)
5. More satirical ticker headlines (7 new ones, 14 total)
6. Gerald's Approval meter in ROI calculator (progress bar + verdicts)
7. HHPL Stock widget — SVG sparkline + "NYSE" label + market cap label
8. Plant of the Day footer feature (7 plants, day-of-week rotation)
9. 2 more FAQ items (Brenda cookies + enterprise pricing)
10. Succy AI typing indicator (animated dots, `showTyping()`)
11. Comparison table tooltips (`[data-tip]` CSS system)
12. CTA waitlist button pulsing glow animation
13. 5th blog card (snake plant $47M case study)
14. Gerald Certificate modal (click Gerald Certified™ badge)
15. Nav "Gerald is watching" time-on-site timer (desktop, after 5s)
16. 5th team member — Vera Aloevera (VP Engineering)
17. HHPL Market Alert notification (fires at 60s, left side)
18. Keyboard shortcuts overlay (press `?`)
19. More keyboard shortcuts: `t` (top), `p` (pricing), `?` (shortcuts)
20. All overlays close on `Esc` (chatbot, legal, cert, kb, konami)
21. Brenda's Notes micro-copy on each pricing card
22. Referral code on waitlist join (PLANT-XXXXXX)
23. Tab visibility title trick ("Come back! Gerald is concerned.")
24. 4 more page titles in rotation
25. Succy AI unprompted notification at 35s (if chatbox closed)
26. Green notification dot on Succy button when message waiting

---

## What's NOT Done Yet
- **User feedback** — user said they have "a lot" — still not collected
- Asymmetric section layouts (from original plan) — partially skipped
- Mobile QA on a real device — browser emulation only so far

---

## Key Technical Context
- Locomotive Scroll 4.1.4 + GSAP ScrollTrigger proxy pattern
- `window._loco` — exposed loco instance (for nav dots scroll-to)
- `window._plantFrames` — pre-rendered 120 canvas frames for scrub
- Three.js r128 UMD via CDN for 3D viewer
- CSS vars: `--black:#070e08`, `--deep:#050c06`, `--mid:#0f1a10`, `--lift:#1a2e1c`, `--surface:#0c1a0d`, `--orange:#e07830`, `--green:#58f066`
- `.rv` class = "reveal" — elements start at `opacity:0,y:30` and are animated in by ScrollTrigger batch
- `[data-tip]` CSS tooltip system — `::after` pseudo-element with `attr(data-tip)` content
- `#ms-toast` — scroll milestone toast, top-right, green-tinted border
- `#mkt-alert` — market alert, left, orange-tinted border
- `#kb-overlay` — keyboard shortcuts overlay, `?` key toggle
- `#gerald-cert` — Gerald certificate modal, click badge to open
- `#nav-timer` / `#nav-timer-val` — Gerald's watching timer in nav
- `#sw-spark` / `sw-spark-line` — SVG sparkline in stock widget
- `.roi-gerald` / `#rGA-fill` — Gerald approval meter in ROI
- `.suc-typing` — typing indicator (3 animated dots)
- `#suc-btn.has-notif` — adds green notification dot
- `.price-brenda` — Brenda's note micro-copy in pricing cards
- `.mob-link` / `#mob-menu` / `#ham` — mobile hamburger menu
- `closeMob()` — global function to close mobile menu
- `#kb-overlay` — keyboard shortcuts modal

## Line Count Reference (approximate)
- Total lines: ~4200+
- CSS: lines 1–~1720 (closing `</style>`)
- HTML body: ~line 1725
- JavaScript: around line ~3050 (inside `<script>`)
- Gerald approval meter: immediately after `calc()` function
- Scroll milestones JS: after social proof toasts JS
- Market alert JS: before scroll milestones JS
- Keyboard handler: near end of script (~line 4350)
- Time-on-site timer: near end of script
- Plant of the Day: near end of script
- Mobile hamburger: last section before `</script>`
