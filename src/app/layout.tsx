import type { Metadata, Viewport } from 'next';
import '@fontsource/crimson-text/400.css';
import 'inter-ui/inter-latin.css'; // official Inter 4 static text fonts (OFL) — metrics match the original
import '@/styles/tokens.css';
import '@/styles/typography.css';
import '@/styles/base.css';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { hoverCssVars } from '@/animations/hover/hoverVars';
import { BRAND } from '@/content/site';

export const metadata: Metadata = { title: BRAND.name };
export const viewport: Viewport = { width: 'device-width' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={hoverCssVars() as React.CSSProperties}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
