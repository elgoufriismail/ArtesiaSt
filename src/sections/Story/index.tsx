'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './Story.module.css';

/**
 * Story — original layer "Story A".
 * Text + two overlapping parallax portraits (used twice: Story A / Story B)
 * Recon: B4 B9 B12 · first-class #4. Spec: docs/IMPLEMENTATION_PLAN.md §3.
 * STATUS: skeleton (root, data-ref, nav theme, scroll markers). Content + animations: implementation phase.
 */
export function Story({ variant }: { variant: 'a' | 'b' }) {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    // animation factories from '@/animations' are wired here (per breakpoint) in the implementation phase
  });

  return (
    <div ref={root} className={styles.root} data-stub="" data-ref={variant === 'a' ? 'Story A' : 'Story B'} data-nav-theme="dark">
      <Marker id={variant === 'a' ? 'story-a' : 'story-b'} />
    </div>
  );
}
