'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Philosophy.module.css';

/**
 * Philosophy — original layer "Our Philosophy".
 * Icon + eyebrow, word-by-word scroll reveal statement, pill
 * Recon: B9 B15. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Philosophy() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Our Philosophy'} data-nav-theme="dark">
    </div>
  );
}
