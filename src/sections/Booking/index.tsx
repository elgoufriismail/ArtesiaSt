'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Booking.module.css';

/**
 * Booking — original layer "Book A Session".
 * Title/intro + sticky rating block + form
 * Recon: B1 B9. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Booking() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Book A Session'} data-nav-theme="dark">
    </div>
  );
}
