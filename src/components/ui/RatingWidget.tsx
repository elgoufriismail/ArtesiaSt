'use client';

import { forwardRef } from 'react';
import { StandInImage } from '@/components/media/StandInImage';
import { MASKS } from '@/content/assets';
import { RATING } from '@/content/site';
import styles from './RatingWidget.module.css';

/** Own five-point star drawn in the original icon's 20×19 box (the original is an inline data-URI SVG). */
function Star({ dataRef }: { dataRef?: string }) {
  return (
    <svg className={styles.vector} viewBox="0 0 20 19" aria-hidden="true" data-ref={dataRef}>
      <path d="M10 0.6l2.78 5.9 6.42.78-4.73 4.44 1.2 6.36L10 14.95l-5.67 3.13 1.2-6.36L.8 7.28l6.42-.78L10 .6z" fill="currentColor" />
    </svg>
  );
}

/**
 * RatingWidget: the original's "Raiting" link (measured Step 8): "Users" row 208×48 (five 48 px avatars at a
 * 32 px step, each ring-masked with a 44 px photo inset 2 px, plus a 48 px counter circle holding a 42 px ink
 * disc with an 11 px bold white label) above the "Trustpoint" line (16 px 600 text · 23×22 star box · score).
 * `stacked` (tablet): the trust text and the star + score sit on two rows instead of one (gap 8).
 */
export const RatingWidget = forwardRef<HTMLAnchorElement, { stacked?: boolean; dataRef?: string; className?: string }>(
  function RatingWidget({ stacked = false, dataRef, className }, ref) {
    return (
      <a ref={ref} className={`${styles.root} ${className ?? ''}`} href={RATING.href} data-ref={dataRef} aria-label={`${RATING.trust}, ${RATING.score}`}>
        <div className={styles.users} data-ref={dataRef && `${dataRef}/Users`}>
          {RATING.avatars.map((slot, i) => (
            <div key={slot} className={styles.avatar} data-ref={dataRef && `${dataRef}/Users/Variant 1${i ? `#${i + 1}` : ''}`} style={{ left: i * 32, maskImage: `url(${MASKS.avatarRing})`, WebkitMaskImage: `url(${MASKS.avatarRing})` }}>
              <StandInImage slot={slot} className={styles.photo} sizes="44px" dataRef={dataRef && `${dataRef}/Users/Variant 1${i ? `#${i + 1}` : ''}/Image`} />
            </div>
          ))}
          <div className={styles.counter} data-ref={dataRef && `${dataRef}/Users/Container`}>
            <div className={styles.disc}><span className={styles.count}><strong>{RATING.counter}</strong></span></div>
          </div>
        </div>
        <div className={`${styles.trust} ${stacked ? styles.stacked : ''}`} data-ref={dataRef && `${dataRef}/Trustpoint`}>
          <p className={styles.trustText}><strong>{RATING.trust}</strong></p>
          <div className={styles.scoreRow} data-ref={dataRef && `${dataRef}/Trustpoint/Trustpoint`}>
            <div className={styles.star} data-ref={dataRef && `${dataRef}/Trustpoint/Trustpoint/Star`}><Star dataRef={dataRef && `${dataRef}/Trustpoint/Trustpoint/Star/Vector`} /></div>
            <p className={styles.trustText}><strong>{RATING.score}</strong></p>
          </div>
        </div>
      </a>
    );
  },
);
