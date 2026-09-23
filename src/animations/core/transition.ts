import { springEase } from './spring';
import type { Transition } from '../config';

/** Convert a config Transition (tween or Framer-style spring) to GSAP tween vars. */
export function toVars(t: Transition): gsap.TweenVars {
  if ('spring' in t) {
    return { duration: t.duration, ease: springEase(t.bounce, t.duration), delay: t.delay ?? 0 };
  }
  return { duration: t.duration, ease: t.ease, delay: t.delay ?? 0 };
}
