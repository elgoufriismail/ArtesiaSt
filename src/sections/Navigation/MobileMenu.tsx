'use client';

import { useEffect, useRef } from 'react';
import { animateMenu } from '@/animations/menu/mobileMenu';
import { NavLink } from '@/components/ui/NavLink';
import { PillButton } from '@/components/ui/PillButton';
import { NAV } from '@/content/site';
import styles from './MobileMenu.module.css';

/**
 * Tablet/phone menu overlay (first-class #11): fixed white "White Overlay" under the nav bar and a
 * centred column (gap 56 px, ~16 px below centre) of 20 px uppercase links + green pill.
 * Open/close timelines from animations/menu/mobileMenu; scroll lock handled by Navigation.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!panel.current || !list.current) return;
    if (first.current) { first.current = false; if (!open) return; }
    const tl = animateMenu(panel.current, list.current, open);
    return () => { tl.kill(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={styles.root} aria-hidden={!open}>
      <div ref={panel} className={styles.overlay} />
      <div className={styles.center}>
      <div ref={list} className={styles.list} onClick={(e) => { if ((e.target as HTMLElement).closest('a')) onClose(); }}>
        {NAV.links.map((l) => (
          <NavLink key={l.label} label={l.label} href={l.href} size="menu" className={styles.item} />
        ))}
        <PillButton label={NAV.cta.label} href={NAV.cta.href} variant="green" />
      </div>
      </div>
    </div>
  );
}
