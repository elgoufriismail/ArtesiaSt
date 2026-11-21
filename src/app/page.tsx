import { ProgressiveBlur } from '@/components/decor/ProgressiveBlur';
import { WavesBackground } from '@/components/decor/WavesBackground';
import { Navigation } from '@/sections/Navigation';
import { Hero } from '@/sections/Hero';
import { BalanceSection } from '@/sections/BalanceSection';
import { Services } from '@/sections/Services';
import { Philosophy } from '@/sections/Philosophy';
import { Story } from '@/sections/Story';
import { HowItWorks } from '@/sections/HowItWorks';
import { TextSection } from '@/sections/TextSection';
import { Quote } from '@/sections/Quote';
import { Journal } from '@/sections/Journal';
import { Faq } from '@/sections/Faq';
import { Footer } from '@/sections/Footer';
import styles from './page.module.css';

/**
 * Homepage — section order is the original's (docs/reconnaissance/STRUCTURE.md §2), minus the sections the client
 * removed (2026-10-05): PathSection, Pricing, Story B, Numbers; (2026-11-21) Text Section 2, Book A Session. Their components
 * stay in src/sections for reuse.
 * Server component: composes client sections; fixed layers first, then Main Container, then footer.
 */
export default function Home() {
  return (
    <>
      <ProgressiveBlur />
      <WavesBackground />
      <main className={styles.main}>
        <Hero />
        <BalanceSection />
        <Services />
        <Philosophy />
        <Story variant="a" />
        <HowItWorks />
        <TextSection index={1} />
        <Quote />
        <Journal />
        <Faq />
      </main>
      <Footer />
      <Navigation />
    </>
  );
}
