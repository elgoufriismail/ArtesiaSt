'use client';

import { FacebookLogo, InstagramLogo, ThreadsLogo, YoutubeLogo } from '@phosphor-icons/react';
import { SOCIALS } from '@/content/site';
import styles from './SocialRow.module.css';

const ICONS = { instagram: InstagramLogo, threads: ThreadsLogo, facebook: FacebookLogo, youtube: YoutubeLogo };

/** 4 Phosphor social icons, 24px, gap 32; hover opacity 1 → 0.5 (INTERACTIONS.md §1). */
export function SocialRow({ tone = 'dark', className, dataRef, variant = 'Desktop' }: { tone?: 'dark' | 'light'; className?: string; dataRef?: string; variant?: 'Desktop' | 'Touch' }) {
  return (
    <div className={`${styles.row} ${styles[tone]} ${className ?? ''}`} data-ref={dataRef}>
      {SOCIALS.map((s, i) => {
        const Icon = ICONS[s.icon];
        return (
          <a key={s.label} href={s.href} className={styles.icon} aria-label={s.label} data-ref={dataRef && `${dataRef}/${variant}${i ? `#${i + 1}` : ''}`}>
            <Icon size={24} weight="regular" />
          </a>
        );
      })}
    </div>
  );
}
