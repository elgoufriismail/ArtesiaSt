# ANIMATIONS — implementation, triggers, timing, easing, scroll relationships

## 0. How this was measured

| Evidence | File(s) | Method |
|---|---|---|
| Load/appear timeline | `reference/animations/appear-<vp>.json` | `requestAnimationFrame` sampler injected before navigation (`addInitScript`), computed `opacity/transform/filter` every frame for 5 s |
| Scroll-linked & scroll-triggered tracks | `reference/animations/scroll-<vp>.json` | instant `scrollTo` in 50 px steps (300 ms settle) down the whole page, then back **up** in 200 px steps; every inline `transform/opacity/filter/stroke-dashoffset/background-color` + Framer variant class recorded per element |
| Visual frame sequences | `reference/animations/frames/<vp>/<zone>/<scrollY>.jpg` | deterministic scrub captures (900 ms settle per step) of the key motion zones |
| Real-scroll videos | `reference/recordings/scroll-<vp>.webm` + `.timeline.json` | mouse-wheel input (100 px / 250 ms) so Lenis smoothing applies; timeline maps video time → scrollY |
| Config values | Framer-generated modules (not committed) | appear JSON (`__framer__appearAnimationsContent`), effect props on components, code-component defaults |

Viewports sampled for motion: **1440×900 (desktop), 1024×768 (tablet), 390×844 (phone)**; recordings also at
1920×1080. "Doc Y" = element's document offset; "scrollY" = window scroll position.

---

## A. Animation stack (what the original uses)

| System | Present? | Role |
|---|---|---|
| **Framer Motion** (bundled Framer runtime, `motion.*.mjs`) | ✅ primary | appear-on-load effects (WAAPI-optimised), in-view appear effects, scroll-transform effects (`onScrollTarget`), parallax speed, variant transitions (hover / toggles / accordion), layout (FLIP) animations |
| **Web Animations API** | ✅ (via Framer "optimized appear") | first-paint appear animations are started with `element.animate()` from the inline appear script, then handed to Framer Motion |
| **GSAP 3.12.5 + ScrollTrigger** | ✅ | only inside the "Animator Basic With Scroll" code component: SVG path draw via `stroke-dashoffset`, `scrub: 0.5` |
| **Lenis** (Framer "Smooth Scroll" code component) | ✅ | global smooth scroll: `smoothWheel:true`, `duration = intensity/10 = 2.0`, `anchors:true`, `autoRaf`, `syncTouch:false` (native touch on phones) |
| **NumberFlow** (`number-flow-react` web component) | ✅ | pricing digits roll between monthly / yearly |
| Custom React code components | ✅ | `TextScrollReveal` (word opacity by scroll), `ImageParallaxVerticalNoize` (image translateY by scroll + noise), `TextIndent` (loaded, not visibly used on the homepage) |
| CSS transitions / keyframes | minimal | no authored CSS keyframes on the page; all motion is JS-driven (Framer adds `transition` only for its own FLIP helpers) |
| WebGL / Three.js / Lottie / canvas | ❌ none | — |

Global Framer defaults used repeatedly:

* **Ease "Framer default"**: `cubic-bezier(.44, 0, .56, 1)` (ease-in-out).
* **Ease "entrance"**: `cubic-bezier(.2, 0, .2, 1)`; **ease "hero bg"**: `cubic-bezier(.4, 0, .2, 1)`;
  **ease "strong in-out"**: `cubic-bezier(.6, 0, .4, 1)`.
* Framer "spring" with `duration`/`bounce` (bounce 0 = critically damped, no overshoot).

---

## B. Catalogue of major animations

Legend — **Trigger**: `load` (on mount), `in-view` (IntersectionObserver-style, replays), `scroll-linked`
(continuous function of scroll position, reversible by construction), `scroll-target` (variant/state flip
when a marker crosses a viewport line), `hover`, `click`.

### B1. Hero intro sequence — `load`

| Element | From → To | Duration | Delay | Easing | Notes |
|---|---|---|---|---|---|
| Hero green background photo ("Image", 7m3i73) | opacity 0 → 1 | 2.0 s | 0 | (.4,0,.2,1) | whole sticky backdrop fades in from white |
| Waves Container (h9ylq1, desktop only) | opacity 0 → 1 | 2.0 s | 0 | (.4,0,.2,1) | then immediately governed by scroll (B5) — net: invisible at top |
| Animated line 1 (ijtjgq) | opacity 0 → **0.5** | 2.0 s | 0.4 | (.4,0,.2,1) | desktop only |
| Animated line 2 (1f1re2w) | opacity 0 → 1 | 2.0 s | 0.4 | (.4,0,.2,1) | desktop only |
| **H1 words** "A / Path / That / Shapes / Your / Future." | per word: opacity 0, **y +10 px, blur(10px)** → opacity 1, y 0, blur 0 | 1.6 s each | 0.1 s + **0.2 s stagger per word** (start delay) | (.44,0,.56,1) | Framer text effect `appear`, tokenization **word**, trigger on mount. Observed: first word begins ≈2.2 s after navigation (waits for hydration + fonts), last word settles ≈4.5 s |
| Hero paragraph (1lgea7r) | opacity 0, **y −20** → 1, 0 | 1.0 s | 0.4 | (.2,0,.2,1) | **desktop only** (tablet/phone: no animation) |
| Hero CTA pill (1ltz739) | opacity 0, **y +20** → 1, 0 | 1.0 s | 0.4 | (.2,0,.2,1) | desktop only |
| Nav logo (g52bo5) | opacity 0, y +20 → 1, 0 | 1.0 s | 0.2 | (.2,0,.2,1) | desktop only |
| Nav links About/Services/Stories/Journal | opacity 0, y +20 → 1, 0 | 1.0 s | 0.4 / 0.5 / 0.6 / 0.7 | (.2,0,.2,1) | 0.1 s stagger |
| Nav CTA pill | opacity 0, y +20 → 1, 0 | 1.0 s | 0.8 | (.2,0,.2,1) | |
| How-It-Works intro text (1fkitzd) | opacity 0, y +20 → 1, 0 | 1.0 s | 0.6 | (.2,0,.2,1) | fires on load even though off-screen (so already visible when reached) — all breakpoints |
| Ready rating block (1n65icg), Book-A-Session title/intro/rating/form (1bv8mug, 89jy4q, ccgg2l, s06wt2, 17z5vyw) | opacity 0, y ±20 → 1, 0 | 1.0 s | 0.4–0.8 | (.2,0,.2,1) | same: load-time, off-screen; desktop only except where noted |

Framer quirk seen in the samples: some appear targets flash to their final state for ~1 frame at ≈240 ms
(SSR→hydration hand-off), then restart from the initial state. **Do not reproduce** — it is an artefact.

### B2. Hero exit — `scroll-linked` + `scroll-target`

* **Hero portrait fades to reveal green backdrop** — "Hero Image" layer opacity = `1 − scrollY / 900`
  (linear) from scroll 0 → 900 (exactly one hero height at 1440×900; tracked against the `Hero` element
  leaving the viewport, threshold 0). Tablet/phone: same mapping over their hero heights.
  Reversible (pure function of scroll).
* **Hero text parallax** — the bottom-right text container ("Container": paragraph + CTA) moves
  `translateY = +0.3 × scrollY` (Framer parallax "speed 70" ⇒ element travels at 70 % of scroll speed,
  i.e. lags behind). Desktop only (disabled on tablet/phone via breakpoint overrides). The H1 has no parallax.
* **Hero backdrop is sticky**: "Image" (100vh) is `position:sticky; top:0` inside a 3600px (4×100vh)
  "Image Container" with a bottom fade mask ⇒ the green photo stays pinned behind the hero **and the
  Toggle section** (~2700 px of scroll).
* **Animated white lines draw-in** — GSAP ScrollTrigger on each `<path>`: `stroke-dashoffset: L → 0`,
  `ease:none`, `start:"top 50%"`, `end:"bottom 50%"`, `scrub:0.5` (0.5 s catch-up smoothing). Measured
  linear: dashoffset 1466 → 0 across scrollY 0 → ≈750 (desktop). Reversible (undraws on scroll up).
* **Animated lines fade out** — when marker `toggle-start-animation` (doc Y≈1144) reaches 50 % viewport
  (scroll ≈ 750–800): container opacity 1 → 0, tween **1.2 s**, ease (.6,0,.4,1); returning: exit
  transition 0.8 s. Replays both ways.
* **Page Intro (backdrop) fades out** — when marker `toggle-on-animation` (doc Y≈1846) reaches 50 %
  viewport (scroll ≈ 1400–1450): opacity 1 → 0, **spring, duration 1.2 s, bounce 0**; scrolling back
  above: opacity → 1, spring 0.8 s. This is what turns the page background from the green photo to white
  right after the switch flips (frames `frames/1440x900/toggle/01400–01500`).

### B3. Toggle ("Balance" switch) sequence — `scroll-target` variants + layout (FLIP) animation

Structure: Toggle section 1400 px tall; its 500 px content block is `position:sticky; top:0`
(pinned while the section scrolls); behind it the pinned hero backdrop (B2).

| Scroll (desktop) | Trigger | What happens |
|---|---|---|
| 0 → ~300 | load / in-view | "Balance" label fades in (in-view appear 0.8 s) |
| ≈ 700 | marker `toggle-start-animation` crosses 50 % | switch variant **Start → Off**: the switch grows from a single white dot (knob only, tiny 2×2 track) into the full pill track with knob on the left and the label; Framer **layout animation** (scale/translate FLIP) — measured track scale 0.26 → 1 and knob scale 3.9 → 1 within ≈300 ms, no overshoot. Reverses at the same threshold (Off → Start) |
| ≈ 1400 | marker `toggle-on-animation` crosses 50 % | block variant **Toggle Off → Toggle On**: knob slides right (translateX ≈ 13 px spring), track colour `rgba(0,0,0,.2)` → green `#7fa69b`, headline/paragraph pair "Text Before" opacity 1 → 0 and "Text After" 0 → 1 (cross-fade, ≈0.3–0.5 s), text colour white → dark (because the backdrop fades to white simultaneously, B2). Reverses when scrolling back |
| ≈ 1450–1650 | same marker | Page Intro fades (B2), nav switches to its dark variant (B10) |

Clicking the switch = anchor link `./#toggle-on-anchor` → Lenis smooth-scrolls to doc Y≈1702 (≈1.8 s,
ease-out), which triggers the same scroll-target states (no separate click animation).

### B4. Image parallax ("ImageParallaxVerticalNoize" code component) — `scroll-linked`

Formula (per component, evaluated on every `scroll` event):
`progress = clamp((vh − rect.top) / (vh + rect.height), 0, 1)`; image and noise overlay get
`height: calc(100% + P px)` and `transform: translateY(−(P − progress·P) px)` → the image starts shifted
up by P and slides down to 0 as the frame travels from bottom to top of the viewport (image moves slower
than the frame = classic parallax). Linear; perfectly reversible.

| Instance | P (intensity) desktop | tablet | phone | Noise overlay |
|---|---|---|---|---|
| Service cards (×4) | 200 | 200 | 0 (static) | opacity .15, overlay |
| Story A/B Image 1 | 300 | 300 | 0 | .15 |
| Story A/B Image 2 | 100 | 100 | — (hidden on phone) | .15 |
| Big Quote photo | 500 | 300 | 0 | .10 |

### B5. Waves background — `scroll-linked` (desktop only)

Fixed full-viewport container with two very wide wavy green lines (opacity .4 / .1). Opacity is a
3-keyframe scroll transform bound to targets: 0 before `how-it-works` → **1 while How It Works is in view**
→ 0 when `big-quote` arrives. Measured: 0 → 1 linearly over scrollY 3700 → 4600, holds 1, then
1 → 0 over 8450 → 9350. Reversible.

### B6. How It Works long line — `scroll-linked` (GSAP)

One long hand-drawn path (viewBox 680×2000, rendered very tall) drawn with `stroke-dashoffset` 12 727 → 0
between scrollY ≈ 4500 and ≈ 10 200 (desktop), linear, scrub 0.5. Reversible. Hidden on phone.

### B7. Sticky rolling step number (01 → 02 → 03) — `scroll-target` variant + layout slide

* Right column "Big Number Container" (540×900) is **sticky** for the whole Steps block (≈2140 px).
* Number = two digit columns: "A" (the "0") and "B" (the changing digit). Column B contains **5 stacked
  copies** (layers 1–5) of a very tall SVG fit-text digit strip; variant changes shift the strip and
  cross-fade layers.
* Triggers: markers `step-2-trigger` (doc Y≈5757) and `step-3-trigger` (≈6431) at 50 % viewport.
* Transition measured (desktop): strip `translateY` from **+408 px → 0** (layout FLIP), old layer opacity
  1 → 0 while next layer 0 → 1, completes within ≈100 px of scrolling at the 300 ms sampling —
  i.e. a time-based tween ≈ 0.4–0.6 s, not scrubbed. Scrolling up plays the mirror (−457…−500 px → 0).
  Tablet: same with ±270 px. Phone: hidden (steps are listed with inline numbers instead).
* Visual: digit rolls upward like an odometer while fading (frames `frames/1440x900/how-it-works-numbers`).

### B8. Counters (Numbers section) — `in-view`

Each counter has two stacked copies of the number and the label: number slides **down from y −40 → 0**
with opacity 0 → 1; label slides **up from y +40 → 0** with opacity 0 → 1 (they meet). Measured ≈0.3 s
settle after entering view (tween, (.44,0,.56,1)-like). Replays on re-entry (animate-once false).
**Desktop only** — no counter motion was recorded at 1024×768 or 390×844 (static on tablet/phone).

### B9. Generic in-view text/section reveal — `in-view`

The most common effect (≈30 instances: eyebrows, section icons, headlines, paragraphs, pills, story
text, journal header/cards, FAQ items, footer items):

* initial/exit: **opacity 0**, no translation, no scale, no blur;
* enter: opacity → 1, **tween 0.8 s, ease (.44,0,.56,1)**, delay 0, threshold 0 (fires as soon as 1 px
  is visible);
* exit: instant (duration 0) back to 0 when the element fully leaves the viewport, **replays** on every
  re-entry (`animateOnce:false`) — both directions.
* One variant with a spring (footer Framer credit / small components) uses the same values.

This is a plain fade. It is used everywhere **except** the special cases in B1–B8/B10–B12.

### B10. Nav colour mode swap — `scroll-target`

Two identical nav rows ("Menu White" and "Menu Dark") are stacked; their opacities cross-fade (0↔1) and
the logo/dot colour animates (white ↔ green, measured through intermediate rgb values ≈ 0.2–0.3 s):

| Scroll range (desktop) | Mode | Why |
|---|---|---|
| 0 → ≈1400 | **White** (white text, white CTA pill with dark text) | over hero photo |
| ≈1450 → ≈9400 | **Dark** (grey/green text, green CTA pill) | light sections (marker `dark-nav-1`) |
| ≈9450 → ≈10 500 | White | over Big Quote (black) |
| ≈10 550 → ≈16 050 | Dark | light sections |
| ≈16 100 → end | White | over footer |

Reverses exactly on the way up. **Desktop only**: the tablet/phone nav is an opaque white bar (green
logo, green "Menu" pill) at all scroll positions — no swap.

### B11. Big Quote — 3D fold of the white arc — `scroll-linked` (**not a fade**)

* The section's top edge is covered by an absolutely positioned **"Shape Container"** holding a white SVG
  arc (1442×422, viewBox 1516×443: white fill above a convex curve). It is centred on the section's top
  edge (`translateY(-50%)`).
* As the section scrolls in, the container is transformed with **`rotateX` from 0° → −90°** (hinge on its
  horizontal centre line, `transform-origin: 50% 50%`), with **no `perspective`** on the element or its
  parent ⇒ the rotation renders as a pure vertical squash (projected height ∝ cos θ): the white dome
  flattens and disappears, "unrolling" the dark photo underneath.
* Mapping (desktop): linear, **−5° per 50 px of scroll**: starts at scrollY ≈ 8400 (section top ≈ 976 px
  below viewport top … i.e. just entering) and reaches −90° at ≈ 9350 (section top ≈ 26 px — when the
  `big-quote` marker reaches the viewport top). Tablet: starts ≈7650 ("−5.6° per 50 px"); phone: ≈9100.
  Fully reversible.
* Combined with: photo parallax (P = 500), two white wavy decorative lines drawn by GSAP (opacity 1 and
  0.2), quote + attribution in-view fades (B9), nav → white mode.
* Frame evidence: `frames/1440x900/big-quote-3d-fold/08300 … 09500.jpg`, all 3 breakpoints.

### B12. Story images — `scroll-linked` (subtle)

Besides the inner parallax (B4), the two image frames themselves drift in opposite directions while the
Story section is in view: **Image 1 y 0 → −16 px** (up) and **Image 2 y 0 → ≈ +120 px** (down),
linear over the section's pass (markers `story-a` / `story-b`, threshold 1). Creates a gentle depth split
between the overlapping portraits. Desktop + tablet (smaller travel at 1024: Image 2 ≈ +1 px per 10 px
scrolled early on); phone: Image 1 only, tiny.

### B13. Footer background — `scroll-linked`

Footer photo (positioned 320 px above the footer, 1311 px tall) translates **y 0 → +160 px** as the footer
enters (measured 0 → 284 px over scroll 14 850 → 16 000 at 1440 — includes the extra travel of the
overlapping start). Parallax "sinking" background. Reversible. Desktop + tablet; not present on phone.

### B14. Pricing scribble underline — `scroll-linked` (GSAP)

Hand-drawn green loop under the Pricing headline (viewBox 310×80): dashoffset 622 → 0 between scrollY
≈ 7600 and ≈ 7800 (short draw, scrub 0.5). Desktop only.

### B15. "Our Philosophy" word-by-word reveal — `scroll-linked` ("Text Scroll Reveal")

* Statement is split into words (type `word`); each word's opacity maps linearly from **0.2 → 1.0**
  over its own slice of the element's scroll progress: word *i* of *n* reveals during progress
  `[i/n, (i+1)/n]`.
* Progress = element top travelling from **viewport bottom (start 1)** to **25 % from the top (end
  0.25)**, smoothed by a spring (stiffness 500, damping 60, mass 1 — fast, no overshoot).
* Reversible (words dim again when scrolling up). All breakpoints.

### B16. Continuous spinner — `load` (idle loop)

Submit buttons (Book form, footer Subscribe) contain a hidden "loading" ring (conic-gradient) that
rotates continuously (360° per ≈1 s, linear) — visible only in the loading variant; running even when
hidden. Not user-visible in normal use.

### B17. Mobile/tablet menu — `click` (see INTERACTIONS.md)

White full-screen panel reveals top → bottom (≈300 ms), menu items fade in together (0 → 1, start
≈300 ms, end ≈800 ms, mounted with y +20 → 0 snap), label "Menu" ↔ "Close", `html{overflow:hidden}`
while open. Closing reverses (≈400 ms).

---

## C. Depth / 3D / physical-motion audit

| Question | Finding |
|---|---|
| Cards lifting / rotating in 3D? | **No.** Service cards only shift their text block on hover (y −20/+20). Pricing cards only gain a border. |
| Parallax layers? | **Yes** — 4 kinds: hero text (speed 0.7), image-in-frame parallax (P 100–500), story frames drifting apart, footer background sinking. |
| Objects moving from floor toward viewer? | **No z-translation anywhere.** The only 3D transform on the page is B11 `rotateX` (fold/flatten of the arc) and it has no perspective, so it reads as a vertical collapse, not a tilt toward the viewer. |
| Stacking / pinning? | Pinned hero backdrop (sticky 3600 px track), pinned Toggle block (sticky 500 px), pinned step number (sticky 900 px), pinned Book-a-session rating block. No GSAP pin-spacers are used — all pinning is CSS `position: sticky`. |
| Scale animations? | Only as FLIP artefacts of layout animations (toggle growth, accordion, number roll). |
| Blur animations? | Only the hero H1 word reveal (blur 10 px → 0). Progressive blur under nav is static. |

## D. Reversal summary

Everything is reversible except load-time appear effects (play once per page load). In-view fades
replay on every entry (reset instantly on exit). Scroll-linked effects are pure functions of scroll.
Scroll-target variants flip back at the same thresholds when scrolling up.

## E. Uncertainties

* Exact duration/curve of variant transitions inside Framer components (toggle switch, rolling number,
  nav swap) was inferred from 50 px / 300 ms sampling and frames, not read from config (those
  components' transitions are compiled into component chunks; values observed ≈0.3–0.6 s,
  spring-like without overshoot).
* Lenis smoothing makes wheel-driven timing machine-dependent; recordings show desktop scroll throughput
  lower than tablet/phone in headless software rendering (8 backdrop-filter layers are expensive).
* Mobile menu panel reveal curve was captured at ~70 ms frame resolution only.
