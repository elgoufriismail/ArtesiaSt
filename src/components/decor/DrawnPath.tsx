import { forwardRef, type CSSProperties } from 'react';
import { PATHS, type PathName } from './paths';

/**
 * Stand-in line art (original paths in the original viewBoxes) rendered as a stroked SVG path.
 * Drawing is driven by animations/svg/drawPath (GSAP ScrollTrigger scrub) on the returned <path>.
 */
export const DrawnPath = forwardRef<SVGPathElement, { name: PathName; stroke?: string; strokeWidth?: number; className?: string; style?: CSSProperties; dataRef?: string }>(
  function DrawnPath({ name, stroke = 'currentColor', strokeWidth = 2, className, style, dataRef }, ref) {
    const p = PATHS[name];
    return (
      <svg className={className} style={style} viewBox={p.viewBox} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" aria-hidden="true">
        <path ref={ref} data-ref={dataRef} d={p.d} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  },
);
