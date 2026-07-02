import { z } from 'zod';
import {
  PET_SPECIES_VALUES,
  type CreatePetPayload,
  type Pet,
  type UpdatePetPayload,
} from '@/types/pet';
import type { PetSex, PetSpecies } from '@/types/tutor';

export const petFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.enum(PET_SPECIES_VALUES),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  weightKg: z.string().optional(),
  isCastrated: z.boolean().default(false),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  continuousMedications: z.string().optional(),
  notes: z.string().optional(),
});

export type PetFormData = z.infer<typeof petFormSchema>;

export const emptyPetFormData: PetFormData = {
  name: '',
  species: 'DOG',
  breed: '',
  sex: 'UNKNOWN',
  birthDate: '',
  color: '',
  weightKg: '',
  isCastrated: false,
  microchip: '',
  allergies: '',
  chronicDiseases: '',
  continuousMedications: '',
  notes: '',
};

function optionalField(value: string | undefined) {
  return value?.trim() || undefined;
}

export function petToFormData(pet: Pet): PetFormData {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    sex: pet.sex,
    birthDate: pet.birthDate?.slice(0, 10) ?? '',
    color: pet.color ?? '',
    weightKg: pet.weightKg ?? '',
    isCastrated: pet.isCastrated,
    microchip: pet.microchip ?? '',
    allergies: pet.allergies ?? '',
    chronicDiseases: pet.chronicDiseases ?? '',
    continuousMedications: pet.continuousMedications ?? '',
    notes: pet.notes ?? '',
  };
}

export function formDataToPetPayload(data: PetFormData): CreatePetPayload {
  return {
    name: data.name,
    species: data.species as PetSpecies,
    sex: data.sex as PetSex,
    isCastrated: data.isCastrated,
    breed: optionalField(data.breed),
    birthDate: optionalField(data.birthDate),
    color: optionalField(data.color),
    weightKg: data.weightKg ? Number(data.weightKg) : undefined,
    microchip: optionalField(data.microchip),
    allergies: optionalField(data.allergies),
    chronicDiseases: optionalField(data.chronicDiseases),
    continuousMedications: optionalField(data.continuousMedications),
    notes: optionalField(data.notes),
  };
}

export function formDataToUpdatePetPayload(data: PetFormData): UpdatePetPayload {
  return formDataToPetPayload(data);
}
