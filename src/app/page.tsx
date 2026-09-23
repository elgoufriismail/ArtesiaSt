import { ProgressiveBlur } from '@/components/decor/ProgressiveBlur';
import { WavesBackground } from '@/components/decor/WavesBackground';
import { Navigation } from '@/sections/Navigation';
import { Hero } from '@/sections/Hero';
import { BalanceSection } from '@/sections/BalanceSection';
import { Services } from '@/sections/Services';
import { Philosophy } from '@/sections/Philosophy';
import { Story } from '@/sections/Story';
import { HowItWorks } from '@/sections/HowItWorks';
import { PathSection } from '@/sections/PathSection';
import { Pricing } from '@/sections/Pricing';
import { TextSection } from '@/sections/TextSection';
import { Quote } from '@/sections/Quote';
import { Journal } from '@/sections/Journal';
import { Numbers } from '@/sections/Numbers';
import { Faq } from '@/sections/Faq';
import { Booking } from '@/sections/Booking';
import { Footer } from '@/sections/Footer';
import styles from './page.module.css';

/**
 * Homepage — section order is exactly the original's (docs/reconnaissance/STRUCTURE.md §2).
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
        <PathSection />
        <Pricing />
        <TextSection index={1} />
        <Quote />
        <Story variant="b" />
        <Journal />
        <TextSection index={2} />
        <Numbers />
        <Faq />
        <Booking />
      </main>
      <Footer />
      <Navigation />
    </>
  );
}
