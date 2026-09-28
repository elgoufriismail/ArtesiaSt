'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Marker } from '@/components/ui/Marker';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { DrawnPath } from '@/components/decor/DrawnPath';
import { reveal } from '@/animations/scroll/reveal';
import { drawPath } from '@/animations/svg/drawPath';
import { quoteFold } from '@/animations/sequences/quoteFold';
import { BIG_QUOTE } from '@/content/site';
import styles from './Quote.module.css';

/** The "Shape": own dome cut-out fitted to the original silhouette (viewBox 1516×443, fill = the #fafafa of the
 *  section above; symmetric cubic, ≤ 0.66 units from the original edge sampled at 16 points). */
const ARC_D = 'M0 0 H1514 V441 C1070 159 444 159 0 441 Z';

/**
 * Quote: original layer "Big Quote" (recon Step 11, docs/IMPLEMENTATION_PLAN.md).
 *
 * #000, min-height 120vh (tablet/phone 80vh), padding 160/120/80 vertical, content at the bottom (gap 80), overflow
 * hidden. Layers: `big-quote` marker (top −40, 100vh) · parallax photo (P 500/300/0, noise 0.1) · two long white
 * lines (680×2000 at top calc(50% − 1000px), left calc(71.6667% − 340px); second at opacity .2; desktop only) · Text
 * (max 1600, padding 0 56/32/8) → Headline (gap 32/28/24): serif quote (max 720) + attribution (white 65%) · Shape
 * Container (full width, aspect 3.41441, translateY(−50%)) with the #fafafa arc.
 * Motion (all measured, all reuse shared modules): B11 fold rotateX 0 → −90° over the marker (threshold 1, linear,
 * no perspective, all breakpoints); B6 lines drawn by their own 6000-unit path boxes crossing 50 % (scrub 0.5);
 * B4 photo parallax; B5 waves fade out over the same marker; B9 appears on quote and attribution (desktop only).
 */
export function Quote() {
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<HTMLDivElement>(null);
  const line1 = useRef<SVGPathElement>(null);
  const line2 = useRef<SVGPathElement>(null);
  const bp = useBreakpoint();
  const c = BIG_QUOTE;
  const base = 'Big Quote';

  useGsap(root, (b) => {
    if (!root.current || !shape.current) return;
    const cleanups: (() => void)[] = [];
    const fold = quoteFold(shape.current);
    if (fold) cleanups.push(() => fold.kill());
    if (b === 'desktop') {
      for (const l of [line1.current, line2.current]) if (l) { const t = drawPath(l); cleanups.push(() => { t.scrollTrigger?.kill(); t.kill(); }); }
      cleanups.push(reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]));
    }
    return () => cleanups.forEach((f) => f());
  }, [bp]);

  return (
    <div ref={root} className={styles.root} data-ref={base} data-nav-theme="light">
      <Marker id="big-quote" className={styles.marker} dataRef={`${base}/big-quote`} />
      <div className={styles.photo}>
        <ParallaxImage slot={c.image} intensity="quote" className={styles.frame} noiseOpacity={0.1} dataRef={`${base}/Photo/Frame`} />
      </div>
      {bp === 'desktop' && (
        <>
          <div className={styles.line} aria-hidden="true">
            <div className={styles.lineInner}><DrawnPath ref={line1} name="quoteA" stroke="var(--c-white)" strokeWidth={2} dataRef={`${base}/Line 1`} /></div>
          </div>
          <div className={`${styles.line} ${styles.lineFaint}`} aria-hidden="true">
            <div className={styles.lineInner}><DrawnPath ref={line2} name="quoteB" stroke="var(--c-white)" strokeWidth={2} dataRef={`${base}/Line 2`} /></div>
          </div>
        </>
      )}
      <div className={styles.text} data-ref={`${base}/Text`}>
        <div className={styles.headline} data-ref={`${base}/Text/Headline`}>
          <div className={styles.quoteWrap} data-appear=""><h2 className={`t-serif-h2 ${styles.quote}`}>{c.quote}</h2></div>
          <div className={styles.full} data-appear=""><p className={`t-small ${styles.attribution}`}>{c.attribution}</p></div>
        </div>
      </div>
      <div ref={shape} className={styles.shapeContainer} data-ref={`${base}/Shape Container`} aria-hidden="true">
        <div className={styles.shape} data-ref={`${base}/Shape Container/Shape`}>
          <svg viewBox="0 0 1516 443" width="100%" height="100%"><path d={ARC_D} fill="var(--c-grey-bg)" /></svg>
        </div>
      </div>
    </div>
  );
}
