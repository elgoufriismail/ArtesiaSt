'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './BalanceSection.module.css';

/**
 * BalanceSection — original layer "Toggle". Sticky block (Balance switch + headline pair) + a 100vh
 * container; recon B3 · first-class #3. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 *
 * STATUS (Step 1): GEOMETRY-ONLY PLACEHOLDER — outer height and scroll-marker offsets match the
 * original so the hero's sticky backdrop, marker-driven hero fades and nav theme behave correctly.
 * Content and the balance sequence are implemented in Step 3.
 */
export function BalanceSection() {
  const root = useRef<HTMLDivElement>(null);
  useGsap(root, () => {});
  return (
    <div ref={root} className={styles.root} data-ref="Toggle" data-nav-theme="light">
      <div className={styles.stickyBlock} aria-hidden="true" />
      <div className={styles.container100vh} data-ref="Toggle/Container 100vh" />
      <Marker id="toggle-start-animation" />
      <span className={`marker ${styles.darkNav}`} data-marker="dark-nav-1" data-nav-theme="dark" aria-hidden="true" />
      <Marker id="toggle-on-anchor" />
      <Marker id="toggle-on-animation" />
    </div>
  );
}
