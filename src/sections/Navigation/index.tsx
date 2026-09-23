'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useScrollLock } from '@/hooks/useScrollLock';
import { MobileMenu } from './MobileMenu';
import styles from './Navigation.module.css';

/**
 * Navigation — original <nav> (Desktop / Tablet / Phone variants).
 * Desktop: transparent bar, two stacked rows (light/dark) cross-faded by navTheme (first-class #10),
 * entrance on load (B1). Tablet/phone: opaque white bar + "Menu" pill → MobileMenu (first-class #11).
 * STATUS: skeleton.
 */
export function Navigation() {
  const root = useRef<HTMLElement>(null);
  const menu = useDisclosure(false);
  useScrollLock(menu.open);

  useGsap(root, () => {
    // entrance (B1) + navTheme (B10, desktop) wired in the implementation phase
  });

  return (
    <header className={styles.root}>
      <nav ref={root} data-ref="Nav" />
      <MobileMenu open={menu.open} onClose={() => menu.setOpen(false)} />
    </header>
  );
}
