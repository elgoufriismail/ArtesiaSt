'use client';

import { useContext } from 'react';
import { LenisContext } from '@/components/providers/SmoothScroll';

/** The global Lenis instance (null during SSR / before mount). */
export const useLenis = () => useContext(LenisContext);
