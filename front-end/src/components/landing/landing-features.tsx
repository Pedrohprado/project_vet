import { features } from '@/lib/landing-content';
import { LandingSection } from './landing-section';
import { landingCardClassName } from '@/lib/landing-styles';

export function LandingFeatures() {
  return (
    <LandingSection
      id="recursos"
      title="Recursos"
      subtitle="Tudo que sua clínica precisa para organizar o dia a dia e encantar tutores."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className={landingCardClassName}>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
