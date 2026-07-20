import { Link } from 'react-router';
import { Check, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OnboardingStepState } from '@/lib/onboarding';
import { cn } from '@/lib/utils';

type OnboardingStepCardProps = {
  step: number;
  text: string;
  linkLabel: string;
  href: string;
  icon: LucideIcon;
  state: OnboardingStepState;
};

export function OnboardingStepCard({
  step,
  text,
  linkLabel,
  href,
  icon: Icon,
  state,
}: OnboardingStepCardProps) {
  const isCompleted = state === 'completed';
  const isLocked = state === 'locked';

  return (
    <Card
      className={cn(
        'shadow-none transition-colors',
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-border/60 bg-muted/20',
        isLocked && 'opacity-60',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {isCompleted ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
          ) : (
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                isLocked
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary',
              )}
            >
              {step}
            </span>
          )}
          <Icon
            className={cn(
              'size-4',
              isCompleted ? 'text-emerald-600' : 'text-muted-foreground',
            )}
          />
        </div>
        <CardTitle
          className={cn(
            'text-sm leading-snug',
            isCompleted && 'text-emerald-900',
          )}
        >
          {text}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isCompleted ? (
          <p className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-white/70 py-2 text-sm font-medium text-emerald-700">
            <Check className="size-3.5" />
            Concluído
          </p>
        ) : (
          <Button
            asChild={!isLocked}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLocked}
          >
            {isLocked ? (
              <span>Aguardando etapa anterior</span>
            ) : (
              <Link to={href}>{linkLabel}</Link>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
