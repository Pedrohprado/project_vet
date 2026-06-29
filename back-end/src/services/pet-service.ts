import { PetPrismaRepository } from '../repositories/prisma/pet-prisma-repository.js';
import { TutorPrismaRepository } from '../repositories/prisma/tutor-prisma-repository.js';
import { pickDefined } from '../lib/pick-defined.js';
import { HttpError } from './erros/http-error.js';
import type { CreatePetInput, UpdatePetInput } from '../https/schemas/pet-schema.js';

const petRepository = new PetPrismaRepository();
const tutorRepository = new TutorPrismaRepository();

export class PetService {
  async getById(tenantId: string, id: string) {
    const pet = await petRepository.findById(tenantId, id);

    if (!pet) {
      throw new HttpError('Pet não encontrado', 404);
    }

    return pet;
  }

  async create(tenantId: string, tutorId: string, input: CreatePetInput) {
    const tutor = await tutorRepository.findById(tenantId, tutorId);

    if (!tutor) {
      throw new HttpError('Tutor não encontrado', 404);
    }

    return petRepository.create(tenantId, tutorId, {
      name: input.name,
      species: input.species,
      sex: input.sex,
      isCastrated: input.isCastrated,
      ...pickDefined({
        breed: input.breed,
        birthDate: input.birthDate,
        color: input.color,
        weightKg: input.weightKg,
        microchip: input.microchip,
        allergies: input.allergies,
        chronicDiseases: input.chronicDiseases,
        continuousMedications: input.continuousMedications,
        notes: input.notes,
      }),
    });
  }

  async update(tenantId: string, id: string, input: UpdatePetInput) {
    await this.getById(tenantId, id);

    return petRepository.update(tenantId, id, pickDefined({
      name: input.name,
      species: input.species,
      breed: input.breed,
      sex: input.sex,
      birthDate: input.birthDate,
      color: input.color,
      weightKg: input.weightKg,
      isCastrated: input.isCastrated,
      microchip: input.microchip,
      allergies: input.allergies,
      chronicDiseases: input.chronicDiseases,
      continuousMedications: input.continuousMedications,
      notes: input.notes,
    }));
  }

  async validateOwnership(tenantId: string, petId: string, tutorId: string) {
    const pet = await petRepository.findByIdAndTutor(tenantId, petId, tutorId);

    if (!pet) {
      throw new HttpError('Pet não pertence a este tutor', 404);
    }

    return pet;
  }
}
