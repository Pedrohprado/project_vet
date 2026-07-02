import type { PetSpecies } from '../generated/prisma/client.js';
import type { Prisma } from '../generated/prisma/client.js';

type VaccineSeed = {
  name: string;
  manufacturer?: string;
  defaultIntervalDays?: number;
  species?: PetSpecies;
};

export const DEFAULT_VACCINE_CATALOG: VaccineSeed[] = [
  { name: 'V8', defaultIntervalDays: 365, species: 'DOG' },
  { name: 'V10', defaultIntervalDays: 365, species: 'DOG' },
  { name: 'Antirrábica', defaultIntervalDays: 365 },
  { name: 'V3', defaultIntervalDays: 365, species: 'CAT' },
  { name: 'V4', defaultIntervalDays: 365, species: 'CAT' },
  { name: 'V5', defaultIntervalDays: 365, species: 'CAT' },
  { name: 'Giardia', defaultIntervalDays: 365 },
  { name: 'Leishmaniose', defaultIntervalDays: 365, species: 'DOG' },
];

export function buildVaccineCatalogCreateMany(
  clinicId: string,
): Prisma.VaccineCatalogItemCreateManyInput[] {
  return DEFAULT_VACCINE_CATALOG.map((item) => ({
    clinicId,
    name: item.name,
    ...(item.manufacturer ? { manufacturer: item.manufacturer } : {}),
    ...(item.defaultIntervalDays != null
      ? { defaultIntervalDays: item.defaultIntervalDays }
      : {}),
    ...(item.species ? { species: item.species } : {}),
    isActive: true,
  }));
}
