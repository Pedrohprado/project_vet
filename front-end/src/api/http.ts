import { env } from '@/env';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

const AUTH_PATHS_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/clinics',
];

function shouldAttemptRefresh(path: string) {
  return !AUTH_PATHS_WITHOUT_REFRESH.some((authPath) => path.includes(authPath));
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const url = `${env.VITE_API_URL}/auth/refresh`;
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${env.VITE_API_URL}${path}`;
  let response = await fetch(url, {
    ...init,
    credentials: init?.credentials ?? 'include',
  });

  if (
    response.status === 401 &&
    shouldAttemptRefresh(path) &&
    init?.credentials !== 'omit'
  ) {
    const refreshed = await tryRefreshSession();

    if (refreshed) {
      response = await fetch(url, {
        ...init,
        credentials: init?.credentials ?? 'include',
      });
    }
  }

  return response;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
