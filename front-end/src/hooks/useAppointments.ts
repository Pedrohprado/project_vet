import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '@/api/appointments';
import { CALENDAR_EVENTS_QUERY_KEY } from '@/hooks/useCalendarEvents';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import { PET_TIMELINE_QUERY_KEY } from '@/hooks/usePetTimeline';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, variables.petId],
      });
    },
  });
}
