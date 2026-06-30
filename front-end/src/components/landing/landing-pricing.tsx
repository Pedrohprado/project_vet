import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { LandingSection, landingPrimaryButtonClassName } from './landing-section';

export function LandingPricing() {
  return (
    <LandingSection
      id="planos"
      title="Planos"
      subtitle="Starter para quem está começando. Pro para clínicas em crescimento."
    >
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'rounded-2xl border bg-white p-6 shadow-xl shadow-black/4 sm:p-8',
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
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={cn(landingPrimaryButtonClassName, 'mt-8 w-full')}
              render={<Link to="/register" />}
            >
              Quero esse plano
            </Button>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
