import { useEffect, useRef, useState } from 'react';
import { OPEN_BOX_SRC, VETERINARY_WOMEN_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

type BadgePlacement = {
  top: string;
  left: string;
  fromX: string;
  fromY: string;
};

// Posições na zona acima/direita da caixa; vetores simulam saída da abertura
const DESKTOP_BADGE_PLACEMENTS: BadgePlacement[] = [
  {
    top: '38%',
    left: '46%',
    fromX: '0px',
    fromY: '80px',
  },
  {
    top: '58%',
    left: '24%',
    fromX: '20px',
    fromY: '64px',
  },
  {
    top: '4%',
    left: '20%',
    fromX: '8px',
    fromY: '100px',
  },
  {
    top: '12%',
    left: '62%',
    fromX: '-22px',
    fromY: '88px',
  },
  {
    top: '54%',
    left: '76%',
    fromX: '-36px',
    fromY: '68px',
  },
];

const BADGE_DELAY_MS = 200;

type MigrationBoxSceneProps = {
  badges: readonly string[];
};

function MigrationBadge({
  label,
  isVisible,
  reducedMotion,
  className,
  style,
}: {
  label: string;
  index: number;
  isVisible: boolean;
  reducedMotion: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        'migration-badge inline-flex whitespace-nowrap rounded-full border border-border/60 bg-white px-2.5 py-1 text-xs font-medium text-foreground shadow-sm sm:px-3.5 sm:py-1.5 sm:text-sm',
        reducedMotion && isVisible && 'migration-badge-static',
        !reducedMotion && isVisible && 'migration-badge-emerge',
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );
}

export function MigrationBoxScene({ badges }: MigrationBoxSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative mx-auto mt-6 w-full max-w-3xl px-2 sm:px-0'
    >
      <div className='relative flex items-end justify-center pt-36 -translate-x-6 sm:-translate-x-20 sm:pt-24 lg:-translate-x-32 lg:pt-28 xl:-translate-x-40'>
        <div
          className='pointer-events-none absolute inset-x-0 top-0 bottom-4 z-10 hidden sm:block'
          aria-hidden
        >
          <div className='relative mx-auto h-full w-full max-w-2xl lg:max-w-3xl'>
            <div className='absolute inset-y-0 left-[38%] right-0 sm:left-[40%] lg:left-[42%]'>
              {badges.map((badge, index) => {
                const placement = DESKTOP_BADGE_PLACEMENTS[index];
                if (!placement) return null;

                return (
                  <MigrationBadge
                    key={badge}
                    label={badge}
                    index={index}
                    isVisible={isVisible}
                    reducedMotion={reducedMotion}
                    className='absolute'
                    style={
                      {
                        top: placement.top,
                        left: placement.left,
                        '--badge-delay': `${index * BADGE_DELAY_MS}ms`,
                        '--badge-from-x': placement.fromX,
                        '--badge-from-y': placement.fromY,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        <img
          src={VETERINARY_WOMEN_SRC}
          alt=''
          aria-hidden
          loading="lazy"
          decoding="async"
          className='relative z-0 -mr-8 h-48 w-auto object-contain sm:-mr-11 sm:h-56 lg:-mr-14 lg:h-64'
        />
        <div className='relative shrink-0'>
          <div
            className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 flex w-max max-w-44 translate-x-[-42%] flex-col items-center gap-1.5 sm:hidden'
            aria-hidden
          >
            {badges.map((badge, index) => (
              <MigrationBadge
                key={badge}
                label={badge}
                index={index}
                isVisible={isVisible}
                reducedMotion={reducedMotion}
                style={
                  {
                    '--badge-delay': `${index * BADGE_DELAY_MS}ms`,
                    '--badge-from-x': '0px',
                    '--badge-from-y': '36px',
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <img
            src={OPEN_BOX_SRC}
            alt=''
            aria-hidden
            loading="lazy"
            decoding="async"
            className='relative z-0 h-28 w-auto object-contain sm:h-32 lg:h-36'
          />
        </div>
      </div>
    </div>
  );
}
