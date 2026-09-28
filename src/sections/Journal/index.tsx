'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { StandInImage } from '@/components/media/StandInImage';
import { NoiseOverlay } from '@/components/media/NoiseOverlay';
import { PATHS } from '@/components/decor/paths';
import { reveal } from '@/animations/scroll/reveal';
import { MASKS } from '@/content/assets';
import { JOURNAL } from '@/content/site';
import styles from './Journal.module.css';

/**
 * Journal: original layer "Journal" (live original, measured 2026-09-28; docs/IMPLEMENTATION_PLAN.md Step 12).
 *
 * Transparent over the white page, column, padding 160/120/80 vertical, gap 0/32/48, overflow hidden.
 * Header (max 1600, padding 0 56/32/8) → Text Container (gap 30): Section Icon (64 masked icon + eyebrow, gap 24),
 * Headline (gap 24): sans H2 with an explicit break + intro (max 640), pill.
 * Articles (max 1600, padding 0 64/40/16, gap 120/80; phone: column, gap 40): three columns on desktop (the middle one
 * padded 100 px down), two on tablet and phone (card C is not part of those layouts). Article: square image link
 * (hairline outline stroke at measured insets + centred blob-masked photo with its own aspect and a noise layer),
 * then Text (gap 24): Container (gap 16) with the linked serif title (max 340) and a 2-line-clamped excerpt (max 340,
 * ellipsis), and a pill.
 * Motion: B9 appears only — header icon, eyebrow, H2, intro and pill on desktop; the article Text blocks on every
 * breakpoint. No scroll-linked motion and no hover beyond the pills' own.
 */
export function Journal() {
  const root = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const c = JOURNAL;
  const base = 'Journal';
  const pill = bp === 'desktop' ? 'Desktop' : 'Touch';

  useGsap(root, (b) => {
    if (!root.current) return;
    const sel = b === 'desktop' ? '[data-appear]' : '[data-appear="all"]';
    return reveal([...root.current.querySelectorAll<HTMLElement>(sel)]);
  }, [bp]);

  return (
    <div ref={root} className={styles.root} data-ref={base} data-nav-theme="dark">
      <div className={styles.header} data-ref={`${base}/Header`}>
        <div className={styles.textContainer} data-ref={`${base}/Header/Text Container`}>
          <div className={styles.iconBlock} data-ref={`${base}/Header/Text Container/Section Icon`}>
            <div className={styles.icon} data-appear="" aria-hidden="true" />
            <div data-appear=""><p className="t-eyebrow">{c.label}</p></div>
          </div>
          <div className={styles.headline} data-ref={`${base}/Header/Text Container/Headline`}>
            <div className={styles.full} data-appear=""><h2 className={`t-sans-h2 ${styles.center}`}>{c.title[0]}<br />{c.title[1]}</h2></div>
            <div className={styles.introWrap} data-appear=""><p className={`t-body ${styles.center}`}>{c.intro}</p></div>
          </div>
          <div data-appear=""><PillButton label={c.cta.label} href={c.cta.href} dataRef={`${base}/Header/Text Container/${pill}`} /></div>
        </div>
      </div>
      <div className={styles.articles} data-ref={`${base}/Articles`}>
        {c.articles.map((a, i) => {
          const art = `${base}/Articles/Article${i ? `#${i + 1}` : ''}`;
          const img = `${art}/Image Container ${a.key}`;
          const stroke = PATHS[a.stroke];
          return (
            <div key={a.key} className={`${styles.col} ${styles[`col${a.key}`]}`}>
              <div className={styles.colInner}>
                <div className={styles.article} data-ref={art}>
                  <a className={styles.imageLink} href={a.href} aria-label={a.title} data-ref={img}>
                    <div className={`${styles.stroke} ${styles[`stroke${a.key}`]}`} data-ref={`${img}/Stroke`} aria-hidden="true">
                      <svg viewBox={stroke.viewBox} preserveAspectRatio="none" width="100%" height="100%">
                        <path d={stroke.d} fill="none" stroke="var(--c-green)" strokeWidth={a.key === 'A' ? 0.732532 : 1} opacity={0.21} />
                      </svg>
                    </div>
                    <div className={`${styles.image} ${styles[`image${a.key}`]}`} style={{ maskImage: `url(${MASKS[a.mask]})`, WebkitMaskImage: `url(${MASKS[a.mask]})` }} data-ref={`${img}/Image`}>
                      <StandInImage slot={a.slot} className={styles.photo} sizes="(min-width: 1200px) 360px, (min-width: 810px) 432px, 100vw" />
                      <NoiseOverlay tile="a" opacity={0.1} inset="-43px 0 -44px" dataRef={`${img}/Image/Noize`} />
                    </div>
                  </a>
                  <div className={styles.text} data-appear="all" data-ref={`${art}/Text`}>
                    <div className={styles.container} data-ref={`${art}/Text/Container`}>
                      <div className={styles.titleWrap}><h3 className={`t-article-title ${styles.center}`}><a className={styles.titleLink} href={a.href}>{a.title}</a></h3></div>
                      <div className={styles.excerptWrap}><p className={`t-small ${styles.center}`}>{a.excerpt}</p></div>
                    </div>
                    <div><PillButton label={c.readMore} href={a.href} dataRef={`${art}/Text/${pill}`} /></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
