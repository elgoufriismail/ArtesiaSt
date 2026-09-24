# IMPLEMENTATION PLAN — ClearPath homepage clone (Next.js + GSAP)

Status: **Phase 2 (implementation architecture) complete.** Project initialised; core animation
infrastructure, scroll math, providers and hooks are implemented and tested; sections and most
animation modules are **typed skeletons/contracts** — the page is not built yet.

Source of truth: `docs/reconnaissance/*`. This plan supersedes `docs/architecture/ARCHITECTURE.md`
(Vite/Motion draft); its stand-in policy is carried over in §7.

## Recon → implementation map

| Reconnaissance | Implemented in |
|---|---|
| `STRUCTURE.md` §2 section order, layer names | `src/app/page.tsx` (order), `src/sections/*` (one folder per section), `data-ref` = original layer path |
| `STRUCTURE.md` markers | `src/components/ui/Marker.tsx` + marker `<Marker id>` inside owning sections |
| `VISUAL.md` tokens + typography | `src/styles/tokens.css`, `src/styles/typography.css` |
| `BREAKPOINTS.md` | literal media queries in `src/styles/*.css` + section CSS modules; `src/lib/breakpoints.ts` (JS); `gsap.matchMedia` in `src/animations/core/media.ts` |
| `RESPONSIVE.md` §4 per-breakpoint behaviour | `PerBp` values in `src/animations/config.ts` |
| `ANIMATIONS.md` B1–B17 | `src/animations/config.ts` (all numbers, keyed B1…B17) + `src/animations/<category>/*` |
| `INTERACTIONS.md` | `src/components/ui/*` (markup/state), `src/hooks/*` (state, scroll lock), `src/animations/{hover,menu,faq,pricing}` |
| `ASSETS.md` | `src/content/assets.ts` + `public/{standins,textures,masks}` via `tools/standins/generate.py` |
| recon references (screenshots, tracks, dumps) | `tools/compare/*` gates + `tests/unit/*` |

---

## 1. Component tree

```
app/layout.tsx  (server)          fonts, global CSS, <html style={hoverCssVars()}>
└─ <SmoothScroll>                 Lenis (duration 2, smoothWheel, native touch) on the GSAP ticker
   └─ app/page.tsx (server)
      ├─ <ProgressiveBlur/>       fixed 220px, 8 backdrop-filter layers (desktop)
      ├─ <WavesBackground/>       fixed wavy lines layer (desktop)                         B5
      ├─ <main> "Main Container"
      │  ├─ <Hero/>               "Page Intro"      markers: hero                            B1 B2 · #1 #2 #13
      │  ├─ <BalanceSection/>     "Toggle"          markers: toggle-start-animation, dark-nav-1,
      │  │                                            toggle-on-anchor, toggle-on-animation   B3 · #3
      │  ├─ <Services/>           "Our Services"    4 × ServiceCard(ParallaxImage)           B4 B9 · #4 #9
      │  ├─ <Philosophy/>         "Our Philosophy"  SectionIcon, TextScrollReveal, Pill      B9 B15
      │  ├─ <Story variant="a"/>  "Story A"         marker story-a; 2 × ParallaxImage        B4 B9 B12 · #4
      │  ├─ <HowItWorks/>         "How It Works"    markers how-it-works, step-2/3-trigger;
      │  │                                            sticky RollingNumber, DrawnPath          B6 B7 B9 · #5 #6 #13
      │  ├─ <PathSection/>        "Ready to find your path?"  RatingWidget, SocialRow        B1 B9
      │  ├─ <Pricing/>            "Pricing"         switch, 3 cards (NumberFlow prices), scribble  B14 · #8 #13
      │  ├─ <TextSection index=1/> "Text Section"                                             B9
      │  ├─ <Quote/>              "Big Quote"       marker big-quote; ParallaxImage, arc, lines  B4 B11 · #7 #13
      │  ├─ <Story variant="b"/>  "Story B"         marker story-b
      │  ├─ <Journal/>            "Journal"         3 × ArticleCard (blob masks)             B9
      │  ├─ <TextSection index=2/> "Text Section#2"
      │  ├─ <Numbers/>            "Numbers"         marker numbers; 4 × Counter              B8
      │  ├─ <Faq/>                "FAQ"             6 × AccordionItem                        #12
      │  └─ <Booking/>            "Book A Session"  sticky RatingWidget/SocialRow, BookingForm(FormField…)
      ├─ <Footer/>                "Footer Container" marker footer-menu; newsletter, sitemap  B13
      └─ <Navigation/>            fixed; desktop rows (light/dark) + Menu pill → <MobileMenu/>  B1 B10 B17 · #10 #11
```

Server/client split: `layout.tsx` and `page.tsx` are server components; every section is a client
component (needs refs for GSAP). Static markup still pre-renders (page is `○ Static`).

## 2. File structure

```
src/
  app/            layout.tsx · page.tsx · page.module.css
  sections/       <Name>/index.tsx + <Name>.module.css for:
                  Navigation (+ MobileMenu.tsx) · Hero · BalanceSection · Services · Philosophy · Story ·
                  HowItWorks · PathSection · Pricing · TextSection · Quote · Journal · Numbers · Faq ·
                  Booking · Footer
  components/
    providers/    SmoothScroll.tsx
    ui/           Marker · SplitWords · PillButton · NavLink · Eyebrow · SectionIcon · SocialRow ·
                  RatingWidget · Switch · AccordionItem · FormField
    media/        StandInImage · ParallaxImage · NoiseOverlay
    decor/        ProgressiveBlur · WavesBackground · DrawnPath
  animations/
    config.ts     ALL tunable values (B1…B17, faq, pricing, serviceCard, pill)
    index.ts      barrel
    core/         gsap.ts (plugin registration) · eases.ts (Framer beziers → CustomEase) ·
                  spring.ts (Framer springs → GSAP ease / CSS linear()) · transition.ts · media.ts
                  (gsap.matchMedia per breakpoint) · scroll.ts (target progress + marker crossing) · todo.ts
    load/         heroWords · entrance · loadFade
    scroll/       reveal · scrollTarget · markerState · textScrollReveal
    parallax/     imageParallax · speedParallax
    hover/        hoverVars (CSS custom properties for CSS hover transitions)
    pinned/       rollingNumber
    counters/     counters
    navigation/   navTheme
    menu/         mobileMenu
    faq/          accordion
    pricing/      pricingSwitch · layoutFlip
    svg/          drawPath
    sequences/    heroSequence · balanceSequence · quoteFold · storyDrift · wavesBackground
  hooks/          useGsap · useBreakpoint · useLenis · useScrollLock · useDisclosure
  lib/            breakpoints.ts · scroll-math.ts (pure, validated)
  content/        assets.ts (stand-in registry) · types.ts (content model) · site.ts (stand-in copy)
  styles/         tokens.css · typography.css · base.css
public/           standins/*.jpg (+manifest) · textures/noise-{a,b}.png · masks/*.svg
tests/unit/       scroll-math.test.ts · spring.test.ts
tools/            standins/generate.py · recon/{lib,capture,text-budgets}.mjs · compare/{geometry,pixels,motion}.mjs
docs/             reconnaissance/ · architecture/text-budgets.json · IMPLEMENTATION_PLAN.md
```

## 3. Section responsibilities

Every section: renders its markup from `content/site.ts`, puts `data-ref` on elements that correspond to
original layers, owns its markers, declares `data-nav-theme`, and wires animation factories inside one
`useGsap(root, bp => …)` call. **Sections contain no animation numbers and no raw GSAP.**

| Section | Layout (desktop → tablet → phone) | Animations wired |
|---|---|---|
| Navigation | transparent 79px bar, 4 links + pill; → opaque white bar + Menu pill (79/69px) | entrance (B1), navTheme (B10, desktop), mobileMenuTimeline (B17) + useScrollLock |
| Hero | 900 / 768 / ~596px; sticky 100vh backdrop inside 4×100vh track (bottom fade mask); portrait `50% 0%`; circles + lines desktop only | heroWordReveal (B1), heroSequence (B1/B2: backdrop fade, portrait fade, lines fade, intro fade, speedParallax), drawPath ×2 |
| BalanceSection | 1400px section, sticky 500px block; markers at original offsets | balanceSequence (B3), reveal |
| Services | 4 × 316×560 → 2×2 → 1 col; image overscan 200 | imageParallax (P per bp), reveal; hover = CSS (--hover-card-*) |
| Philosophy | centred statement 44px | textScrollReveal (B15), reveal |
| Story (a/b) | 553 · 111 · 664 split; images 389×597 + 332×497 → stacked, image 2 hidden on phone | imageParallax 300/100, storyDrift (B12), reveal |
| HowItWorks | display H2 + lead; steps with 450px spacers; sticky 540×900 number column → no number/spacers on phone | rollingNumber (B7), drawPath (B6), reveal, entrance (lead) |
| PathSection | text left, rating/contact/socials right → stacked | entrance (rating), reveal |
| Pricing | 3 cards (radius 16) → stacked; switch 56×32 | pricingSwitch + NumberFlow + layoutFlip (#8), drawPath (B14), reveal; card hover = CSS (spring linear()) |
| TextSection | 664 · 221 · 443 → stacked (gap 38) | reveal |
| Quote | 1080 / 614 / ~650px; black bg; arc container top edge | quoteFold (B11), imageParallax 500/300/0, drawPath ×2, reveal |
| Journal | 3 cards (middle +100px) → 2+1 → 1 col; blob masks | reveal |
| Numbers | 4 in a row → 2×2 → 1 col | counters (B8, desktop) |
| Faq | left text / right list → reordered on phone (headline, intro, list, helper, pill) | accordionToggle (#12), reveal |
| Booking | left sticky rating block / right form → reordered on phone (form before rating) | entrance ×5 (load-time, off-screen), reveal |
| Footer | photo starts 320px above; 3 columns → stacked | scrollTargetTransform y 0→160 (B13, not phone), reveal |

## 4. Animation architecture

**Principles**

1. **One tuning surface** — `src/animations/config.ts` holds every duration, ease, distance, threshold,
   marker id and per-breakpoint switch, keyed by recon IDs (B1…B17). Re-tuning never touches sections.
2. **Factories, not components** — each animation is a function `(elements, cfg = ANIM.x) => ScrollTrigger | tween | null`
   in its category folder. Factories are composable (sequences/ combine load + scroll + parallax pieces).
3. **Lifecycle via `useGsap`** — sections call factories only inside `useGsap(root, bp => …)`, which runs
   them in a `gsap.matchMedia` context for the active breakpoint and reverts everything (tweens,
   ScrollTriggers, inline styles) on unmount or breakpoint change.
4. **Scroll math is pure and tested** — `lib/scroll-math.ts` reproduces Framer's `onScrollTarget`,
   parallax and word-reveal mappings; unit tests replay the original's recorded tracks
   (fold ≤0.2°, fades ≤0.005, parallax ≤0.01px).
5. **Framer semantics preserved** — Framer cubic-beziers are registered as named GSAP eases
   (`framer`, `entrance`, `hero`, `strong`); Framer springs `{duration, bounce}` become GSAP eases via
   `springEase()` (critically damped for bounce 0) and CSS `linear()` easings for CSS hovers; Framer
   layout (FLIP) animations use **GSAP Flip**.
6. **Where GSAP vs CSS** — GSAP/ScrollTrigger for everything scroll-driven, sequenced or measured
   (load sequence, parallax, markers, pinned number, fold, draws, counters, nav theme, menu, FAQ height,
   digit roll). CSS transitions for simple hover states (pill dot slide, underline, social opacity, card
   border, service-card expansion) using spring-derived `linear()` easings from `hoverCssVars()`.
   CSS `position: sticky` for all pinning (the original uses no JS pin-spacers).

**Categories → first-class animations**

| Category (folder) | Module | First-class # / recon |
|---|---|---|
| load | `heroWords` | #1 hero word blur reveal (B1) |
| load | `entrance`, `loadFade` | nav/hero/booking entrances, backdrop/waves/lines load fades (B1) |
| sequences | `heroSequence` | #2 portrait/background transition (B1+B2) |
| sequences | `balanceSequence` | #3 balance scroll-driven switch (B3, Flip) |
| parallax | `imageParallax`, `speedParallax` | #4 image parallax (B4), hero text parallax (B2) |
| pinned | `rollingNumber` (+ CSS sticky) | #5 pinned How It Works, #6 odometer number (B7) |
| sequences | `quoteFold` | #7 Big Quote 3D arc fold (B11) |
| pricing | `pricingSwitch`, `layoutFlip` (+ @number-flow/react) | #8 NumberFlow digits + switch + price-row FLIP |
| hover | `hoverVars` (+ CSS modules) | #9 service card hover expansion, pills, links |
| navigation | `navTheme` | #10 nav colour transitions (B10) |
| menu | `mobileMenu` | #11 mobile menu (B17) |
| faq | `accordion` | #12 FAQ expansion |
| svg | `drawPath` | #13 decorative SVG line drawing (B2/B6/B14, quote lines) |
| scroll | `reveal`, `scrollTarget`, `markerState`, `textScrollReveal` | B9 fades, generic onScrollTarget, marker variants, B15 |
| counters | `counters` | B8 |
| sequences | `storyDrift`, `wavesBackground` | B12, B5 |

Implemented now (generic, used everywhere): core/*, `entrance`, `loadFade`, `reveal`, `scrollTarget`,
`markerState`, `imageParallax`, `speedParallax`, `drawPath`, `hoverVars`, `quoteFold`, `storyDrift`,
`wavesBackground`. Contracts (typed signature + spec, dev warning) for the rest.

## 5. Interaction architecture

| Interaction (INTERACTIONS.md) | State owner | Animation |
|---|---|---|
| Hover: pill, nav link, social, pricing card, inline links, service card | CSS `:hover` / `:focus-visible` | CSS transitions with `--hover-*` vars |
| Balance switch click | anchor `#toggle-on-anchor` → Lenis `anchors:true` smooth scroll | state change comes from scroll (balanceSequence) |
| Pricing Monthly/Yearly | `useDisclosure` in `Pricing` | `pricingSwitch` + NumberFlow (@number-flow/react, the original's library) + `layoutFlip`; prices = the original's values |
| FAQ items | per-item `useDisclosure` (independent, first item open) | `accordionToggle` (Flip height, icon 135°) |
| Mobile menu | `useDisclosure` in `Navigation` + `useScrollLock` (html overflow hidden + lenis.stop) | `mobileMenuTimeline` |
| Forms | native inputs (no submission backend in clone; `onSubmit` prevented) | CSS states (checkbox checked green) |
| Links to other pages | plain `<a href>` to original-like routes (out of scope) | — |

Accessibility baseline kept from the original's semantics: real links/buttons, labelled form fields,
`aria-expanded` on FAQ and menu buttons, `aria-hidden` on decorative layers and markers.

## 6. Responsive strategy

* **One DOM per component** (the original renders 3 variants and hides 2); layout switches with media
  queries using the original breakpoints **literally**: `≥1200`, `810–1199.98`, `≤809.98` (+ type tier
  `≥1600`). 768px is phone.
* Tokens swap per breakpoint (`--gutter` 56/32/8, `--nav-h` 79/69); typography presets have 4 tiers.
* Section CSS modules contain desktop base rules + tablet + phone blocks with the numbers from
  BREAKPOINTS.md §4–5; phone reorders (FAQ, Booking, Story) use flex `order`.
* Behaviour differences are data, not branches: `PerBp` values in `config.ts`, applied through
  `gsap.matchMedia` (`useGsap` passes the active breakpoint). Example: parallax P `{500,300,0}`,
  counters `{true,false,false}`, nav theme desktop-only.
* Fluid widths inside a breakpoint are derived per section from the 1920/1440/1280 and 430/390/375 dumps
  and verified by the geometry gate at all 8 viewports.
* Lenis: `smoothWheel` for mouse/trackpad; touch stays native (`syncTouch:false`) exactly like the original.

## 7. Asset strategy

* **Photos**: 20 generated stand-ins (`tools/standins/generate.py`) at the **original pixel sizes**, with
  hand-authored tonal keys (not sampled from the originals); crops via the original `object-fit`/
  `object-position`/overscan; `StandInImage` marks them `data-standin="photo"` for pixel-diff masking.
  Replace 1:1 with licensed photos later.
* **Textures / masks**: generated grain tiles (256 / 240 px) and original blob/avatar masks at the original
  bounding boxes.
* **Line art**: new paths drawn inside the original viewBoxes (780×1140, 6000×680, 680×2000, 310×80,
  1516×443 arc, journal outlines).
* **Copy**: written fresh (never reworded from the original) to fit `docs/architecture/text-budgets.json`
  (chars ±10 %, words, rendered line count per breakpoint). Generic UI labels are kept. Placeholder brand
  "Calm Shore" / "calm—shore".
* **Fonts**: Crimson Text 400 (Fontsource) + Inter 4 static text cuts from `inter-ui` (OFL), self-hosted.
  The Fontsource variable Inter rendered ~3–4 % narrower than the original and changed line breaks. **Icons**: Phosphor
  (social, check-circle, plus-circle, section icons).
* Images are plain `<img>` with explicit width/height (`images.unoptimized`); no remote images.

## 8. Dependency list (installed, exact versions)

| Package | Version | Why |
|---|---|---|
| next | 16.3.6 | App Router framework (requested) |
| react / react-dom | 19.3.0 | UI |
| gsap | 3.15.0 | animations; bundled plugins used: ScrollTrigger, Flip, CustomEase |
| lenis | 1.3.26 | smooth scroll (original uses Lenis) |
| @phosphor-icons/react | 2.1.10 | icons (original uses Phosphor) |
| @fontsource/crimson-text | 5.3.0 | display serif |
| inter-ui | 4.1.1 | sans (static Inter 4, metrics match the original; replaced @fontsource-variable/inter) |
| **dev:** typescript 5.9.3, @types/react 19.3.0, @types/react-dom 19.3.0, @types/node 22.19.1 | | typing |
| **dev:** @playwright/test 1.56.1, pixelmatch 7.2.0, pngjs 7.0.0 | | verification harness (1.56.1 matches the preinstalled Chromium) |

Deliberately **not** installed: Framer Motion (replaced by GSAP + springEase/Flip), @gsap/react (own `useGsap`),
Tailwind/Sass (plain CSS), ESLint (not required by `next build`). Added in Step 9: @number-flow/react 0.5.12 (MIT) —
the original's own price-roll library, pinned to its 0.5.x line; a hand-written approximation was dropped.

## 9. Implementation order

Each step ends with `npm run typecheck`, `npm run test:unit`, `npm run build` and the geometry + motion
gates for the sections touched.

1. **Chrome** — Navigation (desktop bar, stacked themed rows, entrance), MobileMenu (#11), ProgressiveBlur,
   WavesBackground, Footer (layout + B13).
2. **Hero** — sticky backdrop track, portrait, circles, lines (#13), H1 (#1), intro text; heroSequence (#2).
3. **BalanceSection** — sticky block, markers, Switch; balanceSequence (#3); nav theme boundaries (#10).
4. **Services** (#4, #9) → **Philosophy** (B15) → **Story** A/B (#4, B12).
5. **HowItWorks** — sticky column (#5), RollingNumber (#6), long line (#13).
6. **PathSection**, **Pricing** (#8, scribble #13). ~~TextSection ×2~~ — on hold.
7. ~~Quote~~, 8. ~~Journal, Numbers, Faq, Booking~~ — **on hold, not to be implemented unless re-added to the
   scope** (their recon, config entries and stubs stay available).
9. Stand-in copy pass against text budgets; line-art pass → folded into §11 (selected sections only).
10. Full sweep → replaced by §11 (scope finalisation and release checklist).

**Current phase (after Step 9): no new sections.** The remaining work is §11.

### Step 1 measured corrections (Chrome + Hero)

* `targetProgress` divides by the **target height**, not the viewport (verified at 390: hero 596px).
* Hero H1 words (read from the original's WAAPI animations): 1.6 s framer ease, blur 10→0 and opacity,
  JS-driven y 10→0; delay **0.2 s + 0.1 s × index**. The text effect mounts at hydration: its start is
  1.21–1.57 s after the logo entrance start (median 1345 ms over 15 loads). The clone schedules both from
  one load clock (`core/loadClock`), so the gap is fixed at the median. (The earlier "~1.6 s" figure was
  a 10 %-opacity-crossing artefact.)
* Mobile menu: the panel **slides down** (yPercent −150→0, spring 0.6) rather than using a clip reveal;
  the items follow (spring 0.55, delay .25); the close sequence runs items at 0.25 s, then the panel at 0.6 s.
* Hero lines fade: 0.8 s strong ease forward, 1.2 s back (marker `toggle-start-animation`).
* Desktop nav theme line sits 80px below the viewport top (dark-nav-1 flips between scroll 1450 and 1500 @1440×900).
* Waves background ignores targets inside `[data-stub]` until those sections exist.
* Marker-driven variants (Framer scroll targets): measured by binary search on both sites. They fire when
  an edge of the marker's **untransformed** 8×8 box reaches vh/2 + 1 px: the top edge for the Balance
  switch ("some"), the bottom edge for the Page Intro and hero lines fades ("all"). The clone reproduces
  the trigger positions to the pixel at 1440/1024/390 (`lib/scroll-math` markerPassed, unit-tested).
* Start phase: a variant animation starts a frame or more after the crossing (Page Intro +1, lines +2
  frames; Balance switch boxes +2 and colours/opacity/text +3). `core/ticks.afterTicks` counts real
  frames (GSAP runs listeners added mid-tick in the same tick, so nested one-shot listeners collapse).
* Timing validation is frame-accurate (`tools/compare/timing.mjs`, `balance-timing.mjs`): rAF-timestamped
  fresh samples, backdrop-filter disabled on both sides (software-rendered blur makes frames 150 ms),
  model-free scoring against the original's runs, with its run-to-run noise as the floor.

### Step 3 measured behaviour (BalanceSection, B3)

* Layout: sticky block height = 244 + 32 + 32 + "Text After" (content-driven: 500 @1440, 509.6 @1920,
  485.6 @1024, 476 @768, 584.8 @390). "Text Before" is absolutely stacked on it. Stand-in copy is fitted to
  the original's line counts at all 8 viewports. Toggle root and sticky wrapper are z-index 1, the section is
  pointer-events none, and the link is hit-testable.
* Switch appear: opacity 0.001→1, 0.8 s framer ease, on any intersection. It replays, with an instant
  reset whenever the switch leaves the viewport.
* The TARGET variant's transition applies (Framer rule). → Start / → Off: spring 1.2 s bounce 0;
  → On: spring 0.8 s bounce 0. Framer layout (FLIP) = linear interpolation of each visual box. The clone
  tweens the boxes directly, without px rounding (`autoRound: false`; Framer's projection is sub-pixel).
  Colours use Framer's squared-space RGB mix (`core/color`). Knob +24 px; track rgba(0,0,0,.2) → #7fa69b;
  label white → #535956.
* Headline pairs (both directions): the outgoing pair fades out over 0.3 s (framer ease); the incoming H2
  fades in over 0.6 s and the P over 0.8 s, after a 0.4 s delay.
* Link: `./#toggle-on-anchor` in Start/Off and `./#toggle-start-animation` in On. Lenis anchor scroll
  (duration 2) lands on the same px as the original.
* Text wrapping: `text-wrap` is set per text layer in the original. The hero H1 and both Balance H2s are
  `balance`, and paragraphs wrap. Balancing keeps line counts and makes the green clause start line 2
  at desktop and tablet, as in the original.
* Correction to Step 1: the hero H1 word reveal is DESKTOP ONLY. On tablet and phone the original shows
  the headline sharp from first paint (load screenshots; no word spans, no animations).
* Not reproduced on purpose: the original sometimes stalls 100–190 ms after a large scroll jump before
  starting a variant (non-deterministic React work). The tablet "Animated Lines" container is empty in the
  original, so the clone renders no lines below desktop.

### Step 4 measured behaviour (Services, B4 + B18)

* Layout: Our Services padding-top 80 → Cards (max 1600, padding 0 56/32/8) → Container (padding 0 8,
  gap 16; desktop row of 4 × 560, tablet 2-column grid of 400, phone column of 400). Desktop: a 560²
  parallax square centred in each card (image 560×760, P 200); tablet: card-sized frame (P 200); phone:
  static. H3 t-card-title with text-wrap balance (B/C/D have explicit breaks); description bottom-aligned
  in a centred 240 px box (touch: bottom 80); "Read More" row bottom 24 (label hidden except on hover).
* NEW (not in the recon notes): B18 cursor proximity. Desktop card height = max(440, 560 − 0.1875·|dx|)
  (window mousemove, horizontal distance to card centre only; exact at 1920/1440/1280). It follows with
  motion useSpring(stiffness 150, damping 25) (fit rmse 0.0012; exact analytic stepper `stepSpring`).
  A new target starts moving the frame after it arrives. Hover label: spring 0.6 s, +1 frame.
* Validation: geometry 8/8 viewports; line counts 64/64 (`tools/compare/lines.mjs`); proximity function
  identical to the original (sweep); dynamics unshifted rmse ≤ 0.0024 (height), ≤ 0.009 (label); parallax
  max error 0.005 px (1440) / 0.006 px (1024).

### Step 5 measured behaviour (Philosophy, B15 + B9)

* Layout: padding-top 200/160/100; column gap 64/56/48; icon block (64² masked icon + eyebrow, gap 24);
  Text Reveal padding 0 64/40/16, statement max 1200: H4 Inter 500, −0.03em, 44/52.8 desktop (no 1600
  tier), 38/53.2 tablet, 30/42 phone, text-wrap normal; 26 inline word spans (NBSP pairs are one token).
  Pill CTA = the hero pill component (`framer-wsdyl9`).
* B15 verified: progress = clamp((vh − top)/(0.75·vh)) of the statement; word i: 0.2 → 1 over
  [i/n, (i+1)/n] (≤ 0.006 error); smoothing motion useSpring(500, 60) (rmse 0.0052). Clone: exact stepper,
  next-frame retarget → dynamics unshifted rmse ≤ 0.0041, phase 0 ms.
* B9 appears on icon, label, statement and pill: 0.8 s framer ease, IntersectionObserver amount 0 (edge contact
  counts: the icon's top lands exactly on the viewport edge at the trigger step), replays, instant reset.
  `reveal()` moved from ScrollTrigger to IO. Trigger/reset steps are identical to the original.
* Stand-in copy mirrors the original's token-length profile (26 tokens) so wrapping matches at all 8 widths;
  CTA label within 1 px of the original width. Icon: own leaf glyph with the original's footprint.

### Step 6 measured behaviour (Story A + Story B, B12 + B4 + B9)

* One component, two instances (sections 5 and 11 of the page order). Layout: padding 200/160 (B 160/160),
  tablet 160/120, phone 100 top; split 5:1:6 desktop, 3:1:4 tablet, phone column (images first, gap 40).
  Image 1 60% width, aspect 0.651338 (phone 100% × 400); Image 2 absolute bottom-left, 50%, aspect 0.668342,
  not rendered on phone. Geometry 0 off at all 8 viewports; line counts match for both stories.
* B12 drift: marker 8 × 200vh at top −40, threshold 1; Image 1 y 0 → −16, Image 2 0 → 120, held at the end
  values past the range (the recorded track stays at −16/120; there is no reset to `none` there).
* B4 parallax (Image 1 P 300, Image 2 P 100): the progress uses the frame's rendered rect *including* the
  parent link's drift — the original's rate is the plain rate × (1 + drift velocity) (0.2022 = 0.2004 × 1.0089
  for Image 1, 0.0668 = 0.0716 × 0.933 for Image 2). `imageParallax` now listens on the whole document: a
  'top bottom' → 'bottom top' range from the layout box ends 120 px too early for the drifting Image 2 and
  froze its last value (−6.2 instead of 0).
* Validation: motion.mjs Story A drift/parallax pass at 1440/1024/390 (≤ 0.087 / ≤ 0.021 px);
  `tools/compare/story-motion.mjs` settled transforms per story, all 8 viewports: A ≤ 0.087 px, B ≤ 0.151 px.
  B9 appears on eyebrow, H2, body and pill (same 4 elements and offsets as the original, both stories); edge
  results differ only where the 0.19 px sub-pixel layout offset straddles the viewport edge.
  `tools/compare/story-sbs.mjs` → section-aligned side-by-sides at 1440/1024/768/390.

### Step 7 measured behaviour (How It Works, B7 + B1 + B9)

* Layout: padding-top 160/120/80 (phone gap 64); Text Container max 1600, padding 0 56/32/8, gap 40/32/32;
  Display H2 ("How " ink, "It Works" green); lead row desktop 3:9 spacer + lead, tablet lead max 720; lead
  `text-indent: calc(20% + 16px)` at every breakpoint. Steps row: text (6 / tablet 4) · gap (1) · Big Number
  (5 / 3); text column: 33vh spacers top and bottom, trigger containers 50vh (tablet 33vh) with the step
  markers at `calc(50% − 4px)`; step gap 16/28/24, phone column gap 48 and no spacers, triggers or number.
* Big number: sticky 100vh box; number 1.50943 : 1, `bottom: 64px` (tablet centred); digit columns 52% wide,
  aspect 0.784211. Column B = five SVG fit-text strips "1…9" (viewBox 149×2450, `translateY(−50%)`), layer k
  colours only digit k; column A = "0…9" strip (viewBox 149×2722) clipped. Spans Inter 500 226.858 px, own
  120% line height, −0.04em, inside an H2 of 145.915 px / 1.2. Pixel-identical at 1024 in all three states.
* B7: variant = step markers passed, flip at layoutTop − scrollY ≤ 0.5·vh + 1.9 (c ∈ [1.89, 1.94) from 1 px
  sweeps at 6 viewports; same position both directions). Strip `top` 623 → 481 → 337 % (layout FLIP, all five
  layers together) and outgoing/incoming layer cross-fade, both 0.8 s cubic-bezier(.6,0,.4,1) (the existing
  `strong` ease; fit rmse ≤ 0.0017); slide starts 2 frames and fade 3 frames after the scroll. Clone vs
  original (1440 01→02, 02→01, 02→03; 1024 both ways): phase ≤ 4 ms, shape ≤ 0.0073 of the span.
  Trigger sweeps: same scroll pixel as the original at 1920/1440/1280/1024 (1024 step 3 ±1 px, the original's
  own run-to-run spread; the clone's marker is 0.35 px higher).
* B1 lead entrance is a load-time WAAPI appear exactly like the nav: 1 s cubic-bezier(.2,0,.2,1), y 20 → 0,
  opacity 0.001 → 1, delay 0.6 → starts 400 ms after the nav logo on every load (clone 406–412 ms, first tick
  after the delay). B9 appears on the headline and the three steps, desktop only (static on tablet/phone).
* The "How It Works long line" (B6, two paths 12 727 / 12 843 long, viewBox 680×2000) is a child of the Big
  Quote section, not of How It Works → implemented with Quote. B5 waves keep their stub guard until Quote exists.
* Validation tools: `section-geometry.mjs` (section-relative, all 8: ≤ 0.31 px), `lines.mjs` (all match),
  `hiw-number.mjs` (number pixel diff per state), `section-sbs.mjs` (side-by-sides).

### Step 8 measured behaviour ("Ready to find your path?", B1 + B9, RatingWidget)

* Layout: section max 1600, padding 160/120/80 vertical; Text Container padding 0 56/32/8; Sections: text
  column 6 (tablet 4, space-between: sans H2 two lines, "your path?"-style second line green, paragraph max 480;
  pill at the bottom) · spacer 2 (1) · Container 4 (3, gap 64): Raiting block (muted 14 px auto-width label,
  gap 32/48/40) and Links (contact paragraph with bold e-mail link + SocialRow, gap 32/48/48). Phone: column,
  gap 64, text column gap 40, Container gap 0.
* RatingWidget (shared with Booking): Users row 208×48 (five ring-masked 48 px avatars at a 32 px step, 44 px
  photo inset 2; counter circle at x 160 with a 42 px ink disc and an 11 px bold white label) above the
  Trustpoint line (16 px 600 text · 23×22 star box, 20×19 vector · score; tablet: two rows). No hover state.
* E-mail link hover (measured): underline 1 px, colour transparent → green and offset 8 → 5 px, 0.4 s framer.
* Motion, desktop only (static on tablet/phone, as measured): B1 Raiting block entrance = WAAPI appear
  (1 s cubic-bezier(.2,0,.2,1), y 20 → 0, opacity 0.001 → 1, delay 0.8) → 600 ms after the nav logo (clone
  604–606 ms); B9 on H2, paragraph, pill, rating label, rating link and Links (same 6 targets/positions).
* Validation: section-geometry all 8 viewports ≤ 1.00 px (whole-pixel text advances in the trust row);
  lines.mjs all match (the original's auto-width labels are nowrap and excluded, the clone's label too);
  stand-in labels chosen by in-page width (CTA label within 0.6 px, trust row 284 px exactly). Stand-in
  labels checked not to coincide with the original's (one candidate rejected).
* Tools: lines.mjs / section-geometry.mjs / section-sbs.mjs find sections by whitespace-normalised names
  (this layer name contains an NBSP); copyfit.mjs accepts HTML candidates (inline links).

### Step 9 measured behaviour (Pricing, B14 + #8 + B9)

* Layout: #fafafa, padding-top 160/80/80; Container max 1600, padding 0 56/32/8, gap 80; Text (gap 32): Section
  Icon (64 mask + eyebrow, gap 24) and Headline (gap 24, max 800 desktop only; intro max 480). Plans component
  (gap 48): switch 296×32 (label · 56×32 track, 24 px knob at left 4/28, top 16 − 12 · "Yearly (20% OFF)") and
  Cards: `flex-wrap`, gap 16, card slots `flex: 1 0 0; min-width: 280px` → 3 per row down to 1024, 2 + 1 (the lone
  third card full width) at 768, 1 per row ≤ 430. Card: radius 16, padding 32, gap 40; title (Crimson card title)
  + 14 px description; price row (NumberFlow 48 px + 18/20 px suffix, gap 10, align end); four Phosphor
  CheckCircle (regular) features, gap 16; green pill. At 1024 the middle card is 25 px taller (its description
  wraps), so the row centres the others 12.6 px lower. Geometry (both switch states): ≤ 0.33 px at all 8 viewports;
  line counts match at all 8.
* Prices = the original's NumberFlow ("Number Flow" Framer component → @number-flow/react, core 0.5.x; the
  original has no 0.5.12 `visibilityState` guard and still uses `--number-flow-char-height`, i.e. ≤ 0.5.11 core,
  behaviourally identical to the pinned 0.5.12/0.5.10). Options from the original bundle: transformTiming
  {1000 ms, NumberFlow's own spring linear()}, opacityTiming {500 ms, ease-out}, trend "nearest", continuous,
  isolate, willChange, mask height 20 px (wrapper margins −20). Digits spin `--_number-flow-d` (e.g. 9 → 9 spins
  a full turn with continuous; 49 → 39 positive, 39 → 49 negative). Clone vs original: all 36 animations per
  round trip identical (keyframes, targets, duration, delay, easing, composite) at 1440, 1024 and 390; start
  after the tap 44–75 ms on both (run-to-run spread of the original itself).
* Around the price change Framer runs a layout FLIP on each price wrapper (translate + scaleX, origin centre —
  the digits are visibly stretched) and suffix (translate): spring 0.6 s, bounce 0, both directions
  (`animations/pricing/layoutFlip.ts`). A plain state change would snap the widths; the original glides.
* Switch (`pricingSwitch`): variant springs entering Yearly 0.8 s / entering Monthly 1.2 s, bounce 0 (critically
  damped; same component family as the Balance switch); knob (layout) starts 3 frames and the colours (variant:
  track rgba(0,0,0,.2) ↔ green, "Monthly" ink ↔ body grey, squared-space mix) 5 frames after the tap. Clone vs
  original over repeated runs: phase within −17 … +20 ms (the original varies up to 25–41 ms between its own
  runs), shape ≤ 0.8 % of the span.
* Card hover (Framer data-border overlay): border transparent → green (not grey), spring 0.6 s both ways,
  starting ≈ 24 ms (enter) / 12 ms (leave) after the pointer; CSS transition with the spring as `linear()` and
  those delays → phase 0–3 ms, max |Δalpha| 0.02. The inner pill shows its hover while the card is hovered.
* B14 scribble: the trigger is the path itself ('top 50%' → 'bottom 50%', scrub 0.5) → its bbox (x 26–291,
  y 3–71 of 310×80) defines the 68 px window; own loop fitted to that bbox. Same window at 1920/1440/1280
  (1 scroll step early at 1440/1920 from the section sitting 0.36 px higher — sub-pixel drift from above).
  Desktop only. B9 appears on icon, eyebrow, H2, intro (desktop only).
* Fixed while validating (shared chrome): the closed mobile menu's centre box intercepted taps in the middle of
  the viewport on tablet/phone (it is laid out even when hidden) → `pointer-events: none` on the box, list only.
* Tools: pricing-switch.mjs + pricing-switch-cmp.mjs (rAF recordings, per-channel phase/shape),
  pricing-numberflow.mjs (WAAPI comparison), section-geometry.mjs `--click-o/--click-c` (settled switch states).

### Step 10 measured behaviour (Text Section ×2, B9)

* One component, two instances (page order 9 and 13): #fafafa, padding 160/120/80 top and bottom, overflow hidden →
  Sections (z 1, max 1600, padding 0 56/32/8, row align start): title Section flex 6 (tablet 4) · spacer 2 (1) ·
  body Section 4 (3). Text Containers: padding 0 8, gap 48/40/32. Phone: stacked, gap 38, no spacer. H2 = sans
  H2 (48/44/38/34) with an ink part and a green tail span; paragraph t-body, max 480. No images or decorations.
* Instance 1's paragraph has a bold inline link with the same behaviour as Step 8's e-mail link (underline
  transparent → green, offset 8 → 5 px, 0.4 s framer) — now the shared `.t-inline-link` class (PathSection uses it too).
* Motion: B9 appear on the H2 and paragraph wrappers, desktop only (both instances; nothing hidden on tablet/phone).
* Validation: geometry ≤ 0.10 px (instance 1) / ≤ 0.07 px (instance 2) at all 8 viewports; line counts match at all
  8 for both. The narrow wrapping windows (e.g. 4 lines at 480 px but 6 at 398 px) were met the way the original
  does it — non-breaking word pairs in the stand-in copy.
* Tools: section-geometry `--index=N`, lines.mjs `IDX=N`, section-sbs `IDX=N` (Nth same-named section; clone
  root `<name>#N`, children `<name>/…`); copyfit HTML candidates for paragraphs with inline links.

## 10. Testing strategy

| Layer | Tool | Criterion |
|---|---|---|
| Types | `npm run typecheck` | 0 errors |
| Pure logic | `npm run test:unit` (node:test, no extra deps) | scroll math replays original tracks within tolerance; spring eases monotonic / correct overshoot |
| Build | `npm run build` | static prerender succeeds |
| Geometry | `capture.mjs clone` + `geometry.mjs` | every `data-ref` within ±2px (x, section-relative y, w, h) at all 8 viewports; 0 unknown refs |
| Text fit | text budgets | stand-in blocks: same line count per breakpoint, chars ±10 % |
| Motion | `motion.mjs` + `motion-map.json` | each mapped effect within tolerance at 1440/1024/390 (e.g. fold ±1°, fades ±0.02, parallax ±2px) |
| Pixels | `pixels.mjs` | masked diff per frame reviewed; target < 2 % outside masks for static frames |
| Interactions | Playwright hover/click scripts (ported from recon) | state screenshots side-by-side with `reference/interactions/*`; timing within ±100 ms of recon |
| Load sequence | appear sampler (recon `appear` protocol) | word stagger/duration within ±100 ms |

Current smoke-test result (skeleton): build static ✓, 9/9 unit tests ✓, harness resolves 18/18 clone refs
to original layers (0 unknown) at 1440×900 and 390×844 (geometry fails as expected — sections are empty).

## 11. Scope finalisation and release checklist (current phase)

Implementation is paused after Pricing. No further sections are built. The remaining work narrows the page to
the owner's final section list, removes what that list leaves unused, and verifies the result end to end.
**Nothing destructive happens before the owner confirms the final section list (§11.1).**

### 11.0 Status at the pause

| Section (page order) | Clone component | State |
|---|---|---|
| Navigation / chrome (nav bar, mobile menu, progressive blur, waves) | `Navigation`, `ProgressiveBlur`, `WavesBackground` | implemented + validated (Step 1) |
| Page Intro (hero) | `Hero` | implemented + validated (Steps 1–2) |
| Toggle (Balance) | `BalanceSection` | implemented + validated (Step 3) |
| Our Services | `Services` | implemented + validated (Step 4) |
| Our Philosophy | `Philosophy` | implemented + validated (Step 5) |
| Story A | `Story variant="a"` | implemented + validated (Step 6) |
| How It Works | `HowItWorks` | implemented + validated (Step 7) |
| Ready to find your path? | `PathSection` | implemented + validated (Step 8) |
| Pricing | `Pricing` | implemented + validated (Step 9) |
| Text Section 1 | `TextSection index={1}` | stub (rendered, empty) |
| Big Quote | `Quote` | stub; hosts the `big-quote` marker |
| Story B | `Story variant="b"` | **implemented + validated (Step 6)** — not named in the current list, decision needed |
| Journal · Text Section 2 · Numbers · FAQ · Book A Session | `Journal`, `TextSection index={2}`, `Numbers`, `Faq`, `Booking` | stubs (rendered, empty); `Numbers` hosts the `numbers` marker |
| Footer | `Footer` | **implemented + validated (Step 1, B13)** — not named in the current list, decision needed |

### 11.1 Finalise the section list (owner decision — blocking)

Confirm the final list, including the items the current list does not mention:

1. **Story B**: keep (already built) or omit.
2. **Footer**: keep (already built, part of the chrome) or omit / replace.
3. Any section still to be built later (for example Booking as the target of every "Book a session" CTA)?
4. Navigation targets: the nav links (About, Services, Stories, Journal), the CTAs (`./book-a-session`,
   `./about`, `./services`, `./stories/*`) and the footer sitemap point to pages that do not exist in this
   one-page clone. Decide per link: keep as-is, point to in-page anchors of kept sections, or remove.
5. Waves background (B5): it fades in over How It Works and fades out at the `big-quote` marker. While
   `Quote` is omitted it stays hidden (stub guard). Decide: (a) omit B5, (b) keep the fade-in and choose a new
   fade-out target in a kept section (needs a measured decision, not the original's behaviour), or (c) keep
   hidden.

### 11.2 Omit unused sections from the rendered page (after 11.1, non-destructive first)

1. Remove the omitted sections from `src/app/page.tsx` only; keep their code for one verification round.
2. Re-check everything that depends on page order or on markers in removed sections:
   - nav theme boundaries (`data-nav-theme` of each rendered section; B10 switches at section edges);
   - B5 waves targets (`how-it-works`, `big-quote`) per the 11.1 decision; `numbers` marker users;
   - footer background parallax (B13 depends on page length) and anything measured in page coordinates;
   - `tools/compare/motion-map.json` entries for removed sections (drop them, keep the kept ones).
3. Run §11.4 on the reduced page. Only then continue with 11.3.

### 11.3 Clean up code no longer required (destructive — only with the confirmed list)

Remove only what the confirmed page cannot reach. Current candidates if the stub sections are all omitted:

| Kind | Candidates | Notes |
|---|---|---|
| Section stubs | `TextSection`, `Quote`, `Journal`, `Numbers`, `Faq`, `Booking` (+ their CSS modules) | `Story` stays either way (Story A) |
| UI stubs (never implemented) | `SectionIcon`, `Eyebrow`, `AccordionItem`, `FormField`, `Switch` | `Switch` is only named in comments; the pricing / balance switches are section-local |
| Animation modules used only by stubs | `counters/counters`, `faq/accordion`, `sequences/quoteFold` (+ `animations/index.ts` exports) | `scrollTarget`, `markerState`, `speedParallax`, `loadFade` are used by built sections — keep |
| Config entries | `ANIM.B8` (counters), `B11` (quote fold), `faq`, any journal/booking entries; `B5` per 11.1 | remove together with their modules |
| Content | unused keys in `src/content/site.ts` (journal, numbers, faq, booking copy, if present) | keep `SOCIALS`, `RATING`, `FOOTER` if the footer stays |
| Stand-in assets | `big-quote`, `journal-a/b/c` photos; `blob-a/b/c` masks; line-art paths only used by Quote | update `tools/assets/ledger.mjs` so the ledger lists only assets of kept sections |

**Keep regardless** (reusable infrastructure / reference): `docs/reconnaissance/**` and its reference data,
`docs/ASSET_LEDGER.md` (regenerated), all of `tools/**` (recon, compare, standins, assets), `src/animations/core/**`,
shared components (`PillButton`, `Marker`, `StandInImage`, `ParallaxImage`, `DrawnPath`, `RatingWidget`,
`SocialRow`, `NavLink`, `SplitWords`, `Logo`), and the measured Step 1–9 notes in this document.
After removal: `npm run typecheck`, `npm run test:unit` (drop tests only for removed modules), `npm run build`.

### 11.4 Final verification of the selected sections

All gates at the 8 reference viewports (1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 430×932, 390×844,
375×812) unless noted.

1. **Visual comparison**: `tools/compare/section-sbs.mjs` side-by-sides per kept section; full-page frames via
   `tools/recon/capture.mjs` + `tools/compare/pixels.mjs` with stand-ins masked; review every diff hot spot.
2. **Geometry and text**: `tools/compare/section-geometry.mjs "<section>"` (target ≤ 1 px; Pricing also with
   `--click-o/--click-c` for the Yearly state) and `tools/compare/lines.mjs` (all line counts match) per section.
3. **Scroll animations**: `tools/compare/motion.mjs` (hero, Balance, Services parallax, Story drift/parallax,
   B5 per 11.1, footer B13 if kept) at 1440/1024/390; `story-motion.mjs`; `timing.mjs` and `balance-timing.mjs`
   (load and marker fades); How It Works rolling number (trigger sweeps + rAF transition comparison);
   Pricing scribble window.
4. **Interactions** (forward and reverse, both directions of every state change): Balance switch; Services card
   proximity + hover label (desktop) / touch labels; pill hovers; Philosophy word reveal (scroll both ways);
   PathSection e-mail link hover; Pricing switch (`pricing-switch.mjs` + `pricing-switch-cmp.mjs`, repeated runs
   against the original's own noise floor), NumberFlow (`pricing-numberflow.mjs`: identical animations),
   price-row FLIP, card hover; social icon hovers; footer inputs/links if kept.
5. **Navigation and mobile menu**: desktop nav entrance, link hovers, theme switching at every kept section
   boundary (light/dark, B10) and the progressive blur; tablet/phone menu button → open/close animation (#11),
   item stagger, body scroll lock, Escape / link tap closes, focus handling, the menu CTA; regression check that
   the closed menu does not intercept taps anywhere on the page (fixed in Step 9); in-page links per 11.1.
6. **Load behaviour**: hero entrance and word reveal timing from the shared load clock; no layout shift after
   fonts load; reduced-motion behaviour noted.
7. **Build and code health**: `npm run typecheck`, `npm run test:unit`, `npm run build` (production), then a last
   run of the full gate list on the production server.

Acceptance: geometry within ~1 px where practical, identical line counts, animation phase within one frame and
shape within the original's own run-to-run noise, no unexplained layout shift, no console errors.
