import { Star } from 'lucide-react';
import { testimonials } from '@/lib/landing-content';
import { LandingSection, landingCardClassName } from './landing-section';

export function LandingTestimonials() {
  return (
    <LandingSection
      title="Depoimentos"
      subtitle="O que veterinários que testaram a BoxVet estão dizendo."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map(({ quote, name, role }) => (
          <div key={name} className={landingCardClassName}>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-4 fill-primary text-primary"
                />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <footer className="mt-4 border-t border-border/50 pt-4">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </footer>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
