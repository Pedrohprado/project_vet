import { useRef } from 'react';
import { HowItWorksBalloon } from '@/components/landing/how-it-works-balloon';
import { HowItWorksPlatform } from '@/components/landing/how-it-works-platform';
import { LandingSection } from '@/components/landing/landing-section';
import {
  getProblemBalloonClassName,
  getSolutionBalloonClassName,
  useHowItWorksAnimation,
} from '@/hooks/use-how-it-works-animation';
import { howItWorksContent, howItWorksPairs } from '@/lib/landing-content';
import { cn } from '@/lib/utils';

const problemOffsets = ['ml-0', 'ml-6 lg:ml-8', 'ml-2 lg:ml-3', 'ml-8 lg:ml-10'];
const solutionOffsets = [
  'mr-0 lg:ml-auto',
  'mr-4 lg:mr-6 lg:ml-auto',
  'mr-1 lg:mr-2 lg:ml-auto',
  'mr-6 lg:mr-8 lg:ml-auto',
];

export function LandingHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { phase, cycleKey, visibleSolutionCount, reducedMotion } =
    useHowItWorksAnimation(containerRef);

  return (
    <LandingSection
      id="como-funciona"
      title="Como funciona"
      subtitle={howItWorksContent.subtitle}
    >
      <div
        ref={containerRef}
        className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 xl:gap-10"
      >
        <div className="flex flex-col items-center gap-3 lg:items-end lg:gap-4">
          {howItWorksPairs.map((pair, index) => (
            <div
              key={`problem-${cycleKey}-${pair.problem.title}`}
              className={cn('w-full max-w-[340px] lg:w-max lg:max-w-none', problemOffsets[index])}
              style={{ marginTop: pair.offsetY }}
            >
              <HowItWorksBalloon
                title={pair.problem.title}
                variant="problem"
                className={getProblemBalloonClassName(phase, reducedMotion)}
                style={
                  {
                    '--absorb-duration': '1.2s',
                    '--absorb-delay': `${index * 0.25}s`,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>

        <HowItWorksPlatform />

        <div className="flex flex-col items-center gap-3 lg:items-start lg:gap-4">
          {howItWorksPairs.map((pair, index) => (
            <div
              key={`solution-${cycleKey}-${pair.solution.title}`}
              className={cn('w-full max-w-[340px] lg:w-max lg:max-w-none', solutionOffsets[index])}
              style={{ marginTop: pair.offsetY }}
            >
              <HowItWorksBalloon
                icon={pair.solution.icon}
                title={pair.solution.title}
                variant="solution"
                className={getSolutionBalloonClassName(
                  phase,
                  index,
                  visibleSolutionCount,
                  reducedMotion,
                )}
                style={
                  {
                    '--reveal-duration': '0.6s',
                    '--reveal-delay': '0s',
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
