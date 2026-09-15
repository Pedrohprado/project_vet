import { useEffect, useRef, useState } from 'react';
import { SparklesIcon } from 'lucide-animated';
import { cn } from '@/lib/utils';

const CYCLE_MS = 5000;
const CHAR_INTERVAL_MS = 45;

type SparklesIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type TypingSparkleLineProps = {
  text: string;
  className?: string;
};

export function TypingSparkleLine({ text, className }: TypingSparkleLineProps) {
  const [displayed, setDisplayed] = useState('');
  const [showSparkle, setShowSparkle] = useState(false);
  const sparkleRef = useRef<SparklesIconHandle>(null);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setDisplayed(textRef.current);
      setShowSparkle(true);
      return;
    }

    let typingTimer: ReturnType<typeof setInterval> | undefined;
    let cycleTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const clearTimers = () => {
      if (typingTimer) clearInterval(typingTimer);
      if (cycleTimer) clearTimeout(cycleTimer);
      typingTimer = undefined;
      cycleTimer = undefined;
      sparkleRef.current?.stopAnimation();
    };

    const startCycle = () => {
      if (cancelled) return;

      clearTimers();

      const full = textRef.current;
      let index = 0;

      setDisplayed('');
      setShowSparkle(false);

      typingTimer = setInterval(() => {
        if (cancelled) return;

        index += 1;
        setDisplayed(full.slice(0, index));

        if (index >= full.length) {
          if (typingTimer) clearInterval(typingTimer);
          typingTimer = undefined;
          setShowSparkle(true);
          sparkleRef.current?.startAnimation();
        }
      }, CHAR_INTERVAL_MS);

      cycleTimer = setTimeout(startCycle, CYCLE_MS);
    };

    startCycle();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!showSparkle) return;
    sparkleRef.current?.startAnimation();
  }, [showSparkle]);

  return (
    <span className={cn('inline leading-relaxed', className)}>
      <span aria-hidden>{displayed}</span>
      <span className="sr-only">{text}</span>
      {showSparkle ? (
        <SparklesIcon
          ref={sparkleRef}
          size={14}
          animateOnHover={false}
          className="ml-1 inline-flex shrink-0 align-[-0.15em] text-primary"
          aria-hidden
        />
      ) : (
        <span
          className="ml-px inline-block h-[0.875em] w-px animate-pulse bg-foreground/50 align-[-0.1em]"
          aria-hidden
        />
      )}
    </span>
  );
}
