'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { reveal } from '@/animations/scroll/reveal';
import { storyDrift } from '@/animations/sequences/storyDrift';
import { STORIES } from '@/content/site';
import styles from './Story.module.css';

/**
 * Story: original layers "Story A" / "Story B" (one component; recon Step 6, docs/IMPLEMENTATION_PLAN.md).
 *
 * Section (padding A 200/160 · B 160/160; tablet 160/120; phone 100 top) with the 200vh drift marker at top −40
 * → max-1600 row (padding 0 56/32/8) → component ("Desktop A"/"Tablet A"/"Phone A", gap 48/40/32):
 *   eyebrow row · split row: text (flex 5) · spacer (1) · images (6); tablet 3:1:4; phone stacked, images
 *   first, spacer not rendered, Image 2 hidden. Image 1: 60% wide (aspect 0.651338; phone 100% × 400) with
 *   P 300; Image 2: absolute bottom 0 / left 8, 50% wide (aspect 0.668342), P 100. Parallax progress uses
 *   the frame's untransformed position.
 * Motion: B12 frame drift (Image 1 y 0 → −16, Image 2 y 0 → 120 over the marker, threshold 1); B4 inner
 * parallax; B9 appear on eyebrow, title, paragraph and pill.
 */
export function Story({ variant }: { variant: 'a' | 'b' }) {
  const root = useRef<HTMLDivElement>(null);
  const img1 = useRef<HTMLAnchorElement>(null);
  const img2 = useRef<HTMLAnchorElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const c = STORIES[variant];
  const name = variant === 'a' ? 'Story A' : 'Story B';
  const comp = `${name}/${bp === 'desktop' ? 'Desktop' : bp === 'tablet' ? 'Tablet' : 'Phone'} A`;
  const phone = bp === 'phone';
  const media = `${comp}/${phone ? 'Section#2' : 'Section#3'}`;

  useGsap(root, (b) => {
    if (!root.current || !marker.current || !img1.current) return;
    const drift = storyDrift(marker.current, img1.current, b === 'phone' ? null : img2.current);
    const appear = reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]);
    return () => { drift.forEach((t) => t?.kill()); appear(); };
  }, [bp]);

  return (
    <div ref={root} className={`${styles.root} ${variant === 'b' ? styles.b : ''}`} data-ref={name} data-nav-theme="dark">
      <div ref={marker} className={`marker ${styles.marker}`} data-marker={variant === 'a' ? 'story-a' : 'story-b'} data-ref={`${name}/${variant === 'a' ? 'story-a' : 'story-b'}`} aria-hidden="true" />
      <div className={styles.outer}>
        <div className={styles.row}>
          <div className={styles.comp} data-ref={comp}>
            <div className={styles.sections} data-ref={`${comp}/Sections`}>
              <div className={styles.section} data-ref={`${comp}/Sections/Section`}>
                <div className={styles.title} data-ref={`${comp}/Sections/Section/Title`}>
                  <div data-appear=""><p className={`t-eyebrow ${styles.eyebrow}`}>{c.eyebrow}</p></div>
                </div>
              </div>
            </div>
            <div className={styles.split}>
              <div className={styles.textCol} data-ref={`${comp}/Section`}>
                <div className={styles.textContainer} data-ref={`${comp}/Section/Text Container`}>
                  <div className={styles.titleIntro} data-ref={`${comp}/Section/Text Container/Title & Intro`}>
                    <div data-appear=""><h2 className={`t-serif-h2 ${styles.h2}`}>{c.title}</h2></div>
                    <div className={styles.bodyWrap} data-appear=""><p className={`t-body ${styles.body}`}>{c.body}</p></div>
                  </div>
                  <div data-appear="">
                    <PillButton label={STORIES.cta} href={c.href} dataRef={`${comp}/Section/Text Container/${bp === 'desktop' ? 'Desktop' : 'Touch'}`} />
                  </div>
                </div>
              </div>
              {!phone && <div className={styles.spacer} data-ref={`${comp}/Section#2`} />}
              <div className={styles.mediaCol} data-ref={media}>
                <div className={styles.images} data-ref={`${media}/Images`}>
                  <a ref={img1} className={styles.image1} href={c.href} data-ref={`${media}/Images/Image 1`} aria-label={c.title}>
                    <ParallaxImage slot={c.images[0]} intensity="storyLarge" className={styles.frame} dataRef={`${media}/Images/Image 1/Frame`} />
                  </a>
                  {!phone && (
                    <a ref={img2} className={styles.image2} href={c.href} data-ref={`${media}/Images/Image 2`} aria-label={c.title}>
                      <ParallaxImage slot={c.images[1]} intensity="storySmall" className={styles.frame} dataRef={`${media}/Images/Image 2/Frame`} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
