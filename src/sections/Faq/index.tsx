'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { PlusCircle } from '@phosphor-icons/react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { reveal } from '@/animations/scroll/reveal';
import { accordionAnimate, accordionSet } from '@/animations/faq/accordion';
import { FAQ as C } from '@/content/site';
import styles from './Faq.module.css';

type Item = (typeof C.items)[number];

/** One FAQ item — the original "Open"/"Closed" component: an invisible in-flow Placeholder (question, plus the answer
 *  when open) sets the card height; the Visible Text layer (absolute) always holds the full content. */
function FaqItem({ item, index, refBase }: { item: Item; index: number; refBase: string }) {
  const [open, setOpen] = useState<boolean>(item.open);
  const card = useRef<HTMLDivElement>(null);
  const answer = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLDivElement>(null);
  const from = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!card.current || !answer.current || !icon.current) return;
    if (from.current === null) { accordionSet(answer.current, icon.current, open); return; }
    accordionAnimate(card.current, answer.current, icon.current, from.current, open);
    from.current = null;
  }, [open]);

  const toggle = () => { if (card.current) from.current = card.current.getBoundingClientRect().height; setOpen((o) => !o); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
  const question = <p className={`t-body-lg ${styles.question}`} data-faq-q={index}>{item.q}</p>;
  const answerBody = item.a.map((t) => <p key={t} className={`t-small ${styles.answerP}`}>{t}</p>);

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemCell} data-appear="all">
        <div ref={card} className={styles.card} data-faq-card="" data-ref={refBase} role="button" tabIndex={0} aria-expanded={open} onClick={toggle} onKeyDown={onKey}>
          <div className={styles.placeholder} data-ref={`${refBase}/Placeholder`} aria-hidden="true">
            <div className={styles.textCol} data-ref={`${refBase}/Placeholder/Text`}>
              <p className={`t-body-lg ${styles.question}`}>{item.q}</p>
              {open && <div className={styles.answer}>{answerBody}</div>}
            </div>
            <div className={styles.iconBox} />
          </div>
          <div className={styles.visible} data-faq-visible="" data-ref={`${refBase}/Visible Text`}>
            <div className={styles.textCol} data-ref={`${refBase}/Visible Text/Text`}>
              {question}
              <div ref={answer} className={styles.answer} data-faq-a={index}>{answerBody}</div>
            </div>
            <div ref={icon} className={styles.iconBox} data-faq-icon="" aria-hidden="true"><PlusCircle size="100%" weight="regular" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FAQ: original layer "FAQ" (live original, measured 2026-09-28; docs/IMPLEMENTATION_PLAN.md Step 14).
 *
 * #fafafa, padding-bottom 160/120/80 → variant ("Desktop"/"Tablet"/"Phone") → Sections (max 1600, padding 0 56/32/8):
 * left Section (flex 5/3) → Text (space-between: Headline — two-colour sans H2 + intro — at the top, helper text + pill
 * at the bottom, following the accordion's height), spacer (flex 1), right Section (flex 6/4) → FAQ Accordion →
 * list (gap 8) of six independent items. Phone: one column — headline, list, helper + pill (gap 48, centred).
 * Motion: item open/close (spring 0.8 s: height, answer opacity, icon −135°), B9 appears (all header/helper parts on
 * desktop; the items on every breakpoint).
 */
export function Faq() {
  const root = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const phone = bp === 'phone';
  const variant = `FAQ/${bp === 'desktop' ? 'Desktop' : bp === 'tablet' ? 'Tablet' : 'Phone'}`;
  const V = `${variant}/Sections`;
  const list = phone ? `${V}/Section/Text/Variant 1` : `${V}/Section#3/FAQ Accordion/Variant 1`;

  useGsap(root, (b) => {
    if (!root.current) return;
    return reveal([...root.current.querySelectorAll<HTMLElement>(b === 'desktop' ? '[data-appear]' : '[data-appear="all"]')]);
  }, [bp]);

  // card names follow the state like the original's variants ("Open" / "Closed", numbered in order) — computed from
  // the initial flags; the geometry tools compare the initial state
  const seen: Record<string, number> = {};
  const refs = C.items.map((it) => { const n = it.open ? 'Open' : 'Closed'; seen[n] = (seen[n] ?? 0) + 1; return `${list}/${n}${seen[n] > 1 ? `#${seen[n]}` : ''}`; });
  const accordion = (
    <div className={styles.list} data-ref={list}>
      {C.items.map((it, i) => <FaqItem key={it.q} item={it} index={i} refBase={refs[i]} />)}
    </div>
  );

  return (
    <div ref={root} className={styles.root} data-ref="FAQ" data-nav-theme="dark">
      <div className={styles.wrap}>
        <div className={styles.variant} data-ref={variant}>
          <div className={styles.sections} data-ref={V}>
            <section className={styles.left} data-ref={`${V}/Section`}>
              <div className={styles.text} data-ref={`${V}/Section/Text`}>
                <div className={styles.headline} data-ref={`${V}/Section/Text/Headline`}>
                  <div className={styles.full} data-appear=""><h2 className={`t-sans-h2 ${styles.h2}`} data-faq-h2="">{C.title[0]}<br /><span className={styles.green}>{C.title[1]}</span></h2></div>
                  <div className={styles.introWrap} data-appear=""><p className={`t-body ${styles.para}`} data-faq-intro="">{C.intro}</p></div>
                </div>
                {phone && accordion}
                <div className={styles.helperBlock} data-ref={`${V}/Section/Text/Text`}>
                  <div className={styles.helperWrap} data-appear=""><p className={`t-small ${styles.para}`} data-faq-helper="">{C.helper}</p></div>
                  <div data-appear=""><PillButton label={C.cta.label} href={C.cta.href} dataRef={`${V}/Section/Text/Text/Desktop`} /></div>
                </div>
              </div>
            </section>
            {!phone && <section className={styles.spacer} data-ref={`${V}/Section#2`} />}
            {!phone && (
              <section className={styles.right} data-ref={`${V}/Section#3`}>
                <div className={styles.accordion} data-ref={`${V}/Section#3/FAQ Accordion`}>{accordion}</div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
