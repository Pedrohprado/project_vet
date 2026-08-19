import { z } from 'zod';

export const joinWaitlistSchema = z.object({
  email: z.string().email('E-mail inválido'),
  clinicName: z.string().trim().optional(),
  planInterest: z.string().trim().optional(),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
