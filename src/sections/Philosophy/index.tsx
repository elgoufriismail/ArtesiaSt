'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { reveal } from '@/animations/scroll/reveal';
import { textScrollReveal } from '@/animations/scroll/textScrollReveal';
import { PHILOSOPHY } from '@/content/site';
import styles from './Philosophy.module.css';

/**
 * Philosophy: original layer "Our Philosophy" (recon Step 5, docs/IMPLEMENTATION_PLAN.md §Step 5).
 *
 * Our Philosophy (padding-top 200/160/100, overflow hidden) → inner column (gap 64/56/48):
 *   Icon block (64² masked icon + eyebrow, gap 24) · Text Reveal (padding 0 64/40/16, statement max 1200)
 *   · pill CTA. Icon, label, statement and pill each fade in when they enter the viewport (B9 appear;
 *   replays, instant reset on exit). The statement's words reveal with scroll (B15).
 * Word tokens are split on normal spaces only, so NBSP-glued pairs stay one token (as in the original).
 */
export function Philosophy() {
  const root = useRef<HTMLDivElement>(null);
  const h4 = useRef<HTMLHeadingElement>(null);
  const variant = useBreakpoint() === 'desktop' ? 'Desktop' : 'Touch';

  useGsap(root, () => {
    if (!root.current || !h4.current) return;
    const appear = reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]);
    const off = textScrollReveal(h4.current, [...h4.current.querySelectorAll<HTMLElement>('[data-word]')]);
    return () => { appear(); off(); };
  });

  const P = 'Our Philosophy/Our Philosophy';
  const words = PHILOSOPHY.statement.split(' ');
  return (
    <div ref={root} className={styles.root} data-ref="Our Philosophy" data-nav-theme="dark">
      <div className={styles.inner} data-ref={P}>
        <div className={styles.iconBlock} data-ref={`${P}/Icon`}>
          <div className={styles.appear} data-appear=""><div className={styles.icon} aria-hidden="true" /></div>
          <div className={styles.appear} data-appear=""><p className={`t-eyebrow ${styles.label}`}>{PHILOSOPHY.label}</p></div>
        </div>
        <div className={styles.textReveal} data-ref={`${P}/Text Reveal`}>
          <div className={styles.statementWrap} data-appear="">
            <h4 ref={h4} className={styles.statement}>
              {words.map((w, i) => (
                <span key={i}>
                  <span data-word="" className={styles.word}>{w}</span>
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h4>
          </div>
        </div>
        <div className={styles.appear} data-appear="">
          <PillButton label={PHILOSOPHY.cta.label} href={PHILOSOPHY.cta.href} dataRef={`${P}/${variant}`} />
        </div>
      </div>
    </div>
  );
}
