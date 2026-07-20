import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

type LandingSectionProps = {
  id?: string;
  title?: string;
  titleLine2?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
};

export function LandingSection({
  id,
  title,
  titleLine2,
  subtitle,
  children,
  className,
  centered = true,
}: LandingSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <ScrollReveal>
          {(title || titleLine2 || subtitle) && (
            <header
              className={cn(
                'mb-10 sm:mb-14',
                centered && 'mx-auto max-w-3xl text-center',
              )}
            >
              {title ? (
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {title}
                </h2>
              ) : null}
              {titleLine2 ? (
                <p className="mt-1 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {titleLine2}
                </p>
              ) : null}
              {subtitle ? (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {subtitle}
                </p>
              ) : null}
            </header>
          )}
          {children}
        </ScrollReveal>
      </div>
    </section>
  );
}
