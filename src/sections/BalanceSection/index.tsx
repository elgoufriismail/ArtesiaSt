'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import { balanceSequence } from '@/animations/sequences/balanceSequence';
import { BALANCE } from '@/content/site';
import styles from './BalanceSection.module.css';

/**
 * BalanceSection: original layer "Toggle" (ANIMATIONS.md B3, first-class #3; ANIM.B3 holds the measured values).
 *
 * Toggle (padding 0 16) ─┬─ sticky block "Toggle Off/On" (flex column, gap 32, padding-top 244)
 *                        │    ├─ "Toggle Container" link 140×32 → switch box 139×32 (label · Base · knob)
 *                        │    └─ "Text After" (in flow, sets the block height) + "Text Before" (absolute, on top)
 *                        ├─ marker toggle-start-animation (top 244)
 *                        └─ "Container 100vh" (markers dark-nav-1, toggle-on-anchor, toggle-on-animation)
 * The block height is content-driven (244 + 32 + 32 + Text After), as in the original. The switch
 * knob is a DOM sibling of the track so both boxes can be tweened independently (Framer FLIP result).
 */
const P = 'Toggle/Toggle Off';
const SW = `${P}/Toggle Container/Start`;

export function BalanceSection() {
  const root = useRef<HTMLDivElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const sw = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const base = useRef<HTMLSpanElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const bH2 = useRef<HTMLDivElement>(null);
  const bP = useRef<HTMLDivElement>(null);
  const aH2 = useRef<HTMLDivElement>(null);
  const aP = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    if (!link.current || !sw.current || !label.current || !base.current || !knob.current || !bH2.current || !bP.current || !aH2.current || !aP.current) return;
    return balanceSequence({
      link: link.current,
      appear: sw.current,
      label: label.current,
      base: base.current,
      knob: knob.current,
      before: [bH2.current, bP.current],
      after: [aH2.current, aP.current],
    });
  });

  return (
    <div ref={root} className={styles.root} data-ref="Toggle" data-nav-theme="light">
      <div className={styles.sticky}>
        <div className={styles.block} data-ref={P}>
          <a ref={link} className={styles.link} href="./#toggle-on-anchor" data-ref={`${P}/Toggle Container`} aria-label={BALANCE.label}>
            <div ref={sw} className={styles.switch} data-ref={SW}>
              <span ref={label} className={`t-eyebrow ${styles.label}`} data-ref={`${SW}/Label`}>{BALANCE.label}</span>
              <span ref={base} className={styles.base} data-ref={`${SW}/Base`} />
              <span ref={knob} className={styles.knob} data-ref={`${SW}/Base/Toggle`} />
            </div>
          </a>
          <div className={styles.text} data-ref={`${P}/Text After`}>
            <div ref={aH2} className={`${styles.h2Wrap} ${styles.hidden}`} data-ref={`${P}/Text After/H2`}>
              <h2 className={`t-sans-h2 ${styles.h2}`}>
                {BALANCE.after.title[0]} <span className="t-accent">{BALANCE.after.title[1]}</span>
              </h2>
            </div>
            <div ref={aP} className={`${styles.pWrap} ${styles.hidden}`} data-ref={`${P}/Text After/P`}>
              <p className={`t-body ${styles.p}`}>{BALANCE.after.body}</p>
            </div>
            <div className={`${styles.text} ${styles.before}`} data-ref={`${P}/Text After/Text Before`}>
              <div ref={bH2} className={styles.h2Wrap} data-ref={`${P}/Text After/Text Before/H2`}>
                <h2 className={`t-sans-h2 ${styles.h2} ${styles.onDark}`}>{BALANCE.before.title}</h2>
              </div>
              <div ref={bP} className={styles.pWrap} data-ref={`${P}/Text After/Text Before/P`}>
                <p className={`t-body ${styles.p} ${styles.onDark}`}>
                  {BALANCE.before.body[0]}
                  <br />
                  {BALANCE.before.body[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Marker id="toggle-start-animation" anchor className={styles.mStart} />
      <div className={styles.container100vh} data-ref="Toggle/Container 100vh">
        <Marker id="toggle-on-animation" className={styles.mOn} />
        <Marker id="toggle-on-anchor" anchor className={styles.mAnchor} />
        <span className={`marker ${styles.mDarkNav}`} data-marker="dark-nav-1" data-nav-theme="dark" aria-hidden="true" />
      </div>
    </div>
  );
}
