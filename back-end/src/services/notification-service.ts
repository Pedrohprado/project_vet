import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../generated/prisma/client.js';
import { pickDefined } from '../lib/pick-defined.js';
import { NotificationPrismaRepository } from '../repositories/prisma/notification-prisma-repository.js';

const notificationRepository = new NotificationPrismaRepository();

export class NotificationService {
  async createPostConsultation(data: {
    clinicId: string;
    tutorId: string;
    petId: string;
    consultationId: string;
    tutorName: string;
    recipientPhone?: string | null;
    recipientEmail?: string | null;
    petName: string;
    diagnosis?: string | null;
    conduct?: string | null;
    returnDate?: Date | null;
  }) {
    const parts = [
      `Olá ${data.tutorName}! A consulta do(a) ${data.petName} foi finalizada.`,
    ];

    if (data.diagnosis) {
      parts.push(`Diagnóstico: ${data.diagnosis}`);
    }

    if (data.conduct) {
      parts.push(`Conduta: ${data.conduct}`);
    }

    if (data.returnDate) {
      const dateStr = data.returnDate.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
      parts.push(`Retorno agendado para: ${dateStr}`);
    }

    return notificationRepository.create({
      clinicId: data.clinicId,
      tutorId: data.tutorId,
      petId: data.petId,
      consultationId: data.consultationId,
      type: NotificationType.POST_CONSULTATION,
      channel: NotificationChannel.WHATSAPP,
      status: NotificationStatus.PENDING,
      recipientName: data.tutorName,
      ...pickDefined({
        recipientPhone: data.recipientPhone ?? undefined,
        recipientEmail: data.recipientEmail ?? undefined,
      }),
      title: 'Pós-consulta',
      message: parts.join('\n\n'),
      scheduledAt: new Date(),
    });
  }

  async createVaccineReminder(data: {
    clinicId: string;
    tutorId: string;
    petId: string;
    vaccinationId: string;
    tutorName: string;
    recipientPhone?: string | null;
    recipientEmail?: string | null;
    petName: string;
    vaccineName: string;
    nextDoseAt: Date;
  }) {
    const dateStr = data.nextDoseAt.toLocaleDateString('pt-BR');
    const scheduledAt = new Date(data.nextDoseAt);
    scheduledAt.setHours(9, 0, 0, 0);

    return notificationRepository.create({
      clinicId: data.clinicId,
      tutorId: data.tutorId,
      petId: data.petId,
      vaccinationId: data.vaccinationId,
      type: NotificationType.VACCINE_REMINDER,
      channel: NotificationChannel.WHATSAPP,
      status: NotificationStatus.PENDING,
      recipientName: data.tutorName,
      ...pickDefined({
        recipientPhone: data.recipientPhone ?? undefined,
        recipientEmail: data.recipientEmail ?? undefined,
      }),
      title: 'Lembrete de vacina',
      message: `Olá ${data.tutorName}! A vacina ${data.vaccineName} do(a) ${data.petName} vence em ${dateStr}. Entre em contato para agendar.`,
      scheduledAt,
    });
  }

  async cancelPendingVaccineReminders(vaccinationId: string) {
    return notificationRepository.cancelPendingVaccineReminders(vaccinationId);
  }
}
