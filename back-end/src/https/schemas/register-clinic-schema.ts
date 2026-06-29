import { z } from 'zod';

export const registerClinicSchema = z.object({
  clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
  document: z.string().min(1, 'CPF é obrigatório'),
  phone: z.string().min(1, 'Celular é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
});

export type RegisterClinicInput = z.infer<typeof registerClinicSchema>;
