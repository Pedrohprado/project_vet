import { LandingAudience } from '@/components/landing/landing-audience';
import { LandingComparison } from '@/components/landing/landing-comparison';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingDemo } from '@/components/landing/landing-demo';
import { LandingDifferential } from '@/components/landing/landing-differential';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works';
import { LandingLayout } from '@/components/landing/landing-layout';
import { LandingMetrics } from '@/components/landing/landing-metrics';
import { LandingMigration } from '@/components/landing/landing-migration';
import { LandingPricing } from '@/components/landing/landing-pricing';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';

export function LandingPage() {
  return (
    <LandingLayout>
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingMetrics />
      <LandingDifferential />
      <LandingDemo />
      <LandingAudience />
      <LandingTestimonials />
      <LandingComparison />
      <LandingMigration />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
    </LandingLayout>
  );
}
