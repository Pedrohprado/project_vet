import type { AppointmentStatus, AppointmentType } from '../generated/prisma/client.js';
import { PetPrismaRepository } from '../repositories/prisma/pet-prisma-repository.js';
import { TutorPrismaRepository } from '../repositories/prisma/tutor-prisma-repository.js';
import { pickDefined } from '../lib/pick-defined.js';
import { HttpError } from './erros/http-error.js';
import type { CreatePetInput, UpdatePetInput } from '../https/schemas/pet-schema.js';
import type { PetTimelineEvent } from '../types/pet-timeline.js';

const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consulta',
  VACCINATION: 'Vacinação',
  EXAM: 'Exame',
  PROCEDURE: 'Procedimento',
  RETURN: 'Retorno',
};

const CONSULTATION_STATUS_TITLES: Record<string, string> = {
  OPEN: 'Consulta em andamento',
  FINISHED: 'Consulta finalizada',
  CANCELLED: 'Consulta cancelada',
};

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

  async getTimeline(tenantId: string, petId: string): Promise<PetTimelineEvent[]> {
    const pet = await this.getById(tenantId, petId);
    const { consultations, appointments, vaccinations } =
      await petRepository.findTimelineByPet(tenantId, petId);

    const events: PetTimelineEvent[] = [
      {
        id: `registration-${pet.id}`,
        kind: 'REGISTRATION',
        occurredAt: pet.createdAt.toISOString(),
        title: 'Pet cadastrado',
        description: null,
        veterinarianName: null,
      },
    ];

    for (const consultation of consultations) {
      const description = [consultation.mainComplaint, consultation.diagnosis]
        .filter(Boolean)
        .join(' · ') || null;

      events.push({
        id: `consultation-${consultation.id}`,
        kind: 'CONSULTATION',
        occurredAt: (consultation.finishedAt ?? consultation.startedAt).toISOString(),
        title: CONSULTATION_STATUS_TITLES[consultation.status] ?? 'Consulta',
        description,
        status: consultation.status,
        veterinarianName: consultation.veterinarian.name,
        linkTo: { type: 'consultation', id: consultation.id },
      });
    }

    const upcomingStatuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED'];

    for (const appointment of appointments) {
      const hasConsultation = appointment.consultation !== null;
      const hasVaccination = appointment.vaccination !== null;
      const isUpcoming = upcomingStatuses.includes(appointment.status);

      if ((hasConsultation || hasVaccination) && !isUpcoming) {
        continue;
      }

      const typeLabel = APPOINTMENT_TYPE_LABELS[appointment.type];
      const title = appointment.title?.trim()
        ? appointment.title
        : `${typeLabel} agendada`;

      events.push({
        id: `appointment-${appointment.id}`,
        kind: 'APPOINTMENT',
        occurredAt: appointment.scheduledAt.toISOString(),
        title,
        description: appointment.description,
        status: appointment.status,
        veterinarianName: appointment.veterinarian?.name ?? null,
        linkTo: { type: 'appointment', id: appointment.id },
      });
    }

    for (const vaccination of vaccinations) {
      const description = [vaccination.dose, vaccination.notes]
        .filter(Boolean)
        .join(' · ') || null;

      let status: string | undefined;
      if (!vaccination.appliedAt) {
        status = 'IN_PROGRESS';
      } else if (!vaccination.nextDoseAt) {
        status = 'NO_REINFORCEMENT';
      } else {
        const nextDose = new Date(vaccination.nextDoseAt);
        nextDose.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        status = nextDose < today ? 'EXPIRED' : 'VALID';
      }

      events.push({
        id: `vaccination-${vaccination.id}`,
        kind: 'VACCINATION',
        occurredAt: (vaccination.appliedAt ?? vaccination.createdAt).toISOString(),
        title: vaccination.appliedAt
          ? `Vacinação — ${vaccination.vaccineName}`
          : `Vacinação em andamento — ${vaccination.vaccineName || 'Pendente'}`,
        description,
        status,
        veterinarianName: vaccination.veterinarian?.name ?? null,
        linkTo: { type: 'vaccination', id: vaccination.id },
      });
    }

    events.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    return events;
  }

  async validateOwnership(tenantId: string, petId: string, tutorId: string) {
    const pet = await petRepository.findByIdAndTutor(tenantId, petId, tutorId);

    if (!pet) {
      throw new HttpError('Pet não pertence a este tutor', 404);
    }

    return pet;
  }
}
