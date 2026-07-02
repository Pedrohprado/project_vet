import { z } from 'zod';

export const updateProfileSchema = z.object({
  crmv: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
