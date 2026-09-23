'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Pricing.module.css';

/**
 * Pricing — original layer "Pricing".
 * Icon, H2 with drawn scribble, Monthly/Yearly switch, 3 cards with digit roll
 * Recon: B9 B14 · first-class #8 #13. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Pricing() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Pricing'} data-nav-theme="dark">
    </div>
  );
}
