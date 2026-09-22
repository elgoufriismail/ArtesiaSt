# RECONNAISSANCE — ClearPath homepage (index & summary)

Target: **https://clearpath-template.framer.website/** — homepage only. Captured 2026‑09‑22 with
Playwright 1.56 / Chromium 141 (headless) in a cloud container. The original is the source of truth;
nothing in this folder is a redesign.

## Documents

| File | Contents |
|---|---|
| [STRUCTURE.md](STRUCTURE.md) | section order, DOM/component hierarchy, layout system, sticky/fixed elements, scroll marker IDs |
| [VISUAL.md](VISUAL.md) | colour tokens, full typography scale (4 tiers), spacing, radii, borders, masks, blend modes, progressive blur, image crops, overflow |
| [ASSETS.md](ASSETS.md) | every image/SVG/icon/font/texture with URL + original + rendered size; licensing note; exclusions |
| [BREAKPOINTS.md](BREAKPOINTS.md) | breakpoints, per-viewport page & section heights, spacing per breakpoint |
| [RESPONSIVE.md](RESPONSIVE.md) | desktop / tablet / phone differences section by section, hidden/shown elements, per-breakpoint animation matrix |
| [INTERACTIONS.md](INTERACTIONS.md) | hover / click / menu / FAQ / pricing / form states with timing |
| [ANIMATIONS.md](ANIMATIONS.md) | animation stack, 17 catalogued animations with triggers, values, durations, easings, scroll mapping, reversal, breakpoints, 3D audit |

## Reference material (`reference/`)

```
reference/
├─ screenshots/<W>x<H>/<scrollY>.png   viewport-strip PNGs for all 8 viewports (+ index.json: scrollHeight, shots)
│                                       1920x1080 · 1440x900 · 1280x800 · 1024x768 · 768x1024 · 430x932 · 390x844 · 375x812
├─ recordings/scroll-<vp>.webm          real wheel-scroll videos (Lenis active), 1920/1440/1024/390, with *.timeline.json (ms → scrollY)
├─ animations/
│  ├─ appear-1440x900.json              per-frame load animation samples
│  ├─ scroll-<vp>.json                  scroll-linked style tracks (1440, 1024, 390), down pass + reverse pass
│  ├─ mobile-menu-open-390x844.json     per-frame menu opening samples
│  ├─ appear-config.json                Framer appear-animation config per element & breakpoint
│  └─ frames/<vp>/<zone>/<scrollY>.jpg  scrub frame sequences: hero-exit, toggle, services-parallax, story-a-parallax,
│                                       how-it-works-numbers, pricing-scribble, big-quote-3d-fold, counters
├─ interactions/                        hover (rest / 300 ms / settled) crops, click sequences, menu frames, JSON diffs
├─ dom/tree-<vp>.txt, nodes-<vp>.json   visible DOM + non-default computed styles, all 8 viewports (text truncated to locators)
├─ dom/css-tokens.txt, text-presets.txt design tokens and typography presets per breakpoint
└─ assets/manifest.json                 asset manifest
```

Screenshot protocol (for pixel comparison of the clone): load, wait 4 s (intro animations done), then
for each viewport step `scrollTo(0, n·H)` (instant), wait 1.8 s, capture viewport. Reproduce the same
protocol against the clone and diff file-by-file. Note: the Framer promo badge (bottom-right) is present
in the originals and must be masked out when diffing.

## Key findings (summary)

1. **Built with Framer** (React + Framer Motion). All layout is flexbox stacks; three breakpoints
   (≥1200 / 810–1199 / <810) plus a 4th typography tier at ≥1600. 768 px renders the **phone** layout.
2. **Animation stack**: Framer Motion (appear, in-view, scroll transforms, parallax, variants, layout/FLIP),
   Web Animations API (optimised first-paint appear), **GSAP 3.12.5 + ScrollTrigger** (only for scrubbed SVG
   line drawing, `scrub:0.5`), **Lenis** smooth scroll (`duration 2`), **NumberFlow** (price digits), and
   custom React components (word-by-word scroll text reveal, image parallax with noise).
3. **Signature motions**: hero word-by-word blur reveal; sticky hero backdrop that the portrait fades out
   of; scroll-driven "Balance" switch sequence (dot → switch → on) that swaps headlines and turns the page
   from photo to white; image-in-frame parallax; sticky odometer-style step number; **Big Quote white arc
   folding away with `rotateX 0 → −90°`** (the only 3D transform — no perspective, no z-motion);
   Framer-default 0.8 s fades everywhere else; nav colour mode swaps per section.
4. **Palette**: #2e3231 / #535956 / #949e9b / green #7fa69b / #fafafa / #fff / #000. **Type**: Crimson Text
   (display serif) + Inter.
5. No carousels, tabs, modals, video, Lottie or WebGL on the homepage.

## Uncertainties / limits

* Variant-transition timings inside compiled Framer components (switch, rolling number, nav swap, FAQ,
  menu) are **measured** (≈0.3–0.6 s, spring-like without overshoot), not read from config.
* Captures are headless Chromium with software rendering; desktop wheel-scroll throughput in the videos
  is lower than on a GPU machine. Frame-accurate timing should rely on the JSON samples, not the videos.
* Hover could not be tested for touch devices (touch variants simply omit hover).
* Form submission and the "loading"/"success" states were not triggered (to avoid posting to the live
  form backend).
* Copy text and imagery belong to the template author; see licensing note in ASSETS.md.
