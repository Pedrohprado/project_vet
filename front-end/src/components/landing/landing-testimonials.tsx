import { Star } from 'lucide-react';
import { testimonials } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { landingCardClassName } from '@/lib/landing-styles';
import { ScrollReveal } from './scroll-reveal';

type Testimonial = (typeof testimonials)[number];

const mid = Math.ceil(testimonials.length / 2);
const rowTop = testimonials.slice(0, mid);
const rowBottom = testimonials.slice(mid);

function TestimonialCard({ quote, name, role }: Testimonial) {
  return (
    <article className={cn(landingCardClassName, 'w-70 shrink-0 sm:w-75')}>
      <div className='flex gap-0.5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className='size-4 fill-primary text-primary' />
        ))}
      </div>
      <blockquote className='mt-4 text-sm leading-relaxed text-foreground/90'>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <footer className='mt-4 border-t border-border/50 pt-4'>
        <p className='font-semibold'>{name}</p>
        <p className='text-sm text-muted-foreground'>{role}</p>
      </footer>
    </article>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: readonly Testimonial[];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];

  return (
    <div className='testimonials-marquee-fade overflow-hidden'>
      <div
        className={cn(
          'testimonials-marquee-track flex w-max gap-4 py-1',
          reverse && 'testimonials-marquee-track-reverse',
        )}
      >
        {loop.map((item, index) => (
          <TestimonialCard key={`${item.name}-${index}`} {...item} />
        ))}
      </div>
    </div>
  );
}

export function LandingTestimonials() {
  return (
    <section className='scroll-mt-20 overflow-hidden py-16 sm:py-24'>
      <ScrollReveal className='mx-auto mb-10 max-w-3xl px-4 text-center sm:mb-14 sm:px-6'>
        <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          Depoimentos
        </h2>
        <p className='mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg'>
          O que veterinários que testaram a BoxVet estão dizendo.
        </p>
      </ScrollReveal>

      <div className='testimonials-marquee flex flex-col gap-4'>
        <MarqueeRow items={rowTop} />
        <MarqueeRow items={rowBottom} reverse />
      </div>
    </section>
  );
}
