import { Link } from 'react-router';
import {
  Calendar,
  PawPrint,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ClinicStatsSummary } from '@/api/stats';

type StatKey = keyof Pick<
  ClinicStatsSummary,
  'tutors' | 'pets' | 'appointments' | 'consultations'
>;

const statCards: {
  key: StatKey;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
}[] = [
  {
    key: 'tutors',
    label: 'Tutores',
    description: 'Cadastrados na clínica',
    href: '/tutors',
    icon: Users,
    iconClassName: 'bg-sky-700 text-white',
  },
  {
    key: 'pets',
    label: 'Pets',
    description: 'Animais registrados',
    href: '/tutors',
    icon: PawPrint,
    iconClassName: 'bg-amber-500 text-white',
  },
  {
    key: 'appointments',
    label: 'Agendamentos',
    description: 'Ativos no momento',
    href: '/agenda',
    icon: Calendar,
    iconClassName: 'bg-primary text-primary-foreground',
  },
  {
    key: 'consultations',
    label: 'Consultas',
    description: 'Finalizadas',
    href: '/atendimento',
    icon: Stethoscope,
    iconClassName: 'bg-emerald-700 text-white',
  },
];

type HomeStatsGridProps = {
  stats?: ClinicStatsSummary;
  isLoading?: boolean;
  error?: boolean;
};

export function HomeStatsGrid({ stats, isLoading, error }: HomeStatsGridProps) {
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os indicadores.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((item) => (
        <Link
          key={item.key}
          to={item.href}
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full rounded-2xl border border-border/50 bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm transition-colors hover:bg-white">
            <CardContent className="flex items-center gap-3 py-1">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  item.iconClassName,
                )}
              >
                <item.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-14" />
                ) : (
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {stats?.[item.key] ?? 0}
                  </p>
                )}
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
