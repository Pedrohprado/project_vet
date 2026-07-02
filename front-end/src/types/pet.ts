import type { PetSex, PetSpecies } from '@/types/tutor';

export type Pet = {
  id: string;
  clinicId: string;
  tutorId: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  sex: PetSex;
  birthDate: string | null;
  color: string | null;
  weightKg: string | null;
  photoUrl: string | null;
  isCastrated: boolean;
  microchip: string | null;
  allergies: string | null;
  chronicDiseases: string | null;
  continuousMedications: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tutor?: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  };
};

export type CreatePetPayload = {
  name: string;
  species: PetSpecies;
  breed?: string;
  sex?: PetSex;
  birthDate?: string;
  color?: string;
  weightKg?: number;
  isCastrated?: boolean;
  microchip?: string;
  allergies?: string;
  chronicDiseases?: string;
  continuousMedications?: string;
  notes?: string;
};

export type UpdatePetPayload = Partial<CreatePetPayload>;

export const PET_SPECIES_VALUES = [
  'DOG',
  'CAT',
  'BIRD',
  'RABBIT',
  'RODENT',
  'FERRET',
  'REPTILE',
  'FISH',
  'OTHER',
] as const satisfies readonly PetSpecies[];

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  BIRD: 'Ave',
  RABBIT: 'Coelho',
  RODENT: 'Roedor',
  FERRET: 'Furão',
  REPTILE: 'Réptil',
  FISH: 'Peixe',
  OTHER: 'Outro',
};

export const PET_SEX_LABELS: Record<PetSex, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
  UNKNOWN: 'Não informado',
};
