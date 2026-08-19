import { Check } from 'lucide-react';
import { communityRoadmapContent } from '@/lib/landing-content';
import {
  landingCardClassName,
  landingMutedTextClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { LandingSection } from './landing-section';

export function LandingCommunity() {
  return (
    <LandingSection
      id="comunidade"
      title={communityRoadmapContent.title}
      subtitle={communityRoadmapContent.subtitle}
      surface="plain"
      compact
    >
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        {communityRoadmapContent.items.map(
          ({ icon: Icon, title, description, highlights }) => (
            <article key={title} className={cn(landingCardClassName, 'p-5')}>
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="size-4 text-primary" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className={cn('mt-1.5', landingMutedTextClassName)}>
                {description}
              </p>
              <ul className="mt-4 space-y-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/75"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ),
        )}
      </div>
    </LandingSection>
  );
}
