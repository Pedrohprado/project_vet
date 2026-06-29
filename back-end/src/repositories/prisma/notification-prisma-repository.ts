import { prisma } from '../../lib/prisma.js';
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../../generated/prisma/client.js';

export class NotificationPrismaRepository {
  async create(data: {
    clinicId: string;
    tutorId: string;
    petId?: string;
    appointmentId?: string;
    consultationId?: string;
    type: NotificationType;
    channel?: NotificationChannel;
    status?: NotificationStatus;
    recipientName?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    title?: string;
    message: string;
    scheduledAt: Date;
  }) {
    return prisma.notification.create({
      data,
      select: {
        id: true,
        type: true,
        channel: true,
        status: true,
        message: true,
        scheduledAt: true,
        createdAt: true,
      },
    });
  }
}
