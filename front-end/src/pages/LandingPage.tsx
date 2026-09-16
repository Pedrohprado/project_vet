import { usePreloadBrandImages } from '@/hooks/use-preload-images';
import { LANDING_PRELOAD_PNGS } from '@/lib/marketing-preload';
import { LandingCommunity } from '@/components/landing/landing-community';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works';
import { LandingLayout } from '@/components/landing/landing-layout';
import { LandingMetrics } from '@/components/landing/landing-metrics';
import { LandingMigration } from '@/components/landing/landing-migration';
import { LandingPricing } from '@/components/landing/landing-pricing';
import { LandingProblem } from '@/components/landing/landing-problem';
import { LandingProductInAction } from '@/components/landing/landing-product-in-action';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';

export function LandingPage() {
  usePreloadBrandImages(LANDING_PRELOAD_PNGS);

  return (
    <LandingLayout>
      <LandingHero />
      <LandingProblem />
      <LandingHowItWorks />
      <LandingProductInAction />
      <LandingFeatures />
      <LandingMetrics />
      <LandingTestimonials />
      <LandingMigration />
      <LandingCommunity />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
    </LandingLayout>
  );
}
