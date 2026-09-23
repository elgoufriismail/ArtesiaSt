import { BRAND } from '@/content/site';
import styles from './Logo.module.css';

/** Wordmark: 8px dot + serif 26px wordmark (letter-spacing 0.07em), 160×36. Colour = currentColor + --logo-dot. */
export function Logo({ className, dataRef }: { className?: string; dataRef?: string }) {
  return (
    <a href="./" className={`${styles.logo} ${className ?? ''}`} data-ref={dataRef} aria-label={BRAND.name}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.word}>{BRAND.wordmark}</span>
    </a>
  );
}
