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
      const dateStr = data.returnDate.toLocaleDateString('pt-BR');
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
}
