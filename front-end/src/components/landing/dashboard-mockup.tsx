import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type MockupVariant = 'dashboard' | 'tutor' | 'consultation' | 'message';

type DashboardMockupProps = {
  variant?: MockupVariant;
  className?: string;
  ariaLabel?: string;
  /** Versão reduzida para cards (splash, etc.). */
  compact?: boolean;
};

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted', className)} />;
}

function MockupShell({
  title,
  children,
  className,
  ariaLabel,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-border/50 bg-white shadow-sm',
        compact ? 'rounded-xl' : 'rounded-2xl',
        className,
      )}
      role="img"
      aria-label={ariaLabel ?? title}
    >
      <div
        className={cn(
          'flex items-center gap-2 border-b border-border/50 bg-muted/30',
          compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5',
        )}
      >
        <div className={cn('flex', compact ? 'gap-1' : 'gap-1.5')}>
          <span
            className={cn(
              'rounded-full bg-red-400/80',
              compact ? 'size-1.5' : 'size-2.5',
            )}
          />
          <span
            className={cn(
              'rounded-full bg-yellow-400/80',
              compact ? 'size-1.5' : 'size-2.5',
            )}
          />
          <span
            className={cn(
              'rounded-full bg-green-400/80',
              compact ? 'size-1.5' : 'size-2.5',
            )}
          />
        </div>
        <span
          className={cn(
            'ml-1 font-medium text-muted-foreground',
            compact ? 'truncate text-[10px]' : 'text-xs',
          )}
        >
          {title}
        </span>
      </div>
      <div className={cn('flex', !compact && 'min-h-55 sm:min-h-65')}>
        <aside
          className={cn(
            'hidden shrink-0 flex-col border-r border-border/50 bg-muted/20 sm:flex',
            compact ? 'w-9 gap-1 p-1.5' : 'w-14 gap-2 p-2',
          )}
        >
          <SkeletonBar className={cn('w-full', compact ? 'h-5' : 'h-8')} />
          <SkeletonBar
            className={cn('w-full bg-primary/20', compact ? 'h-5' : 'h-8')}
          />
          <SkeletonBar className={cn('w-full', compact ? 'h-5' : 'h-8')} />
          <SkeletonBar className={cn('w-full', compact ? 'h-5' : 'h-8')} />
        </aside>
        <div className={cn('flex-1', compact ? 'p-2.5' : 'p-4 sm:p-5')}>
          {children}
        </div>
      </div>
    </div>
  );
}

const demoStats = [
  { label: 'Consultas', value: '8' },
  { label: 'Retornos pendentes', value: '3' },
  { label: 'Vacinas próximas', value: '4' },
  { label: 'Acompanhamentos enviados', value: '12' },
] as const;

function DashboardContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'font-semibold text-foreground',
            compact ? 'text-[11px]' : 'text-sm',
          )}
        >
          Hoje
        </p>
        <span
          className={cn(
            'rounded-md bg-primary/15 font-medium text-primary',
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'rounded-lg px-2 py-1 text-xs',
          )}
        >
          Demonstração
        </span>
      </div>
      <div className={cn('grid grid-cols-2', compact ? 'gap-1.5' : 'gap-3')}>
        {demoStats.map(({ label, value }) => (
          <div
            key={label}
            className={cn(
              'border border-border/50',
              compact ? 'rounded-lg p-1.5' : 'rounded-xl p-3',
            )}
          >
            <p
              className={cn(
                'text-foreground/65',
                compact ? 'text-[9px] leading-tight' : 'text-xs',
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                'font-bold tabular-nums text-primary',
                compact ? 'mt-0.5 text-base' : 'mt-1 text-2xl',
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'rounded-lg border border-border/50 bg-muted/20',
          compact ? 'p-2' : 'rounded-xl p-3',
        )}
      >
        <p
          className={cn(
            'font-semibold text-foreground',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          Pós-consulta — Nina
        </p>
        <ul
          className={cn(
            'text-foreground/75',
            compact ? 'mt-1 space-y-0.5 text-[9px]' : 'mt-2 space-y-1.5 text-xs',
          )}
        >
          <li className="flex items-center gap-1.5">
            <Check
              className={cn(
                'shrink-0 text-green-600',
                compact ? 'size-2.5' : 'size-3.5',
              )}
            />
            Orientação enviada
          </li>
          <li className="flex items-center gap-1.5">
            <Check
              className={cn(
                'shrink-0 text-green-600',
                compact ? 'size-2.5' : 'size-3.5',
              )}
            />
            Tutor visualizou
          </li>
          <li className="text-foreground/65">Retorno em 14 dias</li>
          <li className="text-foreground/65">Lembrete programado</li>
        </ul>
      </div>
    </div>
  );
}

function TutorContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Cadastro do tutor</p>
      <div className="space-y-2 rounded-xl border border-border/50 p-3">
        <p className="text-xs text-foreground/65">Nome</p>
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
          Ana Silva
        </div>
        <p className="text-xs text-foreground/65">Celular</p>
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
          (11) 99999-0000
        </div>
        <p className="text-xs text-foreground/65">Pet</p>
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
          Nina — Gato
        </div>
      </div>
    </div>
  );
}

function ConsultationContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          N
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Nina</p>
          <p className="text-xs text-foreground/65">Consulta em andamento</p>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 p-3">
        <p className="text-xs font-medium text-foreground/65">Anamnese</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Tutor relata coceira leve. Sem vômitos ou diarreia.
        </p>
      </div>
      <div className="rounded-xl border border-border/50 p-3">
        <p className="text-xs font-medium text-foreground/65">Conduta</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Antipulgas e retorno em 14 dias.
        </p>
      </div>
    </div>
  );
}

function MessageContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground">Pós-consulta</p>
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/20 p-3">
        <p className="text-xs leading-relaxed text-foreground/85">
          Olá, Ana! Seguem as orientações pós-consulta da Nina. Lembre-se de
          administrar o medicamento conforme a receita. Retorno em 14 dias.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-foreground/65">
        <span className="size-2 rounded-full bg-green-500" />
        Pronto para enviar pelo WhatsApp
      </div>
    </div>
  );
}

const variantConfig: Record<
  MockupVariant,
  { title: string; content: (compact: boolean) => React.ReactNode }
> = {
  dashboard: {
    title: 'boxvet. — Dashboard',
    content: (compact) => <DashboardContent compact={compact} />,
  },
  tutor: {
    title: 'boxvet. — Cadastro Tutor',
    content: () => <TutorContent />,
  },
  consultation: {
    title: 'boxvet. — Consulta',
    content: () => <ConsultationContent />,
  },
  message: {
    title: 'boxvet. — Pós-consulta',
    content: () => <MessageContent />,
  },
};

export function DashboardMockup({
  variant = 'dashboard',
  className,
  ariaLabel,
  compact = false,
}: DashboardMockupProps) {
  const config = variantConfig[variant];

  return (
    <MockupShell
      title={config.title}
      className={className}
      ariaLabel={ariaLabel}
      compact={compact}
    >
      {config.content(compact)}
    </MockupShell>
  );
}
