import { problemContent } from '@/lib/landing-content';
import { landingCardClassName } from '@/lib/landing-styles';
import { LandingSection } from './landing-section';

export function LandingProblem() {
  return (
    <LandingSection
      title={problemContent.title}
      subtitle={problemContent.subtitle}
      surface="plain"
      align="left"
      centered={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problemContent.items.map(({ icon: Icon, title }) => (
          <div key={title} className={landingCardClassName}>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-4 font-medium leading-snug text-foreground/90">
              {title}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
