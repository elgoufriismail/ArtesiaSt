import styles from './NavLink.module.css';

/**
 * Text link with the original's hover underline: a 1px "line" (currentColor) under the label grows
 * from width 0 to 100% (left anchored). size 'nav' = 12px eyebrow; 'menu' = 20px mobile-menu item;
 * 'footer' = 18px sitemap link.
 */
export function NavLink({ label, href, size = 'nav', className, dataRef }: { label: string; href: string; size?: 'nav' | 'menu' | 'footer'; className?: string; dataRef?: string }) {
  return (
    <a href={href} className={`${styles.link} ${styles[size]} ${className ?? ''}`} data-ref={dataRef}>
      <span className={styles.text}>{label}</span>
      <span className={styles.line} aria-hidden="true" />
    </a>
  );
}
