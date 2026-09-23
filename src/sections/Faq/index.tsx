'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './Faq.module.css';

/**
 * Faq — original layer "FAQ".
 * Headline/intro/helper + independent accordion
 * Recon: B9 · first-class #12. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Faq() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'FAQ'} data-nav-theme="dark">
    </div>
  );
}
