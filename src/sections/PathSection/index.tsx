'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { RatingWidget } from '@/components/ui/RatingWidget';
import { SocialRow } from '@/components/ui/SocialRow';
import { reveal } from '@/animations/scroll/reveal';
import { entrance } from '@/animations/load/entrance';
import { PATH_CTA } from '@/content/site';
import { RATING } from '@/content/site';
import styles from './PathSection.module.css';

/**
 * PathSection: original layer "Ready to find your path?" (recon Step 8, docs/IMPLEMENTATION_PLAN.md).
 *
 * Section (max 1600, padding 160/120/80 vertical) → Text Container (padding 0 56/32/8, align end) → Sections:
 *   left text column (flex 6 / tablet 4; space-between): sans H2 (ink line + green line) and paragraph (max 480),
 *   pill CTA at the bottom · spacer (2 / 1) · right Container (4 / 3, gap 64): "Raiting" block (muted label +
 *   RatingWidget; gap 32/48/40) and "Links" (contact paragraph with the bold underlined e-mail + socials; gap
 *   32/48/48). Phone: one column, gap 64; the text column gap 40.
 * Motion (desktop only, like the original): B1 on-load entrance of the Raiting block (delay 0.8, the nav clock);
 * B9 appear on H2, paragraph, pill, rating label, rating link and the Links block.
 */
export function PathSection() {
  const root = useRef<HTMLDivElement>(null);
  const rating = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const c = PATH_CTA;
  const base = 'Ready to find your path?';
  const left = `${base}/Text Container/Sections/Text Container`;
  const right = `${base}/Text Container/Sections/Container`;
  const touch = bp === 'desktop' ? 'Desktop' : 'Touch';

  useGsap(root, (b) => {
    if (!root.current || b !== 'desktop') return;
    const t = rating.current ? entrance(rating.current, 0.8, 1, { fromLoad: true, markAs: 'anim:path-rating' }) : null;
    const appear = reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]);
    return () => { t?.kill(); appear(); };
  }, [bp]);

  return (
    <div ref={root} className={styles.root} data-ref={base} data-nav-theme="dark">
      <div className={styles.textContainer} data-ref={`${base}/Text Container`}>
        <div className={styles.sections} data-ref={`${base}/Text Container/Sections`}>
          <div className={styles.textCol} data-ref={left}>
            <div className={styles.textBlock} data-ref={`${left}/Text Container`}>
              <div data-appear=""><h2 className={`t-sans-h2 ${styles.h2}`}>{c.title[0]}<br /><span className={styles.green}>{c.title[1]}</span></h2></div>
              <div className={styles.bodyWrap} data-appear=""><p className="t-body">{c.body}</p></div>
            </div>
            <div data-appear=""><PillButton label={c.cta.label} href={c.cta.href} dataRef={`${left}/${touch}`} /></div>
          </div>
          {bp !== 'phone' && <div className={styles.spacer} data-ref={`${base}/Text Container/Sections/Section`} />}
          <div className={styles.container} data-ref={right}>
            <div ref={rating} className={styles.rating} data-ref={`${right}/Raiting`}>
              <div data-appear=""><p className={`t-small ${styles.muted}`}>{RATING.label}</p></div>
              <div data-appear=""><RatingWidget stacked={bp === 'tablet'} dataRef={`${right}/Raiting/Raiting`} /></div>
            </div>
            <div className={styles.links} data-ref={`${right}/Links`} data-appear="">
              <div className={styles.contactWrap}>
                <p className={`t-small ${styles.contact}`}>{c.contact.before}<a className="t-inline-link" href={`mailto:${c.contact.email}`} target="_blank" rel="noreferrer"><strong>{c.contact.email}</strong></a>{c.contact.after}</p>
              </div>
              <SocialRow dataRef={`${right}/Links/Social Links`} variant={touch} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
