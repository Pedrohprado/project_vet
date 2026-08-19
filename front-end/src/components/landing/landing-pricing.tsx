import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingContent, pricingPlans } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { LandingSection } from './landing-section';
import {
  landingMutedTextClassName,
  landingPrimaryButtonClassName,
} from '@/lib/landing-styles';
import { WaitlistDialog } from './waitlist-dialog';

export function LandingPricing() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  function openWaitlist(planName: string) {
    setSelectedPlan(planName);
    setWaitlistOpen(true);
  }

  return (
    <>
      <LandingSection
        id="planos"
        title={pricingContent.title}
        subtitle={pricingContent.subtitle}
        surface="warm"
      >
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-8',
                plan.highlighted
                  ? 'border-primary/50 ring-2 ring-primary/20'
                  : 'border-border/50',
              )}
            >
              {plan.highlighted ? (
                <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  Mais popular
                </span>
              ) : null}
              <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold text-primary">{plan.price}</p>
              <p className={cn('mt-2', landingMutedTextClassName)}>
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground/75"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Button
                  className={cn(landingPrimaryButtonClassName, 'w-full')}
                  onClick={() => openWaitlist(plan.name)}
                >
                  {pricingContent.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </LandingSection>

      <WaitlistDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        planInterest={selectedPlan}
      />
    </>
  );
}
