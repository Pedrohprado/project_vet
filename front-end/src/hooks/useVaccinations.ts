import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ATENDIMENTOS_QUERY_KEY } from '@/hooks/useAtendimentos';
import { CALENDAR_EVENTS_QUERY_KEY } from '@/hooks/useCalendarEvents';
import { PET_TIMELINE_QUERY_KEY } from '@/hooks/usePetTimeline';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import {
  createVaccination,
  deleteVaccination,
  finishVaccination,
  getOpenVaccinationByPet,
  getVaccination,
  listVaccinationsByPet,
  updateVaccination,
} from '@/api/vaccinations';

export const PET_VACCINATIONS_QUERY_KEY = 'pet-vaccinations';

export function useOpenVaccination(petId: string | undefined) {
  return useQuery({
    queryKey: ['vaccination', 'open', petId],
    queryFn: () => getOpenVaccinationByPet(petId!),
    enabled: Boolean(petId),
  });
}

export function usePetVaccinations(petId: string | undefined) {
  return useQuery({
    queryKey: [PET_VACCINATIONS_QUERY_KEY, petId],
    queryFn: () => listVaccinationsByPet(petId!),
    enabled: Boolean(petId),
  });
}

export function useVaccination(id: string | undefined) {
  return useQuery({
    queryKey: ['vaccination', id],
    queryFn: () => getVaccination(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVaccination,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ['vaccination', 'open', variables.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_VACCINATIONS_QUERY_KEY, variables.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, variables.petId],
      });
    },
  });
}

export function useUpdateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateVaccination>[1];
    }) => updateVaccination(id, data),
    onSuccess: (vaccination, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['vaccination', id] });
      void queryClient.invalidateQueries({
        queryKey: [PET_VACCINATIONS_QUERY_KEY, vaccination.petId],
      });
    },
  });
}

export function useFinishVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof finishVaccination>[1];
    }) => finishVaccination(id, data),
    onSuccess: (vaccination, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['vaccination', id] });
      void queryClient.invalidateQueries({
        queryKey: ['vaccination', 'open', vaccination.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_VACCINATIONS_QUERY_KEY, vaccination.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, vaccination.petId],
      });
      sessionStorage.removeItem(`vaccination-step-${id}`);
    },
  });
}

export function useDeleteVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; petId?: string }) => deleteVaccination(id),
    onSuccess: (_, { id, petId }) => {
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['vaccination'] });
      void queryClient.invalidateQueries({ queryKey: [PET_VACCINATIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [PET_TIMELINE_QUERY_KEY] });

      if (petId) {
        void queryClient.invalidateQueries({
          queryKey: ['vaccination', 'open', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: [PET_VACCINATIONS_QUERY_KEY, petId],
        });
        void queryClient.invalidateQueries({
          queryKey: [PET_TIMELINE_QUERY_KEY, petId],
        });
      }

      sessionStorage.removeItem(`vaccination-step-${id}`);
    },
  });
}
