import { prisma } from '../../lib/prisma.js';
import type { PetSex, PetSpecies } from '../../generated/prisma/client.js';

const petSelect = {
  id: true,
  clinicId: true,
  tutorId: true,
  name: true,
  species: true,
  breed: true,
  sex: true,
  birthDate: true,
  color: true,
  weightKg: true,
  photoUrl: true,
  isCastrated: true,
  microchip: true,
  allergies: true,
  chronicDiseases: true,
  continuousMedications: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class PetPrismaRepository {
  async findById(clinicId: string, id: string) {
    return prisma.pet.findFirst({
      where: { id, clinicId },
      select: {
        ...petSelect,
        tutor: {
          select: { id: true, name: true, phone: true, whatsapp: true },
        },
      },
    });
  }

  async findByIdAndTutor(clinicId: string, id: string, tutorId: string) {
    return prisma.pet.findFirst({
      where: { id, clinicId, tutorId },
      select: petSelect,
    });
  }

  async create(clinicId: string, tutorId: string, data: {
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthDate?: Date;
    color?: string;
    weightKg?: number;
    isCastrated?: boolean;
    microchip?: string;
    allergies?: string;
    chronicDiseases?: string;
    continuousMedications?: string;
    notes?: string;
  }) {
    return prisma.pet.create({
      data: { ...data, clinicId, tutorId },
      select: petSelect,
    });
  }

  async update(clinicId: string, id: string, data: Partial<{
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthDate?: Date;
    color?: string;
    weightKg?: number;
    isCastrated?: boolean;
    microchip?: string;
    allergies?: string;
    chronicDiseases?: string;
    continuousMedications?: string;
    notes?: string;
  }>) {
    return prisma.pet.update({
      where: { id, clinicId },
      data,
      select: petSelect,
    });
  }
}
