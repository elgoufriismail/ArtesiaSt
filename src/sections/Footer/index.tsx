'use client';

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { Marker } from '@/components/ui/Marker';
import styles from './Footer.module.css';

/**
 * Footer — original "Footer Container": dark stand-in photo (parallax B13, starts 320px above),
 * noise, newsletter form, sitemap, contact, socials, credit. Nav theme: light.
 * STATUS: skeleton.
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  useGsap(root, () => {});
  return (
    <footer ref={root} className={styles.root} data-ref="Footer Container" data-nav-theme="light">
      <Marker id="footer-menu" />
    </footer>
  );
}
