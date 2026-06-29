import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z
    .string({ required_error: 'VITE_API_URL é obrigatório' })
    .min(1, 'VITE_API_URL é obrigatório')
    .refine(
      (value) => {
        if (value.startsWith('/')) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          'VITE_API_URL deve ser uma URL absoluta (http://localhost:3333/api) ou um caminho relativo iniciando com "/" (ex.: /api)',
      },
    ),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error('Invalid environment variables!', _env.error.format());
  throw new Error('Invalid environment variables!');
}

export const env = _env.data;
