import { z } from 'zod';

export const createPetWeightRecordSchema = z.object({
  weightKg: z.coerce.number().positive('Peso deve ser positivo'),
  consultationId: z.string().uuid('Consulta inválida').optional(),
});

export type CreatePetWeightRecordInput = z.infer<typeof createPetWeightRecordSchema>;
