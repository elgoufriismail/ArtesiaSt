'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './Quote.module.css';

/**
 * Quote — original layer "Big Quote".
 * Dark photo (parallax 500), white arc 3D fold, drawn lines, quote
 * Recon: B4 B9 B11 · first-class #7 #13. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Quote() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-stub="" data-ref={'Big Quote'} data-nav-theme="light">
      <Marker id="big-quote" />
    </div>
  );
}
