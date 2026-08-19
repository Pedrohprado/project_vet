import { productInActionContent } from '@/lib/landing-content';
import { landingMutedTextClassName } from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { DashboardMockup } from './dashboard-mockup';
import { LandingSection } from './landing-section';

export function LandingProductInAction() {
  return (
    <LandingSection
      title={productInActionContent.title}
      subtitle={productInActionContent.subtitle}
      surface='plain'
      align='left'
      centered={false}
    >
      <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-12'>
        <ol className='relative space-y-0'>
          {productInActionContent.steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                'relative flex gap-4 pb-8 last:pb-0',
                index < productInActionContent.steps.length - 1 &&
                  'before:absolute before:left-3.75 before:top-8 before:h-[calc(100%-2rem)] before:w-px before:bg-border/80',
              )}
            >
              <span className='relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary'>
                {index + 1}
              </span>
              <div className='pt-0.5'>
                <h3 className='font-semibold text-foreground'>{step.title}</h3>
                <p className={cn('mt-1', landingMutedTextClassName)}>
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <DashboardMockup
          variant='message'
          ariaLabel='Demonstração do envio de orientações pós-consulta ao tutor'
        />
      </div>
    </LandingSection>
  );
}
