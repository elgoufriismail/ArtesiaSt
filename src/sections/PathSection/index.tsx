'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './PathSection.module.css';

/**
 * PathSection — original layer "Ready to find your path?".
 * CTA text + rating widget + contact + socials
 * Recon: B1 B9. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function PathSection() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-ref={'Ready to find your path?'} data-nav-theme="dark">
    </div>
  );
}
