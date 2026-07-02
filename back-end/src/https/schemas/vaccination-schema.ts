import { z } from 'zod';

export const createVaccinationSchema = z.object({
  tutorId: z.string().uuid('Tutor inválido'),
  petId: z.string().uuid('Pet inválido'),
  appointmentId: z.string().uuid().optional(),
});

export const updateVaccinationSchema = z.object({
  vaccineCatalogItemId: z.string().uuid().nullable().optional(),
  vaccineName: z.string().optional(),
  dose: z.string().optional(),
  batch: z.string().optional(),
  manufacturer: z.string().optional(),
  nextDoseAt: z.coerce.date().nullable().optional(),
  notes: z.string().optional(),
});

export const finishVaccinationSchema = z.object({
  vaccineCatalogItemId: z.string().uuid().nullable().optional(),
  vaccineName: z.string().min(1, 'Nome da vacina é obrigatório').optional(),
  dose: z.string().optional(),
  batch: z.string().optional(),
  manufacturer: z.string().optional(),
  nextDoseAt: z.coerce.date().nullable().optional(),
  notes: z.string().optional(),
  appliedAt: z.coerce.date().optional(),
});

export const listVaccinationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dueVaccinationsQuerySchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export type CreateVaccinationInput = z.infer<typeof createVaccinationSchema>;
export type UpdateVaccinationInput = z.infer<typeof updateVaccinationSchema>;
export type FinishVaccinationInput = z.infer<typeof finishVaccinationSchema>;
export type ListVaccinationsQuery = z.infer<typeof listVaccinationsQuerySchema>;
export type DueVaccinationsQuery = z.infer<typeof dueVaccinationsQuerySchema>;
