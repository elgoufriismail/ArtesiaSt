'use client';

import { useEffect } from 'react';
import { useLenis } from './useLenis';

/** Scroll lock used by the mobile menu: html{overflow:hidden} like the original + Lenis stop. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      html.style.overflow = prev;
      lenis?.start();
    };
  }, [locked, lenis]);
}
