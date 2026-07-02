import { useQuery } from '@tanstack/react-query';
import { getPetTimeline } from '@/api/pet-timeline';

export const PET_TIMELINE_QUERY_KEY = 'pet-timeline';

export function usePetTimeline(petId: string | undefined) {
  return useQuery({
    queryKey: [PET_TIMELINE_QUERY_KEY, petId],
    queryFn: () => getPetTimeline(petId!),
    enabled: Boolean(petId),
  });
}
