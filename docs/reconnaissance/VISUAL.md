# VISUAL — typography, colour, spacing, surfaces, imagery

All values are **computed styles measured in Chromium 141** (Playwright) unless marked *config* (read from the
Framer-generated CSS/JS). Reference screenshots: `reference/screenshots/<W>x<H>/<scrollY>.png` (viewport
strips; every file is one viewport-sized frame at the scroll offset in its name, captured after 1.8s settle).

---

## 1. Colour tokens (Framer CSS variables, *config*)

| Token (Framer name) | Value | Used for |
|---|---|---|
| `--token-b72f3c38…` (dark text) | `#2e3231` | headings, dark text, nav text on light |
| `--token-d424afa5…` (body text) | `#535956` | body copy, form text |
| `--token-eac71914…` (muted) | `#949e9b` | muted labels ("Trusted by…"), placeholders |
| `--token-534ca2ef…` **Green** | `#7fa69b` = rgb(127,166,155) | brand accent: pills, eyebrows, second-colour headline parts, icons, big numbers, prices, strokes |
| `--token-15d296e7…` | `#ffffff` | white text/surfaces |
| `--token-4c121226…` | `#ffffffa6` (white 65%) | secondary text on dark (quote attribution, footer) |
| `--token-6d9fab8e…` | `#fafafa` | light-grey section background (Pricing, Text Sections, Numbers, FAQ) |

Other literal colours: section black `#000` (Big Quote), toggle track `rgba(0,0,0,.2)` (off) → green (on),
checkbox idle `rgba(127,166,155,.2)` → checked `#7fa69b`, TrustPoint star `rgb(0,182,122)`,
link colour inside rich text = green, underline on hover.

## 2. Typography

Fonts: **Crimson Text** (Google; 400 used, 700/italic declared) for display serif; **Inter** (Framer-hosted
variable subsets; 400/500/600 used) for everything else. *(Aspekta is only used by the Framer promo badge — ignore.)*

Framer text presets (*config*; sizes switch at **1600 / 1200 / 810** px — note the extra ≥1600 tier):

| Preset | Family | ≥1600 | 1200–1599 | 810–1199 | <810 | Weight | Line-height | Letter-spacing | Transform | Default colour | Used for |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `1gy6fax` **Display** | Crimson Text | 152 | 136 | 88 | 64 | 400 | 84% | −0.05em (≥1600) / −0.04em / −0.04em / −0.03em | — | #2e3231 | hero H1, "How It Works" H2 |
| `1omst67` **Serif H2** | Crimson Text | 80 | 72 | 64 | 48 | 400 | 100% | −0.04em / −0.03em… | — | #2e3231 | story titles, step titles, quote, Book title, footer "Join…" |
| `rrkxdq` **Card title** | Crimson Text | 38 | 36 | 34 | 32 | 400 | 100% | −0.03em | — | #fff | service card titles, pricing plan names |
| `1jvkzq1` Article title (link) | Crimson Text | = rrkxdq size | | | | 400 | 100% | −0.03em | — | green | journal titles |
| `19py25s` **Sans H2** | Inter | 48 | 44 | 38 | 34 | 500 | 120% | −0.04em | — | #2e3231 | toggle headlines, Ready, Pricing, Text Sections, Journal, FAQ |
| `1qkymns` Sans H3 | Inter | 34 | 32 | 30 | 26 | 600 | 140% | −0.03em | — | #2e3231 | (form headings "Tell us about you." etc.) |
| `c1ofpr` Lead | Inter | 28 | 26 | 24 | 22 | 500 | 140% | −0.03em | — | #2e3231 | How-It-Works intro |
| `33sk3i` Large body | Inter | 20 | 18 | 18 | 18 | 400 | 170% | 0 | — | #535956 | "/ month", footer contact |
| `k1gzgo` **Body** | Inter | 16 | 16 | 16 | 16 | 400 | 170% | 0 | — | #535956 | paragraphs |
| `99grtk` Small body | Inter | 14 | 14 | 14 | 14 | 400 | 180% | 0 | — | #535956 | card copy, FAQ answers, labels |
| `9azdev` **Eyebrow/Button label** | Inter | 12 | 12 | 12 | 12 | 600 | 140% | 0.11em | UPPERCASE | green | eyebrows, pill labels, nav links, toggle label |

Non-preset text (measured @1440):
* Logo wordmark "clear—path": Crimson Text 26px/36.4px, 400, letter-spacing **+1.82px (0.07em)**, white or
  dark per nav variant; preceded by an 8×8 round dot ("Rectangle 1").
* Counters "450+ / 80+ / 9+ / 25+": Inter **72px/72px, 600, −2.88px (−0.04em)**, green (a second black copy
  is stacked absolutely for the slide effect — see ANIMATIONS §B8).
* How-It-Works giant numbers: Inter 500 **fit-text ≈226.86px** (line-height 272px, −0.04em), green, inside
  SVG foreignObject 281px wide per digit column.
* Prices (NumberFlow): Inter **48px/48px, 500, −1.92px (−0.04em)**, green, `$` symbol same style.
* Philosophy statement (Text Scroll Reveal, `h4`): Inter 44px/52.8px, 500, −1.32px (−0.03em), #2e3231,
  centered, words at opacity 0.2 until revealed.
* Coloured tails in headlines (e.g. second line of the toggle H2, "It Works", "your path?", "Answered.",
  "a simple step."): same preset, colour green.

## 3. Spacing scale (observed)

Gutters: desktop 56 + 8, tablet 32 + 8, phone 8 + 8 (⇒ 16px visual margin on phone).
Section paddings: 200/160/120/100/80 (see BREAKPOINTS.md). Common internal gaps: 8, 16, 24, 32, 40, 48,
56, 64, 80, 120. Pills: `padding: 1px 48px 0 20px` (right side reserves room for the 4px dot).
Card inner padding: pricing 32, FAQ item 24, service card text inset 24.

## 4. Surfaces, borders, radii, shadows

| Element | Size @1440 | Radius | Fill | Border / shadow |
|---|---|---|---|---|
| Pill button (primary) | h 39, w auto (152–235) | 999px | green (#7fa69b) or white (nav at top / footer subscribe) | none |
| Pill dot ("Circle A/B") | 4×4 | 999px | white / green | — |
| Nav CTA "Book a session" | 191×39 | 999 | **white** on photo nav, **green** on light nav | — |
| Toggle switch track | 56×32 (pricing), grows in Toggle section | 999 | rgba(0,0,0,.2) → green | — |
| Toggle knob | 24×24 | 50% | white | — |
| Service card | 316×560 | **0** (square) | photo | — |
| Pricing card | 427×489 | **16px** | #fff | hover: 1px light-grey border appears |
| FAQ item | 648×79 (closed) / 141 (open) | **16px** | #fff | none |
| Avatar | 48×48 (image 44×44) | 999 | photo | ring made by mask (2px gap) |
| "+81" bubble | 42×42 | 999 | #2e3231 | white 12px bold text |
| Checkbox | 20×20 | 4px | rgba(127,166,155,.2) → #7fa69b checked | none, `appearance:none` |
| Text inputs | 537×40 | 0 | transparent | bottom hairline (1px, light) — no focus ring change detected |
| Journal image | 357×~269 | blob via SVG `mask-image` | photo + noise overlay | outline SVG stroke (#7fa69b thin) behind, offset |
| Big Quote arc "Shape" | 1442×422 | — | white SVG arc | — |
| Hero outline circles | 864–1094 ⌀ | 50% | none | 1px white/low-opacity border ("data-border") |

**No drop shadows are used in the design.** (The only box-shadow on the page belongs to the Framer promo badge.)

## 5. Gradients, masks, blend modes

* Hero "Image Container" `mask-image: linear-gradient(#000 90%, transparent 100%)` — bottom 10% of the
  3600px sticky track fades.
* Hero "Animated Lines" `mask-image: linear-gradient(#000 85%, transparent)`.
* Noise textures: `6mcf62…png` (256px tile rendered at 128px) and `hfyi67…png` (100px tile) with
  `mix-blend-mode: overlay`; opacity 1 (hero/journal/footer) or 0.15 (parallax images) / 0.1 (Big Quote).
* Button spinner: `conic-gradient(rgba(green,0) 76deg, green 360deg)` ring rotating.
* Journal images: `mask-image:url(<blob>.svg)` ×3 distinct blobs; avatars: `mask-image:url(9O8s…svg)`.

## 6. Progressive blur under the nav (fixed, 1440×220)

8 absolutely stacked layers, each with `backdrop-filter: blur(Npx)` and a banded `mask-image` gradient
(`to top`), N = **0.15625, 0.3125, 0.625, 1.25, 2.5, 5, 10, 20** px, bands in 12.5% steps (0–37.5%,
12.5–50%, … 87.5–100%). Result: content scrolling under the nav is increasingly blurred toward the very top
edge (visible in any mid-page screenshot). Present at desktop (the container is hidden on tablet/phone
— `hidden-vtru7o hidden-16glfzb`).

## 7. Imagery & cropping (desktop)

* Hero: two stacked full-bleed layers — a soft green/yellow blurred photo (`A6yz8…`, cover, position
  49.5% 28.4%) and the portrait (`vJzjZ…`, 3600×3200, cover, **position 50% 0%** — top-anchored). Portrait
  fades to reveal the green layer as you scroll (ANIMATIONS §B2).
* Service cards: image box 560×560 centred on a 316-wide card (overflows and is clipped), image rendered
  560×760 (200px parallax overscan).
* Story images: Image 1 389×597 (rendered 389×897, 300px overscan) at right; Image 2 332×497 overlapping
  at left/bottom (rendered 332×597, 100px overscan).
* Big Quote photo: 1440×1080 frame, image 1440×1580 (500px overscan).
* Footer photo: 1440×1311, absolutely positioned starting 320px **above** the footer (overlaps Book
  section bottom), with noise overlay.

## 8. Overflow behaviour

Sections with `overflow:hidden`: Our Services, Our Philosophy, Ready, Pricing, Text Sections, Big Quote,
Journal, FAQ; Book A Session uses `overflow:clip` (so its sticky child still works). Hero/Toggle/Story/How
It Works are `visible` (needed for sticky and overlaps). No horizontal scrolling at any tested width.
