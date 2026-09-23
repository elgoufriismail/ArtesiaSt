'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { imageParallax } from '@/animations/parallax/imageParallax';
import { ANIM } from '@/animations/config';
import { StandInImage } from './StandInImage';
import type { StandInSlot } from '@/content/assets';
import styles from './ParallaxImage.module.css';

type Intensity = 'services' | 'storyLarge' | 'storySmall' | 'quote';

/**
 * ParallaxImage: the original's image-parallax code component (B4, first-class #4). A frame
 * (white, overflow hidden) holds the image and a noise layer (100 px tile, overlay, opacity .15 / .1).
 * Both are `height: calc(100% + P)` and slide from −P to 0 as the frame crosses the viewport.
 * P per breakpoint comes from ANIM.B4 (0 = static, no overscan).
 * `className` positions/sizes the frame (it is the element whose viewport rect drives the progress).
 */
export function ParallaxImage({ slot, intensity, className, dataRef, noiseOpacity }: {
  slot: StandInSlot; intensity: Intensity; className?: string; dataRef?: string; noiseOpacity?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const noise = useRef<HTMLDivElement>(null);
  const P = ANIM.B4[intensity];
  useGsap(frame, (bp) => {
    if (!frame.current || !img.current || !noise.current) return;
    const t = imageParallax(frame.current, [img.current, noise.current], P[bp]);
    return () => { t?.kill(); };
  });
  const vars = { '--p-desktop': `${P.desktop}px`, '--p-tablet': `${P.tablet}px`, '--p-phone': `${P.phone}px`, '--noise-opacity': noiseOpacity ?? ANIM.B4.noiseOpacity.default } as React.CSSProperties;
  return (
    <div ref={frame} className={`${styles.frame} ${className ?? ''}`} style={vars} data-ref={dataRef}>
      <StandInImage slot={slot} className={styles.layer} ref={img} dataRef={dataRef ? `${dataRef}/img` : undefined} sizes="(min-width: 1200px) 560px, (min-width: 810px) 50vw, 100vw" />
      <div ref={noise} className={`${styles.layer} ${styles.noise}`} aria-hidden="true" />
    </div>
  );
}
