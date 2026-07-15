import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BIRD_SRC, FLYBIRD_SRC, CAT_SRC } from '@/lib/brand';
import { heroContent } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { DashboardMockup } from './dashboard-mockup';
import { landingPrimaryButtonClassName } from './landing-section';

const PERCH_MS = 4500;
const FLY_DURATION_S = 8;

type Takeoff = {
  left: number;
  travel: number;
};

export function LandingHero() {
  const [isFlying, setIsFlying] = useState(false);
  const [flyKey, setFlyKey] = useState(0);
  const [takeoff, setTakeoff] = useState<Takeoff>({ left: 0, travel: 0 });
  const mockupRef = useRef<HTMLDivElement>(null);
  const thirdBirdRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      return;
    }

    const measureTakeoff = () => {
      const mockup = mockupRef.current;
      const bird = thirdBirdRef.current;
      if (!mockup || !bird) {
        return;
      }

      const mockupRect = mockup.getBoundingClientRect();
      const birdRect = bird.getBoundingClientRect();
      const left = birdRect.left - mockupRect.left;
      const travel = Math.max(mockupRect.width - left - birdRect.width, 0);
      setTakeoff({ left, travel });
    };

    let timeoutId = 0;
    let flying = false;

    measureTakeoff();
    window.addEventListener('resize', measureTakeoff);

    const schedule = () => {
      const delay = flying ? FLY_DURATION_S * 1000 : PERCH_MS;
      timeoutId = window.setTimeout(() => {
        flying = !flying;
        if (flying) {
          measureTakeoff();
          setFlyKey((key) => key + 1);
        }
        setIsFlying(flying);
        schedule();
      }, delay);
    };

    schedule();

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', measureTakeoff);
    };
  }, []);

  return (
    <section className="relative scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">
              Sistema veterinário com foco no tutor
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {heroContent.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {heroContent.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className={landingPrimaryButtonClassName}
                render={<a href={heroContent.plansHref} />}
              >
                {heroContent.primaryCta}
              </Button>
            </div>
          </div>

          <div
            ref={mockupRef}
            className="relative mx-auto mt-8 w-full max-w-lg sm:mt-10 lg:mt-0 lg:max-w-none"
          >
            <div
              className="pointer-events-none absolute left-4 top-0 z-20 flex translate-y-[-58%] items-end gap-1 sm:left-6"
              aria-hidden
            >
              {[0, 1, 2].map((index) => (
                <img
                  key={index}
                  ref={index === 2 ? thirdBirdRef : undefined}
                  src={BIRD_SRC}
                  alt=""
                  className={cn(
                    'h-11 w-auto object-contain transition-opacity duration-150 lg:h-12',
                    isFlying && index === 2 && 'opacity-0',
                  )}
                />
              ))}
            </div>

            {isFlying ? (
              <img
                key={flyKey}
                src={FLYBIRD_SRC}
                alt=""
                aria-hidden
                className="hero-bird-fly pointer-events-none z-20 object-contain"
                style={
                  {
                    '--bird-duration': `${FLY_DURATION_S}s`,
                    '--bird-start-left': `${takeoff.left}px`,
                    '--bird-travel': `${takeoff.travel}px`,
                  } as React.CSSProperties
                }
              />
            ) : null}

            <img
              src={CAT_SRC}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -left-4 z-20 h-25 w-auto object-contain sm:h-28 lg:-left-8"
            />
            <DashboardMockup variant="dashboard" className="relative z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
