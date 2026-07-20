import { z } from 'zod';

const petSpeciesEnum = z.enum([
  'DOG',
  'CAT',
  'BIRD',
  'RABBIT',
  'RODENT',
  'FERRET',
  'REPTILE',
  'FISH',
  'OTHER',
]);

const petSexEnum = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);

export const listCommunityCasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(200).optional(),
  species: petSpeciesEnum.optional(),
  sex: petSexEnum.optional(),
});

export const createCommunityCaseSchema = z.object({
  consultationId: z.string().uuid('Consulta inválida'),
  title: z.string().trim().min(1, 'Título é obrigatório').max(200),
  authorNote: z.string().trim().max(5_000).optional().nullable(),
});

export const updateCommunityCaseSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(200),
  authorNote: z.string().trim().max(5_000).optional().nullable(),
});

export const createCommunityCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comentário é obrigatório').max(2_000),
});

export type ListCommunityCasesQuery = z.infer<typeof listCommunityCasesQuerySchema>;
export type CreateCommunityCaseInput = z.infer<typeof createCommunityCaseSchema>;
export type UpdateCommunityCaseInput = z.infer<typeof updateCommunityCaseSchema>;
export type CreateCommunityCommentInput = z.infer<typeof createCommunityCommentSchema>;

export { petSpeciesEnum, petSexEnum };
