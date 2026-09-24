'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { reveal } from '@/animations/scroll/reveal';
import { TEXT_SECTIONS } from '@/content/site';
import styles from './TextSection.module.css';

/**
 * TextSection: original layer "Text Section", used twice (recon Step 10, docs/IMPLEMENTATION_PLAN.md).
 *
 * #fafafa, padding 160/120/80 top and bottom, overflow hidden → Sections (z 1, max 1600, padding 0 56/32/8,
 * align start): Section (flex 6 / tablet 4) with the sans H2 (ink text + green tail) · spacer Section (2 / 1)
 * · Section (4 / 3) with the paragraph (max 480; #1 has a bold inline link). Text Containers: padding 0 8,
 * gap 48/40/32. Phone: Sections stack (gap 38), no spacer.
 * Motion: B9 appear on the H2 and paragraph wrappers, desktop only (static on tablet/phone, as measured).
 */
export function TextSection({ index }: { index: 1 | 2 }) {
  const root = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const c = TEXT_SECTIONS[index - 1];
  const base = 'Text Section';
  const body = c.body as { before: string; link?: { label: string; href: string }; after?: string };

  useGsap(root, (b) => {
    if (!root.current || b !== 'desktop') return;
    return reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]);
  }, [bp]);

  return (
    <div ref={root} className={styles.root} data-ref={index === 1 ? base : `${base}#2`} data-nav-theme="dark">
      <div className={styles.sections} data-ref={`${base}/Sections`}>
        <div className={styles.titleCol} data-ref={`${base}/Sections/Section`}>
          <div className={styles.textContainer} data-ref={`${base}/Sections/Section/Text Container`}>
            <div className={styles.full} data-appear="">
              <h2 className={`t-sans-h2 ${styles.h2}`}>{c.title[0]}<span className={styles.green}>{c.title[1]}</span></h2>
            </div>
          </div>
        </div>
        {bp !== 'phone' && <div className={styles.spacer} data-ref={`${base}/Sections/Section#2`} />}
        <div className={styles.bodyCol} data-ref={`${base}/Sections/Section#${bp === 'phone' ? 2 : 3}`}>
          <div className={styles.textContainer} data-ref={`${base}/Sections/Section#${bp === 'phone' ? 2 : 3}/Text Container`}>
            <div className={styles.bodyWrap} data-appear="">
              <p className={`t-body ${styles.body}`}>
                {body.before}
                {body.link && <a className="t-inline-link" href={body.link.href}><strong>{body.link.label}</strong></a>}
                {body.after}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
