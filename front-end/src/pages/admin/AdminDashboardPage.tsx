import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {
  Building2,
  PawPrint,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformClinics, usePlatformStats } from '@/hooks/usePlatform';
import { cn } from '@/lib/utils';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { PlatformClinic } from '@/api/platform';

type StatCard = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
  getValue: (stats: {
    clinicsActive: number;
    clinicsInactive: number;
    tutors: number;
    pets: number;
  }) => number;
};

const statCards: StatCard[] = [
  {
    key: 'clinicsActive',
    label: 'Clínicas ativas',
    description: 'Clientes com acesso liberado',
    icon: Building2,
    cardClassName: 'border-primary/20 bg-primary/5',
    iconClassName: 'text-primary',
    getValue: (stats) => stats.clinicsActive,
  },
  {
    key: 'tutors',
    label: 'Tutores',
    description: 'Donos de pets em toda a plataforma',
    icon: Users,
    cardClassName: 'border-sky-500/20 bg-sky-500/5',
    iconClassName: 'text-sky-600 dark:text-sky-400',
    getValue: (stats) => stats.tutors,
  },
  {
    key: 'pets',
    label: 'Pets',
    description: 'Animais cadastrados na plataforma',
    icon: PawPrint,
    cardClassName: 'border-emerald-500/20 bg-emerald-500/5',
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
    getValue: (stats) => stats.pets,
  },
  {
    key: 'clinicsInactive',
    label: 'Clínicas inativas',
    description: 'Clientes desativados',
    icon: UserX,
    cardClassName: 'border-amber-500/20 bg-amber-500/5',
    iconClassName: 'text-amber-600 dark:text-amber-400',
    getValue: (stats) => stats.clinicsInactive,
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function planLabel(plan: PlatformClinic['plan']) {
  const labels = {
    FREE: 'Gratuito',
    STARTER: 'Starter',
    PRO: 'Pro',
  } as const;

  return labels[plan];
}

function RecentClinicRow({ clinic }: { clinic: PlatformClinic }) {
  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/50">
      <td className="px-4 py-3 text-sm font-medium">{clinic.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {clinic.email ?? clinic.phone ?? '—'}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline">{planLabel(clinic.plan)}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={clinic.isActive ? 'default' : 'secondary'}>
          {clinic.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(clinic.createdAt)}
      </td>
    </tr>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, error } = usePlatformStats();
  const {
    data: recentClinics,
    isLoading: isLoadingClinics,
    error: clinicsError,
  } = usePlatformClinics(undefined, 'all', { limit: 5 });

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Visão geral</h1>
        <p className={pageDescriptionClassName}>
          Indicadores globais da plataforma veterinária.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os indicadores.
        </p>
      ) : (
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
                    {stats ? item.getValue(stats) : 0}
                  </p>
                )}
                <CardDescription className="mt-1">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle>Últimas clínicas registradas</CardTitle>
            <CardDescription>
              Clientes que se cadastraram recentemente na plataforma.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link to="/admin/clinicas">
              Ver todas
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {isLoadingClinics && (
            <div className="space-y-2 px-4 py-6 sm:px-0">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {clinicsError && (
            <p className="px-4 py-8 text-sm text-destructive sm:px-0">
              Não foi possível carregar as clínicas recentes.
            </p>
          )}

          {!isLoadingClinics && !clinicsError && recentClinics?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-0">
              Nenhuma clínica cadastrada ainda.
            </p>
          )}

          {!isLoadingClinics && !clinicsError && recentClinics && recentClinics.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Plano</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClinics.items.map((clinic) => (
                    <RecentClinicRow key={clinic.id} clinic={clinic} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
