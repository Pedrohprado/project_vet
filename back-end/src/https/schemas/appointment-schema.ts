import { z } from 'zod';
import { AppointmentType } from '../../generated/prisma/client.js';

export const createAppointmentSchema = z.object({
  tutorId: z.string().uuid('Tutor inválido'),
  petId: z.string().uuid('Pet inválido'),
  type: z.nativeEnum(AppointmentType),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(30),
  title: z.string().optional(),
  description: z.string().optional(),
  veterinarianId: z.string().uuid().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
