/**
 * Stand-in site content — written fresh for this project (not reworded from the original) and sized
 * to docs/architecture/text-budgets.json (chars ±10 %, words, rendered lines per breakpoint).
 * Generic interface labels (page names, "Menu", "Close") are ordinary UI words.
 * Brand is a placeholder, to be replaced in the modification phase.
 * Sections not implemented yet are added in their implementation step.
 */
import type { Cta } from './types';

export const BRAND = { name: 'Calm Shore', wordmark: 'ARTESIA' } as const;

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
  headline: 'Artesia Studio.',
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
  label: 'Chosen by 90+ people',
  counter: '5k+',
  trust: 'Clients rank us highly',
  score: '4.9 overall',
  href: './stories',
  avatars: ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'],
} as const;

/** Pricing. Stand-in copy with the original's budgets (label 10, H2 28, intro 143, plan names 7/6/8, descriptions
 *  33/37/36, four features each, CTA 11), fitted to its line counts and widths. The prices and the discount are
 *  the original's values (monthly 49/89/229 → yearly 39/71/183), rendered by NumberFlow. */
export const PRICING = {
  label: 'Fair Prices',
  title: 'Support that fits your week',
  intro: 'A clear price for every rhythm of care. Start monthly, or commit for a year and save — every plan includes the same warm, personal\u00a0support.',
  switch: { monthly: 'Monthly', yearly: 'Yearly', discount: ' (20% OFF)' },
  suffix: '/ month',
  cta: { label: 'Choose now', href: './book-a-session' } satisfies Cta,
  plans: [
    { name: 'Harbour', desc: 'Gentle support for first steps.', monthly: 49, yearly: 39, features: ['Two sessions a month', 'Email check-ins', 'Guided breathing audio', 'Progress journal'] },
    { name: 'Steady', desc: 'Weekly care to build lasting new habits.', monthly: 89, yearly: 71, features: ['Weekly one-hour sessions', 'Personal care plan', 'Messaging support', 'Monthly review'] },
    { name: 'Flourish', desc: 'Deep guidance for bigger changes.', monthly: 229, yearly: 183, features: ['Two sessions each week', 'Priority booking', 'Family consultations', 'Workshops and group calls'] },
  ],
} as const;

/** Text Sections (two instances of one component). Stand-in copy with the original's budgets: H2 = ink part + green
 *  tail (55 + 24 / 72 + 26 ch), paragraph 228 ch with a bold inline link near its end / 137 ch; fitted to the
 *  original line counts at all 8 viewports. */
export const TEXT_SECTIONS = [
  {
    title: ['Each session is shaped around your story, your rhythm and ', 'the goals that\u00a0matter.'],
    body: {
      before: 'We blend proven methods with a calm, personal\u00a0approach. Sessions happen in our quiet studio or online, and you can switch whenever it\u00a0suits\u00a0you. Curious how we\u00a0work? Meet ',
      link: { label: 'our\u00a0studio', href: './about' },
      after: ' and the people who make it a\u00a0safe\u00a0place.',
    },
  },
  {
    title: ['Small, steady steps add up. With patient guidance you learn what you need ', 'and to act on it with\u00a0care.'],
    body: { before: 'Progress rarely follows a straight line. We celebrate small wins, learn from setbacks and keep going, together, at a pace that feels\u00a0right.' },
  },
] as const;

/** Big Quote. Stand-in quote (≈71 ch, serif) and attribution (≈47 ch), fitted to the original line counts. */
export const BIG_QUOTE = {
  quote: 'Healing is rarely sudden. It grows quietly, one honest talk at a\u00a0time.',
  attribution: '— Calm Shore, notes on ten years of practice',
  image: 'big-quote',
} as const;

/** Journal. Stand-in copy with the original's budgets (eyebrow 11, H2 40 on two lines with an explicit break, intro
 *  96, pill 15, titles 32 / 24 / 30, excerpts 95 / 83 / 277 — the third one clamped to two lines with an ellipsis),
 *  fitted to its line counts. Card C only exists on desktop. Pill labels chosen to render
 *  within 0.4 px of the original label widths (pill geometry); no original text reused (clash-checked). */
export const JOURNAL = {
  label: 'Deep Reading',
  title: ['Thoughtful Perspectives on', 'Calmer Living'] as const,
  intro: 'Short essays and gentle, practical ideas on rest, relationships and change, to help you feel steadier.',
  cta: { label: 'Browse Journal', href: './journal' } satisfies Cta,
  readMore: 'Open note',
  articles: [
    { key: 'A', slot: 'journal-a', mask: 'blobA', stroke: 'journalStrokeA', title: 'Finding Calm in Crowded Weeks', excerpt: 'A few small habits that turn busy days into calmer ones, without needing a whole new routine.', href: './journal/finding-calm-in-crowded-weeks' },
    { key: 'B', slot: 'journal-b', mask: 'blobB', stroke: 'journalStrokeB', title: 'When Everything Feels Loud', excerpt: 'Simple ways to settle a crowded mind when noise, news and worry arrive all at once.', href: './journal/when-everything-feels-loud' },
    { key: 'C', slot: 'journal-c', mask: 'blobC', stroke: 'journalStrokeC', title: 'How to Start Again After Loss', excerpt: 'Loss changes the ordinary shape of a day. The empty chair, the message you almost send, the plans that quietly fall away. Starting again rarely means moving on; it means learning to carry what happened while making space for new routines, new people and new reasons to rest and hope.', href: './journal/how-to-start-again-after-loss' },
  ],
} as const;

/** Numbers. The counter values are the original's (start → end, like the Pricing prices); the two-line labels are
 *  stand-in copy with explicit breaks, each widest line rendered within 1 px of the original label width. */
export const NUMBERS = [
  { start: 420, end: 450, suffix: '+', label: ['Hours of support', 'given so far'] },
  { start: 50, end: 80, suffix: '+', label: ['Members', 'listened to'] },
  { start: 0, end: 9, suffix: '+', label: ['Years of careful work', 'behind us'] },
  { start: 0, end: 25, suffix: '+', label: ['Classes and', 'quiet routines'] },
] as const;

/** FAQ. Stand-in copy with the original's budgets (H2 15 + 9 green on two lines, intro 87, helper 81, pill 15,
 *  questions 41/41/48/35/35/40, answers 144/175/126/172/127/162+195), fitted to the natural line counts of every
 *  question and answer paragraph at all 8 viewports. Item 1 starts open (the original CMS "Open" flag). */
export const FAQ = {
  title: ['Your worries, ', 'addressed.'] as const,
  intro: 'Starting something new brings questions. Here are the ones we hear most, answered plainly.',
  helper: 'Still unsure about anything? Send us a short note and we will get back to you gently.',
  cta: { label: 'Inside The Studio', href: './about' } satisfies Cta,
  items: [
    { open: true, q: 'Is counselling right for someone like me?', a: ['Counselling is not only for moments of real crisis. It suits anyone who wants more clarity, steadier habits or simply space to think things through.'] },
    { open: false, q: 'What happens in our very first session?', a: ['We start with a relaxed conversation about what brings you here, what you hope will change and how you like to work, so we can shape a plan that fits you from the start.'] },
    { open: false, q: 'Can I choose between online and studio sessions?', a: ['Yes. You can meet us in our quiet studio or join from home by video call, and switch between the two whenever it suits you.'] },
    { open: false, q: 'How often should we plan to meet?', a: ['Most of us start with weekly sessions and later move to every second week. We look at the rhythm together from time to time and adjust it to your energy, your week and your goals.'] },
    { open: false, q: 'Will what I tell you stay private?', a: ['Always. Everything you share stays between us, apart from the rare situations where the law requires us to act to keep someone safe.'] },
    { open: false, q: 'What if I am unsure what to talk about?', a: ['That is completely fine and really common. Many people arrive without a clear topic, and the first sessions are simply about noticing what feels heavy right now.', 'Over time the threads tend to become clearer. We follow whatever matters most to you at your own pace, and you are always free to pause, change direction or bring something new to a session.'] },
  ],
} as const;

/** Book A Session. Stand-in copy with the original's budgets (eyebrow 14, H2 34, intro 191, contact 97, group titles
 *  18/16/41, five service labels, newsletter 44, note 136), fitted to its line counts at all 8 viewports. Field names are
 *  the clone's own; the form has no backend (see ANIM.formButton.stubLatency). */
export const BOOKING = {
  eyebrow: 'Plan your visit',
  title: ['Care begins with one ', 'small\u00a0message.'] as const,
  intro: 'Whether this is your first step, a return after some time away or simply a moment of curiosity, you are welcome here. Use the form and we will gladly suggest a time that feels right for\u00a0you.',
  contact: { before: 'Rather talk it through first? ', link: 'Write us a note', after: ' or find us on social, we are glad to hear from you.', email: 'hello@calmshore.com' },
  groups: { about: 'A little about\u00a0you.', help: 'What brings you\u00a0here?', support: 'Which kind of support feels right for\u00a0you?' },
  fields: { name: 'Full name *', email: 'Email address *', phone: 'Phone (optional)', message: 'Share anything that could help us understand what you need' },
  pronouns: { placeholder: 'How should we address you? *', options: ['She / her', 'He / him', 'They / them', 'I would rather not say'] },
  services: ['One-to-one counselling', 'Personal coaching', 'Calm & balance sessions', 'Single orientation meeting', 'Still deciding, just looking around'],
  source: { placeholder: 'How did you find us? *', options: ['Search engine', 'Recommendation', 'Referral from a professional', 'Somewhere else'] },
  newsletter: 'Would you like our monthly letter by email?',
  note: 'Our letter arrives once a month with gentle ideas, short reads and occasional news. Every issue has a simple way to stop receiving\u00a0it\u00a0again.',
  submit: { idle: 'Request a visit', success: 'Request sent' },
} as const;

export const FOOTER = {
  // budget: 19 chars · 2 lines with explicit break
  headline: ['Notes For', 'Quiet Days.'] as const,
  // budget: 138 chars · 20 words · 3 lines @480
  body: 'Every few weeks we send short reflections, simple exercises and gentle reminders to help you rest, reset and look after your mind and body.',
  emailPlaceholder: 'Your Email',
  subscribe: { idle: 'Subscribe', success: 'Subscribed' },
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
