import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type HowItWorksBalloonProps = {
  icon?: LucideIcon;
  title: string;
  variant?: 'problem' | 'solution';
  className?: string;
  style?: React.CSSProperties;
};

export function HowItWorksBalloon({
  icon: Icon,
  title,
  variant = 'problem',
  className,
  style,
}: HowItWorksBalloonProps) {
  const isProblem = variant === 'problem';

  return (
    <div
      className={cn(
        'flex h-11 w-max max-w-full items-center rounded-xl border px-3.5',
        isProblem
          ? 'border-border/60 bg-muted/40 text-muted-foreground shadow-sm'
          : 'relative gap-3 border-green-500/70 bg-white text-foreground shadow-xl shadow-black/4',
        className,
      )}
      style={style}
    >
      {!isProblem ? (
        <span
          className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
          aria-hidden
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      ) : null}
      {!isProblem && Icon ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-500/15">
          <Icon className="size-4 text-green-600" />
        </div>
      ) : null}
      <p
        className={cn(
          'whitespace-nowrap text-sm leading-none',
          isProblem ? 'font-normal' : 'font-medium',
        )}
      >
        {title}
      </p>
    </div>
  );
}
