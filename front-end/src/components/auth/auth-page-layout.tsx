import {
  Calendar,
  ClipboardList,
  Heart,
  PawPrint,
  Pill,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
} from 'lucide-react';
import { BIRD_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

const ecosystemBadges = [
  {
    icon: Stethoscope,
    label: 'Consultas',
    className: 'left-[7%] top-[11%] -rotate-3',
    duration: '5.5s',
    delay: '0s',
  },
  {
    icon: Users,
    label: 'Tutores',
    className: 'left-[20%] top-[36%] rotate-2',
    duration: '6.8s',
    delay: '0.8s',
  },
  {
    icon: PawPrint,
    label: 'Pets',
    className: 'left-[4%] top-[61%] -rotate-1',
    duration: '7.2s',
    delay: '1.4s',
  },
  {
    icon: Syringe,
    label: 'Vacinas',
    className: 'left-[15%] top-[79%] rotate-3',
    duration: '6.2s',
    delay: '2.1s',
  },
  {
    icon: ClipboardList,
    label: 'Prontuário',
    className: 'right-[11%] top-[15%] rotate-2',
    duration: '6.5s',
    delay: '0.4s',
  },
  {
    icon: Calendar,
    label: 'Agendamento',
    className: 'right-[5%] top-[44%] -rotate-2',
    duration: '7.5s',
    delay: '1.1s',
  },
  {
    icon: Pill,
    label: 'Receitas',
    className: 'right-[19%] top-[57%] rotate-1',
    duration: '5.8s',
    delay: '1.8s',
  },
  {
    icon: Heart,
    label: 'Atendimento',
    className: 'right-[8%] top-[76%] -rotate-3',
    duration: '6.9s',
    delay: '2.5s',
  },
  {
    icon: Sparkles,
    label: 'IA',
    className: 'left-[11%] top-[50%] -rotate-2',
    duration: '7.1s',
    delay: '0.6s',
  },
] as const;

function EcosystemBadge({
  icon: Icon,
  label,
  className,
  duration,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
  duration: string;
  delay: string;
}) {
  return (
    <div className={cn('absolute', className)}>
      <div
        className='auth-float flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur-sm'
        style={
          {
            '--float-duration': duration,
            '--float-delay': delay,
          } as React.CSSProperties
        }
      >
        <Icon className='size-3.5 text-primary' />
        {label}
      </div>
    </div>
  );
}

type AuthPageLayoutProps = {
  children: React.ReactNode;
  isRegister?: boolean;
  subtitle: string;
};

export function AuthPageLayout({
  children,
  isRegister = false,
  subtitle,
}: AuthPageLayoutProps) {
  return (
    <div className='relative flex min-h-svh items-center justify-center overflow-hidden bg-white p-4 sm:p-6'>
      <div
        className='auth-grid-bg pointer-events-none absolute inset-0'
        aria-hidden
      />
      <div
        className='auth-yellow-blur pointer-events-none absolute inset-x-0 bottom-0 h-[55%]'
        aria-hidden
      />

      <div
        className='pointer-events-none absolute inset-0 hidden lg:block'
        aria-hidden
      >
        {ecosystemBadges.map((badge) => (
          <EcosystemBadge
            key={badge.label}
            icon={badge.icon}
            label={badge.label}
            className={badge.className}
            duration={badge.duration}
            delay={badge.delay}
          />
        ))}
      </div>

      <div
        className={cn(
          'relative z-10 w-full',
          isRegister ? 'max-w-lg' : 'max-w-md',
        )}
      >
        <img
          src={BIRD_SRC}
          alt=''
          aria-hidden
          className='pointer-events-none absolute top-0 right-6 z-20 h-14 w-auto translate-y-[-58%] object-contain sm:right-10 sm:h-16'
        />
        <div className='rounded-2xl border border-border/50 bg-white p-6 shadow-xl shadow-black/4 sm:p-8'>
          <header className='mb-6 text-center sm:mb-8'>
            <p className='text-sm text-muted-foreground'>
              {isRegister ? 'Crie sua conta na' : 'Bem vindo'}
            </p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-primary sm:text-4xl'>
              boxvet.
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
              {subtitle}
            </p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
