'use client';

import { useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { reveal } from '@/animations/scroll/reveal';
import { storyGallery } from '@/animations/story/storyGallery';
import { STORIES } from '@/content/site';
import styles from './Story.module.css';

/** Photo shapes in gallery order (left column takes 1, 3, 5; right column 2, 4, 6). */
const RATIOS = ['2 / 3', '4 / 5', '1 / 1', '2 / 3', '4 / 5', '1 / 1'];

/**
 * Story (client change 2026-10-23, Option A — replaces the original's two overlapping frames).
 *
 * Section (padding 200/160 · tablet 160/120 · phone 100/0) → max-1600 row (padding 0 56/32/8) → split row:
 *   text column (flex 5 · tablet 3) whose content is sticky (top 160 · tablet 140; static on phone):
 *   eyebrow, serif title, body, pill · spacer (1) · gallery (flex 6 · tablet 4): two columns of photos
 *   (gap 24/16/12; photos gap 56/40/28; right column offset 180/120/64), shapes RATIOS, numbered captions.
 *   Phone: text first, then the two-column gallery.
 * Motion: B9 appear on the text; animations/story/storyGallery (reveal once per photo; hover on fine pointers:
 * zoom + lean, inset mat, cursor badge, siblings dim); B4 inner parallax ('gallery').
 */
export function Story({ variant }: { variant: 'a' | 'b' }) {
  const root = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const c = STORIES[variant];
  const name = variant === 'a' ? 'Story A' : 'Story B';
  const comp = `${name}/${bp === 'desktop' ? 'Desktop' : bp === 'tablet' ? 'Tablet' : 'Phone'} A`;
  const phone = bp === 'phone';
  const photos = c.gallery.map((g, i) => ({ ...g, i }));
  const columns = [photos.filter((p) => p.i % 2 === 0), photos.filter((p) => p.i % 2 === 1)];

  useGsap(root, (b) => {
    if (!root.current || !gallery.current) return;
    const hover = b !== 'phone' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const stopGallery = storyGallery(gallery.current, { hover });
    const appear = reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]);
    return () => { stopGallery(); appear(); };
  }, [bp]);

  return (
    <div ref={root} className={`${styles.root} ${variant === 'b' ? styles.b : ''}`} data-ref={name} data-nav-theme="dark">
      <div className={styles.outer}>
        <div className={styles.row}>
          <div className={styles.comp} data-ref={comp}>
            <div className={styles.split}>
              <div className={styles.textCol} data-ref={`${comp}/Section`}>
                <div className={styles.textContainer} data-ref={`${comp}/Section/Text Container`}>
                  <div data-appear=""><p className={`t-eyebrow ${styles.eyebrow}`}>{c.eyebrow}</p></div>
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
              <div className={styles.mediaCol} data-ref={`${comp}/Gallery`}>
                <div ref={gallery} className={styles.gallery}>
                  {columns.map((col, ci) => (
                    <div key={ci} className={`${styles.col} ${ci ? styles.colB : ''}`}>
                      {col.map((p) => (
                        <a
                          key={p.slot}
                          className={styles.item}
                          href={c.href}
                          aria-label={`${c.title} — ${p.caption}`}
                          data-gallery="item"
                          style={{ '--ratio': RATIOS[p.i % RATIOS.length] } as React.CSSProperties}
                        >
                          <div className={styles.frame} data-gallery="frame">
                            <div className={styles.zoom} data-gallery="zoom">
                              <ParallaxImage slot={p.slot} intensity="gallery" className={styles.photo} dataRef={`${comp}/Gallery/Photo ${p.i + 1}`} />
                            </div>
                          </div>
                          <div className={styles.caption} data-gallery="caption">
                            <span className={styles.num}>{String(p.i + 1).padStart(2, '0')}</span>
                            <span className={styles.label}>{p.caption}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ))}
                  <div className={styles.badge} data-gallery="badge" aria-hidden="true">
                    <span>View</span>
                    <ArrowUpRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
