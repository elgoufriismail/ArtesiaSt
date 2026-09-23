'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './Hero.module.css';

/**
 * Hero — original layer "Page Intro".
 * Sticky backdrop + portrait, outline circles, animated lines, H1 word reveal, intro text + CTA
 * Recon: B1 B2 B4(no) · first-class #1 #2 #13. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Page Intro'} data-nav-theme="light">
      <Marker id="hero" />
    </div>
  );
}
