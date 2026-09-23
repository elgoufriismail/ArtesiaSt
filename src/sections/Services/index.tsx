'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Services.module.css';

/**
 * Services — original layer "Our Services".
 * 4 image cards (parallax 200) with hover expansion
 * Recon: B4 B9 · first-class #4 #9. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Services() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-stub="" data-ref={'Our Services'} data-nav-theme="dark">
    </div>
  );
}
