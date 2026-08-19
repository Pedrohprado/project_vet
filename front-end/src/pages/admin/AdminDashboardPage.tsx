import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Building2,
  ChevronRight,
  Heart,
  MessageSquare,
  MessagesSquare,
  PawPrint,
  Stethoscope,
  UserCheck,
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePlatformClinics,
  usePlatformStats,
  usePlatformVeterinarianRelations,
  usePlatformVeterinarians,
} from '@/hooks/usePlatform';
import { cn } from '@/lib/utils';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { PlatformClinic, PlatformStats, PlatformVeterinarian } from '@/api/platform';
import { USER_ROLE_LABELS } from '@/types/auth';

type StatCard = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
  getValue: (stats: PlatformStats) => number;
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
    key: 'veterinariansActive',
    label: 'Veterinários ativos',
    description: 'Profissionais com acesso habilitado',
    icon: UserCheck,
    cardClassName: 'border-violet-500/20 bg-violet-500/5',
    iconClassName: 'text-violet-600 dark:text-violet-400',
    getValue: (stats) => stats.veterinariansActive,
  },
  {
    key: 'veterinariansRecentLogin',
    label: 'Logins recentes',
    description: 'Veterinários ativos nos últimos 30 dias',
    icon: Users,
    cardClassName: 'border-indigo-500/20 bg-indigo-500/5',
    iconClassName: 'text-indigo-600 dark:text-indigo-400',
    getValue: (stats) => stats.veterinariansRecentLogin,
  },
  {
    key: 'consultationsFinished',
    label: 'Consultas finalizadas',
    description: 'Atendimentos concluídos na plataforma',
    icon: Stethoscope,
    cardClassName: 'border-teal-500/20 bg-teal-500/5',
    iconClassName: 'text-teal-600 dark:text-teal-400',
    getValue: (stats) => stats.consultationsFinished,
  },
  {
    key: 'communityCases',
    label: 'Casos na comunidade',
    description: 'Publicações clínicas compartilhadas',
    icon: MessagesSquare,
    cardClassName: 'border-orange-500/20 bg-orange-500/5',
    iconClassName: 'text-orange-600 dark:text-orange-400',
    getValue: (stats) => stats.communityCases,
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

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function formatVetLabel(name: string, crmv: string | null) {
  return crmv ? `${name} (CRMV ${crmv})` : name;
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

function VeterinarianRow({ veterinarian }: { veterinarian: PlatformVeterinarian }) {
  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/50">
      <td className="px-4 py-3 text-sm font-medium">{veterinarian.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {veterinarian.clinicName ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {veterinarian.crmv ?? '—'}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline">
          {USER_ROLE_LABELS[veterinarian.role]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={veterinarian.isActive ? 'default' : 'secondary'}>
          {veterinarian.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatDateTime(veterinarian.lastLoginAt)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {veterinarian.consultationsCount}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {veterinarian.communityCasesCount}
      </td>
    </tr>
  );
}

export function AdminDashboardPage() {
  const [vetSearch, setVetSearch] = useState('');
  const [debouncedVetSearch, setDebouncedVetSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedVetSearch(vetSearch.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [vetSearch]);

  const { data: stats, isLoading, error } = usePlatformStats();
  const {
    data: recentClinics,
    isLoading: isLoadingClinics,
    error: clinicsError,
  } = usePlatformClinics(undefined, 'all', { limit: 5 });
  const {
    data: veterinarians,
    isLoading: isLoadingVets,
    error: vetsError,
  } = usePlatformVeterinarians(debouncedVetSearch || undefined, { limit: 10 });
  const {
    data: relations,
    isLoading: isLoadingRelations,
    error: relationsError,
  } = usePlatformVeterinarianRelations();

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Visão geral</h1>
        <p className={pageDescriptionClassName}>
          Indicadores globais da plataforma e relações entre veterinários.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os indicadores.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ranking de atividade</CardTitle>
            <CardDescription>
              Veterinários mais engajados na comunidade (casos, comentários e curtidas).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRelations ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : relationsError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar o ranking.
              </p>
            ) : !relations?.ranking.length ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há atividade registrada na comunidade.
              </p>
            ) : (
              <div className="space-y-3">
                {relations.ranking.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">
                        {index + 1}. {formatVetLabel(item.name, item.crmv)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.clinicName ?? 'Clínica não informada'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{item.activityScore} pts</p>
                      <p>{item.casesCount} casos · {item.commentsCount} coment.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relações na comunidade</CardTitle>
            <CardDescription>
              Pares de veterinários que mais interagiram entre si.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRelations ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : relationsError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar as relações.
              </p>
            ) : !relations?.interactionPairs.length ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há interações registradas entre veterinários.
              </p>
            ) : (
              <div className="space-y-3">
                {relations.interactionPairs.map((pair) => (
                  <div
                    key={`${pair.userA.id}-${pair.userB.id}`}
                    className="rounded-xl border bg-muted/20 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">
                          {formatVetLabel(pair.userA.name, pair.userA.crmv)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pair.userA.clinicName ?? '—'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        <Heart className="size-3.5" />
                        <MessageSquare className="size-3.5" />
                      </div>
                      <div className="min-w-0 space-y-1 text-right">
                        <p className="text-sm font-medium">
                          {formatVetLabel(pair.userB.name, pair.userB.crmv)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pair.userB.clinicName ?? '—'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {pair.interactionsCount}{' '}
                      {pair.interactionsCount === 1 ? 'interação' : 'interações'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Veterinários</CardTitle>
            <CardDescription>
              Diretório com clínica, CRMV, último acesso e volume de atendimento.
            </CardDescription>
          </div>
          <Input
            value={vetSearch}
            onChange={(event) => setVetSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail, CRMV ou clínica"
            className="w-full sm:max-w-xs"
          />
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {isLoadingVets && (
            <div className="space-y-2 px-4 py-6 sm:px-0">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {vetsError && (
            <p className="px-4 py-8 text-sm text-destructive sm:px-0">
              Não foi possível carregar os veterinários.
            </p>
          )}

          {!isLoadingVets && !vetsError && veterinarians?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-0">
              Nenhum veterinário encontrado.
            </p>
          )}

          {!isLoadingVets && !vetsError && veterinarians && veterinarians.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Clínica</th>
                    <th className="px-4 py-3 font-medium">CRMV</th>
                    <th className="px-4 py-3 font-medium">Papel</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Último login</th>
                    <th className="px-4 py-3 font-medium">Consultas</th>
                    <th className="px-4 py-3 font-medium">Casos</th>
                  </tr>
                </thead>
                <tbody>
                  {veterinarians.items.map((veterinarian) => (
                    <VeterinarianRow
                      key={veterinarian.id}
                      veterinarian={veterinarian}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
