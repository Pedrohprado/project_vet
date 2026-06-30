import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { faqItems } from '@/lib/landing-content';
import { LandingSection } from './landing-section';

export function LandingFaq() {
  return (
    <LandingSection
      id='faq'
      title='Perguntas frequentes'
      subtitle='Tire suas dúvidas sobre a BoxVet.'
    >
      <div className='mx-auto max-w-2xl space-y-3'>
        {faqItems.map((item) => (
          <Collapsible
            key={item.question}
            className='rounded-2xl border border-border/50 bg-white shadow-sm'
          >
            <CollapsibleTrigger className='flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:text-primary data-panel-open:text-primary'>
              {item.question}
              <ChevronDown className='size-4 shrink-0 transition-transform in-data-panel-open:rotate-180' />
            </CollapsibleTrigger>
            <CollapsibleContent className='border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground'>
              {item.answer}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </LandingSection>
  );
}
