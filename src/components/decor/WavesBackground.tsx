'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { wavesBackground } from '@/animations/sequences/wavesBackground';
import { ANIM } from '@/animations/config';
import { PATHS } from './paths';
import styles from './WavesBackground.module.css';

/**
 * Fixed desktop layer with two long wavy green lines (stand-in art, 6000×680, opacity .4 / .1),
 * vertically centred. Opacity is scroll-driven (B5): 0 → 1 as How It Works enters, 1 → 0 as the Big
 * Quote enters (markers). Hidden on tablet/phone.
 */
export function WavesBackground() {
  const root = useRef<HTMLDivElement>(null);
  useGsap(root, (bp) => {
    if (!ANIM.B5.enabled[bp] || !root.current) return;
    wavesBackground(root.current);
  });
  return (
    <div ref={root} className={styles.root} data-ref="Waves Container" aria-hidden="true">
      {(['waveA', 'waveB'] as const).map((k, i) => (
        <svg key={k} className={styles.line} viewBox={PATHS[k].viewBox} width="6000" height="680" style={{ opacity: i === 0 ? 0.4 : 0.1 }}>
          <path d={PATHS[k].d} fill="none" stroke="var(--c-green)" strokeWidth={1} />
        </svg>
      ))}
    </div>
  );
}
