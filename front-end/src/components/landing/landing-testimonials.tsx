import { testimonials } from '@/lib/landing-content';
import {
  landingCardClassName,
  landingBodyTextClassName,
  landingMutedTextClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

type Testimonial = (typeof testimonials)[number];

function TestimonialCard({
  quote,
  name,
  role,
  clinic,
  city,
  avatarInitials,
}: Testimonial) {
  return (
    <article className={cn(landingCardClassName, 'flex h-full flex-col')}>
      <blockquote className={cn('flex-1', landingBodyTextClassName, 'text-base')}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
          aria-hidden
        >
          {avatarInitials}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className={landingMutedTextClassName}>{role}</p>
          <p className={cn('mt-0.5 text-xs italic text-foreground/50')}>
            {clinic} · {city}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function LandingTestimonials() {
  return (
    <section className="scroll-mt-20 bg-white py-12 sm:py-16">
      <ScrollReveal className="mx-auto mb-8 max-w-3xl px-4 text-center sm:mb-10 sm:px-6">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Depoimentos
        </h2>
        <p className={cn('mt-4', landingBodyTextClassName)}>
          Espaço reservado para histórias reais de clínicas que usam a BoxVet.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
