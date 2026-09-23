'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './HowItWorks.module.css';

/**
 * HowItWorks — original layer "How It Works".
 * Display H2 + lead, 3 steps with spacers, sticky odometer number, long drawn line
 * Recon: B6 B7 B9 · first-class #5 #6 #13. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'How It Works'} data-nav-theme="dark">
      <Marker id="how-it-works" />
      <Marker id="step-2-trigger" />
      <Marker id="step-3-trigger" />
    </div>
  );
}
