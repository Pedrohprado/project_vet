import z from 'zod';

export const listPlatformClinicsQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listPlatformTutorsQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateClinicStatusSchema = z.object({
  isActive: z.boolean(),
});

export type ListPlatformClinicsQuery = z.infer<typeof listPlatformClinicsQuerySchema>;
export type ListPlatformTutorsQuery = z.infer<typeof listPlatformTutorsQuerySchema>;
export type UpdateClinicStatusInput = z.infer<typeof updateClinicStatusSchema>;
