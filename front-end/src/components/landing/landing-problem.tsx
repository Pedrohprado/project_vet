import { problemContent } from '@/lib/landing-content';
import { LandingSection } from './landing-section';
import { landingCardClassName } from '@/lib/landing-styles';

export function LandingProblem() {
  return (
    <LandingSection
      title={problemContent.titleLine1}
      titleLine2={problemContent.titleLine2}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problemContent.items.map(({ icon: Icon, title }) => (
          <div key={title} className={landingCardClassName}>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-4 font-medium leading-snug">{title}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-muted-foreground">
        {problemContent.closing}
      </p>
    </LandingSection>
  );
}
