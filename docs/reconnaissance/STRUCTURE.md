# STRUCTURE — page anatomy, DOM hierarchy, layout system

Source: `https://clearpath-template.framer.website/` (homepage only).
Generator: **Framer** (`<meta name="generator" content="Framer 40f5bc6">`), React 18 + Framer Motion runtime, plus
custom code components (GSAP 3.12.5 + ScrollTrigger, Lenis, NumberFlow).

Raw evidence: `reference/dom/tree-<W>x<H>.txt` (indented visible DOM, one line per element, with document
coordinates `@x,y,w,h`) and `reference/dom/nodes-<W>x<H>.json` (same nodes + non-default computed styles).
Text inside the dumps is truncated to short locator strings on purpose.

---

## 1. Top-level document skeleton (desktop, 1440×900)

```
body (bg #fff)
└─ #main > div.framer-…-lkcb1d  (flex column, 1440×17048, position:relative)
   ├─ [fixed] progressive-blur strip          1440×220, top:0  (8 stacked backdrop-filter layers, see VISUAL.md §6)
   ├─ div.framer-djtar … (display:contents)   ← the page component
   │  ├─ [fixed] "Waves Container"            1440×100vh, two 6000×680 wavy SVG lines   (desktop only)
   │  ├─ "Main Container"                     flex column, gap 0 — holds the 16 sections below
   │  └─ [fixed] nav container                1440×79, top:0, z above content
   ├─ footer "Footer Container"               1440×991 (dark, image background)
   └─ [fixed] Framer promo badge (bottom-right) ← NOT part of the design, exclude
```

## 2. Section order (exact, top → bottom)

Framer layer names are used as canonical section IDs. Heights are for 1440×900 (see
`BREAKPOINTS.md` for all 8 viewports).

| # | Layer name | Doc Y | Height | Background | What it is |
|---|---|---|---|---|---|
| 1 | **Page Intro** | 0 | 900 (100vh) | photo (sticky) | Hero: full-bleed portrait photo over a blurred green photo, 3 thin outline circles, 2 animated white SVG lines, giant serif H1 (3 lines, bottom-left), paragraph + pill CTA bottom-right |
| 2 | **Toggle** | 900 | 1400 | transparent (hero backdrop shows through) | Sticky 500px block: a "Balance" switch + two stacked headline/paragraph pairs that cross-fade when the switch flips (scroll-driven) |
| 3 | **Our Services** | 2300 | 640 | transparent → white | 4 tall image cards (316×560) in a row, image parallax inside |
| 4 | **Our Philosophy** | 2940 | 630 | white | Icon + eyebrow label, centered 2–3 line statement with word-by-word scroll opacity reveal, pill CTA |
| 5 | **Story A** | 3570 | 1022 | white | Eyebrow row, left: serif H2 + paragraph + pill; right: two overlapping portrait images (parallax) |
| 6 | **How It Works** | 4592 | 2562 | white | Huge serif H2 (two colours) + intro; 3 steps in left column (separated by 450px spacers); right column sticky giant number "01→02→03" that rolls; long GSAP-drawn wavy line in background |
| 7 | **Ready to find your path?** | 7154 | 639 | white | Left: sans H2 (2 colours) + paragraph + pill; right: rating widget (avatars, score, star) + contact paragraph + 4 social icons |
| 8 | **Pricing** | 7793 | 1104 | #fafafa | Icon + eyebrow, H2 with hand-drawn scribble underline (GSAP draw), paragraph, Monthly/Yearly switch, 3 white cards (radius 16) |
| 9 | **Text Section** | 8897 | 478 | #fafafa | 2-column text: sans H2 (with green tail) left, paragraph right |
| 10 | **Big Quote** | 9376 | 1080 | #000 + photo | Dark photo with parallax + noise, white arc "Shape" at the top that folds away in 3D (rotateX), 2 white decorative lines, serif quote + attribution |
| 11 | **Story B** | 10456 | 982 | white | Same component as Story A (second story) |
| 12 | **Journal** | 11437 | 1367 | white | Icon + eyebrow, H2, paragraph, pill; 3 article cards with blob-masked images and thin outline strokes, middle card offset +100px |
| 13 | **Text Section** (2) | 12804 | 531 | #fafafa | Same 2-column text pattern |
| 14 | **Numbers** | 13335 | 298 | #fafafa | 4 counters (big number + 2-line label) |
| 15 | **FAQ** | 13633 | 736 | #fafafa | Left: H2 + paragraph (top) and helper text + pill (bottom); right: 6 accordion items (white, radius 16) |
| 16 | **Book A Session** | 14369 | 1688 | white | Left: eyebrow, serif H2 (2 colours), paragraph, sticky rating/social block; right: long form (inputs, select, textarea, 5 checkboxes, select, opt-in checkbox, submit pill) |
| — | **Footer Container** | 16057 | 991 | dark photo + noise | Newsletter (serif H2, text, email input + subscribe pill, fine print), sitemap 2 columns, contact line, social icons, Framer credit, copyright |

Invisible 8×8 "marker" `<section>`s used as scroll targets (they carry the IDs used by Framer scroll effects):
`hero`, `toggle-start-animation` (y≈1144), `dark-nav-1` (y≈1384), `toggle-on-anchor` (y≈1702, also the
anchor the switch links to), `toggle-on-animation` (y≈1846), `story-a` (1800 tall), `how-it-works` (900 tall),
`step-2-trigger` (y≈5757), `step-3-trigger` (y≈6431), `big-quote` (900 tall), `story-b`, `numbers`,
`footer-menu` (y≈16009).

## 3. Layout system

* **Everything is flexbox** (Framer stacks). No CSS grid on the page. Main Container: `flex-direction:column; gap:0`.
* **Horizontal rhythm (desktop)**: section wrapper `padding:0 56px` + inner text wrappers `padding:0 8px`
  ⇒ content edge at **x = 64 … 1376** (1312px) at 1440. At 1920 content spans 64 … 1856 (layout is fluid,
  not max-width-capped — widths scale with viewport).
* Recurring **3-column split** (desktop): left 664 (56→720) · spacer 221 (720→941, `hidden` on phone) ·
  right 443 (941→1384). Used by Hero bottom text, Ready-to-find, Text Sections, footer.
* Recurring **story split**: text 553 · spacer 111 · media 664 (Story A/B, FAQ, Book A Session).
* Cards: services 4×316 with 16px gaps; pricing 3×427 with ~16px gaps; journal 3×357 spread with auto gaps.
* **Sticky elements** (position:sticky): hero "Image" layer (inside a 3600px-tall "Image Container", so the
  hero photo stays pinned while ~2700px of content scrolls over it), Toggle block (500px, top 0),
  How-It-Works "Big Number Container" (540×900), Book-A-Session left "Container" (rating + socials).
* **Fixed elements**: nav (79px desktop / 69px phone), progressive blur (220px), Waves Container (desktop),
  promo badge.
* Vertical section padding (desktop): mostly `160px 0` (Our Philosophy / Story A top 200px); tablet 120px;
  phone 80–100px. Full table in `BREAKPOINTS.md`.

## 4. Component hierarchy (Framer components → reuse map)

| Component (class root) | Variants observed | Used in |
|---|---|---|
| Nav `framer-1juce9w` | Desktop / Tablet / Phone (+ menu open) | fixed header |
| Nav menu row `framer-dzsk0e` | two stacked copies "Menu White" & "Menu Dark", cross-faded | nav (desktop) |
| Nav link `framer-1l2g74h` | Desktop, hover (underline "line" grows) | nav |
| Logo `framer-184vqzk` | White / Dark | nav |
| **Pill button** `framer-wsdyl9` | Desktop (rest), hover (content slides → dot swaps side) | hero, philosophy, stories, ready, journal, FAQ, nav CTA |
| Service card `framer-mi53us` | Desktop, Touch, hover | Our Services |
| Parallax image `ImageParallaxVerticalNoize` (code) | intensity 200 / 300 / 100 / 500 | services, stories, big quote |
| Toggle switch `framer-566tf9`/`mldl2n`/`1aat3pr` | Start, Off, On | Toggle section |
| Toggle block `framer-10xhhiq` / `8451ev` | Toggle Off / On | Toggle section |
| Big number `framer-1iff3ar` / `15pp6vn` / `1nxc56i` | 01 / 02 / 03 | How It Works |
| Rating widget `framer-1wbeo4d` | — | Ready, Book |
| Avatar `framer-jqnges` | Variant 1 (masked ring) | rating |
| Social icon `framer-19gd0gr` | Desktop, hover (opacity) | ready, book, footer |
| Pricing switch `framer-1uwbx76` / `wx4344` | Toggle Off (Monthly) / On (Yearly) | Pricing |
| Pricing card `framer-15gt6mo` | Monthly / Yearly, hover (border) | Pricing |
| Price `number-flow-react` (NumberFlow web component) | — | Pricing |
| Article card `framer-et0r4d` | Desktop (+ middle offset) | Journal |
| Counter `framer-zbc97v` | Desktop / Tablet / Phone | Numbers |
| FAQ list `framer-pmeiww` + item `framer-ltb46s` (Open) / `kvw35u` (Closed) | Open/Closed | FAQ |
| Form (Framer native form) | — | Book A Session, footer newsletter |
| Submit button `framer-1vpdtys` | Desktop, hover, loading (conic spinner) | form |
| Text Scroll Reveal (code) | word mode | Our Philosophy |
| Animator Basic With Scroll (code, GSAP) | — | hero lines, how-it-works line, pricing scribble |
| Smooth scroll (code, Lenis) | intensity 20 → duration 2 | page |

## 5. Framer-specific DOM idioms worth knowing for the rebuild

* Framer renders **all three breakpoints' variants in the DOM** and hides the inactive ones with
  `.hidden-<hash>` classes under media queries (`hidden-72rtr7`/`lkcb1d` desktop, `hidden-1f5hb54`/`vtru7o`
  tablet, `hidden-1ln1qcq`/`16glfzb` phone). A clone can instead use one component with responsive CSS.
* `display:contents` wrappers are frequent (breakpoint wrappers) — ignore them structurally.
* Text is in `.framer-text` `<h1..h6>/<p>` with `--framer-*` CSS variables (see VISUAL.md typography).
* Large display numbers in How-It-Works are rendered as **SVG `<foreignObject>` "fit-text"** (text scaled
  to box width) — not plain HTML text.
* Section icons are `mask-image` SVGs filled by `background-color`.
