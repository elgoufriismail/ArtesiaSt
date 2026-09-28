'use client';

import { useRef, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PillButton } from '@/components/ui/PillButton';
import { DrawnPath } from '@/components/decor/DrawnPath';
import { reveal } from '@/animations/scroll/reveal';
import { drawPath } from '@/animations/svg/drawPath';
import { pricingSwitch } from '@/animations/pricing/pricingSwitch';
import { afterTicks } from '@/animations/core/ticks';
import { springToCssLinear } from '@/animations/core/spring';
import { ANIM } from '@/animations/config';
import { PRICING } from '@/content/site';
import styles from './Pricing.module.css';

const HOVER_EASE = springToCssLinear(ANIM.pricing.cardHover.bounce, ANIM.pricing.cardHover.duration, 40);

/**
 * Pricing: original layer "Pricing" (recon Step 9, docs/IMPLEMENTATION_PLAN.md).
 *
 * Section (padding-top 160/80/80) → Container (max 1600, padding 0 56/32/8, gap 80) → Text (gap 32): Section Icon
 * (64 masked icon + eyebrow, gap 24) and Headline (gap 24; max 800 on desktop): sans H2 + intro (max 480), with the
 * 310×80 scribble at left 414 / top −9 (desktop only). Then the "Monthly"/"Yearly" component (gap 48): the switch
 * ("Toggle Off"/"Toggle On": label · 56×32 track with a 24 px knob · "Yearly (20% OFF)") and Cards (wrap, gap 16,
 * cards flex 1 0 0 with min-width 280 → 3 / 3 / 2+1 / 1 per row). Card (radius 16, padding 32, gap 40): title + desc,
 * price row (live original, re-measured 2026-09-28: "$" and the amount as two sans-H2 texts in green + the suffix
 * in a 4 px-padded Container, gap 2, bottom-aligned), four CheckCircle options (gap 16), green pill.
 * Motion: B14 scribble draw (desktop), B9 appears on icon, eyebrow, H2 and intro (desktop), switch springs
 * (to Yearly 0.8 s, to Monthly 1.2 s), prices swap instantly (no animation) a few frames after the tap, card hover
 * border (spring 0.6 s, CSS).
 */
export function Pricing() {
  const root = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const monthlyLabel = useRef<HTMLParagraphElement>(null);
  const scribble = useRef<SVGPathElement>(null);
  const ctl = useRef<ReturnType<typeof pricingSwitch> | null>(null);
  const [yearly, setYearly] = useState(false);          // switch state (variant name, aria)
  const [priceYearly, setPriceYearly] = useState(false); // shown prices (swap phase measured separately)
  const [hovered, setHovered] = useState(-1);
  const yearlyRef = useRef(false);
  const bp = useBreakpoint();
  const c = PRICING;
  const base = 'Pricing';
  const comp = `${base}/Container/${yearly ? 'Yearly' : 'Monthly'}`;
  const toggleName = yearly ? 'Toggle On' : 'Toggle Off';

  useGsap(root, (b) => {
    if (!root.current || !knob.current || !track.current || !monthlyLabel.current) return;
    const sw = pricingSwitch({ knob: knob.current, track: track.current, monthlyLabel: monthlyLabel.current });
    ctl.current = sw;
    sw.set(yearlyRef.current, false);
    const cleanups: (() => void)[] = [() => sw.kill()];
    if (b === 'desktop') {
      cleanups.push(reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear]')]));
      if (scribble.current) { const t = drawPath(scribble.current); cleanups.push(() => { t.scrollTrigger?.kill(); t.kill(); }); }
    }
    return () => cleanups.forEach((f) => f());
  }, [bp]);

  const toggle = () => {
    const next = !yearlyRef.current;
    yearlyRef.current = next;
    setYearly(next);
    ctl.current?.set(next, true);
    afterTicks(ANIM.pricing.lagFrames.prices, () => setPriceYearly(yearlyRef.current));   // instant swap
  };

  return (
    <div ref={root} className={styles.root} data-ref={base} data-nav-theme="dark" style={{ '--hover-ease': HOVER_EASE } as React.CSSProperties}>
      <div className={styles.container} data-ref={`${base}/Container`}>
        <div className={styles.text} data-ref={`${base}/Container/Text`}>
          <div className={styles.iconBlock} data-ref={`${base}/Container/Text/Section Icon`}>
            <div className={styles.icon} data-appear="" aria-hidden="true" />
            <div data-appear=""><p className="t-eyebrow">{c.label}</p></div>
          </div>
          <div className={styles.headline} data-ref={`${base}/Container/Text/Headline`}>
            {bp === 'desktop' && (
              <div className={styles.scribble} aria-hidden="true">
                <DrawnPath ref={scribble} name="scribble" stroke="var(--c-green)" strokeWidth={3} dataRef={`${base}/Container/Text/Headline/Scribble`} />
              </div>
            )}
            <div className={styles.h2Wrap} data-appear=""><h2 className={`t-sans-h2 ${styles.h2}`}>{c.title}</h2></div>
            <div className={styles.introWrap} data-appear=""><p className={`t-body ${styles.intro}`}>{c.intro}</p></div>
          </div>
        </div>
        <div className={styles.plans} data-ref={comp}>
          <button type="button" className={styles.switch} data-ref={`${comp}/${toggleName}`} onClick={toggle} aria-pressed={yearly} aria-label={`${c.switch.monthly} / ${c.switch.yearly}${c.switch.discount}`}>
            <p ref={monthlyLabel} className={`t-eyebrow ${styles.swLabel}`}>{c.switch.monthly}</p>
            <div ref={track} className={styles.track} data-ref={`${comp}/${toggleName}/Base`}>
              <div ref={knob} className={styles.knob} data-ref={`${comp}/${toggleName}/Base/Toggle`} />
            </div>
            <p className={`t-eyebrow ${styles.swLabel} ${styles.discount}`}><span className={styles.ink}>{c.switch.yearly}</span>{c.switch.discount}</p>
          </button>
          <div className={styles.cards} data-ref={`${comp}/Cards`}>
            {c.plans.map((plan, i) => {
              const card = `${comp}/Cards/${yearly ? 'Yearly' : 'Monthly'}${i ? `#${i + 1}` : ''}`;
              return (
                <div key={plan.name} className={styles.cardSlot}>
                  <a className={styles.card} href={c.cta.href} data-ref={card} onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)}>
                    <div className={styles.cardTitle} data-ref={`${card}/Card Title`}>
                      <h3 className={`t-card-title ${styles.planName}`}>{plan.name}</h3>
                      <p className="t-small">{plan.desc}</p>
                    </div>
                    <div className={styles.price} data-ref={`${card}/Price`}>
                      <div className={styles.priceText}><p className={`t-sans-h2 ${styles.priceGlyph}`}>$</p></div>
                      <div className={styles.priceText}><p className={`t-sans-h2 ${styles.priceGlyph}`}>{priceYearly ? plan.yearly : plan.monthly}</p></div>
                      <div className={styles.suffixBox} data-ref={`${card}/Price/Container`}>
                        <div className={styles.suffixWrap}><p className={`t-body-lg ${styles.suffix}`}>{c.suffix}</p></div>
                      </div>
                    </div>
                    <div className={styles.options} data-ref={`${card}/Options`}>
                      {plan.features.map((f, j) => (
                        <div key={f} className={styles.option} data-ref={`${card}/Options/Option${j ? `#${j + 1}` : ''}`}>
                          <CheckCircle size={24} weight="regular" className={styles.check} aria-hidden="true" />
                          <p className={`t-small ${styles.optionText}`}>{f}</p>
                        </div>
                      ))}
                    </div>
                    <PillButton as="span" label={c.cta.label} active={hovered === i} dataRef={`${card}/Variant 1`} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
