import { prisma } from '../../lib/prisma.js';
import {
  AppointmentStatus,
  AppointmentType,
  type AppointmentStatus as AppointmentStatusType,
  type AppointmentType as AppointmentTypeEnum,
} from '../../generated/prisma/client.js';

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
  sourceConsultationId: true,
  sourceVaccinationId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const pendingStatuses: AppointmentStatusType[] = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
];

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
    type: AppointmentTypeEnum;
    status?: AppointmentStatusType;
    title?: string;
    description?: string;
    scheduledAt: Date;
    durationMinutes?: number;
    sourceConsultationId?: string;
    sourceVaccinationId?: string;
  }) {
    return prisma.appointment.create({
      data: { ...data, clinicId },
      select: appointmentSelect,
    });
  }

  async updateStatus(clinicId: string, id: string, status: AppointmentStatusType) {
    return prisma.appointment.update({
      where: { id, clinicId },
      data: { status },
      select: appointmentSelect,
    });
  }

  async updateScheduledAt(clinicId: string, id: string, scheduledAt: Date) {
    return prisma.appointment.update({
      where: { id, clinicId },
      data: { scheduledAt },
      select: appointmentSelect,
    });
  }

  async updateSchedule(
    clinicId: string,
    id: string,
    data: { scheduledAt: Date; durationMinutes?: number },
  ) {
    return prisma.appointment.update({
      where: { id, clinicId },
      data: {
        scheduledAt: data.scheduledAt,
        ...(data.durationMinutes !== undefined
          ? { durationMinutes: data.durationMinutes }
          : {}),
      },
      select: appointmentSelect,
    });
  }

  async findPendingReturnByConsultation(clinicId: string, sourceConsultationId: string) {
    return prisma.appointment.findFirst({
      where: {
        clinicId,
        sourceConsultationId,
        type: AppointmentType.RETURN,
        status: { in: pendingStatuses },
      },
      select: appointmentSelect,
    });
  }

  async findPendingNextDoseByVaccination(clinicId: string, sourceVaccinationId: string) {
    return prisma.appointment.findFirst({
      where: {
        clinicId,
        sourceVaccinationId,
        type: AppointmentType.VACCINATION,
        status: { in: pendingStatuses },
      },
      select: appointmentSelect,
    });
  }

  async completePendingReturnsForConsultation(clinicId: string, sourceConsultationId: string) {
    return prisma.appointment.updateMany({
      where: {
        clinicId,
        sourceConsultationId,
        type: AppointmentType.RETURN,
        status: { in: pendingStatuses },
      },
      data: { status: AppointmentStatus.COMPLETED },
    });
  }

  async cancelPendingReturnsForConsultation(
    clinicId: string,
    sourceConsultationId: string,
  ) {
    return prisma.appointment.updateMany({
      where: {
        clinicId,
        sourceConsultationId,
        type: AppointmentType.RETURN,
        status: { in: pendingStatuses },
      },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }

  async findManyInRange(clinicId: string, start: Date, end: Date) {
    return prisma.appointment.findMany({
      where: {
        clinicId,
        scheduledAt: { gte: start, lte: end },
      },
      select: {
        ...appointmentSelect,
        tutor: { select: { id: true, name: true } },
        pet: { select: { id: true, name: true, species: true } },
        veterinarian: { select: { id: true, name: true } },
        consultation: { select: { id: true, status: true } },
        vaccination: { select: { id: true, appliedAt: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
