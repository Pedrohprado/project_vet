import { Button } from '@/components/ui/button';
import { ctaContent, heroContent } from '@/lib/landing-content';
import { landingPrimaryButtonClassName } from '@/lib/landing-styles';
import { ScrollReveal } from './scroll-reveal';

export function LandingCta() {
  return (
    <section className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <div
        className="auth-yellow-blur pointer-events-none absolute inset-x-0 bottom-0 top-0 opacity-80"
        aria-hidden
      />
      <ScrollReveal className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {ctaContent.title}
        </h2>
        <Button
          className={landingPrimaryButtonClassName + ' mt-8'}
          render={<a href={heroContent.plansHref} />}
        >
          {ctaContent.button}
        </Button>
      </ScrollReveal>
    </section>
  );
}
