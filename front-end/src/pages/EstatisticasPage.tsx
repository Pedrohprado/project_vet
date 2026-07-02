import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react';
import { BrandPageBackground } from '@/components/brand-page-background';
import { HomeHero } from '@/components/home/home-hero';
import { HomeRecentServices } from '@/components/home/home-recent-services';
import { HomeStatsGrid } from '@/components/home/home-stats-grid';
import { HomeWeekReminders } from '@/components/home/home-week-reminders';
import {
  getOnboardingStepState,
  OnboardingStepCard,
} from '@/components/onboarding/onboarding-step-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { useAuth } from '@/hooks/useAuth';
import { useClinicStats } from '@/hooks/useStats';
import { useWeekReminders } from '@/hooks/useWeekReminders';

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
  const { data: stats, isLoading: isLoadingStats, error: statsError } =
    useClinicStats();
  const {
    data: weekReminders = [],
    isLoading: isLoadingReminders,
    error: remindersError,
  } = useWeekReminders();
  const {
    data: atendimentosData,
    isLoading: isLoadingAtendimentos,
    error: atendimentosError,
  } = useAtendimentos(1, 5);
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
    <div className="relative -mx-4 -mt-4 min-h-full sm:-mx-6">
      <BrandPageBackground variant="absolute" blurHeight="55%" />

      <div className="relative z-10 space-y-6 px-4 pt-4 sm:px-6 sm:pt-6">
        <HomeHero
          userName={user?.name ?? 'Usuário'}
          clinicName={clinic?.name}
          reminderCount={
            isLoadingReminders ? undefined : weekReminders.length
          }
        />

        {isFirstAccess && user && clinic ? (
          <Card className="rounded-2xl border border-border/50 bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle>Bem-vindo ao Box Vet!</CardTitle>
                <CardDescription>
                  Organize tutores, pets, consultas e agendamentos da{' '}
                  {clinic.name} em um só lugar.
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

        <HomeStatsGrid
          stats={stats}
          isLoading={isLoadingStats}
          error={Boolean(statsError)}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HomeWeekReminders
            items={weekReminders}
            isLoading={isLoadingReminders}
            error={Boolean(remindersError)}
          />
          <HomeRecentServices
            items={atendimentosData?.items}
            isLoading={isLoadingAtendimentos}
            error={Boolean(atendimentosError)}
          />
        </div>
      </div>
    </div>
  );
}
