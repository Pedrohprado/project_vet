import { usePreloadBrandImages } from '@/hooks/use-preload-images';
import { useDocumentSeo } from '@/hooks/use-document-seo';
import { LANDING_PRELOAD_PNGS } from '@/lib/marketing-preload';
import { landingSeo } from '@/lib/seo';
import { LandingJsonLd } from '@/components/seo/landing-json-ld';
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

/**
 * Landing completa — rota `/landing` desabilitada em App.tsx (redirect para `/`).
 * Para reativar: trocar o Navigate em App.tsx por element={<LandingPage />}
 * e mudar landingSeo.robots para INDEX_FOLLOW em seo.ts.
 */
export function LandingPage() {
  usePreloadBrandImages(LANDING_PRELOAD_PNGS);
  useDocumentSeo(landingSeo);

  return (
    <LandingLayout>
      <LandingJsonLd />
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
