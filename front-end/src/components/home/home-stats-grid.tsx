import {
  Calendar,
  PawPrint,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
}[] = [
  {
    key: 'tutors',
    label: 'Tutores',
    description: 'Cadastrados na clínica',
    icon: Users,
    cardClassName: 'border-primary/20 bg-primary/5',
    iconClassName: 'text-primary',
  },
  {
    key: 'pets',
    label: 'Pets',
    description: 'Animais registrados',
    icon: PawPrint,
    cardClassName: 'border-emerald-500/20 bg-emerald-500/5',
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'appointments',
    label: 'Agendamentos',
    description: 'Ativos no momento',
    icon: Calendar,
    cardClassName: 'border-sky-500/20 bg-sky-500/5',
    iconClassName: 'text-sky-600 dark:text-sky-400',
  },
  {
    key: 'consultations',
    label: 'Consultas',
    description: 'Finalizadas',
    icon: Stethoscope,
    cardClassName: 'border-violet-500/20 bg-violet-500/5',
    iconClassName: 'text-violet-600 dark:text-violet-400',
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
        <Card
          key={item.key}
          className={cn(
            'rounded-2xl border bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm',
            item.cardClassName,
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            <item.icon className={cn('size-4', item.iconClassName)} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-semibold tracking-tight">
                {stats?.[item.key] ?? 0}
              </p>
            )}
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
