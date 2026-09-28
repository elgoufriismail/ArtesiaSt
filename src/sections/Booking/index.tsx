'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { RatingWidget } from '@/components/ui/RatingWidget';
import { SocialRow } from '@/components/ui/SocialRow';
import { reveal } from '@/animations/scroll/reveal';
import { entrance } from '@/animations/load/entrance';
import { ANIM } from '@/animations/config';
import { BOOKING as C, RATING } from '@/content/site';
import styles from './Booking.module.css';

type SubmitState = 'idle' | 'loading' | 'success';

/** Stand-in for the form backend (the clone has none): resolves after ANIM.booking.stubLatency. */
function sendBooking(_data: FormData): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ANIM.booking.stubLatency * 1000); });
}

/**
 * The original "Button Book a Session Form" (192×40 pill): label + "Circle A" (4 px dot at right 16, holding the
 * loading ring "Loading 1" — a 12 px conic gradient turning continuously — and its 8 px white core "Loading 2") and
 * "Circle B" (parked at left −16). Variants: Desktop (hover: label +28, dots +32 → the dot jumps from right to left),
 * Touch (tablet/phone, no hover), Loading (Circle A grows to a 31 px disc at right 5 and shows the ring), Success
 * (label only). The original's form falls back to the default variant when the request fails.
 */
function SubmitButton({ state, touch, dataRef }: { state: SubmitState; touch: boolean; dataRef: string }) {
  const name = state === 'loading' ? 'Loading' : state === 'success' ? 'Success' : touch ? 'Touch' : 'Desktop';
  return (
    <button type="submit" className={styles.submit} data-state={state} data-touch={touch ? '' : undefined} data-ref={dataRef} data-variant={name} aria-busy={state === 'loading'}>
      <span className={`t-eyebrow ${styles.submitLabel}`}>{state === 'success' ? C.submit.success : C.submit.idle}</span>
      <span className={styles.circleA} data-ref={`${dataRef}/Circle A`} aria-hidden="true">
        <span className={styles.ring} data-ref={`${dataRef}/Circle A/Loading 1`} />
        <span className={styles.core} data-ref={`${dataRef}/Circle A/Loading 2`} />
      </span>
      <span className={styles.circleB} data-ref={`${dataRef}/Circle B`} aria-hidden="true" />
    </button>
  );
}

/** The original's native form: groups A–E (gap 64), 40 px fields with a 1 px bottom rule that darkens on focus, two
 *  selects with a chevron, a textarea, 20 px checkboxes, the note and the submit pill. Native `required` validation. */
function BookingForm({ base, touch }: { base: string; touch: boolean }) {
  const [state, setState] = useState<SubmitState>('idle');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    try { await sendBooking(new FormData(e.currentTarget)); setState('success'); } catch { setState('idle'); }
  };
  const V = `${base}/Variant 1`;
  return (
    <div className={styles.formVariant} data-ref={V}>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.group} data-ref={`${V}/A`}>
          <h5 className={styles.groupTitle}>{C.groups.about}</h5>
          <div className={styles.field}><input className={styles.input} type="text" name="full-name" placeholder={C.fields.name} required autoComplete="name" /></div>
          <div className={styles.field}><input className={styles.input} type="email" name="email" placeholder={C.fields.email} required autoComplete="email" /></div>
          <div className={styles.field}><input className={styles.input} type="tel" name="phone" placeholder={C.fields.phone} autoComplete="tel" /></div>
          <div className={`${styles.field} ${styles.selectField}`}>
            <select className={styles.select} name="address-as" required defaultValue="">
              <option value="" disabled>{C.pronouns.placeholder}</option>
              {C.pronouns.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.group} data-ref={`${V}/B`}>
          <h5 className={styles.groupTitle}>{C.groups.help}</h5>
          <div className={`${styles.field} ${styles.areaField}`}><textarea className={styles.textarea} name="message" placeholder={C.fields.message} /></div>
        </div>
        <div className={styles.group} data-ref={`${V}/C`}>
          <h5 className={styles.groupTitle}>{C.groups.support}</h5>
          <div className={styles.checkboxes} data-ref={`${V}/C/Checkboxes`}>
            {C.services.map((s) => (
              <label key={s} className={styles.check}>
                <input className={styles.box} type="checkbox" name="support" value={s} />
                <p className={`t-small ${styles.checkText}`}>{s}</p>
              </label>
            ))}
          </div>
        </div>
        <div className={styles.groupD} data-ref={`${V}/D`}>
          <div className={`${styles.field} ${styles.selectField}`}>
            <select className={styles.select} name="found-via" required defaultValue="">
              <option value="" disabled>{C.source.placeholder}</option>
              {C.source.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.groupE} data-ref={`${V}/E`}>
          <label className={styles.check}>
            <input className={styles.box} type="checkbox" name="newsletter" />
            <p className={`t-small ${styles.checkText}`}>{C.newsletter}</p>
          </label>
          <div className={styles.noteWrap}><p className={`t-small ${styles.note}`}>{C.note}</p></div>
        </div>
        <div className={styles.submitWrap}><SubmitButton state={state} touch={touch} dataRef={`${V}/${touch ? 'Touch' : 'Desktop'}`} /></div>
      </form>
    </div>
  );
}

/**
 * Booking: original layer "Book A Session" (live original, measured 2026-09-28; docs/IMPLEMENTATION_PLAN.md Step 15).
 *
 * White, padding 160/120/80, overflow clip → variant "Desktop"/"Tablet"/"Phone" (column, gap 56): "Title" (eyebrow) and
 * "Sections" (max 1600, padding 0 56/32/8): left Section (flex 6 / 3; stretches to the form's height) → "Text Intro"
 * (serif H2 ink + green, intro max 480; gap 24, phone 40) and the sticky "Container" (top 160, gap 80: "Raiting" +
 * "Links"), spacer (flex 1), right Section (flex 5 / 4) → the form. Phone: one column — intro, form, Container.
 * Motion: desktop on-load entrances (B1: eyebrow −20 / headline, intro, Container +20 / form column opacity only;
 * delays 0.4 / 0.4 / 0.6 / 0.8 / 0.6), B9 appears on the rating label, rating link and Links at every breakpoint.
 */
export function Booking() {
  const root = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const phone = bp === 'phone';
  const touch = bp !== 'desktop';
  const variant = `Book A Session/${bp === 'desktop' ? 'Desktop' : bp === 'tablet' ? 'Tablet' : 'Phone'}`;
  const S = `${variant}/Sections`;
  const left = `${S}/Section`;
  const right = `${S}/Section#3`;

  useGsap(root, (b) => {
    if (!root.current) return;
    const q = (k: string) => root.current?.querySelector<HTMLElement>(`[data-entrance="${k}"]`);
    const d = ANIM.B1.entranceDelays;
    const tweens = b === 'desktop' ? ([
      [q('title'), d.bookTitle, -1, undefined],
      [q('headline'), d.bookHeadline, 1, undefined],
      [q('intro'), d.bookIntro, 1, undefined],
      [q('container'), d.bookRating, 1, undefined],
      [q('form'), d.bookForm, 1, 0],
    ] as const).flatMap(([el, delay, dir, distance]) => (el ? [entrance(el, delay, dir, { fromLoad: true, distance })] : [])) : [];
    const appear = reveal([...root.current.querySelectorAll<HTMLElement>('[data-appear="all"]')]);
    return () => { tweens.forEach((t) => t.kill()); appear(); };
  }, [bp]);

  const form = <BookingForm base={phone ? left : right} touch={touch} />;
  return (
    <div ref={root} className={styles.root} data-ref="Book A Session" data-nav-theme="dark">
      <div className={styles.wrap}>
        <div className={styles.variant} data-ref={variant}>
          <div className={styles.title} data-ref={`${variant}/Title`}>
            <div className={styles.pageTitle} data-ref={`${variant}/Title/Page Title`} data-entrance="title">
              <p className={`t-eyebrow ${styles.eyebrow}`}>{C.eyebrow}</p>
            </div>
          </div>
          <div className={styles.sections} data-ref={S}>
            <section className={styles.left} data-ref={left}>
              <div className={styles.textIntro} data-ref={`${left}/Text Intro`}>
                <div className={styles.full} data-entrance="headline"><h2 className={`t-serif-h2 ${styles.h2}`}>{C.title[0]}<span className={styles.green}>{C.title[1]}</span></h2></div>
                <div className={styles.introWrap} data-entrance="intro"><p className={`t-body ${styles.para}`}>{C.intro}</p></div>
              </div>
              {phone && form}
              <div className={styles.container} data-ref={`${left}/Container`} data-entrance="container">
                <div className={styles.rating} data-ref={`${left}/Container/Raiting`}>
                  <div data-appear="all"><p className={`t-small ${styles.muted}`}>{RATING.label}</p></div>
                  <div data-appear="all"><RatingWidget dataRef={`${left}/Container/Raiting/Raiting`} /></div>
                </div>
                <div className={styles.links} data-ref={`${left}/Container/Links`} data-appear="all">
                  <div className={styles.contactWrap}>
                    <p className={`t-small ${styles.para}`}>{C.contact.before}<a className="t-inline-link" href={`mailto:${C.contact.email}`} target="_blank" rel="noreferrer"><strong>{C.contact.link}</strong></a>{C.contact.after}</p>
                  </div>
                  <SocialRow dataRef={`${left}/Container/Links/Social Links`} variant="Desktop" />
                </div>
              </div>
            </section>
            {!phone && <section className={styles.spacer} data-ref={`${S}/Section#2`} />}
            {!phone && (
              <section className={styles.right} data-ref={right} data-entrance="form">
                <div className={styles.formBox}>{form}</div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
