import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

function BrandingPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground transition-all duration-500 md:flex',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10">
          <PawPrint className="size-5" />
        </div>
        <span className="text-lg font-semibold">Project Vet</span>
      </div>
      <div className="space-y-2">
        <blockquote className="text-lg font-medium leading-relaxed">
          Gestão veterinária simples e eficiente para sua clínica.
        </blockquote>
        <p className="text-sm text-primary-foreground/80">
          Atendimentos, tutores, pets e consultas em um só lugar.
        </p>
      </div>
    </div>
  );
}

export function AuthSplitLayout({
  mode,
  children,
}: {
  mode: 'login' | 'register';
  children: React.ReactNode;
}) {
  const isLogin = mode === 'login';

  return (
    <div className="grid min-h-svh grid-cols-1 transition-all duration-500 md:grid-cols-2">
      <div
        className={cn(
          'flex items-center justify-center p-6 transition-all duration-500 md:p-10',
          isLogin ? 'order-1 md:order-1' : 'order-1 md:order-2',
        )}
      >
        {children}
      </div>
      <BrandingPanel
        className={cn(isLogin ? 'order-2 md:order-2' : 'order-2 md:order-1')}
      />
    </div>
  );
}
