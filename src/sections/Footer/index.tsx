'use client';

import { useRef } from 'react';
import { Leaf } from '@phosphor-icons/react';
import { useGsap } from '@/hooks/useGsap';
import { footerParallax } from '@/animations/parallax/footerParallax';
import { reveal } from '@/animations/scroll/reveal';
import { ANIM } from '@/animations/config';
import { Marker } from '@/components/ui/Marker';
import { NavLink } from '@/components/ui/NavLink';
import { PillButton } from '@/components/ui/PillButton';
import { SocialRow } from '@/components/ui/SocialRow';
import { StandInImage } from '@/components/media/StandInImage';
import { NoiseOverlay } from '@/components/media/NoiseOverlay';
import { FOOTER } from '@/content/site';
import styles from './Footer.module.css';

/**
 * Footer — original "Footer Container" (STRUCTURE.md §2, BREAKPOINTS.md §4).
 * Dark stand-in photo + noise; background starts 320/160/0 px above the footer and sinks into place
 * (B13, footerParallax). Items fade in on view (B9). Nav theme under the footer: light.
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  useGsap(root, (bp) => {
    if (bg.current) footerParallax(bg.current, ANIM.B13.offset[bp]);
    if (root.current) reveal([...root.current.querySelectorAll('[data-reveal]')]);
  });

  return (
    <footer ref={root} className={styles.root} data-ref="Footer Container" data-nav-theme="light">
      <Marker id="footer-menu" />
      <div ref={bg} className={styles.bg} data-ref="Footer Container/Footer Background Image">
        <StandInImage slot="footer" className={styles.bgImg} />
        <NoiseOverlay tile="a" opacity={0.1} />
      </div>

      <div className={styles.sectionsA} data-ref="Footer Container/Sections A">
        <section className={styles.colMain}>
          <div className={styles.containerA}>
            <div className={styles.textContainer}>
              <div data-reveal>
                <h2 className={`t-serif-h2 ${styles.headline}`} data-standin="text">
                  {FOOTER.headline[0]}
                  <br />
                  {FOOTER.headline[1]}
                </h2>
              </div>
              <div data-reveal>
                <p className={`t-body ${styles.muted} ${styles.body}`} data-standin="text">{FOOTER.body}</p>
              </div>
            </div>
            <div className={styles.subscription}>
              <form className={styles.form} data-reveal onSubmit={(e) => e.preventDefault()}>
                <label className={styles.inputWrap}>
                  <span className="sr-only">Email</span>
                  <input className={styles.input} type="email" name="email" placeholder={FOOTER.emailPlaceholder} required />
                </label>
                <PillButton as="button" type="submit" label={FOOTER.subscribe} variant="white" className={styles.subscribe} />
              </form>
              <p className={`t-small ${styles.muted} ${styles.finePrint}`} data-reveal data-standin="text">
                {FOOTER.finePrint.before}
                <a href="./legal/privacy-policy" className={styles.inlineLink}>{FOOTER.finePrint.link}</a>
                {FOOTER.finePrint.after}
              </p>
            </div>
          </div>
        </section>
        <section className={styles.spacer} aria-hidden="true" />
        <section className={styles.colSide}>
          <div className={styles.navigation}>
            <p className={`t-eyebrow ${styles.muted}`} data-reveal>{FOOTER.sitemapLabel}</p>
            <div className={styles.links}>
              {FOOTER.sitemap.map((col, ci) => (
                <div key={ci} className={styles.linkCol}>
                  {col.map((l) => (
                    <div key={l.label} data-reveal>
                      <NavLink label={l.label} href={l.href} size="footer" className={styles.siteLink} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className={styles.sectionsB} data-ref="Footer Container/Sections B">
        <section className={styles.colMain}>
          <div className={styles.contactBlock} data-reveal>
            <p className={`t-body-lg ${styles.muted}`}>
              {FOOTER.contact.label} <a href={`mailto:${FOOTER.contact.email}`} className={styles.inlineLink}>{FOOTER.contact.email}</a>
            </p>
            <SocialRow tone="light" />
          </div>
        </section>
        <section className={styles.spacer} aria-hidden="true" />
        <section className={styles.colSide}>
          <div className={styles.creditBlock} data-reveal>
            <div className={styles.credit}>
              <Leaf size={40} weight="fill" className={styles.creditIcon} aria-hidden="true" />
              <p className={`t-small ${styles.muted}`} data-standin="text">
                <span className={styles.white}>{FOOTER.credit[0]}</span>
                <br />
                {FOOTER.credit[1]}
              </p>
            </div>
            <p className={`t-small ${styles.muted}`} data-standin="text">{FOOTER.copyright}</p>
          </div>
        </section>
      </div>
    </footer>
  );
}
