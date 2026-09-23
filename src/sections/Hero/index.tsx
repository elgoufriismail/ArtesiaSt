'use client';

import { useRef } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useGsap } from '@/hooks/useGsap';
import { heroWordReveal } from '@/animations/load/heroWords';
import { heroSequence } from '@/animations/sequences/heroSequence';
import { SplitWords } from '@/components/ui/SplitWords';
import { PillButton } from '@/components/ui/PillButton';
import { StandInImage } from '@/components/media/StandInImage';
import { NoiseOverlay } from '@/components/media/NoiseOverlay';
import { DrawnPath } from '@/components/decor/DrawnPath';
import { HERO } from '@/content/site';
import styles from './Hero.module.css';

/**
 * Hero — original layer "Page Intro" (STRUCTURE.md §2, VISUAL.md §7, BREAKPOINTS.md §4).
 * Backdrop: 400vh "Image Container" (mask 90 %→100 %) holding a sticky 100vh "Image" layer with the
 * green backdrop, three outline circles (desktop) and the top-anchored portrait.
 * Content: two decorative drawn lines (desktop), display H1 (word blur reveal, first-class #1),
 * indented intro paragraph + pill CTA (entrance + 0.3× scroll parallax on desktop).
 * Scroll: portrait → backdrop transition (first-class #2); Page Intro fades when the Balance switch
 * turns on (markers in BalanceSection).
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const lineA = useRef<HTMLDivElement>(null);
  const lineB = useRef<HTMLDivElement>(null);
  const pathA = useRef<SVGPathElement>(null);
  const pathB = useRef<SVGPathElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const paragraph = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  // original renders no spacer on phone, so its intro column is layer "Section#2" there (data-ref contract)
  const introRef = useBreakpoint() === 'phone' ? 'Page Intro/Hero/Text/Text/Section#2' : 'Page Intro/Hero/Text/Text/Section#3';

  useGsap(root, (bp) => {
    if (!root.current || !hero.current || !backdrop.current || !portrait.current) return;
    heroWordReveal([...(h1.current?.querySelectorAll<HTMLElement>('[data-word]') ?? [])]);
    heroSequence({
      root: root.current,
      hero: hero.current,
      backdrop: backdrop.current,
      portrait: portrait.current,
      lines: bp === 'desktop' ? lines.current : null,
      lineWraps: [lineA.current, lineB.current].filter(Boolean) as HTMLElement[],
      paths: [pathA.current, pathB.current].filter(Boolean) as SVGPathElement[],
      introContainer: intro.current,
      paragraph: paragraph.current,
      cta: cta.current,
    }, bp);
  });

  return (
    <div ref={root} className={styles.root} data-ref="Page Intro" data-nav-theme="light">
      <div className={styles.imageContainer} data-ref="Page Intro/Image Container">
        <div ref={backdrop} className={styles.image} data-ref="Page Intro/Image Container/Image">
          <div className={styles.layer} data-ref="Page Intro/Image Container/Image/Green Background">
            <StandInImage slot="hero-backdrop" className={styles.fill} />
            <NoiseOverlay tile="a" opacity={0.1} />
          </div>
          <div className={styles.circles} aria-hidden="true" data-ref="Page Intro/Image Container/Image/Circles Container">
            <span className={`${styles.circle} ${styles.c1}`} />
            <span className={`${styles.circle} ${styles.c2}`} />
            <span className={`${styles.circle} ${styles.c3}`} />
          </div>
          <div ref={portrait} className={styles.layer} data-ref="Page Intro/Image Container/Image/Hero Image">
            <StandInImage slot="hero-portrait" className={styles.fill} />
            <NoiseOverlay tile="a" opacity={0.1} />
          </div>
        </div>
      </div>

      <div ref={hero} className={styles.hero} data-ref="Page Intro/Hero">
        <div ref={lines} className={styles.lines} aria-hidden="true" data-ref="Page Intro/Hero/Animated Lines">
          <div ref={lineA} className={styles.lineWrap}><DrawnPath ref={pathA} name="heroA" stroke="#fff" dataRef="Page Intro/Hero/Animated Lines/path-1" /></div>
          <div ref={lineB} className={styles.lineWrap}><DrawnPath ref={pathB} name="heroB" stroke="#fff" dataRef="Page Intro/Hero/Animated Lines/path-2" /></div>
        </div>

        <div className={styles.textOuter} data-ref="Page Intro/Hero/Text">
          <div className={styles.textRow} data-ref="Page Intro/Hero/Text/Text">
            <section className={styles.colTitle} data-ref="Page Intro/Hero/Text/Text/Section">
              <div className={styles.container} data-ref="Page Intro/Hero/Text/Text/Section/Container">
                <h1 ref={h1} className={`t-display ${styles.h1}`} data-standin="text">
                  <SplitWords text={HERO.headline} />
                </h1>
              </div>
            </section>
            <section className={styles.spacer} aria-hidden="true" data-ref="Page Intro/Hero/Text/Text/Section#2" />
            <section className={styles.colIntro} data-ref={introRef}>
              <div ref={intro} className={styles.introContainer} data-ref={`${introRef}/Container`}>
                <div ref={paragraph}>
                  <p className={`t-body ${styles.paragraph}`} data-standin="text">{HERO.intro}</p>
                </div>
                <div ref={cta}>
                  <PillButton label={HERO.cta.label} href={HERO.cta.href} variant="green" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
