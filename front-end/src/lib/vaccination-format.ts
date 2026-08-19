import { addDays, startOfDay } from 'date-fns';
import { toClinicDate } from '@/lib/clinic-date';
import type { Vaccination, VaccinationStatusKind } from '@/types/vaccination';
import { VACCINATION_STATUS_LABELS } from '@/types/vaccination';

export function getVaccinationStatus(
  vaccination: Pick<Vaccination, 'appliedAt' | 'nextDoseAt'>,
  referenceDate = new Date(),
): VaccinationStatusKind {
  if (!vaccination.appliedAt) {
    return 'IN_PROGRESS';
  }

  if (!vaccination.nextDoseAt) {
    return 'NO_REINFORCEMENT';
  }

  const nextDose = startOfDay(toClinicDate(vaccination.nextDoseAt));
  const today = startOfDay(referenceDate);

  if (nextDose < today) {
    return 'EXPIRED';
  }

  return 'VALID';
}

export function getVaccinationStatusLabel(
  vaccination: Pick<Vaccination, 'appliedAt' | 'nextDoseAt'>,
) {
  return VACCINATION_STATUS_LABELS[getVaccinationStatus(vaccination)];
}

export function suggestNextDoseDate(
  defaultIntervalDays: number | null | undefined,
  fromDate: Date | string = new Date(),
) {
  if (!defaultIntervalDays) {
    return undefined;
  }

  const base =
    typeof fromDate === 'string'
      ? new Date(`${fromDate}T12:00:00`)
      : fromDate;

  if (Number.isNaN(base.getTime())) {
    return undefined;
  }

  return addDays(base, defaultIntervalDays).toISOString();
}

export function formatVaccinationDate(iso: string | null | undefined) {
  if (!iso) {
    return '—';
  }

  return toClinicDate(iso).toLocaleDateString('pt-BR');
}

export function groupLatestVaccinationsByName(vaccinations: Vaccination[]) {
  const applied = vaccinations.filter((item) => item.appliedAt);
  const grouped = new Map<string, Vaccination>();

  for (const vaccination of applied) {
    const key = vaccination.vaccineName.trim().toLowerCase();
    const existing = grouped.get(key);

    if (
      !existing ||
      new Date(vaccination.appliedAt!).getTime() >
        new Date(existing.appliedAt!).getTime()
    ) {
      grouped.set(key, vaccination);
    }
  }

  return [...grouped.values()].sort((a, b) =>
    a.vaccineName.localeCompare(b.vaccineName, 'pt-BR'),
  );
}
