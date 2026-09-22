# BREAKPOINTS

## 1. Layout breakpoints (Framer, *config*)

| Name | Media query | Framer hash (page / nav) | Captured viewports in this recon |
|---|---|---|---|
| **Desktop** | `(min-width: 1200px)` | `72rtr7` / `lkcb1d` | 1920×1080, 1440×900, 1280×800 |
| **Tablet** | `(min-width: 810px) and (max-width: 1199.98px)` | `1f5hb54` / `vtru7o` | 1024×768 |
| **Phone** | `(max-width: 809.98px)` | `1ln1qcq` / `16glfzb` | **768×1024**, 430×932, 390×844, 375×812 |

⚠️ **768 px is a phone layout** in this design (below 810). There is no separate "small tablet" layout.

## 2. Typography breakpoints (Framer text presets, *config*)

Text presets use **four** tiers: `≥1600`, `1200–1599`, `810–1199` (serif H2 preset `1omst67`: `809–1199`),
`<810` (serif H2: `≤808`). So 1920 renders larger type than 1440/1280 while the layout is identical.
Full size table in `VISUAL.md §2`.

## 3. Page metrics per captured viewport

`scrollHeight` (px): 1920 → **18 111**, 1440 → **17 048**, 1280 → **16 601**, 1024 → **16 096**,
768 → **19 258**, 430 → **20 081**, 390 → **20 299**, 375 → **20 293**.

## 4. Section top / height per viewport (`docY/height`, px)

| Section | 1920×1080 | 1440×900 | 1280×800 | 1024×768 | 768×1024 | 430×932 | 390×844 | 375×812 |
|---|---|---|---|---|---|---|---|---|
| Page Intro | 0/900 | 0/900 | 0/900 | 0/768 | 0/460 | 0/568 | 0/596 | 0/596 |
| Toggle | 900/1590 | 900/1400 | 900/1300 | 768/1254 | 460/1500 | 568/1449 | 596/1429 | 596/1397 |
| Our Services | 2490/640 | 2300/640 | 2200/640 | 2022/896 | 1960/1728 | 2017/1728 | 2024/1728 | 1992/1728 |
| Our Philosophy | 3130/630 | 2940/630 | 2840/630 | 2918/629 | 3688/508 | 3745/634 | 3752/676 | 3720/676 |
| Story A | 3760/1095 | 3570/1022 | 3470/948 | 3546/776 | 4196/857 | 4379/905 | 4428/932 | 4396/932 |
| How It Works | 4855/2907 | 4592/2562 | 4418/2396 | 4322/2058 | 5053/1015 | 5284/1189 | 5360/1220 | 5328/1274 |
| Ready to find your path? | 7762/639 | 7154/639 | 6815/639 | 6380/618 | 6068/761 | 6473/788 | 6580/788 | 6602/788 |
| Pricing | 8401/1111 | 7793/1104 | 7453/1104 | 6998/1040 | 6829/1509 | 7261/2051 | 7368/2078 | 7390/2078 |
| Text Section | 9512/493 | 8897/478 | 8558/531 | 8038/422 | 8338/388 | 9312/524 | 9446/524 | 9469/524 |
| Big Quote | 10005/1296 | 9376/1080 | 9089/960 | 8461/614 | 8726/819 | 9836/746 | 9971/675 | 9993/650 |
| Story B | 11301/1055 | 10456/982 | 10049/908 | 9075/921 | 9545/932 | 10582/1007 | 10646/1034 | 10643/1061 |
| Journal | 12356/1433 | 11437/1367 | 10957/1313 | 9997/1275 | 10477/2471 | 11589/1835 | 11680/1783 | 11704/1753 |
| Text Section (2) | 13790/493 | 12804/531 | 12270/531 | 11271/422 | 12948/402 | 13424/443 | 13463/511 | 13457/511 |
| Numbers | 14282/298 | 13335/298 | 12801/298 | 11694/461 | 13350/826 | 13867/826 | 13973/826 | 13967/826 |
| FAQ | 14581/754 | 13633/736 | 13100/761 | 12155/751 | 14175/1033 | 14693/1235 | 14799/1293 | 14793/1293 |
| Book A Session | 15335/1696 | 14369/1688 | 13861/1749 | 12906/1624 | 15209/2202 | 15928/2306 | 16092/2334 | 16086/2334 |
| Footer | 17031/1080 | 16057/991 | 15610/991 | 14530/1566 | 17411/1847 | 18234/1847 | 18425/1874 | 18419/1874 |

Notes
* Hero = 900 px at all desktop sizes tested (it is **not** 100vh at 1920×1080 — the Page Intro is fixed
  900 px tall on desktop; the sticky backdrop layer inside is 100vh). Tablet = 768 (100vh at 1024×768).
  Phone ≈ 460–596 (content-driven, starts under the 69 px opaque nav).
* Toggle section height scales with viewport (it contains a "Container 100vh").
* How It Works collapses from ~2.5 k px (sticky number + 450 px step spacers) to ~1.2 k px on phone
  (no sticky number, no spacers).

## 5. Section spacing per breakpoint (vertical padding, horizontal gutter)

| Section | Desktop | Tablet | Phone |
|---|---|---|---|
| Gutter (section / inner) | 56 / 8 | 32 / 8 | 8 / 8 |
| Toggle | 0 16 | 0 16 | 0 16 |
| Our Services | 80 top, gap 120 | 80 top | 80 top |
| Our Philosophy | 200 top | 160 top | 100 top |
| Story A | 200 top / 160 bottom | 160 / 120 | 100 top, gap 32 |
| How It Works | 160 top | 120 top | 80 top, gap 64 |
| Ready | 160 / 160 | 120 / 120 | 80 / 80 |
| Pricing | 160 top | 80 top | 80 top |
| Text Sections | 160 / 160 | 120 / 120 | 80 / 80, column gap 38 |
| Big Quote | 160 / 160, gap 80 | 120 | 80 |
| Story B | 160 / 160 | 160 / 120 | 100 top |
| Journal | 160 / 160 | 120, gap 32 | 80, gap 48 |
| Numbers | 0 / 160 bottom (inner 0 64) | 0 / 120 (inner 0 40) | 0 / 80 (inner 0 16) |
| FAQ | 0 / 160 | 0 / 120 | 0 / 80 |
| Book A Session | 160 / 160 | 120 / 120 | 80 / 80 |
