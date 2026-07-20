import { PET_SEX_LABELS, PET_SPECIES_LABELS, PET_SPECIES_VALUES } from '@/types/pet';
import type { PetSex } from '@/types/tutor';

export type PetSelectItem = {
  value: string;
  label: string;
};

export const PET_SPECIES_SELECT_ITEMS: PetSelectItem[] = PET_SPECIES_VALUES.map(
  (value) => ({
    value,
    label: PET_SPECIES_LABELS[value],
  }),
);

export const PET_SEX_SELECT_ITEMS: PetSelectItem[] = (
  Object.entries(PET_SEX_LABELS) as [PetSex, string][]
).map(([value, label]) => ({ value, label }));
