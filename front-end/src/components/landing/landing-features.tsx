import { featureGroups } from '@/lib/landing-content';
import {
  landingCardClassName,
  landingCardHighlightClassName,
  landingMutedTextClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { LandingSection } from './landing-section';

export function LandingFeatures() {
  return (
    <LandingSection
      id="recursos"
      title="Recursos"
      subtitle="Organizados pela jornada do cuidado — do agendamento ao acompanhamento pós-consulta."
      surface="warm"
    >
      <div className="space-y-10">
        {featureGroups.map((group) => (
          <div key={group.id}>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                group.highlighted ? 'text-primary' : 'text-foreground',
              )}
            >
              {group.title}
            </h3>
            <div
              className={cn(
                'grid gap-4',
                group.features.length === 3
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'sm:grid-cols-2',
              )}
            >
              {group.features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className={
                    group.highlighted
                      ? landingCardHighlightClassName
                      : landingCardClassName
                  }
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h4 className="mt-4 font-semibold">{title}</h4>
                  {description ? (
                    <p className={cn('mt-2', landingMutedTextClassName)}>
                      {description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
