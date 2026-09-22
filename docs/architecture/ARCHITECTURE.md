# ARCHITECTURE — ClearPath homepage reconstruction

Status: **architecture phase complete; page sections not implemented yet** (they are registered stubs).
Source of truth: `docs/reconnaissance/*` (geometry, typography, colour, motion, responsive behaviour of the
original). Nothing here redesigns the original — every decision below exists to reproduce it and to
**prove** the reproduction numerically.

---

## 1. Constraints

| Constraint | Consequence |
|---|---|
| No licence to redistribute the original photos and copy | Photos → generated **stand-ins** at the original pixel sizes/crops; copy → **freshly written** stand-in text fitted to measured length budgets. Custom code components of the template are **re-implemented from observed behaviour**, never copied. |
| Geometry, typography, spacing, colours, motion, responsive behaviour must match | Tokens and text presets are transcribed from measurements; layout is rebuilt with the same flexbox model; motion reuses the same libraries (Motion, GSAP, Lenis, NumberFlow) with the measured parameters. |
| Later modifications will be requested | Content lives in one typed module; sections are isolated components; tokens are CSS variables; behaviour is parameterised per breakpoint. |

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite 8** + **React 19** + **TypeScript 5.9** (versions pinned, `.npmrc save-exact`) | static output, fast dev loop, component isolation for later modifications |
| Motion | **motion 13** (Framer Motion) | the original *is* Framer Motion: same springs (`duration/bounce`), variants, `layout` FLIP animations, `useScroll`/`useTransform` |
| Scrubbed SVG path drawing | **GSAP 3.15 + ScrollTrigger** | original uses GSAP ScrollTrigger (`scrub:0.5`, `top 50%`→`bottom 50%`) for exactly these paths |
| Smooth scroll | **Lenis 1.3** (`duration:2`, `smoothWheel`, `anchors`, native touch) | original config (`intensity 20 → duration 2`) |
| Price digits | **@number-flow/react** | original uses NumberFlow |
| Fonts | `@fontsource/crimson-text` (400), `@fontsource-variable/inter` | same families, OFL, self-hosted |
| Icons | `@phosphor-icons/react` | same icon set (MIT) |
| Styling | plain CSS with custom properties (`src/styles/*.css`) + co-located CSS per section | stepped media queries reproduce Framer's discrete breakpoints exactly; no utility framework to translate through |
| Verification | Playwright 1.56.1 (matches preinstalled Chromium), pixelmatch, pngjs | same capture protocol as the recon |

## 3. Repository layout

```
index.html
src/
  main.tsx                 font + global CSS imports, root render
  App.tsx                  page shell (fixed layers · Main Container · footer)
  styles/
    tokens.css             colours, fonts, gutters, radii, nav height, eases (per breakpoint)
    typography.css         11 text presets × 4 tiers (≥1600 / 1200–1599 / 810–1199 / <810) + measured one-offs
    base.css               reset, Lenis classes, .marker
  lib/
    breakpoints.ts         MQ constants, useBreakpoint(), pick()
    motion-presets.ts      EASE + T (named transitions from the recon catalogue)
    smooth-scroll.tsx      <SmoothScroll> Lenis provider + ScrollTrigger bridge
    scroll-math.ts         pure functions: targetProgress, sequenceValue, markerPassed, parallaxOffset, wordOpacity
  hooks/scroll.ts          useDocRect, useTargetProgress (MotionValue), useMarker (boolean)
  components/              shared primitives (implementation phase — see §6)
  sections/
    registry.tsx           ordered section list (16) — currently stubs with data-ref
    <Section>/…            one folder per section (implementation phase)
  content/                 typed stand-in content (implementation phase — see §5)
public/
  standins/*.jpg           generated photo stand-ins + manifest.json (slot → original asset id, size)
  textures/noise-{a,b}.png generated grain tiles
  masks/blob-{a,b,c}.svg   original blob masks at the original bounding boxes; avatar-ring.svg
tools/
  standins/generate.py     deterministic stand-in generator
  recon/lib.mjs            Playwright helpers (proxy-safe launch, settle, named-geometry dump)
  recon/capture.mjs        capture original|clone with the recon screenshot protocol (+ mask rects)
  recon/text-budgets.mjs   metrics-only text budgets of the original → docs/architecture/text-budgets.json
  compare/geometry.mjs     box diff clone vs original by layer path
  compare/pixels.mjs       masked pixel diff per frame
  compare/motion.mjs       scroll-curve diff per effect (motion-map.json)
docs/reconnaissance/       recon (source of truth)
docs/architecture/         this document + text budgets
```

## 4. Layout architecture

* **One DOM for all breakpoints.** The original renders three variants of many components and hides two
  with `.hidden-*` classes; the clone renders each component once and switches layout with media queries
  (flex direction, widths, `order` for the phone reorders in FAQ / Book-a-Session / Story).
  Behaviour that differs per breakpoint (parallax intensity, disabled effects) is selected with
  `useBreakpoint()` + `pick({desktop, tablet, phone})` — values from RESPONSIVE.md §4.
* **Flexbox stacks mirroring Framer stacks**, same padding/gap numbers (BREAKPOINTS.md §5). Horizontal
  rhythm: section `padding: 0 var(--gutter)` + inner `padding: 0 var(--inner)`.
* **Fluid widths inside a breakpoint.** Column widths are expressed the way Framer resolves them
  (fixed spacer columns vs `1fr` columns). During implementation, each section's column rules are
  derived by comparing the 1920 / 1440 / 1280 dumps (desktop) and 430 / 390 / 375 (phone) and
  expressed as `flex: <n> 0 0` / fixed px; the geometry gate (§8) confirms them at all 8 viewports.
* **Sticky/fixed exactly as the original:** CSS `position: sticky` for the hero backdrop (100vh inside a
  4×100vh track with bottom fade mask), Toggle block (500px), How-It-Works number (900px), Book rating
  block; fixed nav, progressive blur (8 backdrop-filter layers), waves layer. No JS pinning.
* **Scroll markers** — invisible `.marker` elements at the same document offsets as the original's marker
  sections (`toggle-start-animation`, `dark-nav-1`, `toggle-on-anchor`, `toggle-on-animation`,
  `step-2-trigger`, `step-3-trigger`, `how-it-works`, `big-quote`, `story-a/b`, `footer-menu`). Effects
  reference markers, not magic scroll numbers, so they stay correct at every viewport.

## 5. Stand-in policy (content & assets)

**Photos** — `tools/standins/generate.py` renders each slot at the **original pixel size** with a
hand-authored tonal key (light/dark, warm/cool, highlight position) chosen to keep the visual hierarchy
(e.g. white text stays legible where the original photo was dark). They are not sampled from, traced from,
or derived from the originals. Crops use the original `object-fit`/`object-position` and parallax
overscan values, so framing geometry is identical. `public/standins/manifest.json` maps every slot to the
original asset id it replaces. Stand-ins can be swapped for licensed photos by replacing files 1:1.

**Artwork** — blob masks, avatar mask, noise tiles are generated originals at the original bounding
boxes/tile sizes. Decorative line paths (hero lines, waves, How-It-Works line, quote lines, pricing
scribble, journal outline strokes) will be newly drawn paths inside the **same viewBoxes** with
comparable path lengths, so the GSAP draw timing (which depends on scroll range, not length) is identical.
The Big-Quote arc is a plain geometric arc at the original 1516×443 viewBox.

**Copy** — all distinctive copy (headlines, paragraphs, quote, stories, FAQ, pricing blurbs) is **written
fresh**, not reworded from the original. It must fit the metrics in `docs/architecture/text-budgets.json`
(per text block and breakpoint: characters ±10 %, word count, rendered line count, explicit line breaks),
which is what makes wrapping, block heights and hierarchy match. Generic UI labels (About, Services,
Stories, Journal, Book a session, Monthly/Yearly, Read more, form field labels) are kept as ordinary
interface words. Brand stand-in: **"Calm Shore"** / wordmark **"calm—shore"** (same 10-character
lowercase + em-dash form as the original wordmark) — expected to be replaced in the modification phase.

**Content model** — `src/content/site.ts` (typed): one object per section (headline segments with an
`accent` flag for the green tails, paragraphs, CTA labels, card lists, FAQ items, pricing tiers with
monthly/yearly numbers, counters, form fields). Components never hard-code copy.

Elements whose content is a stand-in carry `data-standin="photo|text"` so the pixel diff masks them.

## 6. Component architecture

Shared primitives (`src/components/`), each mapped to a recon behaviour:

| Primitive | Reproduces | Key parameters (recon) |
|---|---|---|
| `Reveal` | B9 generic in-view fade (replays; instant reset on exit) | 0.8 s, `EASE.framer`, threshold 0 |
| `Entrance` | B1 load entrance (y ±20, opacity) | 1 s, `EASE.entrance`, per-element delay |
| `WordAppear` | B1 hero H1 word reveal | per word opacity 0 / y +10 / blur 10 → rest, 1.6 s, delay .1 + .2·i |
| `PillButton` | pill + dot hover slide (28–32 px), white/green variants | 39 px high, padding 1 48 0 20, hover ≈0.3 s |
| `NavLink` | underline grow on hover | 1 px line |
| `ParallaxImage` | B4 image-in-frame parallax + noise overlay | `parallaxOffset()`; P per breakpoint; noise .15/.1 overlay |
| `NoiseOverlay` | grain textures | tile 128 / 100 px, `mix-blend-mode: overlay` |
| `DrawPath` | B2/B6/B14 GSAP scrubbed stroke draw | `top 50%` → `bottom 50%`, `scrub: .5`, `ease: none` |
| `ScrollTargetTransform` | Framer `onScrollTarget` transforms (hero fade, waves, fold, story drift, footer) | `targetProgress(threshold)` / `sequenceValue()` → MotionValue |
| `TextScrollReveal` | B15 word opacity by scroll | `revealProgress(start 1, end .25)`, spring 500/60/1, min .2 |
| `Toggle` (switch) | B3 Start → Off → On states | Motion `layout` + variants, markers at .5 vh |
| `RollingNumber` | B7 odometer digit | 5 stacked strips, y slide + cross-fade, markers step-2/3 |
| `Counter` | B8 slide-in counters (desktop) | number y −40→0, label y +40→0 |
| `ProgressiveBlur` | nav blur strip | 8 layers, blur 0.156→20 px, 12.5 % bands |
| `NavThemeController` | B10 White/Dark cross-fade | theme ranges from markers |
| `Accordion` | FAQ (independent items, icon 135°) | Motion `layout` height, ≈0.5 s |
| `PricingSwitch` + `Price` | Monthly/Yearly + NumberFlow | 20 % discount values |
| `MobileMenu` | B17 overlay | panel reveal ≈0.3 s, items fade .3→.8 s, scroll lock |
| `RatingWidget`, `SocialRow`, `SectionIcon`, `Eyebrow`, `FormField` | static pieces | — |

Sections (`src/sections/<Name>/`): `Nav`, `ProgressiveBlur`, `WavesBackground`, `PageIntro`, `ToggleSection`,
`OurServices`, `OurPhilosophy`, `Story` (used twice), `HowItWorks`, `ReadyToFind`, `Pricing`,
`TextSection` (used twice), `BigQuote`, `Journal`, `Numbers`, `Faq`, `BookSession`, `Footer`.

## 7. Motion architecture

Scroll data flow: **Lenis** smooths wheel input and moves the real window scroll → Motion `useScroll()`
reads `window.scrollY` → pure functions in `scroll-math.ts` turn (element document offset, scrollY,
viewport) into values → MotionValues drive `style` without React re-renders. GSAP ScrollTrigger is updated
from Lenis' scroll event. Scroll-target variants (`useMarker`) are the only scroll logic that re-renders
(boolean flips), then Motion animates with the recorded transition.

The scroll math is already **validated against the original's recorded tracks**
(`docs/reconnaissance/reference/animations/scroll-1440x900.json`):

| Function | Checked against | Max abs error |
|---|---|---|
| `targetProgress` (threshold 1) → Big-Quote `rotateX` | 25 samples | **0.10°** |
| `targetProgress` (threshold 0) → hero portrait opacity | 23 samples | **0.001** |
| `sequenceValue` → waves opacity (0→1→0) | 50 samples | **0.001** |
| `parallaxOffset` → service-card image translateY | 39 samples | **0.0005 px** |

Effect → implementation map (IDs from ANIMATIONS.md):

| ID | Effect | Implementation |
|---|---|---|
| B1 | load sequence | `Entrance`, `WordAppear`, backdrop `animate` with `T.heroBg`; start after fonts ready |
| B2 | hero exit | `ScrollTargetTransform` (Hero, threshold 0) → opacity; text `translateY = 0.3·scrollY` (desktop); `DrawPath` lines; `useMarker` → lines/Page-Intro fades with `T.linesOut/In`, `T.introOut/In` |
| B3 | toggle | markers `toggle-start` / `toggle-on` → `Toggle` variants + text cross-fade |
| B4 | image parallax | `ParallaxImage` |
| B5 | waves | `sequenceValue([0,1,0], [how-it-works, big-quote])` |
| B6/B14 | path draws | `DrawPath` |
| B7 | rolling number | `RollingNumber` driven by `useMarker(step-2)`, `useMarker(step-3)` |
| B8 | counters | `Counter` in-view (desktop only) |
| B9 | fades | `Reveal` |
| B10 | nav theme | `NavThemeController` |
| B11 | 3D fold | `ScrollTargetTransform` (big-quote marker, threshold 1) → `rotateX(-90·p)`, no perspective, origin 50 % 50 % |
| B12 | story frame drift | `ScrollTargetTransform` (story marker, threshold 1) |
| B13 | footer bg | `ScrollTargetTransform` → `y 0→160` |
| B15 | philosophy words | `TextScrollReveal` |
| B16 | spinner | CSS keyframes (linear, 1 s) |
| B17 | mobile menu | `MobileMenu` |

`prefers-reduced-motion`: the original does **not** honour it (its appear script is invoked with the
reduced-motion option disabled). The clone matches that by default; a single `REDUCED_MOTION_SUPPORT`
flag in `motion-presets.ts` can later enable a reduced variant (final states, no scroll-linked motion) —
an open decision for the modification phase.

## 8. Verification gates (definition of "accurate")

All tools reuse the reconnaissance protocol so results are comparable with the committed references.

```
npm run build && npm run preview &                 # clone at http://localhost:4173
node tools/recon/capture.mjs clone [vp…]           # frames + named geometry (+ mask rects)
node tools/compare/geometry.mjs [vp…] --tol=2      # boxes by layer path, section-relative
node tools/compare/pixels.mjs [vp…]                # masked pixel diff per frame
node tools/compare/motion.mjs [vp…]                # scroll curves per effect (motion-map.json)
node tools/recon/capture.mjs original [vp…]        # optional: refresh original references (needs network)
```

| Gate | Pass criterion (per section, all 8 viewports unless noted) |
|---|---|
| Geometry | every `data-ref` element within **±2 px** (x, section-relative y, w, h) of the original layer; top-level section heights within ±2 px |
| Text budgets | each stand-in block within ±10 % chars and **same line count** per breakpoint |
| Motion | each mapped effect within its tolerance in `motion-map.json` (e.g. fold ±1°, opacities ±0.02, parallax ±2 px) at 1440 / 1024 / 390 |
| Pixels | masked diff reported per frame; reviewed visually; target < 2 % differing pixels outside masks for static frames |
| Interactions | hover/click state screenshots compared side-by-side with `reference/interactions/*` |

Harness smoke test (stub clone, 1440×900): all 16 section refs resolve to original layer paths
(0 unknown), geometry/pixel/motion reports generate. (Original layer names can contain NBSP — paths are
whitespace-normalised.)

### `data-ref` contract

Every clone element that corresponds to an original Framer layer carries `data-ref` = the original's
named-layer path relative to Main Container (e.g. `Big Quote/Shape Container`, `Our Services/Cards/Container/Card A Container`),
with `#n` for repeated siblings in document order; nav elements start with `Nav/`, footer with
`Footer Container/`. Clone-only helper elements use paths not present in the original (reported as
"unknown", which is allowed) — except those listed in `tools/compare/motion-map.json`, which are part of
the contract.

## 9. Implementation order (next phase)

1. Shell: fixed layers (nav desktop + mobile menu, progressive blur, waves), footer; marker system.
2. Page Intro + Toggle (sticky backdrop, load sequence, toggle states, nav theme) — highest-risk motion first.
3. Our Services, Our Philosophy, Story (A/B).
4. How It Works (sticky rolling number, line draw), Ready.
5. Pricing, Text Sections, Big Quote (3D fold).
6. Journal, Numbers, FAQ, Book A Session.
7. Stand-in copy pass against text budgets; decorative line art.
8. Full verification sweep at 8 viewports; fix until gates pass.

Each step ends with geometry + motion gates for the sections touched.

## 10. Known risks

* **Framer's intrinsic text sizing**: Framer sizes many text boxes to content (`width: auto`/`max-content`).
  Stand-in copy that wraps differently changes box heights — mitigated by text budgets + line-count gate.
* **Variant transition timings** inside compiled Framer components were measured, not read (≈0.3–0.6 s);
  tuned with frame sequences in `reference/animations/frames`.
* **Backdrop-filter cost**: 8-layer progressive blur is heavy in software rendering; kept desktop-only as
  in the original.
* **Motion vs Framer runtime differences** in layout-animation interpolation (FLIP scale correction) may
  cause sub-frame differences in the toggle/accordion; acceptable if end states and durations match.
