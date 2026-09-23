'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import styles from './TextSection.module.css';

/**
 * TextSection — original layer "Text Section".
 * 2-column text (used twice)
 * Recon: B9. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function TextSection({ index }: { index: 1 | 2 }) {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-stub="" data-ref={index === 1 ? 'Text Section' : 'Text Section#2'} data-nav-theme="dark">
    </div>
  );
}
