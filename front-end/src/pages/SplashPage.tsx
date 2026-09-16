import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { BrandCardBirds } from '@/components/brand/brand-card-birds';
import { BrandImage } from '@/components/brand/brand-image';
import { BrandLogo } from '@/components/brand/brand-logo';
import { BrandPageBackground } from '@/components/brand-page-background';
import { Button } from '@/components/ui/button';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { useFunnelTrack } from '@/hooks/useFunnelTrack';
import { usePreloadBrandImages } from '@/hooks/use-preload-images';
import { CAT_SRC, DOG_SRC } from '@/lib/brand';
import { SPLASH_PRELOAD_PNGS } from '@/lib/marketing-preload';
import { splashBenefits } from '@/lib/billing';
import {
  landingPrimaryButtonClassName,
  marketingBodyClassName,
  marketingCardClassName,
  marketingListItemClassName,
  marketingTitleClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';

export function SplashPage() {
  useFunnelTrack('ENTRADA');
  usePreloadBrandImages(SPLASH_PRELOAD_PNGS);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 sm:py-12">
      <BrandPageBackground variant="absolute" blurHeight="55%" />

      <div className="relative z-10 w-full max-w-md md:max-w-3xl lg:max-w-4xl">
        <div className="relative">
          <BrandCardBirds count={3} priority />

          <div className={cn(marketingCardClassName, 'overflow-visible md:pt-5 md:pb-7')}>
            <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start md:gap-8">
              <div className="flex flex-col overflow-visible md:-mt-0.5">
                <div className="flex justify-center md:justify-start">
                  <BrandLogo size="xl" className="md:hidden" priority />
                  <BrandLogo size="lg" className="hidden md:flex" priority />
                </div>

                <div
                  className="mt-5 flex items-end justify-center md:hidden"
                  aria-hidden
                >
                  <BrandImage
                    src={DOG_SRC}
                    alt=""
                    priority
                    className="relative z-10 h-28 w-auto max-w-[44%] -translate-x-1 object-contain object-bottom sm:h-32"
                  />
                  <BrandImage
                    src={CAT_SRC}
                    alt=""
                    priority
                    className="relative -ml-5 h-28 w-auto max-w-[44%] translate-x-1 object-contain object-bottom sm:-ml-6 sm:h-32"
                  />
                </div>

                <div className="relative mt-3 hidden md:mx-1 md:block md:px-6 lg:px-8">
                  <BrandImage
                    src={DOG_SRC}
                    alt=""
                    aria-hidden
                    priority
                    className="pointer-events-none absolute -bottom-5 -left-8 z-20 h-[5.5rem] w-auto object-contain lg:-bottom-6 lg:-left-11 lg:h-28 xl:-left-14 xl:h-[7.25rem]"
                  />
                  <BrandImage
                    src={CAT_SRC}
                    alt=""
                    aria-hidden
                    priority
                    className="pointer-events-none absolute -bottom-5 -right-8 z-20 h-[5.5rem] w-auto object-contain lg:-bottom-6 lg:-right-11 lg:h-28 xl:-right-14 xl:h-[7.25rem]"
                  />
                  <DashboardMockup
                    variant="dashboard"
                    compact
                    className="relative z-10 mx-auto w-full max-w-[18rem] lg:max-w-[19rem]"
                    ariaLabel="Demonstração do painel BoxVet com consultas, retornos e acompanhamento pós-consulta"
                  />
                </div>
              </div>

              <div className="flex flex-col md:pt-1">
                <h1
                  className={cn(
                    marketingTitleClassName,
                    'text-xl sm:text-2xl sm:leading-snug',
                  )}
                >
                  Cuide dos seus pacientes antes, durante e depois de cada procedimento!
                </h1>

                <p className={`${marketingBodyClassName} mt-3`}>
                  A BoxVet organiza agenda, prontuário, vacinas e acompanhamento
                  pós-consulta para clínicas veterinárias.
                </p>

                <ul className="mt-5 space-y-2">
                  {splashBenefits.map((benefit) => (
                    <li
                      key={benefit.text}
                      className={cn(
                        'flex gap-2.5',
                        benefit.highlighted
                          ? 'text-sm font-medium leading-relaxed text-foreground'
                          : marketingListItemClassName,
                      )}
                    >
                      <span
                        className={cn(
                          'mt-2 h-px w-3 shrink-0',
                          benefit.highlighted
                            ? 'bg-primary/50'
                            : 'bg-foreground/40',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        {benefit.text}
                        {benefit.highlighted ? (
                          <>
                            {' '}
                            <Sparkles
                              className="inline size-3.5 align-[-0.15em] text-primary"
                              aria-hidden
                            />
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  action="join"
                  className={`${landingPrimaryButtonClassName} mt-6 w-full gap-2 sm:max-w-[11rem]`}
                  render={<Link to="/login" />}
                >
                  fazer parte
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-foreground/55">
            © {new Date().getFullYear()} BoxVet. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
