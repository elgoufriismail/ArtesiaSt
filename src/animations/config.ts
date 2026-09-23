/**
 * THE tuning surface for every animation. Keys are the IDs of docs/reconnaissance/ANIMATIONS.md §B
 * (B1…B17) and the interaction IDs of INTERACTIONS.md. Sections never contain numbers — animation
 * modules read them from here, so any animation can be re-tuned without touching a section.
 *
 * Per-breakpoint values use { desktop, tablet, phone }; `null` = effect disabled on that breakpoint
 * (RESPONSIVE.md §4). Durations are seconds, distances px, scroll positions use scroll markers.
 */
import type { Breakpoint } from '@/lib/breakpoints';
import type { EaseName } from './core/eases';

export type PerBp<T> = Record<Breakpoint, T>;
export interface Tween { duration: number; ease: EaseName | 'none'; delay?: number }
export interface Spring { spring: true; duration: number; bounce: number; delay?: number }
export type Transition = Tween | Spring;

export const ANIM = {
  /* ── B1 load sequence ─────────────────────────────────────────────── */
  B1: {
    backdrop: { from: { opacity: 0.001 }, to: { opacity: 1 }, t: { duration: 2, ease: 'hero' } as Tween },
    waves: { from: { opacity: 0.001 }, to: { opacity: 1 }, t: { duration: 2, ease: 'hero' } as Tween },
    heroLines: [
      { to: { opacity: 0.5 }, t: { duration: 2, ease: 'hero', delay: 0.4 } as Tween },
      { to: { opacity: 1 }, t: { duration: 2, ease: 'hero', delay: 0.4 } as Tween },
    ],
    /** Hero H1 word reveal (first-class #1), DESKTOP ONLY (tablet/phone: static headline, verified). Read from the original's WAAPI animations: 1.6 s framer ease,
     *  delay 0.2 s + stagger 0.1 s per word, mounted `mountLag` s after the appear start (median of 15
     *  loads; range 1.21–1.57 s, depends on hydration). See load/heroWords.ts and core/loadClock.ts. */
    heroWords: { from: { opacity: 0.001, y: 10, filter: 'blur(10px)' }, duration: 1.6, ease: 'framer' as EaseName, mountLag: 1.345, delay: 0.2, stagger: 0.1, waitForFonts: true },
    /** Entrance y/opacity (desktop only for hero text; nav on all where shown) */
    entrance: { duration: 1, ease: 'entrance' as EaseName, distance: 20 },
    entranceDelays: {
      navLogo: 0.2, navLinks: [0.4, 0.5, 0.6, 0.7], navCta: 0.8,
      heroParagraph: 0.4, heroCta: 0.4, howItWorksIntro: 0.6, pathRating: 0.8,
      bookTitle: 0.4, bookHeadline: 0.4, bookIntro: 0.6, bookRating: 0.8, bookForm: 0.6,
    },
    heroTextEntranceEnabled: { desktop: true, tablet: false, phone: false } as PerBp<boolean>,
  },

  /* ── B2 hero exit (first-class #2) ───────────────────────────────── */
  B2: {
    portraitFade: { threshold: 0, from: 1, to: 0 },               // onScrollTarget(Hero, 0)
    textParallaxFactor: { desktop: 0.3, tablet: 0, phone: 0 } as PerBp<number>, // speed 70
    // fading out = Framer "exit" (0.8 s), fading back in = "animate" (1.2 s) — verified frame-by-frame
    linesFadeOut: { marker: 'toggle-start-animation', line: 0.5, edge: 'bottom' as const, startFrames: 2, t: { duration: 0.8, ease: 'strong' } as Tween, back: { duration: 1.2, ease: 'strong' } as Tween },
    introFadeOut: { marker: 'toggle-on-animation', line: 0.5, edge: 'bottom' as const, startFrames: 1, t: { spring: true, duration: 1.2, bounce: 0 } as Spring, back: { spring: true, duration: 0.8, bounce: 0 } as Spring },
  },

  /* ── B3 balance switch (first-class #3) ──────────────────────────── */
  /** Measured frame by frame at 1440×900 (rAF-timestamped, backdrop-filter off; fits in docs/architecture
   *  and tools/compare/balance-timing.mjs). Framer rule: the TARGET variant's transition applies. */
  B3: {
    startMarker: 'toggle-start-animation',   // crosses `line` → Start → Off
    onMarker: 'toggle-on-animation',         // crosses `line` → Off → On
    line: 0.5,
    edge: 'top' as const,                    // trigger edge (lib/scroll-math markerPassed): switch = "some"
    startFrames: 1,                          // Framer variant start phase (see scroll/markerState)
    /** Extra frames after the (startFrames-deferred) state change, calibrated with the best-time-shift fits
     *  of tools/compare/balance-timing.mjs: the switch boxes first move ≈2 frames, and colours, label opacity
     *  and text ≈3 frames after the crossing is seen (Framer: layout projection before variant animations). */
    lagFrames: { layout: 2, variant: 2 },
    /** In-view appear of the switch: any intersection, replays, instant reset on exit (either direction). */
    appear: { from: 0.001, t: { duration: 0.8, ease: 'framer' } as Tween },
    /** Switch transitions by target state. Layout moves are linear box interpolations (Framer FLIP). */
    toStart: { spring: true, duration: 1.2, bounce: 0 } as Spring,
    toOff: { spring: true, duration: 1.2, bounce: 0 } as Spring,
    toOn: { spring: true, duration: 0.8, bounce: 0 } as Spring,
    /** Switch boxes in px, relative to the 139×32 switch box. Label x uses left% + xPercent (centred at Start). */
    boxes: {
      start: { label: { left: '50%', xPercent: -50, top: 7.6, opacity: 0 }, base: { left: 68.5, top: 15, width: 2, height: 2 }, knob: { left: 57.5, top: 4 } },
      off: { label: { left: '0%', xPercent: 0, top: 7.2, opacity: 1 }, base: { left: 83, top: 0, width: 56, height: 32 }, knob: { left: 87, top: 4 } },
      on: { label: { left: '0%', xPercent: 0, top: 7.2, opacity: 1 }, base: { left: 83, top: 0, width: 56, height: 32 }, knob: { left: 111, top: 4 } },
    },
    colors: {
      track: { start: 'rgba(0, 0, 0, 0.2)', off: 'rgba(0, 0, 0, 0.2)', on: '#7fa69b' },
      label: { start: '#ffffff', off: '#ffffff', on: '#535956' },
    },
    /** Headline pair swap (both directions): outgoing pair out, incoming H2 / P in after a delay. */
    text: {
      out: { duration: 0.3, ease: 'framer' } as Tween,
      inH2: { duration: 0.6, ease: 'framer', delay: 0.4 } as Tween,
      inP: { duration: 0.8, ease: 'framer', delay: 0.4 } as Tween,
    },
  },

  /* ── B4 image parallax (first-class #4) ──────────────────────────── */
  B4: {
    services: { desktop: 200, tablet: 200, phone: 0 } as PerBp<number>,
    storyLarge: { desktop: 300, tablet: 300, phone: 0 } as PerBp<number>,
    storySmall: { desktop: 100, tablet: 100, phone: 0 } as PerBp<number>,
    quote: { desktop: 500, tablet: 300, phone: 0 } as PerBp<number>,
    noiseOpacity: { default: 0.15, quote: 0.1 },
  },

  /* ── B18 service card cursor proximity (found in Step 4; missing from the recon notes) ─── */
  /** Each desktop card's height follows the cursor's HORIZONTAL distance to the card centre (window
   *  mousemove; vertical position irrelevant): h = max(min, max − k·|dx|). Exact at 1920/1440/1280
   *  (error ≤ 0.03 px). Cards stay at `max` until the first mousemove. The height chases its target
   *  with motion useSpring(stiffness 150, damping 25) (fit rmse 0.0012; retargets keep velocity).
   *  The card box shrinks symmetrically about its centre; image, description and noise stay fixed.
   *  Hover (pointer inside the card): "read more" label opacity 0 → 1, spring 0.6 s bounce 0.
   *  Tablet/phone (Touch variant): static 400 px cards, no proximity, no hover label. */
  B18: {
    enabled: { desktop: true, tablet: false, phone: false } as PerBp<boolean>,
    max: 560, min: 440, k: 0.1875,
    spring: { stiffness: 150, damping: 25, mass: 1 },
    startFrames: 1,                          // motion applies the new target / hover variant next frame
    label: { spring: true, duration: 0.6, bounce: 0 } as Spring,
  },

  /* ── B5 waves background ─────────────────────────────────────────── */
  B5: { values: [0, 1, 0], targets: ['how-it-works', 'big-quote'], threshold: 1, enabled: { desktop: true, tablet: false, phone: false } as PerBp<boolean> },

  /* ── B6 / B14 / hero lines — decorative SVG drawing (first-class #13) ─ */
  draw: { start: 'top 50%', end: 'bottom 50%', scrub: 0.5, ease: 'none' as const },

  /* ── B7 pinned How It Works + odometer (first-class #5, #6) ─────── */
  B7: {
    markers: ['step-2-trigger', 'step-3-trigger'],
    line: 0.5,
    rollDistance: { desktop: 408, tablet: 270, phone: null } as PerBp<number | null>, // FLIP start offset
    t: { spring: true, duration: 0.5, bounce: 0 } as Spring,                           // measured 0.4–0.6 s
  },

  /* ── B8 counters ─────────────────────────────────────────────────── */
  B8: { numberFromY: -40, labelFromY: 40, t: { duration: 0.8, ease: 'framer' } as Tween, enabled: { desktop: true, tablet: false, phone: false } as PerBp<boolean> },

  /* ── B9 generic in-view fade ─────────────────────────────────────── */
  B9: { t: { duration: 0.8, ease: 'framer' } as Tween, resetOnExit: true, threshold: 0 },

  /* ── B10 navigation colour transitions (first-class #10) ─────────── */
  B10: {
    t: { duration: 0.3, ease: 'framer' } as Tween,
    enabled: { desktop: true, tablet: false, phone: false } as PerBp<boolean>,
    /** Viewport y (px) whose underlying [data-nav-theme] decides the theme. Recon: switches happen
     *  when a boundary passes the top by ~66–116px (dark-nav-1 @1384 flips between scroll 1450 and 1500).
     *  The original also shows scroll-direction hysteresis at later boundaries — calibrated in Step 7. */
    line: -80,
  },

  /* ── B11 big quote 3D arc fold (first-class #7) ──────────────────── */
  B11: { marker: 'big-quote', threshold: 1, rotateXTo: -90, transformOrigin: '50% 50%', perspective: null as number | null },

  /* ── B12 story frame drift ───────────────────────────────────────── */
  B12: { threshold: 1, image1Y: -16, image2Y: 120 },

  /* ── B13 footer background ───────────────────────────────────────── */
  /** Footer background sits `offset` px above the footer and travels 0 → offset as it scrolls in
   *  (linear, from its top entering the viewport to the page end) — recon: 320 @1440, 160 @1024. */
  B13: { offset: { desktop: 320, tablet: 160, phone: 0 } as PerBp<number> },

  /* ── B15 philosophy word reveal ──────────────────────────────────── */
  B15: { start: 1, end: 0.25, min: 0.2, max: 1, smoothing: { stiffness: 500, damping: 60, mass: 1 } },

  /* ── B16 spinner ─────────────────────────────────────────────────── */
  B16: { period: 1 },

  /* ── B17 mobile menu (first-class #11) ───────────────────────────── */
  /** Frame-measured on the original (390×844): the white panel SLIDES DOWN from y −150 % to 0 with a
   *  critically damped spring (~0.6 s; remaining distance halves every ~50 ms); links stay in place and
   *  only fade in (from ~0.25 s, spring-like). */
  B17: {
    panel: { spring: true, duration: 0.6, bounce: 0 } as Spring,
    panelFrom: '-150%',
    items: { spring: true, duration: 0.55, bounce: 0, delay: 0.25 } as Spring,
    /** close (measured): links fade out ≈0.25 s, then the panel slides back up to −150 % with an S-curve
     *  (≈0.6 s 'framer'), overlay removed at ≈0.85 s */
    closeItems: { duration: 0.25, ease: 'framer' } as Tween,
    close: { duration: 0.6, ease: 'framer', delay: 0.25 } as Tween,
  },

  /* ── Interactions ────────────────────────────────────────────────── */
  faq: { t: { spring: true, duration: 0.55, bounce: 0 } as Spring, iconRotate: 135, exclusive: false },           // first-class #12
  pricing: { digit: { spring: true, duration: 0.45, bounce: 0 } as Spring, knob: { spring: true, duration: 0.4, bounce: 0 } as Spring, discount: 0.2 }, // #8
  serviceCard: { lift: 60, t: { spring: true, duration: 0.6, bounce: 0 } as Spring },                               // #9 (CSS)
  pill: { slide: 30, t: { spring: true, duration: 0.3, bounce: 0 } as Spring },                                    // CSS
} as const;

export type AnimConfig = typeof ANIM;
