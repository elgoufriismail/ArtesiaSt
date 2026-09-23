/**
 * Breakpoints of the original (docs/reconnaissance/BREAKPOINTS.md §1). 768px is a PHONE layout.
 * CSS cannot read these constants — styles repeat the literal values with a comment.
 */
export const MQ = {
  desktop: '(min-width: 1200px)',
  tablet: '(min-width: 810px) and (max-width: 1199.98px)',
  phone: '(max-width: 809.98px)',
} as const;

/** Extra typography tier (text presets only). */
export const MQ_TYPE_XL = '(min-width: 1600px)';

export type Breakpoint = keyof typeof MQ;

export const pick = <T,>(values: Record<Breakpoint, T>, bp: Breakpoint): T => values[bp];

export function currentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia(MQ.desktop).matches) return 'desktop';
  if (window.matchMedia(MQ.tablet).matches) return 'tablet';
  return 'phone';
}
