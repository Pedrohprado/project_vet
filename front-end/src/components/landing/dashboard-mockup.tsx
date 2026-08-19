import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type MockupVariant = 'dashboard' | 'tutor' | 'consultation' | 'message';

type DashboardMockupProps = {
  variant?: MockupVariant;
  className?: string;
  ariaLabel?: string;
};

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted', className)} />;
}

function MockupShell({
  title,
  children,
  className,
  ariaLabel,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm',
        className,
      )}
      role="img"
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-yellow-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </div>
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="flex min-h-55 sm:min-h-65">
        <aside className="hidden w-14 shrink-0 flex-col gap-2 border-r border-border/50 bg-muted/20 p-2 sm:flex">
          <SkeletonBar className="h-8 w-full" />
          <SkeletonBar className="h-8 w-full bg-primary/20" />
          <SkeletonBar className="h-8 w-full" />
          <SkeletonBar className="h-8 w-full" />
        </aside>
        <div className="flex-1 p-4 sm:p-5">{children}</div>
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

function DashboardContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Hoje</p>
        <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
          Demonstração
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {demoStats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border/50 p-3">
            <p className="text-xs text-foreground/65">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
        <p className="text-xs font-semibold text-foreground">
          Pós-consulta — Nina
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground/75">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-green-600" />
            Orientação enviada
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-green-600" />
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
  { title: string; content: React.ReactNode }
> = {
  dashboard: { title: 'boxvet. — Dashboard', content: <DashboardContent /> },
  tutor: { title: 'boxvet. — Cadastro Tutor', content: <TutorContent /> },
  consultation: {
    title: 'boxvet. — Consulta',
    content: <ConsultationContent />,
  },
  message: {
    title: 'boxvet. — Pós-consulta',
    content: <MessageContent />,
  },
};

export function DashboardMockup({
  variant = 'dashboard',
  className,
  ariaLabel,
}: DashboardMockupProps) {
  const config = variantConfig[variant];

  return (
    <MockupShell
      title={config.title}
      className={className}
      ariaLabel={ariaLabel}
    >
      {config.content}
    </MockupShell>
  );
}
