import { useQuery } from '@tanstack/react-query';
import { listConsultations } from '@/api/consultations';
import { listVaccinations } from '@/api/vaccinations';
import type { AtendimentoListItem } from '@/types/atendimento';

export const ATENDIMENTOS_QUERY_KEY = 'atendimentos';

function mapToAtendimentoList(
  consultations: Awaited<ReturnType<typeof listConsultations>>,
  vaccinations: Awaited<ReturnType<typeof listVaccinations>>,
  limit: number,
): AtendimentoListItem[] {
  const consultationItems: AtendimentoListItem[] = consultations.items.map(
    (item) => ({
      id: item.id,
      kind: 'CONSULTATION',
      occurredAt: item.startedAt,
      status: item.status,
      tutor: item.tutor,
      pet: item.pet,
      veterinarian: item.veterinarian,
    }),
  );

  const vaccinationItems: AtendimentoListItem[] = vaccinations.items.map(
    (item) => ({
      id: item.id,
      kind: 'VACCINATION',
      occurredAt: item.appliedAt ?? item.createdAt,
      status: item.appliedAt ? 'FINISHED' : 'OPEN',
      tutor: item.pet.tutor,
      pet: {
        id: item.pet.id,
        name: item.pet.name,
        species: item.pet.species,
      },
      veterinarian: item.veterinarian,
      vaccineName: item.vaccineName || undefined,
    }),
  );

  return [...consultationItems, ...vaccinationItems]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}

export function useAtendimentos(page = 1, limit = 20) {
  return useQuery({
    queryKey: [ATENDIMENTOS_QUERY_KEY, page, limit],
    queryFn: async () => {
      const [consultations, vaccinations] = await Promise.all([
        listConsultations({ page, limit }),
        listVaccinations({ page, limit }),
      ]);

      const items = mapToAtendimentoList(consultations, vaccinations, limit);

      return {
        items,
        total: consultations.total + vaccinations.total,
        page,
        limit,
      };
    },
  });
}
