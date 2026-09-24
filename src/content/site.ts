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

/** Philosophy ("Our Philosophy"). Stand-in statement with the original's 26 reveal tokens and a similar
 *  token-length profile (the brand and the last pair are NBSP-glued single tokens, like "ClearPath," and
 *  "that lasts."), fitted to its line counts at all 8 viewports. CTA label chosen to render within 1 px of the original label width (pill geometry). */
export const PHILOSOPHY = {
  label: 'Our Philosophy',
  statement:
    'At Calm\u00a0Shore, we never push change — we let it emerge with patience. Through thoughtful conversation, simple tools, and a gentle pace, we nurture growth that\u00a0endures.',
  cta: { label: 'About Our Craft', href: './about' } satisfies Cta,
} as const;

/** Stories A and B (same original component). Stand-in copy fitted to the original line counts; paragraphs
 *  end with an NBSP-glued pair like the originals. "Read full story" is a generic UI label (the original
 *  label starts with an NBSP, kept for identical pill width). */
export const STORIES = {
  a: {
    eyebrow: 'Real stories. Real progress.',
    title: 'Learning to rest without guilt.',
    body: 'Years of long hours and constant worry left Daniel exhausted and distant from the people he loved. Session by session, he learned to slow down, set boundaries, and make room for rest and\u00a0joy.',
    href: './stories/learning-to-rest',
    images: ['story-a-1', 'story-a-2'],
  },
  b: {
    eyebrow: 'Real stories. Real progress.',
    title: 'Rebuilding her confidence after a difficult year.',
    body: 'After a sudden job loss, Priya expected to bounce back quickly. Instead, she felt unsettled — withdrawing from friends, routines, and the hobbies that once grounded her. She came to therapy not because she was broken, but to trust her own choices again and feel steady in her\u00a0life.',
    href: './stories/rebuilding-confidence',
    images: ['story-b-1', 'story-b-2'],
  },
  cta: '\u00a0Read full story',
} as const;

/** How It Works. Section title kept as a functional label (two colours like the original: "How " ink,
 *  "It Works" green). Lead and steps are stand-in copy with the original's character budgets
 *  (lead ≈199, steps ≈240 / 262 / 222) fitted to its line counts at all 8 viewports. */
export const HOW_IT_WORKS = {
  title: ['How ', 'It Works'] as const,
  lead: 'Healing begins quietly. We listen closely, learn what brought you here and what support should feel like, then map a path at your own pace — one that respects your story, your limits, and your\u00a0life.',
  steps: [
    {
      title: 'Say Hello',
      body: 'Send a short note or book a free first call. We ask a few gentle questions about what is on your mind, what you hope to change, and what has helped before, so the very first session can start from understanding instead of from forms and\u00a0paperwork.',
    },
    {
      title: 'Gentle Direction',
      body: 'Together we shape a plan that suits your week, your energy, and your goals. Some clients want weekly sessions, others prefer a slower rhythm with small exercises in between. Nothing is fixed, and the plan grows with you as you notice what truly helps.',
    },
    {
      title: 'Find a Balance',
      body: 'Slowly, techniques become dependable habits. You recognise tension sooner, respond gently, and recover faster whenever life feels heavy. Sessions become occasional check-ins, and your abilities keep working\u00a0afterwards.',
    },
  ],
} as const;

/** "Ready to find your path?" CTA block. Stand-in copy with the original's budgets (H2 13 + 10 ch on two
 *  lines, paragraph ≈158, CTA 18, contact ≈97 with a bold underlined e-mail link), fitted to its line counts. */
export const PATH_CTA = {
  title: ['Ready to feel', 'more at home?'] as const,
  body: 'Take the first step whenever you feel ready. Book a free introductory call, ask anything you need, and we will find a gentle pace and a plan that suits\u00a0you.',
  cta: { label: 'Plan a First Meeting', href: './book-a-session' } satisfies Cta,
  contact: { before: 'Questions before you book? Write to ', email: 'hello@calmshore.com', after: ' and we reply\u00a0soon.' },
} as const;

/** Rating widget (PathSection + Booking): label, five avatar stand-ins + counter, trust line with star. */
export const RATING = {
  label: 'Loved by our community',
  counter: '5k+',
  trust: 'Clients rank us highly',
  score: '4.9 overall',
  href: './stories',
  avatars: ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'],
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
