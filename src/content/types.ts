/**
 * Content model. All copy is STAND-IN text written fresh for this project (never reworded from the
 * original) and must fit docs/architecture/text-budgets.json (chars ±10 %, words, lines per breakpoint).
 * `Segmented` supports headlines whose tail is green in the original (accent: true).
 */
import type { StandInSlot } from './assets';

export type Segmented = { text: string; accent?: boolean }[];
export interface Cta { label: string; href: string }

export interface SiteContent {
  brand: { name: string; wordmark: string };
  nav: { links: Cta[]; cta: Cta };
  hero: { headline: string; intro: string; cta: Cta };
  balance: { label: string; before: { headline: Segmented; body: string }; after: { headline: Segmented; body: string } };
  services: { cards: { title: string; body: string; image: StandInSlot; href: string }[]; readMore: string };
  philosophy: { eyebrow: string; statement: string; cta: Cta };
  stories: Record<'a' | 'b', { eyebrow: string; title: string; body: string; cta: Cta; images: [StandInSlot, StandInSlot] }>;
  howItWorks: { headline: Segmented; lead: string; steps: { title: string; body: string }[] };
  path: { headline: Segmented; body: string; cta: Cta; contact: string };
  pricing: { eyebrow: string; headline: string; body: string; plans: { name: string; blurb: string; monthly: number; features: string[] }[] };
  textSections: [{ headline: Segmented; body: string }, { headline: Segmented; body: string }];
  quote: { text: string; attribution: string };
  journal: { eyebrow: string; headline: string; body: string; cta: Cta; articles: { title: string; excerpt: string; image: StandInSlot; href: string }[] };
  numbers: { value: string; label: string }[];
  faq: { headline: Segmented; intro: string; helper: string; cta: Cta; items: { q: string; a: string }[] };
  booking: { eyebrow: string; headline: Segmented; intro: string; form: { sections: string[] }; submit: string };
  footer: { headline: string; body: string; finePrint: string; sitemap: Cta[][]; contact: string; copyright: string };
}
