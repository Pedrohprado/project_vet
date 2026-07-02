import { z } from 'zod';

export const createConsultationSchema = z.object({
  tutorId: z.string().uuid('Tutor inválido'),
  petId: z.string().uuid('Pet inválido'),
  appointmentId: z.string().uuid().optional(),
});

export const updateConsultationSchema = z.object({
  mainComplaint: z.string().optional(),
  history: z.string().optional(),
  physicalExam: z.string().optional(),
  temperature: z.coerce.number().optional(),
  diagnosis: z.string().optional(),
  conduct: z.string().optional(),
  observations: z.string().optional(),
  needsReturn: z.boolean().optional(),
  returnDate: z.coerce.date().optional(),
  prescriptionDocumentType: z.enum(['SIMPLE', 'SPECIAL_CONTROL']).optional(),
});

export const createPrescriptionSchema = z.object({
  medicineName: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  routeOfAdministration: z.string().optional(),
  pharmacyType: z.enum(['HUMAN', 'VETERINARY']).optional(),
  quantity: z.string().optional(),
});

export const finishConsultationSchema = z.object({
  diagnosis: z.string().optional(),
  conduct: z.string().optional(),
  needsReturn: z.boolean().default(false),
  returnDate: z.coerce.date().optional(),
});

export const listConsultationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type FinishConsultationInput = z.infer<typeof finishConsultationSchema>;
export type ListConsultationsQuery = z.infer<typeof listConsultationsQuerySchema>;
