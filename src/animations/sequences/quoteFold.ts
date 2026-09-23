import { ANIM } from '../config';
import { scrollTargetTransform } from '../scroll/scrollTarget';
import { marker } from '../core/scroll';

/**
 * FIRST-CLASS #7 — Big Quote 3D arc fold (B11): the white arc container rotates rotateX 0 → −90°
 * by progress(big-quote marker, threshold 1); no perspective, origin 50% 50% (reads as a vertical
 * collapse). Measured error of the mapping vs original: ≤0.1°.
 */
export function quoteFold(shapeContainer: HTMLElement, cfg = ANIM.B11) {
  const target = marker(cfg.marker);
  if (!target) return null;
  shapeContainer.style.transformOrigin = cfg.transformOrigin;
  return scrollTargetTransform(shapeContainer, target, cfg.threshold, { rotationX: 0 }, { rotationX: cfg.rotateXTo });
}
