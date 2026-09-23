'use client';

import { FacebookLogo, InstagramLogo, ThreadsLogo, YoutubeLogo } from '@phosphor-icons/react';
import { SOCIALS } from '@/content/site';
import styles from './SocialRow.module.css';

const ICONS = { instagram: InstagramLogo, threads: ThreadsLogo, facebook: FacebookLogo, youtube: YoutubeLogo };

/** 4 Phosphor social icons, 24px, gap 32; hover opacity 1 → 0.5 (INTERACTIONS.md §1). */
export function SocialRow({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <div className={`${styles.row} ${styles[tone]} ${className ?? ''}`}>
      {SOCIALS.map((s) => {
        const Icon = ICONS[s.icon];
        return (
          <a key={s.label} href={s.href} className={styles.icon} aria-label={s.label}>
            <Icon size={24} weight="regular" />
          </a>
        );
      })}
    </div>
  );
}
