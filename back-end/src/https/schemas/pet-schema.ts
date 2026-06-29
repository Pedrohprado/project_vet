import { z } from 'zod';
import { PetSex, PetSpecies } from '../../generated/prisma/client.js';

export const createPetSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.nativeEnum(PetSpecies),
  breed: z.string().optional(),
  sex: z.nativeEnum(PetSex).default(PetSex.UNKNOWN),
  birthDate: z.coerce.date().optional(),
  color: z.string().optional(),
  weightKg: z.coerce.number().positive().optional(),
  isCastrated: z.boolean().default(false),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  continuousMedications: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePetSchema = createPetSchema.partial();

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
