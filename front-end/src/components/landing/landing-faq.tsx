import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { faqItems } from '@/lib/landing-content';
import { landingCardClassName } from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { LandingSection } from './landing-section';

export function LandingFaq() {
  return (
    <LandingSection
      id="faq"
      title="Perguntas frequentes"
      subtitle="Tire suas dúvidas sobre a BoxVet."
      surface="plain"
    >
      <div className="mx-auto max-w-2xl space-y-3">
        {faqItems.map((item) => (
          <Collapsible
            key={item.question}
            className={cn(landingCardClassName, 'overflow-hidden p-0 shadow-sm')}
          >
            <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-panel-open:text-primary">
              {item.question}
              <ChevronDown className="size-4 shrink-0 transition-transform in-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-foreground/75">
              {item.answer}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </LandingSection>
  );
}
