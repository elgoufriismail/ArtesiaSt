'use client';

import { useEffect, useRef, useState } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { counters, countUp } from '@/animations/counters/counters';
import { ANIM } from '@/animations/config';
import { NUMBERS } from '@/content/site';
import styles from './Numbers.module.css';

/** The original's "Counter" text component: toFixed(0) with thousands commas. */
const format = (v: number) => v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Framer "Counter" replica: an invisible in-flow copy sizes the box (start value until triggered, then the end
 *  value), the visible copy sits on top (absolute) and counts start → end once its own text enters the view. */
function Counter({ start, end, suffix }: { start: number; end: number; suffix: string }) {
  const shown = useRef<HTMLParagraphElement>(null);
  const [sized, setSized] = useState(start);
  useEffect(() => {
    const el = shown.current;
    if (!el) return;
    return countUp(el, start, end, (v) => { el.textContent = `${format(v)}${suffix}`; }, () => setSized(end));
  }, [start, end, suffix]);
  return (
    <>
      <p className={`${styles.num} ${styles.sizer}`} aria-hidden="true">{format(sized)}{suffix}</p>
      <p ref={shown} className={`${styles.num} ${styles.shown}`}>{format(start)}{suffix}</p>
    </>
  );
}

/**
 * Numbers: original layer "Numbers" (live original, measured 2026-09-28; docs/IMPLEMENTATION_PLAN.md Step 13).
 *
 * #fafafa, column, no top padding, padding-bottom 160/120/80 → wrapper (max 1600) → variant row, whose layer name
 * follows the breakpoint: "Desktop" (row, padding 0 64, four columns flex 1 0 0) · "Tablet" (2×2 grid, row gap 64,
 * padding 0 40) · "Phone" (column, gap 64, padding 0 16, centred). Counter Container (column, gap 16): number
 * (Inter 600 72/1, −0.04em, green; count-up) and a two-line label (t-small, explicit break, no wrapping).
 * Motion: count-up on every breakpoint (own in-view trigger, once, 1.2 s linear); B8 slide on desktop only (row
 * trigger, once, 1 s entrance ease, 0.2 s stagger). The first recon's `numbers` marker no longer exists live.
 */
export function Numbers() {
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const variant = bp === 'desktop' ? 'Desktop' : bp === 'tablet' ? 'Tablet' : 'Phone';
  const base = `Numbers/${variant}`;

  useGsap(root, (b) => {
    if (!row.current || !ANIM.B8.enabled[b]) return;
    const items = [...row.current.querySelectorAll<HTMLElement>('[data-counter]')].map((c) => ({ number: c.children[0] as HTMLElement, label: c.children[1] as HTMLElement }));
    return counters(row.current, items);
  }, [bp]);

  return (
    <div ref={root} className={styles.root} data-ref="Numbers" data-nav-theme="dark">
      <div className={styles.wrap}>
        <div ref={row} className={styles.row} data-ref={base}>
          {NUMBERS.map((n, i) => (
            <div key={n.end} className={styles.counter} data-counter="" data-ref={`${base}/Counter Container${i ? `#${i + 1}` : ''}`}>
              <div className={styles.number}><Counter start={n.start} end={n.end} suffix={n.suffix} /></div>
              <div className={styles.label}><p className={`t-small ${styles.labelText}`}>{n.label[0]}<br />{n.label[1]}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
