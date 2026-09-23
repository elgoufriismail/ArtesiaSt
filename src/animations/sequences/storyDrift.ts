import { ANIM } from '../config';
import { scrollTargetTransform } from '../scroll/scrollTarget';

/** B12 story frames drift apart: Image 1 y 0 → −16, Image 2 y 0 → +120 by progress(story marker, 1). */
export function storyDrift(storyMarker: Element, image1: HTMLElement, image2: HTMLElement | null, cfg = ANIM.B12) {
  const a = scrollTargetTransform(image1, storyMarker, cfg.threshold, { y: 0 }, { y: cfg.image1Y });
  const b = image2 ? scrollTargetTransform(image2, storyMarker, cfg.threshold, { y: 0 }, { y: cfg.image2Y }) : null;
  return [a, b];
}
