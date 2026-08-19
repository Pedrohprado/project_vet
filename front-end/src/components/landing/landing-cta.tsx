import { Button } from '@/components/ui/button';
import { ctaContent, heroContent } from '@/lib/landing-content';
import {
  landingBodyTextClassName,
  landingPrimaryButtonClassName,
  landingSectionPaddingClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

export function LandingCta() {
  return (
    <section className="relative scroll-mt-20 overflow-hidden">
      <div
        className="auth-yellow-blur pointer-events-none absolute inset-x-0 bottom-0 top-0 opacity-80"
        aria-hidden
      />
      <ScrollReveal
        className={cn(
          'relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6',
          landingSectionPaddingClassName,
        )}
      >
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {ctaContent.title}
        </h2>
        <p className={cn('mt-4', landingBodyTextClassName)}>
          {ctaContent.subtitle}
        </p>
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
