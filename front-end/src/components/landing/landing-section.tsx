import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';
import {
  landingBodyTextClassName,
  landingSectionPaddingClassName,
  landingSectionPaddingCompactClassName,
} from '@/lib/landing-styles';

type LandingSectionSurface = 'plain' | 'dots' | 'warm';

type LandingSectionProps = {
  id?: string;
  title?: string;
  titleLine2?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
  align?: 'center' | 'left';
  surface?: LandingSectionSurface;
  compact?: boolean;
};

const surfaceClassNames: Record<LandingSectionSurface, string> = {
  plain: 'bg-white',
  dots: 'auth-grid-bg bg-white',
  warm: 'relative bg-white',
};

export function LandingSection({
  id,
  title,
  titleLine2,
  subtitle,
  children,
  className,
  centered = true,
  align = 'center',
  surface = 'plain',
  compact = false,
}: LandingSectionProps) {
  const isLeft = align === 'left';

  return (
    <section
      id={id}
      className={cn('relative scroll-mt-20', surfaceClassNames[surface], className)}
    >
      {surface === 'warm' ? (
        <div
          className="auth-yellow-blur pointer-events-none absolute inset-x-0 bottom-0 top-0 opacity-40"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'relative mx-auto max-w-6xl px-4 sm:px-6',
          compact
            ? landingSectionPaddingCompactClassName
            : landingSectionPaddingClassName,
        )}
      >
        <ScrollReveal>
          {(title || titleLine2 || subtitle) && (
            <header
              className={cn(
                'mb-8 sm:mb-10',
                centered && !isLeft && 'mx-auto max-w-3xl text-center',
                isLeft && 'max-w-2xl text-left',
              )}
            >
              {title ? (
                <h2
                  className={cn(
                    'text-balance text-3xl font-bold tracking-tight sm:text-4xl',
                    centered && !isLeft && 'mx-auto max-w-2xl',
                  )}
                >
                  {title}
                </h2>
              ) : null}
              {titleLine2 ? (
                <p className="mt-1 text-balance text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {titleLine2}
                </p>
              ) : null}
              {subtitle ? (
                <p
                  className={cn(
                    'mt-4',
                    landingBodyTextClassName,
                    centered && !isLeft && 'mx-auto max-w-2xl',
                  )}
                >
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
