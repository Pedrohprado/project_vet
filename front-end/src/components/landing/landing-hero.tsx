import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { FLYBIRD_SRC, CAT_SRC } from '@/lib/brand';
import { heroContent } from '@/lib/landing-content';
import { DashboardMockup } from './dashboard-mockup';
import {
  landingOutlineButtonClassName,
  landingPrimaryButtonClassName,
} from './landing-section';

export function LandingHero() {
  return (
    <section className='relative scroll-mt-20 overflow-hidden'>
      <div className='mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-8'>
          <div className='max-w-xl'>
            <p className='text-sm font-medium text-primary'>
              Sistema veterinário com foco no tutor
            </p>
            <h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>
              {heroContent.title}
            </h1>
            <p className='mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg'>
              {heroContent.subtitle}
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
              <Button
                className={landingPrimaryButtonClassName}
                render={<Link to='/register' />}
              >
                {heroContent.primaryCta}
              </Button>
              <Button
                variant='outline'
                className={landingOutlineButtonClassName}
                render={<a href='#demonstracao' />}
              >
                {heroContent.secondaryCta}
              </Button>
            </div>
          </div>

          <div className='relative mx-auto w-full max-w-lg lg:max-w-none'>
            <img
              src={FLYBIRD_SRC}
              alt=''
              aria-hidden
              className='auth-float pointer-events-none absolute left-1/2 top-0 z-20 h-14 w-auto -translate-x-1/2 translate-y-[-70%] object-contain sm:h-16 sm:translate-y-[-75%]'
              style={
                {
                  '--float-duration': '5.5s',
                  '--float-delay': '0s',
                } as React.CSSProperties
              }
            />
            <img
              src={CAT_SRC}
              alt=''
              aria-hidden
              className='pointer-events-none absolute -bottom-4 -left-4 z-20 h-20 w-auto object-contain sm:h-24 lg:-left-8'
            />
            <DashboardMockup variant='dashboard' className='relative z-10' />
          </div>
        </div>
      </div>
    </section>
  );
}
