import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '@/api/appointments';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
