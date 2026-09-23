'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useScrollLock } from '@/hooks/useScrollLock';
import { navTheme } from '@/animations/navigation/navTheme';
import { entrance } from '@/animations/load/entrance';
import { ANIM } from '@/animations/config';
import { Logo } from '@/components/ui/Logo';
import { NavLink } from '@/components/ui/NavLink';
import { PillButton } from '@/components/ui/PillButton';
import { NAV } from '@/content/site';
import { MobileMenu } from './MobileMenu';
import styles from './Navigation.module.css';

/**
 * Navigation — original <nav> (Desktop / Tablet / Phone variants).
 * Desktop: transparent 79 px bar, logo left, two stacked menu rows ("Menu Dark" over "Menu White")
 * cross-faded by navTheme (first-class #10); load entrance (B1): logo .2 s, links .4/.5/.6/.7 s,
 * CTA .8 s — y +20 → 0 with opacity, 1 s 'entrance'.
 * Tablet/phone: opaque white bar (79/69 px), green logo, fixed-width "Menu" pill → MobileMenu
 * (first-class #11) with scroll lock.
 */
export function Navigation() {
  const root = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const menu = useDisclosure(false);
  useScrollLock(menu.open);

  useGsap(root, (bp) => {
    if (bp !== 'desktop' || !nav.current) return;
    navTheme(nav.current);
    const d = ANIM.B1.entranceDelays;
    nav.current.querySelectorAll<HTMLElement>('[data-entrance]').forEach((el) => {
      const key = el.dataset.entrance!;
      const delay = key === 'logo' ? d.navLogo : key === 'cta' ? d.navCta : d.navLinks[Number(key)];
      entrance(el, delay, 1, { fromLoad: true, markAs: key === 'logo' ? 'anim:nav-logo' : undefined });
    });
  });

  const row = (tone: 'light' | 'dark') => (
    <div className={`${styles.row} ${tone === 'dark' ? styles.rowDark : styles.rowLight}`} data-ref={tone === 'dark' ? 'Nav/White#2/Menu Dark' : 'Nav/White#2/Menu White'}>
      {NAV.links.map((l, i) => (
        <div key={l.label} data-entrance={i}>
          <NavLink label={l.label} href={l.href} />
        </div>
      ))}
      <div data-entrance="cta">
        <PillButton label={NAV.cta.label} href={NAV.cta.href} variant={tone === 'dark' ? 'green' : 'white'} />
      </div>
    </div>
  );

  return (
    <header ref={root} className={styles.header}>
      <nav ref={nav} className={styles.nav} data-ref="Nav" data-theme="light" data-menu-open={menu.open || undefined}>
        <div className={styles.logoWrap} data-entrance="logo">
          <Logo className={styles.logo} />
        </div>
        <div className={styles.desktopMenu}>
          {row('dark')}
          {row('light')}
        </div>
        <div className={styles.touchMenu}>
          <PillButton
            as="button"
            label={menu.open ? NAV.closeLabel : NAV.menuLabel}
            active={menu.open}
            onClick={menu.toggle}
            className={styles.menuPill}
            ariaExpanded={menu.open}
          />
        </div>
      </nav>
      <MobileMenu open={menu.open} onClose={() => menu.setOpen(false)} />
    </header>
  );
}
