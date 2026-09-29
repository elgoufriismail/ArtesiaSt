'use client';

import { useState, type FormEvent } from 'react';
import { ANIM } from '@/animations/config';
import styles from './SubmitPill.module.css';

export type SubmitState = 'idle' | 'loading' | 'success';

/** Stand-in for the form backend (the clone has none): resolves after ANIM.formButton.stubLatency. */
function sendForm(_data: FormData): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ANIM.formButton.stubLatency * 1000); });
}

/** Form submit state as the original's Framer forms show it: native validation runs first (the submit event only
 *  fires for a valid form); Loading while the request runs → Success (persists, fields kept); a failure returns to
 *  the default variant. */
export function useSubmitState() {
  const [state, setState] = useState<SubmitState>('idle');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    try { await sendForm(new FormData(e.currentTarget)); setState('success'); } catch { setState('idle'); }
  };
  return { state, onSubmit };
}

/**
 * The original's form submit pills ("Button Book a Session Form" — green, 192 wide; "Button Subscription Form" —
 * white, 150 wide): label + "Circle A" (4 px dot at right 16, holding the loading ring "Loading 1" — a 12 px conic
 * gradient turning continuously — and its 8 px core "Loading 2") and "Circle B" (parked at left −16). Variants:
 * Desktop (hover: label +28, dots +32 → the dot jumps from right to left; white tone: label turns green), Touch
 * (tablet/phone, no hover), Loading (Circle A → 31 px disc at right 5 showing the ring), Success (label only).
 * Every variant change is one spring (ANIM.formButton), a frame late (Loading: per form, `loadingLag`).
 */
export function SubmitPill({ state, touch, tone, labels, width, loadingLag, dataRef }: {
  state: SubmitState; touch: boolean; tone: 'green' | 'white'; labels: { idle: string; success: string }; width: number;
  /** s before the Loading transition starts (per form, ANIM.formButton.lagLoading) */
  loadingLag: number; dataRef?: string;
}) {
  const name = state === 'loading' ? 'Loading' : state === 'success' ? 'Success' : touch ? 'Touch' : 'Desktop';
  return (
    <button type="submit" className={`${styles.pill} ${styles[tone]}`} style={{ width, ['--pill-lag-loading' as string]: `${loadingLag * 1000}ms` }} data-state={state} data-touch={touch ? '' : undefined} data-ref={dataRef} data-variant={name} aria-busy={state === 'loading'}>
      <span className={`t-eyebrow ${styles.label}`}>{state === 'success' ? labels.success : labels.idle}</span>
      <span className={styles.circleA} data-ref={dataRef && `${dataRef}/Circle A`} aria-hidden="true">
        <span className={styles.ring} data-ref={dataRef && `${dataRef}/Circle A/Loading 1`} />
        <span className={styles.core} data-ref={dataRef && `${dataRef}/Circle A/Loading 2`} />
      </span>
      <span className={styles.circleB} data-ref={dataRef && `${dataRef}/Circle B`} aria-hidden="true" />
    </button>
  );
}
