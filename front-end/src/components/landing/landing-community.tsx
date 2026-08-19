import { Check } from 'lucide-react';
import { communityRoadmapContent } from '@/lib/landing-content';
import { landingCardClassName } from '@/lib/landing-styles';
import { LandingSection } from './landing-section';

export function LandingCommunity() {
  return (
    <LandingSection
      id="comunidade"
      title={communityRoadmapContent.title}
      subtitle={communityRoadmapContent.subtitle}
    >
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        {communityRoadmapContent.items.map(
          ({ icon: Icon, title, description, highlights }) => (
            <article key={title} className={landingCardClassName}>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
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
