import { AppointmentStatus, ConsultationStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export class StatsService {
  async getClinicSummary(clinicId: string) {
    const [
      tutors,
      pets,
      appointments,
      consultations,
      totalConsultations,
      totalAppointments,
    ] = await Promise.all([
      prisma.tutor.count({ where: { clinicId } }),
      prisma.pet.count({ where: { clinicId } }),
      prisma.appointment.count({
        where: {
          clinicId,
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        },
      }),
      prisma.consultation.count({
        where: {
          clinicId,
          status: ConsultationStatus.FINISHED,
        },
      }),
      prisma.consultation.count({ where: { clinicId } }),
      prisma.appointment.count({ where: { clinicId } }),
    ]);

    return {
      tutors,
      pets,
      appointments,
      consultations,
      onboarding: {
        tutorCreated: tutors > 0,
        petRegistered: pets > 0,
        careStarted: totalConsultations > 0 || totalAppointments > 0,
      },
    };
  }
}
