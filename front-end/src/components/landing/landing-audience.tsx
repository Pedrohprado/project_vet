import { audienceItems } from '@/lib/landing-content';
import { LandingSection, landingCardClassName } from './landing-section';

export function LandingAudience() {
  return (
    <LandingSection
      title="Para quem é?"
      subtitle="A BoxVet foi pensada para diferentes perfis de atendimento veterinário."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audienceItems.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className={landingCardClassName + ' text-center'}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="size-6 text-primary" />
            </div>
            <p className="mt-4 font-medium">{title}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
