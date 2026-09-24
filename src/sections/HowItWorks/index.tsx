'use client';

import { Fragment, useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Marker } from '@/components/ui/Marker';
import { reveal } from '@/animations/scroll/reveal';
import { entrance } from '@/animations/load/entrance';
import { rollingNumber } from '@/animations/pinned/rollingNumber';
import { ANIM } from '@/animations/config';
import { HOW_IT_WORKS } from '@/content/site';
import styles from './HowItWorks.module.css';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ZERO_STRIP = ['0', ...DIGITS];

/** One SVG fit-text digit strip, as the original renders it (viewBox scaled to the column width; one digit
 *  per line). `lit` = index of the only coloured digit (−1: all coloured). */
function Strip({ digits, lit, className, dataRef }: { digits: string[]; lit: number; className: string; dataRef?: string }) {
  return (
    <svg className={className} viewBox={`0 0 149 ${digits.length === 10 ? 2722 : 2450}`} data-ref={dataRef} aria-hidden="true">
      <foreignObject width="100%" height="100%">
        <div className={styles.stripText}>
          {digits.map((d, i) => (
            <Fragment key={i}>
              <span className={lit === -1 || lit === i ? undefined : styles.clear}>{d}</span>
              {i < digits.length - 1 && <span><br /></span>}
            </Fragment>
          ))}
        </div>
      </foreignObject>
    </svg>
  );
}

/**
 * HowItWorks: original layer "How It Works" (recon Step 7, docs/IMPLEMENTATION_PLAN.md).
 *
 * Section (padding-top 160/120/80, phone gap 64) with the `how-it-works` marker (8 × 100vh, B5 waves target)
 * → Text Container (max 1600, padding 0 56/32/8, gap 40/32/32): Display H2 ("How " ink + green) · lead row
 *   (desktop: 3:9 spacer + lead; tablet: lead max 720; phone: full) with the B1 on-load entrance (delay 0.6).
 * → Steps (max 1600, padding 0 56/32/8): text column (flex 6 / 4) with 33vh spacers top and bottom and
 *   trigger containers (50vh desktop, 33vh tablet) holding step-2/3 markers at their middle; spacer (1);
 *   Big Number column (flex 5 / 3) with a sticky 100vh box and the odometer number (B7). Phone: steps only.
 * Motion: B9 appear on headline and steps (desktop only), B1 lead entrance (all), B7 rolling number.
 */
export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const phone = bp === 'phone';
  const c = HOW_IT_WORKS;
  const base = 'How It Works';
  const leadSec = bp === 'desktop' ? 'Section#2' : 'Section';
  const num = `${base}/Steps/Big Number/Big Number Container`;

  useGsap(root, (b) => {
    if (!root.current) return;
    const cleanups: (() => void)[] = [];
    if (lead.current) { const t = entrance(lead.current, 0.6, 1, { fromLoad: true, markAs: 'anim:hiw-lead' }); cleanups.push(() => { t.kill(); }); }
    if (b === 'desktop') cleanups.push(reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]));
    if (ANIM.B7.enabled[b] && colB.current) cleanups.push(rollingNumber([...colB.current.children] as HTMLElement[]));
    return () => cleanups.forEach((f) => f());
  }, [bp]);

  const step = (i: number) => (
    <div className={styles.step} data-appear="" data-ref={`${base}/Steps/Text/Step ${i + 1}`}>
      <div className={styles.stepTitle}><h2 className={`t-serif-h2 ${styles.green}`}>{c.steps[i].title}</h2></div>
      <div className={styles.stepBody}><p className="t-body">{c.steps[i].body}</p></div>
    </div>
  );
  const trigger = (n: 2 | 3) => (
    <div className={styles.trigger} data-ref={`${base}/Steps/Text/Trigger Container${n === 3 ? '#2' : ''}`}>
      <Marker id={`step-${n}-trigger`} className={styles.mStep} dataRef={`${base}/Steps/Text/Trigger Container${n === 3 ? '#2' : ''}/step-${n}-trigger`} />
    </div>
  );

  return (
    <div ref={root} className={styles.root} data-ref={base} data-nav-theme="dark">
      <Marker id="how-it-works" className={styles.mSection} dataRef={`${base}/how-it-works`} />
      <div className={styles.textContainer} data-ref={`${base}/Text Container`}>
        <div className={styles.headline} data-ref={`${base}/Text Container/Headline`}>
          <div className={styles.headlineInner} data-appear="">
            <h2 className={`t-display ${styles.green} ${styles.h2}`}><span className={styles.ink}>{c.title[0]}</span>{c.title[1]}</h2>
          </div>
        </div>
        <div className={styles.sections} data-ref={`${base}/Text Container/Sections`}>
          {bp === 'desktop' && <div className={styles.leadSpacer} data-ref={`${base}/Text Container/Sections/Section`} />}
          <div className={styles.leadSection} data-ref={`${base}/Text Container/Sections/${leadSec}`}>
            <div ref={lead} className={styles.leadContainer} data-ref={`${base}/Text Container/Sections/${leadSec}/Text Container`}>
              <div className={styles.leadWrap}><h5 className={`t-lead ${styles.lead}`}>{c.lead}</h5></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.steps} data-ref={`${base}/Steps`}>
        <div className={styles.text} data-ref={`${base}/Steps/Text`}>
          {!phone && <div className={styles.vspacer} data-ref={`${base}/Steps/Text/Section`} />}
          {step(0)}
          {!phone && trigger(2)}
          {step(1)}
          {!phone && trigger(3)}
          {step(2)}
          {!phone && <div className={styles.vspacer} data-ref={`${base}/Steps/Text/Section#2`} />}
        </div>
        {!phone && <div className={styles.gap} data-ref={`${base}/Steps/Section`} />}
        {!phone && (
          <div className={styles.bigNumber} data-ref={`${base}/Steps/Big Number`}>
            <div className={styles.numberBox} data-ref={num}>
              <div className={styles.numberWrap}>
                <div className={styles.number} role="img" aria-label="Step number" data-ref={`${num}/01`}>
                  <div ref={colB} className={styles.colB} data-ref={`${num}/01/B`}>
                    {[0, 1, 2, 3, 4].map((k) => <Strip key={k} digits={DIGITS} lit={k} className={`${styles.strip} ${k ? styles.off : ''}`} dataRef={`${num}/01/B/${k + 1}`} />)}
                  </div>
                  <div className={styles.colA} data-ref={`${num}/01/A`}>
                    <Strip digits={ZERO_STRIP} lit={-1} className={`${styles.strip} ${styles.stripA}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
