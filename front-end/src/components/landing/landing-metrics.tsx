import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { metrics } from '@/lib/landing-content';
import { landingCardClassName } from '@/lib/landing-styles';
import { ScrollReveal } from './scroll-reveal';

type MetricCounterProps = {
  end: number;
  prefix?: string;
  suffix?: string;
  localeFormat?: boolean;
  duration?: number;
};

function formatCount(value: number, localeFormat?: boolean) {
  return localeFormat ? value.toLocaleString('pt-BR') : String(value);
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function MetricCounter({
  end,
  prefix = '',
  suffix = '',
  localeFormat,
  duration = 2000,
}: MetricCounterProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;

        hasAnimated.current = true;
        const startTime = performance.now();

        function animate(now: number) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setCount(Math.round(eased * end));

          if (progress < 1) {
            frameId = requestAnimationFrame(animate);
          } else {
            setCount(end);
          }
        }

        frameId = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [duration, end, prefersReducedMotion]);

  const displayCount = prefersReducedMotion ? end : count;

  return (
    <p
      ref={ref}
      className="text-3xl font-bold text-primary tabular-nums sm:text-4xl"
    >
      {prefix}
      {formatCount(displayCount, localeFormat)}
      {suffix}
    </p>
  );
}

export function LandingMetrics() {
  return (
    <section className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={landingCardClassName + ' text-center'}
              >
                <MetricCounter
                  end={metric.end}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  localeFormat={metric.localeFormat}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
