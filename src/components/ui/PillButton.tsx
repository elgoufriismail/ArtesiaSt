import type { CSSProperties } from 'react';
import styles from './PillButton.module.css';

/**
 * Pill button (original "Desktop"/"Touch" pill component, INTERACTIONS.md §1):
 * 39px tall, padding 1 48 0 20, 12px/600 uppercase label, two 4px dots — "Circle A" inside at
 * right:16px, "Circle B" parked outside at left:-16px (clipped). Hover (or `active`) slides the label
 * +28px and both dots +32px so the dot appears to jump from right to left. Transition = spring from
 * ANIM.pill via --hover-pill-* (hoverVars).
 * Variants: green (white label/dots) · white (ink label → green on hover; dot A body grey, dot B green).
 */
export interface PillButtonProps {
  label: string;
  href?: string;
  variant?: 'green' | 'white';
  as?: 'a' | 'button' | 'span';
  type?: 'button' | 'submit';
  active?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  dataRef?: string;
  ariaExpanded?: boolean;
  ariaLabel?: string;
}

export function PillButton({ label, href, variant = 'green', as = 'a', type = 'button', active, onClick, className, style, dataRef, ariaExpanded, ariaLabel }: PillButtonProps) {
  const cls = [styles.pill, styles[variant], active ? styles.active : '', className ?? ''].join(' ');
  const inner = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.dot} ${styles.dotA}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dotB}`} aria-hidden="true" />
    </>
  );
  if (as === 'button') {
    return (
      <button type={type} className={cls} style={style} onClick={onClick} data-ref={dataRef} aria-expanded={ariaExpanded} aria-label={ariaLabel}>
        {inner}
      </button>
    );
  }
  if (as === 'span') return <span className={cls} style={style} data-ref={dataRef}>{inner}</span>;
  return (
    <a className={cls} style={style} href={href} onClick={onClick} data-ref={dataRef}>
      {inner}
    </a>
  );
}
