/**
 * Animation modules — one file per animation concern, grouped by the categories of
 * docs/IMPLEMENTATION_PLAN.md §4. Every factory:
 *   - takes DOM elements + optional overrides, reads defaults from ./config.ts (ANIM),
 *   - must be called inside useGsap(scope, bp => …) so it is reverted automatically,
 *   - never renders markup and never owns React state.
 */
export * from './load/heroWords';
export * from './load/entrance';
export * from './load/loadFade';
export * from './scroll/reveal';
export * from './scroll/scrollTarget';
export * from './scroll/markerState';
export * from './scroll/textScrollReveal';
export * from './parallax/imageParallax';
export * from './parallax/speedParallax';
export * from './parallax/footerParallax';
export * from './hover/hoverVars';
export * from './pinned/rollingNumber';
export * from './counters/counters';
export * from './navigation/navTheme';
export * from './menu/mobileMenu';
export * from './faq/accordion';
export * from './pricing/digitRoll';
export * from './pricing/pricingSwitch';
export * from './svg/drawPath';
export * from './sequences/heroSequence';
export * from './sequences/balanceSequence';
export * from './sequences/quoteFold';
export * from './sequences/storyDrift';
export * from './sequences/wavesBackground';
