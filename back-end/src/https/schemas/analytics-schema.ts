import { z } from 'zod';

export const FUNNEL_PATHS_BY_STEP = {
  ENTRADA: ['/', '/login', '/register'],
  CHECKOUT: ['/assinatura', '/assinatura/pagamento'],
  ENTERED: ['/estatisticas'],
} as const;

export type FunnelStepValue = keyof typeof FUNNEL_PATHS_BY_STEP;

const allowedPaths = [
  ...FUNNEL_PATHS_BY_STEP.ENTRADA,
  ...FUNNEL_PATHS_BY_STEP.CHECKOUT,
  ...FUNNEL_PATHS_BY_STEP.ENTERED,
] as const;

export const trackFunnelEventSchema = z
  .object({
    step: z.enum(['ENTRADA', 'CHECKOUT', 'ENTERED']),
    path: z.enum(allowedPaths),
    sessionId: z.string().trim().min(1).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    const allowedForStep = FUNNEL_PATHS_BY_STEP[data.step] as readonly string[];
    if (!allowedForStep.includes(data.path)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Path inválido para o step informado',
        path: ['path'],
      });
    }
  });

export type TrackFunnelEventInput = z.infer<typeof trackFunnelEventSchema>;
