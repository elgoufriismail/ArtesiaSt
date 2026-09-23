# INTERACTIONS — every interactive element, initial → resulting state

Evidence: `reference/interactions/`
* `hover-1440x900.json` — per target: selector, cursor, per-descendant computed-style diffs sampled at
  60/120/200/300/450/600/800/1200 ms after pointer-enter, and whether it reverts on leave.
* `<target>-0-rest.png`, `-1-hover-300ms.png`, `-2-hover-settled.png` — clipped state screenshots.
* `clicks-1440x900.json` + `click-*.png` — toggle switch, pricing switch, FAQ, form states.
* `menu-<vp>.json` + `menu-*.png` — tablet/phone menu open/close frames.

All interactive elements use `cursor: pointer`. No custom cursor, no cursor-follower, no magnetic buttons,
no drag/swipe carousels, no tabs, no modals/lightboxes, no dropdown menus (other than native `<select>`).

---

## 1. Hover states (desktop)

| Element | Rest | Hover result | Timing |
|---|---|---|---|
| **Pill button** (all green pills, nav CTA, "Get started", submit, subscribe) | label left-aligned (padding-left 20), 4 px dot "Circle A" at the right end; "Circle B" parked just outside the left edge (clipped) | whole inner row slides **right by 28–32 px**: label moves right, **Circle B slides into view on the left**, Circle A slides out past the right edge (clipped by the pill's radius/overflow) ⇒ reads as "the dot jumps from right to left". White pills (nav CTA on photo, footer Subscribe): label colour **#2e3231 → green #7fa69b** | ≈300 ms, ease-out, no overshoot; reverts on leave |
| Nav text link (About…Journal) | uppercase 12 px label; hidden 0-width "line" + "push" elements under the text | 1 px underline ("line") grows to full label width under the text | ≈300 ms; reverts |
| Logo | — | no visual change | — |
| **Service card** | (corrected in Step 4) cards are 560 tall until the first mousemove | **cursor proximity** (window mousemove, any vertical position): each desktop card height = max(440, 560 − 0.1875·\|cursor x − card centre x\|), motion useSpring(150, 25); box shrinks about its centre (image, description fixed; title/read-more follow the edges). **Hover** (pointer inside the card): "read more" label 0 → 1 (spring 0.6 s) | height starts the frame after the move; label ~1 frame later |
| Pricing card | white, no border | a 1 px light-grey border appears (radius 16); inner "Get started" pill does its pill hover | ≈300 ms |
| Social icon (24 px) | opacity 1 | icon opacity **1 → 0.5** | ≈300 ms; reverts |
| Inline rich-text link ("Send us an email", "how we work", footer "Privacy Policy.") | green (or white in footer), no underline | underline appears | instant (CSS) |
| Footer sitemap links | white | underline appears (Framer link hover preset) | instant |
| Story images, Journal images/titles, avatars/rating, FAQ rows, toggle switch, form inputs | — | **no hover change** (cursor pointer only on links) | — |

## 2. Click / tap interactions

| Element | Initial state | Action | Resulting state |
|---|---|---|---|
| **Toggle switch** (Toggle section, anchor `./#toggle-on-anchor`) | switch Off, first headline pair visible | click | URL hash set; **Lenis smooth-scroll** to the anchor (from 300 → 1702 in ≈1.8 s, ease-out, `duration 2`); the scroll itself triggers the On state (ANIMATIONS §B3) |
| **Pricing Monthly/Yearly switch** | "Monthly" (dark label), track grey `rgba(0,0,0,.2)`, knob left; prices $49 / $89 / $229, cards variant "Monthly" | click track/knob | switch variant "Toggle On": knob slides right, track green; label "(20% OFF)" in green; cards variant "Yearly"; prices **roll** (NumberFlow digit animation, visible change by 200 ms, settled < 450 ms) to **$39 / $71 / $183**. Click again → back to monthly |
| **FAQ item** | first item **open** by default (height 141 at 1440), others closed (79); plus-in-circle icon | click a closed item | item expands to fit answer (e.g. 79 → 165 px) with a Framer **layout animation** (spring-like, ≈500–600 ms, slight scale FLIP on the icon), icon **rotates 135°** (+ → ×), answer text fades in. **Other items stay as they are** — multiple can be open simultaneously (not an exclusive accordion) |
| FAQ open item | open | click | collapses back to 79 px, icon rotates back |
| Nav links / pills / cards / journal / story / footer links | — | click | navigate to other pages (`./about`, `./services`, `./stories`, `./journal`, `./book-a-session`, story/article slugs, legal pages, 404) — **out of scope** (homepage only). External: `mailto:`, social sites, `framer.link`, `templatoria.com` in new tab |
| **Menu pill (tablet/phone)** | "Menu" pill (green, dot), page scrollable | tap | white full-screen overlay: panel reveals top→down (~0–300 ms); links About / Services / Stories / Journal (uppercase, centred, ~84 px apart) + green "Book a session" pill fade in together (opacity 0 → 1 between ≈300 ms and ≈800 ms, mounted 20 px low and snapped); pill label **"Menu" → "Close"**; `html { overflow: hidden }` (scroll lock) |
| Close pill | overlay open | tap | overlay collapses (≈400 ms), label back to "Menu", scroll unlocked |

## 3. Forms

Book-a-Session form (Framer native form): 3 text inputs (name*, email*, phone), select "Preferred Pronouns *",
textarea, 5 checkboxes (service interest), select "Where did you hear about us? *", 1 opt-in checkbox,
submit pill "Book a session". Footer: email input + white "Subscribe" pill.

| State | Observation |
|---|---|
| Input idle | transparent, no border/radius/padding on the input itself; a thin light divider line is visible under each field in the screenshots (drawn by the surrounding layout, not the input); text #535956 Inter 16/27.2; placeholder #949e9b |
| Input focus | **no visible change** measured (no ring, no border colour change) |
| Checkbox | 20×20, radius 4, `appearance:none`, idle `rgba(127,166,155,.2)`; checked **solid #7fa69b** (computed `background-image: none` — whether a check glyph is drawn via a pseudo-element was not verified; see `form-1440x900-2-typed-checked.png`) |
| Select | native `<select>` styled like inputs with a chevron |
| Submit | not exercised (would post to Framer's form backend). Button has a "loading" variant with a rotating conic ring (see ANIMATIONS §B16) |

## 4. Scroll interactions & sticky elements (see ANIMATIONS.md for curves)

* Lenis smooth scrolling for wheel/trackpad on desktop/tablet; anchors are smooth-scrolled.
* Sticky: hero backdrop (≈2700 px), Toggle block (500 px), How-It-Works number (≈2140 px),
  Book-a-Session rating/social block (desktop/tablet).
* Fixed: nav, progressive blur (desktop), waves lines (desktop).

## 5. Things that look interactive but are not

* Rating widget (avatars + "Excellent 4.9 out of 5 ★ TrustPoint") is a plain external link.
* Journal image blobs and outline strokes do not react to hover.
* Hero outline circles are static.
