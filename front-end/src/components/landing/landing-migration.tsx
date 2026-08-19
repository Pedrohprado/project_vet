import { Check } from 'lucide-react';
import { migrationContent } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { OPEN_BOX_SRC, VETERINARY_WOMEN_SRC } from '@/lib/brand';
import { LandingSection } from './landing-section';

export function LandingMigration() {
  return (
    <LandingSection
      id='migracao'
      title={migrationContent.title}
      subtitle={migrationContent.subtitle}
      surface='dots'
    >
      <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-12'>
        <div>
          <ol className='space-y-0'>
            {migrationContent.steps.map((step, index) => (
              <li
                key={step.title}
                className={cn(
                  'relative flex gap-4 pb-6 last:pb-0',
                  index < migrationContent.steps.length - 1 &&
                    'before:absolute before:left-3.75 before:top-8 before:h-[calc(100%-1.5rem)] before:w-px before:bg-border/80',
                )}
              >
                <span className='relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white text-sm font-semibold text-primary shadow-sm'>
                  {index + 1}
                </span>
                <p className='pt-1 font-medium text-foreground'>{step.title}</p>
              </li>
            ))}
          </ol>

          <ul className='mt-8 flex flex-wrap gap-x-6 gap-y-2'>
            {migrationContent.benefits.map((benefit) => (
              <li
                key={benefit}
                className='flex items-center gap-2 text-sm text-foreground/75'
              >
                <Check className='size-4 shrink-0 text-primary' />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className='relative mx-auto flex max-w-sm items-end justify-center gap-2 sm:max-w-md'>
          <img
            src={VETERINARY_WOMEN_SRC}
            alt=''
            aria-hidden
            loading='lazy'
            decoding='async'
            className='relative z-0 -mr-6 h-44 w-auto object-contain sm:-mr-8 sm:h-52'
          />
          <img
            src={OPEN_BOX_SRC}
            alt=''
            aria-hidden
            loading='lazy'
            decoding='async'
            className='relative z-0 h-24 w-auto object-contain sm:h-28'
          />
        </div>
      </div>
    </LandingSection>
  );
}
