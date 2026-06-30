import { differentialContent } from '@/lib/landing-content';
import { LandingSection, landingCardClassName } from './landing-section';

export function LandingDifferential() {
  return (
    <LandingSection title={differentialContent.title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {differentialContent.items.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className={landingCardClassName + ' flex items-start gap-4'}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="size-5 text-primary" />
            </div>
            <p className="font-medium leading-snug">{title}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
