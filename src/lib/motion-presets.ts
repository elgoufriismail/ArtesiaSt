import type { Transition } from 'motion/react';

/** The original ignores prefers-reduced-motion; keep false to match it (see ARCHITECTURE.md §7). */
export const REDUCED_MOTION_SUPPORT = false;

/** Cubic-bezier presets used by the original (docs/reconnaissance/ANIMATIONS.md §A). */
export const EASE = {
  framer: [0.44, 0, 0.56, 1],
  entrance: [0.2, 0, 0.2, 1],
  hero: [0.4, 0, 0.2, 1],
  strong: [0.6, 0, 0.4, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** Named transitions, one per recurring effect in the recon catalogue. */
export const T = {
  /** B9 generic in-view fade (enter) */
  revealIn: { type: 'tween', duration: 0.8, ease: EASE.framer } satisfies Transition,
  /** B9 exit: instant reset so the fade replays on re-entry */
  revealOut: { duration: 0 } satisfies Transition,
  /** B1 hero backdrop / waves fade on load */
  heroBg: { type: 'tween', duration: 2, ease: EASE.hero } satisfies Transition,
  /** B1 nav + hero text entrance (delay per element) */
  entrance: (delay: number): Transition => ({ type: 'tween', duration: 1, ease: EASE.entrance, delay }),
  /** B1 H1 word blur reveal (delay = 0.1 + 0.2 * wordIndex) */
  heroWord: (index: number): Transition => ({ type: 'tween', duration: 1.6, ease: EASE.framer, delay: 0.1 + 0.2 * index }),
  /** B2 Page Intro fade out / in (marker toggle-on-animation) */
  introOut: { type: 'spring', duration: 1.2, bounce: 0 } satisfies Transition,
  introIn: { type: 'spring', duration: 0.8, bounce: 0 } satisfies Transition,
  /** B2 hero animated lines fade out / in (marker toggle-start-animation) */
  linesOut: { type: 'tween', duration: 1.2, ease: EASE.strong } satisfies Transition,
  linesIn: { type: 'tween', duration: 0.8, ease: EASE.strong } satisfies Transition,
  /** Variant/layout transitions inside components — MEASURED (≈0.3–0.6s, no overshoot); tune against recon tracks */
  variant: { type: 'spring', duration: 0.5, bounce: 0 } satisfies Transition,
  hover: { type: 'spring', duration: 0.4, bounce: 0 } satisfies Transition,
  cardHover: { type: 'spring', duration: 0.6, bounce: 0 } satisfies Transition,
  /** B15 TextScrollReveal smoothing */
  wordRevealSpring: { stiffness: 500, damping: 60, mass: 1 },
} as const;
