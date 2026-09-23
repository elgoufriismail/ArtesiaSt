'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './Numbers.module.css';

/**
 * Numbers — original layer "Numbers".
 * 4 counters
 * Recon: B8. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Numbers() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-stub="" data-ref={'Numbers'} data-nav-theme="dark">
      <Marker id="numbers" />
    </div>
  );
}
