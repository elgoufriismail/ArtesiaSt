# RESPONSIVE — every meaningful desktop / tablet / phone difference

Breakpoints: Desktop ≥1200 · Tablet 810–1199 · Phone <810 (see BREAKPOINTS.md). Evidence:
`reference/screenshots/<vp>/`, `reference/dom/tree-<vp>.txt`, `reference/animations/scroll-<vp>.json`,
frames under `reference/animations/frames/{1024x768,390x844}/`.

Widths inside a breakpoint are **fluid** (flex percentages) — 1920 vs 1280 differ only by column widths
and the ≥1600 type tier; 430 vs 375 differ only by widths/wrapping.

## 1. Global

| Aspect | Desktop | Tablet | Phone |
|---|---|---|---|
| Nav | transparent over content, 79 px; logo left; 4 text links + pill CTA right; **White/Dark colour modes cross-fade by section** | opaque **white bar** 79 px; logo (green) + green **"Menu" pill** (dot) | opaque white bar **69 px**; logo + "Menu" pill |
| Menu | inline links | full-screen white overlay menu (click) | same overlay |
| Progressive blur strip under nav | ✅ 220 px, 8 layers | ❌ | ❌ |
| Fixed "Waves" background lines | ✅ | ❌ | ❌ |
| Lenis smooth scroll | wheel smoothing | wheel smoothing | touch = native (`syncTouch:false`) |
| Type scale | presets ≥1600 / 1200–1599 | 810–1199 | <810 |
| Gutter | 64 px content edge | 40 px | 16 px |

## 2. Section by section

| Section | Desktop | Tablet (1024) | Phone (390) |
|---|---|---|---|
| **Page Intro** | 900 px; H1 136 px bottom-left (3 lines); paragraph with first-line indent + pill bottom-right; 3 outline circles; 2 animated white lines; hero text parallax; load animations on paragraph/pill | 768 px; H1 88 px; paragraph+pill right column; **no circles, no animated lines, no parallax, no paragraph/pill appear animation** | ≈596 px starting **under** the white nav; stacked, left-aligned: H1 64 px (3 lines) → paragraph → pill; no circles/lines/parallax |
| **Toggle** | sticky 500 px block; switch Start→Off→On; headline cross-fade; backdrop fades to white | same behaviour (thresholds scaled) | same behaviour; headlines wrap to 3–4 lines |
| **Our Services** | 4 cards in a row (316×560), image parallax 200 | **2×2 grid** (464-wide cards, image 464×600), parallax 200, "read more" label hidden (Touch variant, no hover / proximity; corrected in Step 4) | **1 column**, cards full width (358 × ~400 image), **no parallax** (intensity 0), Touch variant |
| **Our Philosophy** | icon + label, 3-line centred statement (44 px), pill | same, narrower | same, statement wraps to ~6 lines |
| **Story A / B** | text 553 left, two overlapping images right (Image 1 389×597, Image 2 332×497), inner parallax 300/100, frames drift | text 344 left, images 278 / 240 wide | **stacked: eyebrow → single image (358×400, Image 2 hidden) → title → text → pill**; no parallax |
| **How It Works** | serif H2 + lead in 2 columns (lead offset to 332 px); steps in left column separated by 450 px spacers; **sticky rolling number right** | lead full-width below H2; steps + sticky number (smaller, ±270 px roll) | **no sticky number, no spacers, no long line**; steps listed sequentially |
| **Ready to find your path?** | text left, rating + contact + socials right | same 2 columns | stacked: text, pill, rating, contact, socials |
| **Pricing** | 3 cards in a row (427×489) | 3 cards in a row (≈304 wide); middle card sits ~13 px higher | **stacked 3 cards** full width; scribble underline hidden |
| **Text Section(s)** | 2 columns (664 / spacer / 443) | 2 columns | stacked, gap 38 |
| **Big Quote** | 1080 px, photo parallax 500, arc 3D fold, quote 72 px | 614 px, parallax 300, fold | 650–746 px, no photo parallax, fold still present, quote 48 px |
| **Journal** | 3 cards in one row, middle card lowered 100 px | 2 cards per row (432 wide) + 3rd below | **1 column**, cards stacked (see `screenshots/390x844/11816.png`–`12660.png` for exact blob placement) |
| **Numbers** | 4 counters in a row, slide-in animation | **2×2**, static | **1 column, centred**, static |
| **FAQ** | headline + intro top-left, helper + pill bottom-left, accordion right | same 2 columns (344 / 376) | **reordered**: headline → intro → accordion → helper text → pill |
| **Book A Session** | left: title/intro + sticky rating & socials; right: form | same 2 columns | **reordered**: title → intro → form → rating & socials at the bottom (not sticky) |
| **Footer** | 3 columns: newsletter (664) · spacer · sitemap (2 cols) ; bottom row: contact · credit/copyright | stacked newsletter then sitemap (1566 px tall) | stacked; image background full height (1874 px), no noise-offset overlap |

## 3. Hidden / shown elements

* Desktop-only: progressive blur, Waves Container, hero circles, hero animated lines, the 3-column
  spacer sections (`hidden-1ln1qcq`), nav inline links, How-It-Works spacers ("Trigger Container") and
  long line (also visible on tablet), Pricing scribble, Framer promo badge's larger card.
* Tablet+desktop: sticky rolling number, Story Image 2, step spacers.
* Phone-only / touch variants: "Menu" pill nav, Touch variant of service cards (read-more always shown),
  phone-specific footer layout.

## 4. Animations & interactions by breakpoint (summary — details in ANIMATIONS.md)

| Effect | Desktop | Tablet | Phone |
|---|---|---|---|
| Hero H1 word blur-reveal | ✅ | — (static, corrected in Step 3) | — (static, corrected in Step 3) |
| Hero paragraph/pill/nav appear | ✅ | ❌ | ❌ (nav logo only) |
| Hero portrait fade / Page Intro fade | ✅ | ✅ | ✅ |
| Hero text parallax (0.3×) | ✅ | ❌ | ❌ |
| Hero line draw (GSAP) | ✅ | ❌ | ❌ |
| Toggle sequence | ✅ | ✅ | ✅ |
| Image parallax | 200/300/100/500 | 200/300/100/300 | ❌ |
| Story frame drift | ✅ | ✅ (smaller) | minimal |
| Waves lines | ✅ | ❌ | ❌ |
| How-It-Works line draw + rolling number | ✅ | ✅ | ❌ |
| Philosophy word reveal | ✅ | ✅ | ✅ |
| Pricing scribble draw | ✅ | ❌ | ❌ |
| Big Quote rotateX fold | ✅ | ✅ | ✅ |
| Counters slide | ✅ | ❌ | ❌ |
| Generic in-view fades | ✅ | ✅ (fewer instances) | ✅ (fewer instances) |
| Nav colour swap | ✅ | ❌ (always white bar) | ❌ |
| Footer bg parallax | ✅ | ✅ | ❌ |
| Hover effects | ✅ | Touch variants (no hover) on cards | Touch variants |
