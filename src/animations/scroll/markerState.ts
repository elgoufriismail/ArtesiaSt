import { onMarker } from '../core/scroll';

/**
 * Framer scroll-target variants: calls onChange(true/false) when marker `id` crosses `line`×vh.
 * Used by B2 (lines/intro fade), B3 (balance states), B7 (steps), B10 (nav theme boundaries).
 */
export function markerState(id: string, line: number, onChange: (passed: boolean) => void) {
  return onMarker(id, line, onChange);
}
