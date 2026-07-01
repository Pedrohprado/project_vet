import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Calendar,
  PawPrint,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getOnboardingStepState,
  OnboardingStepCard,
} from '@/components/onboarding/onboarding-step-card';
import { useAuth } from '@/hooks/useAuth';
import { useClinicStats } from '@/hooks/useStats';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

const statCards = [
  {
    key: 'tutors' as const,
    label: 'Tutores',
    description: 'Cadastrados na clínica',
    icon: Users,
  },
  {
    key: 'pets' as const,
    label: 'Pets',
    description: 'Animais registrados',
    icon: PawPrint,
  },
  {
    key: 'appointments' as const,
    label: 'Agendamentos',
    description: 'Ativos no momento',
    icon: Calendar,
  },
  {
    key: 'consultations' as const,
    label: 'Consultas',
    description: 'Finalizadas',
    icon: Stethoscope,
  },
];

const firstSteps = [
  {
    step: 1,
    text: 'Cadastre seu primeiro tutor.',
    linkLabel: 'Novo tutor',
    href: '/tutors/new',
    icon: UserPlus,
  },
  {
    step: 2,
    text: 'Adicione os pets vinculados a cada tutor.',
    linkLabel: 'Ver tutores',
    href: '/tutors',
    icon: Users,
  },
  {
    step: 3,
    text: 'Inicie atendimentos, consultas e agendamentos.',
    linkLabel: 'Ir para atendimento',
    href: '/atendimento',
    icon: Stethoscope,
  },
];

export function EstatisticasPage() {
  const { user, clinic, isFirstAccess, completeWelcome } = useAuth();
  const { data: stats, isLoading, error } = useClinicStats();
  const [isDismissing, setIsDismissing] = useState(false);

  const onboarding = stats?.onboarding ?? {
    tutorCreated: false,
    petRegistered: false,
    careStarted: false,
  };

  const allStepsComplete =
    onboarding.tutorCreated &&
    onboarding.petRegistered &&
    onboarding.careStarted;

  async function handleDismissWelcome() {
    setIsDismissing(true);

    try {
      await completeWelcome();
    } catch (err) {
      console.error('Failed to dismiss welcome', err);
    } finally {
      setIsDismissing(false);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Estatísticas</h1>
        <p className={pageDescriptionClassName}>
          {clinic
            ? `Visão geral da ${clinic.name}`
            : 'Resumo da sua clínica veterinária'}
        </p>
      </div>

      {isFirstAccess && user && clinic ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Bem-vindo, {user.name}!</CardTitle>
              <CardDescription>
                O Box Vet ajuda você a organizar tutores, pets, consultas,
                agendamentos e o histórico clínico da {clinic.name}.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => void handleDismissWelcome()}
              disabled={isDismissing}
              aria-label="Fechar orientações"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">Por onde começar</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {firstSteps.map((item) => (
                <OnboardingStepCard
                  key={item.step}
                  {...item}
                  state={getOnboardingStepState(item.step, onboarding)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDismissWelcome()}
              disabled={isDismissing}
            >
              {isDismissing
                ? 'Salvando...'
                : allStepsComplete
                  ? 'Concluir onboarding'
                  : 'Entendi, começar a usar'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar as estatísticas.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statCards.map((item) => (
            <Card key={item.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <item.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {isLoading ? '—' : (stats?.[item.key] ?? 0)}
                </p>
                <CardDescription className="mt-1">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
