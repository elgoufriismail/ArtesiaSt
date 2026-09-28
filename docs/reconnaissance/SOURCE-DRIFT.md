# Source drift — changes to the live original after the first recon

The first recon snapshot (docs/reconnaissance/**, reference data recorded 2026-09-22) remains the historical record.
The **current live original** (https://clearpath-template.framer.website/) is the target. When the live site differs,
it is re-measured, recorded here, and the clone and the comparison baselines follow the live site.

## 2026-09-28 — Pricing: plain-text prices, no NumberFlow

Found while re-validating after Big Quote (Pricing geometry suddenly off by up to 21 px with an unchanged clone).
Re-measured with `tools/recon/pricing-live.mjs` (1920, 1440, 1280, 1024, 390) and `tools/compare/pricing-swap.mjs`.
Reference captures: `reference/drift-2026-09-28/pricing/` (`<vp>-monthly.png`, `<vp>-yearly.png` = whole section per
state, `pricing-live.json` = named-layer geometry, price-row DOM + type metrics, headline svgs, rAF change logs of
both switch directions).

| | Recon snapshot (2026-09-22) | Live (2026-09-28) |
|---|---|---|
| Price markup | NumberFlow web component (`number-flow-react`, "$49" one element, 20 px mask margins) + suffix, gap 10 | two rich-text blocks "$" and "49" (Framer preset 19py25s = sans H2) + suffix in a `Container` (padding 4), gap 2, `align-items: flex-end` |
| Price type | 48 px / line-height 1 (row 48 px) | sans H2: 48 / 44 / 38 / 34 px (≥1600 / 1200–1599 / tablet / phone), line-height 1.2, −0.04em, 500, green |
| Price row height | 48 | 57.6 / 52.8 / 45.6 / 40.8 |
| Suffix | 18/20 px body-lg, 64×31 | unchanged type, inside the 72×38.6 padded `Container` |
| Monthly → Yearly | NumberFlow digit roll (1 s spring transform, 0.5 s opacity) + layout FLIP of price and suffix (spring 0.6 s) | **instant text swap** in one frame (49→39, 89→71, 229→183); no animation, no opacity/transform change, no Web Animations |
| Yearly → Monthly | the same roll in reverse | instant swap back |
| Swap time after the tap | 44–75 ms | 23–46 ms (first tap on a fresh page 240–330 ms: one-off warm-up) |
| Switch start phase | knob 3 frames, colours 5 frames after the tap | knob together with the price swap (≈ 15–28 ms), colours 2 frames later (spring shapes unchanged) |
| Section height @1440 | 1104 | 1109.02 (1920 1120.6 · 1024 1037.8 · 390 2056.6) |
| Green headline scribble | 310×80 svg, stroke 3, desktop only | **unchanged — still present** at 1920/1440/1280 (x 974 / 734 / 654 in the section), absent on tablet/phone as before |

Correction of the first drift report (2026-09-28, Big Quote step): "the scribble layer is gone" was wrong. The
scribble's wrapper has never carried a layer name in the original; the geometry tool listed the clone's named wrapper
as "clone-only", which was misread as a removal.

Everything else in the section (text block, switch geometry and springs, cards, options, pills, card hover, B9
appears, B14 scribble draw window) re-measured identical: geometry ≤ 0.33 px in both switch states at all 8
viewports, line counts all match.

### Consequences in the clone

* `Pricing`: price row rebuilt as the live markup (two `t-sans-h2` texts in green + padded suffix container, gap 2);
  prices swap instantly `lagFrames.prices` (1) frames after the tap; switch lags re-tuned to knob 2 / colours 3.
* Removed: `@number-flow/react` (Pricing was its only user), `animations/pricing/layoutFlip.ts`, `ANIM.pricing.flow`,
  `ANIM.pricing.layout`, `.t-price`, `tools/compare/pricing-numberflow.mjs`.
* Baselines: the scroll-track baselines `reference/animations/scroll-{1440x900,1024x768,390x844}.json` were
  re-recorded from the live site with `tools/recon/scroll-baseline.mjs` (same protocol); the 2026-09-22 files are kept
  in `reference/animations/snapshot-2026-09-22/`. Everything below Pricing moved by the new section height (e.g. the
  `big-quote` marker 9336 → 9340.4 at 1440), which `tests/unit/scroll-math.test.ts` now uses.
* Tools: `tools/compare/pricing-swap.mjs` (swap timing + "nothing animates" check, o vs c) replaces the NumberFlow
  comparison; `pricing-switch.mjs` samples the amount text and suffix container instead of NumberFlow hosts.

## 2026-09-28 — Numbers: no `numbers` marker

The first recon listed an 8×8 `numbers` scroll marker. The live page has none at any breakpoint (nothing in the clone
used it), so the clone's Numbers no longer renders it. Everything else in Numbers matches the recon snapshot's layout;
the counter animation was re-measured in detail (ANIMATIONS.md B8 correction).
