import { env } from '@/env';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${env.VITE_API_URL}${path}`;
  return fetch(url, {
    ...init,
    credentials: init?.credentials ?? 'include',
  });
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    let message = 'Erro inesperado';

    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // ignore parse errors
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
