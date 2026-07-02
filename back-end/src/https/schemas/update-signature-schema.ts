import { z } from 'zod';

export const updateSignatureSchema = z.object({
  signature: z
    .string()
    .min(1, 'Assinatura é obrigatória')
    .regex(/^data:image\/png;base64,/, 'Assinatura deve ser uma imagem PNG'),
});

export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
