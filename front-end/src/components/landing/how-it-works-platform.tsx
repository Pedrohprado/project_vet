import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { DOG_SRC } from '@/lib/brand';

export function HowItWorksPlatform() {
  return (
    <div className="relative flex w-full max-w-sm flex-col items-center lg:max-w-md">
      <span className="mb-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        boxvet.
      </span>
      <div className="relative w-full">
        <DashboardMockup variant="dashboard" />
        <img
          src={DOG_SRC}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute -bottom-6 -left-6 z-10 h-28 w-auto object-contain sm:-bottom-8 sm:-left-8 sm:h-36"
        />
      </div>
    </div>
  );
}
