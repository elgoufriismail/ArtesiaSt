# ASSETS — images, SVG, icons, fonts, textures actually used

Machine-readable manifest: **`reference/assets/manifest.json`** (URLs, original pixel sizes, rendered sizes
per viewport, object-fit/position, section usage).

> **Licensing.** All photography, copy, the custom code components and the hosted font files belong to
> the template author (Anton Drukarov / Templatoria, sold via Framer Marketplace) or their licensors.
> Binaries are **not** committed to this repository. Reusing the originals in the clone is only
> appropriate if you hold a valid licence for the template; otherwise substitute your own assets with the
> same dimensions/crops listed below. Google-Fonts **Crimson Text** and **Inter** are OFL-licensed and can be
> self-hosted freely.

All image URLs are on `https://framerusercontent.com/images/…`. Framer serves AVIF/WebP negotiated
variants and responsive sizes via `?scale-down-to=512|1024|2048` + `srcset`/`sizes`.

## 1. Photographs

| File | Original px | Where | Rendered @1440 | Fit / position |
|---|---|---|---|---|
| `A6yz8YhmbQkg8ACTADACAMNk7s.jpg` | 2048×2048 | Hero backdrop (blurred green/yellow) — sticky | 1440×900 | cover, 49.5% 28.4% |
| `vJzjZEQ7XEcIpUiaWAlM8HVcE.jpg` | 3600×3200 | Hero portrait (fades out on scroll) | 1440×900 | cover, **50% 0%** |
| `VW2dIv9jFcnOEMXK68HcTW0X9g.jpg` | 2048×2048 | Service card 1 | 560×760 (parallax overscan) in 316×560 card | cover, center |
| `X1KAS3BPHbN4rR5FN8CCVsSUhM.jpg` | 2048×2048 | Service card 2 | same | cover |
| `lZn0EEipDdK6TqFQ685W86d6r9M.jpg` | 2048×2048 | Service card 3 | same | cover |
| `Ux4Is85LWxm9dXetoVhxJWLGhLI.jpg` | 2048×2048 | Service card 4 | same | cover |
| `Xgg8qSDKhoEnATJuF3xxVuO0bw.jpg` | 2048×2048 | Story A – Image 1 (large, right) | 389×897 (300 overscan) | cover |
| `lLxmvlvWIZ4P7PBI7azU4zec.jpg` | 2048×2048 | Story A – Image 2 (small, overlapping) | 332×597 (100 overscan) | cover |
| `PSjitKcEoMQOEmVvStpNCNRXmSk.jpg` | 2048×2048 | Story B – Image 1 | 389×897 | cover |
| `yzTuL74LYLey46xO4X9rihvGRs4.jpg` | 2048×2048 | Story B – Image 2 | 332×597 | cover |
| `i3wLiFEx85bL9zj8Y2GBkjDc5z4.jpg` | 2048×2048 | Big Quote background (dark, hand) | 1440×1580 (500 overscan) | cover |
| `D6H1lHKBDuxkhpUVf8PPyt7Jivg.jpg` | 2048×2048 | Journal article A | 357×269, blob-masked | cover |
| `LksF7zMOHE97HJPqXDmb7LSvWE.jpg` | 2048×2048 | Journal article B | 357×267, blob-masked | cover |
| `ZMX4xonC6WvSRyRzHHgOkTDzw4.jpg` | 2048×2048 | Journal article C | 357×240, blob-masked | cover |
| `TF67zgMSYINSD7dymhKX4rhrTM.jpg` | 2048×2048 | Footer background | 1440×1311 | cover |
| `POpTLGuLzTuWYxuEYrRGJD678.jpg` | 280×280 | Avatar 1 (rating widgets ×2) | 44×44 | cover |
| `aLd0GlWVHywVWuurCk8JtAWSPw.jpg` | 512×512 | Avatar 2 | 44×44 | cover |
| `PH9MBoozXCDuSg7Zw0ksQExNo.jpg` | 512×512 | Avatar 3 | 44×44 | cover |
| `duZSo1YDta06usFuc3EkJTiRdM.jpg` | 512×512 | Avatar 4 | 44×44 | cover |
| `ES6IJ8JiS4iNVkDK38fQhwjZDr4.jpg` | 512×512 | Avatar 5 | 44×44 | cover |

Tablet/phone crops: see `renderedByViewport` in the manifest (e.g. service images 464×600 @1024,
358×400 @390; footer 390×1874 @390).

No `<video>`, no Lottie, no WebGL/canvas, no GIFs on the homepage.

## 2. Textures (tiled, blended)

| File | Size | CSS | Where |
|---|---|---|---|
| `6mcf62RlDfRfU61Yg5vb2pefpi4.png` | 256×256 | repeat, rendered at 128 px, `mix-blend-mode: overlay`, opacity 1 | hero layers, journal images, footer |
| `hfyi67pKwBIagdce3cECqq02Do.png` | 240×240 | repeat, `background-size:100px 100px`, overlay, opacity .15 (.1 Big Quote) | every parallax image (services, stories, big quote) |

## 3. SVG masks

| File | Intrinsic | Use |
|---|---|---|
| `YRuh4U5ThvXtO2fvm6HWgEZuE4.svg` | 314×236 | Journal image A blob mask |
| `XzHb5S2N4RU9GakyQhgQX2XqY6w.svg` | 297×222 | Journal image B blob mask |
| `4hAvhj6oDkzuyTUlP4waQ9M3jSw.svg` | 314×211 | Journal image C blob mask |
| `9O8sLldl6mV9miUVjkyrhGJsZ7c.svg` | — | Avatar overlap cut-out (avatars 2–5) |
| inline `data:image/svg+xml` 64×64 ×3 | — | Section icons (meditating figure — Philosophy; waves — Pricing; lotus — Journal) filled green via `background-color` + `mask-image` |

## 4. Inline SVG artwork (in DOM)

| Name | viewBox | Rendered @1440 | Stroke/fill | Animated |
|---|---|---|---|---|
| Hero "Animated Lines" (2 paths, loops) | 0 0 780 1140 | 780×1140 at x=330 | white | GSAP draw |
| Waves "Long Line" / "Long Line 2" | 0 0 6000 680 (rotated 90°) | 6000×680 | #7fa69b @ .4 / .1 | opacity by scroll |
| How-It-Works long line | 0 0 680 2000 | tall | white / green token | GSAP draw |
| Pricing scribble | 0 0 310 80 | 310×80 | #7fa69b | GSAP draw |
| Big Quote white decorative lines (2) | 0 0 680 2000 | 680×2000 | white (opacity 1 / .2) | GSAP draw |
| Big Quote arc "Shape" | 0 0 1516 443 | 1442×422 | white fill | rotateX fold |
| Journal "Stroke" outlines (3) | 293×254, 265×259, 302×265 | 336×289, 282×314, 314×311 | #7FA69B hairline | — |
| Hero outline circles (3) | CSS circles (border) | ⌀1094 / 864 / 979 | white, low opacity | — |
| Star (TrustPoint) | 0 0 20 19 | 20×19 | `rgb(0,182,122)` | — |

## 5. Icons

Phosphor icons (Framer "phosphor-icons" module v0.0.57), inline SVG viewBox 0 0 256 256:
InstagramLogo, ThreadsLogo, FacebookLogo, YoutubeLogo (24 px, social rows ×3), CheckCircle (24 px,
pricing features ×12), PlusCircle (FAQ: 39 px on open item / 24 px closed, rotates 135° when open).
Open-source (MIT) — safe to reuse via the `@phosphor-icons/*` packages.

## 6. Fonts

| Family | Source | Weights actually rendered | Notes |
|---|---|---|---|
| Crimson Text | Google Fonts `fonts.gstatic.com/s/crimsontext/v19/…` | 400 (normal) | 700 + italics declared but not seen on the homepage |
| Inter | Framer-hosted woff2 subsets `framerusercontent.com/assets/{vQyevYAy…, d3tHnaQI…, yDtI2UI8…, DXD0Q7Ly…}.woff2` | 400, 500, 600 (bold `<strong>` runs in the rating widget not separately measured) | Inter variable; can be replaced by Google/rsms Inter |
| Aspekta Variable | Framer-hosted `MQthzhqtkV99jFAFdccXwW1PRf0.woff2` | — | **only** used by the Framer promo badge → not needed |

## 7. Exclude from the clone (third-party chrome)

* Framer marketplace promo card ("Get this template" + thumbnail `6HsC0d9bhLu4NT4YGuH3j68zl8.jpg`),
  fixed bottom-right; links to another template and framer.com.
* Framer analytics (`events.framer.com`) and editor bar (`framer.com/edit/init.mjs`).
