import { z } from 'zod';
import { onlyDigits } from '../../lib/normalize.js';

export const registerClinicSchema = z.object({
  clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
  document: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((value) => onlyDigits(value).length === 11, 'CPF inválido'),
  phone: z
    .string()
    .min(1, 'Celular é obrigatório')
    .refine((value) => {
      const digits = onlyDigits(value);
      return digits.length === 10 || digits.length === 11;
    }, 'Celular inválido'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
});

export type RegisterClinicInput = z.infer<typeof registerClinicSchema>;
