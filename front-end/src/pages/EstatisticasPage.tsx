import { BrandPageBackground } from '@/components/brand-page-background';
import { HomeHero } from '@/components/home/home-hero';
import { HomeRecentServices } from '@/components/home/home-recent-services';
import { HomeStatsGrid } from '@/components/home/home-stats-grid';
import { HomeWeekReminders } from '@/components/home/home-week-reminders';
import { OnboardingWelcomeDialog } from '@/components/onboarding/onboarding-welcome-dialog';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { useAuth } from '@/hooks/useAuth';
import { useFunnelTrack } from '@/hooks/useFunnelTrack';
import { useClinicStats } from '@/hooks/useStats';
import { useWeekReminders } from '@/hooks/useWeekReminders';

export function EstatisticasPage() {
  useFunnelTrack('ENTERED');
  const { user, clinic } = useAuth();
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
  } = useAtendimentos(1, 10);

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

        <HomeStatsGrid
          stats={stats}
          isLoading={isLoadingStats}
          error={Boolean(statsError)}
        />
      </div>

      <OnboardingWelcomeDialog />
    </div>
  );
}
