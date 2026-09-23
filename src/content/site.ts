/**
 * Stand-in site content — written fresh for this project (not reworded from the original) and sized
 * to docs/architecture/text-budgets.json (chars ±10 %, words, rendered lines per breakpoint).
 * Generic interface labels (page names, "Menu", "Close") are ordinary UI words.
 * Brand is a placeholder, to be replaced in the modification phase.
 * Sections not implemented yet are added in their implementation step.
 */
import type { Cta } from './types';

export const BRAND = { name: 'Calm Shore', wordmark: 'calm—shore' } as const;

export const NAV = {
  links: [
    { label: 'About', href: './about' },
    { label: 'Services', href: './services' },
    { label: 'Stories', href: './stories' },
    { label: 'Journal', href: './journal' },
  ] satisfies Cta[],
  cta: { label: 'Book a session', href: './book-a-session' } satisfies Cta,
  menuLabel: 'Menu',
  closeLabel: 'Close',
} as const;

export const HERO = {
  // budget: 31 chars · 6 words · 3 lines (1200–1599 / tablet / phone), 2 lines ≥1600
  headline: 'A Steady Place To Find Yourself.',
  // budget: 216 chars · 34 words · 5 lines @427px (first line indented 20% + 16px)
  intro:
    'We guide people through hard seasons of life with steady, practical care. Our counselling and coaching sessions help you understand yourself more clearly, build healthier habits and move toward change on your own terms.',
  cta: { label: 'Begin your journey', href: './book-a-session' } satisfies Cta,
} as const;

/** BalanceSection ("Toggle"). Stand-in copy written to the original's budgets
 *  (docs/architecture/text-budgets.json: H2 60/68 chars, P 70/88 chars; line counts per breakpoint
 *  verified with tools/recon/text-fit.mjs). "Balance" is a generic UI label. */
export const BALANCE = {
  label: 'Balance',
  before: {
    title: 'If only feeling steady were as easy as turning on a light.',
    body: ['It may be nearer than it seems.', 'Each small choice brings it into view.'],
  },
  after: {
    title: ['No single button changes everything,', 'yet every small step still counts.'],
    body: 'Every story is its own. Here are some of the ways we support people in taking their next step.',
  },
} as const;

/** Services ("Our Services"). Stand-in copy written to the original's budgets and line counts
 *  (card titles: A wraps naturally with text-wrap balance; B/C/D are two words with an explicit break).
 *  Visual order A, B, D, C, as in the original layer names. "read more" is a generic UI label. */
export const SERVICES = {
  readMore: 'read more',
  href: './services',
  cards: [
    { key: 'A', slot: 'service-1', title: ['Anxiety & Burnout Support'], body: 'Calm, practical tools to ease pressure, restore energy, and feel grounded again.' },
    { key: 'B', slot: 'service-2', title: ['Couples', 'Counselling'], body: 'Private sessions to talk things through, ease conflict, and understand each other.' },
    { key: 'D', slot: 'service-3', title: ['Guided', 'Check-in'], body: 'A brief, focused meeting to explore your needs and choose a next step.' },
    { key: 'C', slot: 'service-4', title: ['Career', 'Guidance'], body: 'Practical sessions to clarify goals, find direction, and grow confident.' },
  ],
} as const;

export const FOOTER = {
  // budget: 19 chars · 2 lines with explicit break
  headline: ['Notes For', 'Quiet Days.'] as const,
  // budget: 138 chars · 20 words · 3 lines @480
  body: 'Every few weeks we send short reflections, simple exercises and gentle reminders to help you rest, reset and look after your mind and body.',
  emailPlaceholder: 'Your Email',
  subscribe: 'Subscribe',
  // budget: 80 chars · 14 words · 2 lines @320 (link inside)
  finePrint: { before: 'By subscribing you accept our ', link: 'Privacy Policy.', after: ' We never share your details.' },
  sitemapLabel: 'Sitemap',
  sitemap: [
    [
      { label: 'Main Page', href: './' },
      { label: 'About', href: './about' },
      { label: 'Services', href: './services' },
      { label: 'Stories', href: './stories' },
      { label: 'Client Story', href: './stories' },
      { label: 'Journal', href: './journal' },
    ],
    [
      { label: 'Article', href: './journal' },
      { label: 'Book a Session', href: './book-a-session' },
      { label: 'Privacy Policy', href: './legal/privacy-policy' },
      { label: 'Terms of Use', href: './legal/terms-of-use' },
      { label: '404', href: './404' },
    ],
  ] satisfies Cta[][],
  // budget: 31 chars
  contact: { label: 'Contact us:', email: 'hello@calmshore.com' },
  // budget: 44 chars · 2 lines (explicit break)
  credit: ['Site template', 'handcrafted by Calm Shore Studio'] as const,
  // budget: 46 chars
  copyright: 'Copyright 2026 Calm Shore. All rights reserved.',
} as const;

export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'Threads', href: 'https://www.threads.com/', icon: 'threads' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
] as const;
