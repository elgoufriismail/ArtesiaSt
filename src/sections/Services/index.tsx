'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { cardProximity } from '@/animations/hover/cardProximity';
import { SERVICES } from '@/content/site';
import styles from './Services.module.css';

/**
 * Services: original layer "Our Services" (recon Step 4: docs/IMPLEMENTATION_PLAN.md §Step 4).
 *
 * Our Services (padding-top 80, overflow hidden) → Cards (max 1600, padding 0 56/32/8) → Container
 * (padding 0 8, gap 16: row / 2-col grid / column) → 4 × Card Container (560 / 400 tall) → card link.
 * Desktop card: 560² parallax square (P 200) centred in the card, so it stays fixed while the card box
 * shrinks with cursor proximity (B18). The title is pinned 24 px from the card top, "Read More" 24 px from
 * the bottom, and the description is centred (fixed). Tablet/phone ("Touch" variant): 400 px cards, card-sized
 * parallax frame (P 200 tablet, 0 phone), description bottom 80.
 */
export function Services() {
  const root = useRef<HTMLDivElement>(null);
  const variant = useBreakpoint() === 'desktop' ? 'Desktop' : 'Touch';

  useGsap(root, (bp) => {
    if (bp !== 'desktop' || !root.current) return;
    const cards = [...root.current.querySelectorAll<HTMLElement>('[data-card]')].map((slot) => ({
      slot,
      box: slot.querySelector<HTMLElement>('[data-card-box]')!,
      label: slot.querySelector<HTMLElement>('[data-card-label]')!,
    }));
    return cardProximity(cards);
  });

  const C = 'Our Services/Cards/Container';
  return (
    <div ref={root} className={styles.root} data-ref="Our Services" data-nav-theme="dark">
      <div className={styles.cards} data-ref="Our Services/Cards">
        <div className={styles.container} data-ref={C}>
          {SERVICES.cards.map((c) => {
            const card = `${C}/Card ${c.key} Container`, link = `${card}/${variant}`;
            return (
              <div key={c.key} className={styles.slot} data-card="" data-ref={card}>
                <a className={styles.card} href={SERVICES.href} data-card-box="" data-ref={link}>
                  <ParallaxImage slot={c.slot} intensity="services" className={styles.image} dataRef={`${link}/Image`} />
                  <h3 className={`t-card-title ${styles.title}`}>
                    {c.title.length > 1 ? <>{c.title[0]}<br />{c.title[1]}</> : c.title[0]}
                  </h3>
                  <div className={styles.desc} data-ref={`${link}/Container`}>
                    <p className={`t-small ${styles.body}`}>{c.body}</p>
                  </div>
                  <div className={styles.readMore} data-ref={`${link}/Read More`}>
                    <span className={styles.dot} data-ref={`${link}/Read More/Circle A`} />
                    <span className={`t-eyebrow ${styles.label}`} data-card-label="">{SERVICES.readMore}</span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
