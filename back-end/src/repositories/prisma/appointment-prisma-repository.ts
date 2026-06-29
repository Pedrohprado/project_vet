import { prisma } from '../../lib/prisma.js';
import type { AppointmentStatus, AppointmentType } from '../../generated/prisma/client.js';

const appointmentSelect = {
  id: true,
  clinicId: true,
  tutorId: true,
  petId: true,
  veterinarianId: true,
  type: true,
  status: true,
  title: true,
  description: true,
  scheduledAt: true,
  durationMinutes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AppointmentPrismaRepository {
  async findById(clinicId: string, id: string) {
    return prisma.appointment.findFirst({
      where: { id, clinicId },
      select: {
        ...appointmentSelect,
        tutor: { select: { id: true, name: true } },
        pet: { select: { id: true, name: true, species: true } },
        veterinarian: { select: { id: true, name: true } },
      },
    });
  }

  async create(clinicId: string, data: {
    tutorId: string;
    petId: string;
    veterinarianId?: string;
    type: AppointmentType;
    status?: AppointmentStatus;
    title?: string;
    description?: string;
    scheduledAt: Date;
    durationMinutes?: number;
  }) {
    return prisma.appointment.create({
      data: { ...data, clinicId },
      select: appointmentSelect,
    });
  }

  async updateStatus(clinicId: string, id: string, status: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id, clinicId },
      data: { status },
      select: appointmentSelect,
    });
  }
}
