'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './BalanceSection.module.css';

/**
 * BalanceSection — original layer "Toggle".
 * Sticky 500px block: Balance switch (Start/Off/On) + headline pair cross-fade
 * Recon: B3 · first-class #3. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function BalanceSection() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Toggle'} data-nav-theme="light">
      <Marker id="toggle-start-animation" />
      <Marker id="dark-nav-1" />
      <Marker id="toggle-on-anchor" />
      <Marker id="toggle-on-animation" />
    </div>
  );
}
