import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BIRD_SRC, FLYBIRD_SRC, CAT_SRC } from '@/lib/brand';
import { heroContent } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { DashboardMockup } from './dashboard-mockup';
import { landingPrimaryButtonClassName } from './landing-section';
import { ScrollReveal } from './scroll-reveal';

const PERCH_MS = 6000;
const FLY_DURATION_S = 8;
const BIRD_COUNT = 3;

/** Arcos de voo: esquerdo alto, meio médio, direito quase reto */
const BIRD_LANES = [
  { laneY: -48 },
  { laneY: -28 },
  { laneY: -8 },
] as const;

type Takeoff = {
  left: number;
  travel: number;
};

export function LandingHero() {
  const [isFlying, setIsFlying] = useState(false);
  const [flyKey, setFlyKey] = useState(0);
  const [takeoffs, setTakeoffs] = useState<Takeoff[]>(
    Array.from({ length: BIRD_COUNT }, () => ({ left: 0, travel: 0 })),
  );
  const mockupRef = useRef<HTMLDivElement>(null);
  const birdRefs = useRef<(HTMLImageElement | null)[]>([]);
  const isFlyingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const perchTimeoutRef = useRef(0);
  const flyTimeoutRef = useRef(0);

  const measureTakeoffs = useCallback(() => {
    const mockup = mockupRef.current;
    if (!mockup) {
      return;
    }

    const mockupRect = mockup.getBoundingClientRect();
    const next = birdRefs.current.map((bird) => {
      if (!bird) {
        return { left: 0, travel: 0 };
      }

      const birdRect = bird.getBoundingClientRect();
      const left = birdRect.left - mockupRect.left;
      const travel = Math.max(mockupRect.width - left - birdRect.width, 0);
      return { left, travel };
    });

    setTakeoffs(next);
    return next;
  }, []);

  const clearTimers = useCallback(() => {
    window.clearTimeout(perchTimeoutRef.current);
    window.clearTimeout(flyTimeoutRef.current);
  }, []);

  const startFlight = useCallback(() => {
    if (reducedMotionRef.current || isFlyingRef.current) {
      return;
    }

    clearTimers();
    measureTakeoffs();

    isFlyingRef.current = true;
    setFlyKey((key) => key + 1);
    setIsFlying(true);

    flyTimeoutRef.current = window.setTimeout(() => {
      isFlyingRef.current = false;
      setIsFlying(false);

      if (!reducedMotionRef.current) {
        perchTimeoutRef.current = window.setTimeout(() => {
          startFlight();
        }, PERCH_MS);
      }
    }, FLY_DURATION_S * 1000);
  }, [clearTimers, measureTakeoffs]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = media.matches;

    const onMotionChange = () => {
      reducedMotionRef.current = media.matches;
      clearTimers();
      if (media.matches) {
        isFlyingRef.current = false;
        setIsFlying(false);
        return;
      }

      perchTimeoutRef.current = window.setTimeout(() => {
        startFlight();
      }, PERCH_MS);
    };

    measureTakeoffs();
    window.addEventListener('resize', measureTakeoffs);
    media.addEventListener('change', onMotionChange);

    if (!media.matches) {
      perchTimeoutRef.current = window.setTimeout(() => {
        startFlight();
      }, PERCH_MS);
    }

    return () => {
      clearTimers();
      window.removeEventListener('resize', measureTakeoffs);
      media.removeEventListener('change', onMotionChange);
    };
  }, [clearTimers, measureTakeoffs, startFlight]);

  const sharedTravel = takeoffs[0]?.travel ?? 0;

  return (
    <section className="relative scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <ScrollReveal className="max-w-xl">
            <p className="text-sm font-medium text-primary">
              O cuidado continua depois da consulta
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
          </ScrollReveal>

          <ScrollReveal
            delay={120}
            className="relative mx-auto mt-8 w-full max-w-lg sm:mt-10 lg:mt-0 lg:max-w-none"
          >
            <div ref={mockupRef} className="relative">
              <button
                type="button"
                className={cn(
                  'absolute left-4 top-0 z-20 flex translate-y-[-58%] items-end gap-2 border-0 bg-transparent p-0 sm:left-6 sm:gap-2.5',
                  isFlying
                    ? 'pointer-events-none'
                    : 'pointer-events-auto cursor-pointer',
                )}
                aria-label="Fazer os passarinhos voarem"
                disabled={isFlying}
                onMouseEnter={startFlight}
                onClick={startFlight}
              >
                {Array.from({ length: BIRD_COUNT }, (_, index) => (
                  <img
                    key={index}
                    ref={(node) => {
                      birdRefs.current[index] = node;
                    }}
                    src={BIRD_SRC}
                    alt=""
                    draggable={false}
                    className={cn(
                      'h-11 w-auto object-contain transition-opacity duration-150 lg:h-12',
                      isFlying && 'opacity-0',
                    )}
                  />
                ))}
              </button>

              {isFlying
                ? BIRD_LANES.map((lane, index) => {
                    const takeoff = takeoffs[index] ?? takeoffs[0];

                    return (
                      <div
                        key={`${flyKey}-${index}`}
                        className="hero-bird-fly-track pointer-events-none z-20"
                        style={
                          {
                            '--bird-duration': `${FLY_DURATION_S}s`,
                            '--bird-start-left': `${takeoff?.left ?? 0}px`,
                            '--bird-travel': `${sharedTravel}px`,
                            '--bird-phase': `${index * 120}deg`,
                          } as React.CSSProperties
                        }
                        aria-hidden
                      >
                        <img
                          src={FLYBIRD_SRC}
                          alt=""
                          className="hero-bird-fly object-contain"
                          style={
                            {
                              '--bird-duration': `${FLY_DURATION_S}s`,
                              '--bird-lane-y': `${lane.laneY}px`,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    );
                  })
                : null}

              <img
                src={CAT_SRC}
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-4 -left-4 z-20 h-25 w-auto object-contain sm:h-28 lg:-left-8"
              />
              <DashboardMockup variant="dashboard" className="relative z-10" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
