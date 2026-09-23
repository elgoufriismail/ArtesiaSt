'use client';

/**
 * Single registration point for GSAP + plugins (client only).
 * Every animation module imports gsap/ScrollTrigger/Flip from here, never from 'gsap' directly,
 * so plugins are guaranteed to be registered and eases defined exactly once.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { registerEases } from './eases';

let registered = false;
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
  registerEases();
  registered = true;
}

export { gsap, ScrollTrigger, Flip, CustomEase };
