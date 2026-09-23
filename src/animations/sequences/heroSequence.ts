import { ANIM } from '../config';
import { pending } from '../core/todo';
import type { Breakpoint } from '@/lib/breakpoints';

/**
 * FIRST-CLASS #2 — hero portrait/background transition (B1 load + B2 exit):
 * backdrop load fade (2 s), portrait opacity = 1 − progress(Hero, threshold 0), lines fade at
 * toggle-start marker, whole Page Intro fade at toggle-on marker (spring 1.2 s / back 0.8 s),
 * text speed parallax (desktop). Composes loadFade, scrollTargetTransform, markerState, speedParallax.
 */
export interface HeroParts { root: HTMLElement; backdrop: HTMLElement; portrait: HTMLElement; lines: HTMLElement | null; text: HTMLElement | null; hero: HTMLElement }
export function heroSequence(parts: HeroParts, bp: Breakpoint, cfg = ANIM) {
  void parts; void bp; void cfg;
  pending('B2', 'hero sequence');
}
