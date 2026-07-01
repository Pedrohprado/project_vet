import { apiFetchJson } from '@/api/http';
import type { PetTimelineEvent } from '@/types/pet-timeline';

export async function getPetTimeline(petId: string): Promise<PetTimelineEvent[]> {
  return apiFetchJson<PetTimelineEvent[]>(`/pets/${petId}/timeline`);
}
