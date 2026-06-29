import { z } from 'zod';

export const createTutorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTutorSchema = createTutorSchema.partial();

export const listTutorsQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTutorInput = z.infer<typeof createTutorSchema>;
export type UpdateTutorInput = z.infer<typeof updateTutorSchema>;
export type ListTutorsQuery = z.infer<typeof listTutorsQuerySchema>;
