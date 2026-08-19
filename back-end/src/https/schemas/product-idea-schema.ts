import { z } from 'zod';

export const productIdeaStatusEnum = z.enum(['IDEA', 'TODO', 'DOING', 'DONE']);

export const createProductIdeaSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(120),
  description: z.string().trim().max(2_000).optional().nullable(),
});

export const moveProductIdeaSchema = z.object({
  status: productIdeaStatusEnum,
  index: z.number().int().min(0),
});

export type CreateProductIdeaInput = z.infer<typeof createProductIdeaSchema>;
export type MoveProductIdeaInput = z.infer<typeof moveProductIdeaSchema>;
