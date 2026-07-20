import { cn } from '@/lib/utils';

type MockupVariant = 'dashboard' | 'tutor' | 'consultation' | 'message';

type DashboardMockupProps = {
  variant?: MockupVariant;
  className?: string;
};

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted', className)} />;
}

function MockupShell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-white shadow-xl shadow-black/4',
        className,
      )}
    >
      <div className='flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5'>
        <div className='flex gap-1.5'>
          <span className='size-2.5 rounded-full bg-red-400/80' />
          <span className='size-2.5 rounded-full bg-yellow-400/80' />
          <span className='size-2.5 rounded-full bg-green-400/80' />
        </div>
        <span className='ml-2 text-xs font-medium text-muted-foreground'>
          {title}
        </span>
      </div>
      <div className='flex min-h-55 sm:min-h-65'>
        <aside className='hidden w-14 shrink-0 flex-col gap-2 border-r border-border/50 bg-muted/20 p-2 sm:flex'>
          <SkeletonBar className='h-8 w-full' />
          <SkeletonBar className='h-8 w-full bg-primary/20' />
          <SkeletonBar className='h-8 w-full' />
          <SkeletonBar className='h-8 w-full' />
        </aside>
        <div className='flex-1 p-4 sm:p-5'>{children}</div>
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <SkeletonBar className='h-5 w-32' />
        <SkeletonBar className='h-8 w-24 rounded-lg bg-primary/30' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='rounded-xl border border-border/50 p-3'>
            <SkeletonBar className='h-3 w-16' />
            <SkeletonBar className='mt-2 h-6 w-12 bg-primary/25' />
          </div>
        ))}
      </div>
      <SkeletonBar className='h-24 w-full rounded-xl' />
    </div>
  );
}

function TutorContent() {
  return (
    <div className='space-y-3'>
      <SkeletonBar className='h-5 w-40' />
      <div className='space-y-2 rounded-xl border border-border/50 p-3'>
        <SkeletonBar className='h-3 w-20' />
        <SkeletonBar className='h-9 w-full rounded-lg' />
        <SkeletonBar className='h-3 w-16' />
        <SkeletonBar className='h-9 w-full rounded-lg' />
        <SkeletonBar className='h-3 w-24' />
        <SkeletonBar className='h-9 w-full rounded-lg' />
      </div>
      <SkeletonBar className='h-9 w-full rounded-xl bg-primary/30' />
    </div>
  );
}

function ConsultationContent() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <SkeletonBar className='size-10 rounded-full bg-primary/20' />
        <div className='flex-1'>
          <SkeletonBar className='h-4 w-28' />
          <SkeletonBar className='mt-1 h-3 w-20' />
        </div>
      </div>
      <div className='rounded-xl border border-border/50 p-3'>
        <SkeletonBar className='h-3 w-24' />
        <SkeletonBar className='mt-2 h-16 w-full' />
      </div>
      <div className='rounded-xl border border-border/50 p-3'>
        <SkeletonBar className='h-3 w-16' />
        <SkeletonBar className='mt-2 h-12 w-full' />
      </div>
    </div>
  );
}

function MessageContent() {
  return (
    <div className='flex flex-col gap-3'>
      <SkeletonBar className='h-4 w-36' />
      <div className='ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/20 p-3'>
        <p className='text-xs leading-relaxed text-foreground/80'>
          Olá! Seguem as orientações pós-consulta do Thor. Lembre-se de
          administrar o medicamento conforme a receita. Qualquer dúvida, estamos
          à disposição!
        </p>
      </div>
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <span className='size-2 rounded-full bg-green-500' />
        Mensagem enviada automaticamente
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
}: DashboardMockupProps) {
  const config = variantConfig[variant];

  return (
    <MockupShell title={config.title} className={className}>
      {config.content}
    </MockupShell>
  );
}
