import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';

export type HowItWorksPhase = 'idle' | 'absorb' | 'reveal' | 'hold';

const PHASE_DURATIONS: Record<HowItWorksPhase, number> = {
  idle: 2500,
  absorb: 2000,
  reveal: 2800,
  hold: 5000,
};

const PHASE_ORDER: HowItWorksPhase[] = [
  'idle',
  'absorb',
  'reveal',
  'hold',
];

const REVEAL_INTERVAL_MS = 550;
export const HOW_IT_WORKS_PAIR_COUNT = 4;

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

export function useHowItWorksAnimation(
  containerRef: RefObject<HTMLElement | null>,
) {
  const [phase, setPhase] = useState<HowItWorksPhase>('idle');
  const [cycleKey, setCycleKey] = useState(0);
  const [visibleSolutionCount, setVisibleSolutionCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prevRevealKey, setPrevRevealKey] = useState(`${phase}-${cycleKey}`);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  if (reducedMotion && visibleSolutionCount !== HOW_IT_WORKS_PAIR_COUNT) {
    setVisibleSolutionCount(HOW_IT_WORKS_PAIR_COUNT);
  }

  if (
    !reducedMotion &&
    !isVisible &&
    (phase !== 'idle' || visibleSolutionCount !== 0)
  ) {
    setPhase('idle');
    setVisibleSolutionCount(0);
  }

  const revealKey = `${phase}-${cycleKey}`;
  if (
    !reducedMotion &&
    isVisible &&
    phase === 'reveal' &&
    revealKey !== prevRevealKey
  ) {
    setPrevRevealKey(revealKey);
    setVisibleSolutionCount(0);
  } else if (revealKey !== prevRevealKey) {
    setPrevRevealKey(revealKey);
  }

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;

    const timer = window.setTimeout(() => {
      const currentIndex = PHASE_ORDER.indexOf(phase);
      const nextPhase = PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length];

      if (nextPhase === 'idle') {
        setCycleKey((key) => key + 1);
        setVisibleSolutionCount(0);
      }

      if (nextPhase === 'reveal') {
        setVisibleSolutionCount(0);
      }

      setPhase(nextPhase);
    }, PHASE_DURATIONS[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, isVisible, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !isVisible || phase !== 'reveal') return;

    const timers: number[] = [];

    for (let index = 0; index < HOW_IT_WORKS_PAIR_COUNT; index++) {
      timers.push(
        window.setTimeout(() => {
          setVisibleSolutionCount(index + 1);
        }, index * REVEAL_INTERVAL_MS),
      );
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, cycleKey, isVisible, reducedMotion]);

  return { phase, cycleKey, visibleSolutionCount, isVisible, reducedMotion };
}

export function getProblemBalloonClassName(
  phase: HowItWorksPhase,
  reducedMotion: boolean,
): string {
  if (reducedMotion) return '';

  if (phase === 'idle') return '';
  if (phase === 'absorb') return 'how-it-works-absorb';
  return 'how-it-works-hidden';
}

export function getSolutionBalloonClassName(
  phase: HowItWorksPhase,
  index: number,
  visibleSolutionCount: number,
  reducedMotion: boolean,
): string {
  if (reducedMotion) return '';

  if (phase === 'idle' || phase === 'absorb') {
    return 'how-it-works-hidden';
  }

  if (index >= visibleSolutionCount) {
    return 'how-it-works-hidden';
  }

  if (phase === 'reveal' && index === visibleSolutionCount - 1) {
    return 'how-it-works-reveal';
  }

  return '';
}
