'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Journal.module.css';

/**
 * Journal — original layer "Journal".
 * Header + 3 blob-masked article cards
 * Recon: B9. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Journal() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Journal'} data-nav-theme="dark">
    </div>
  );
}
