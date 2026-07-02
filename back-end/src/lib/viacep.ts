import { HttpError } from '../services/erros/http-error.js';

const VIACEP_TIMEOUT_MS = 5000;

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export type AddressByCep = {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
};

function normalizeCepDigits(cep: string) {
  return cep.replace(/\D/g, '');
}

function formatZipCode(digits: string) {
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function parseCepParam(cep: string) {
  const digits = normalizeCepDigits(cep);

  if (digits.length !== 8) {
    throw new HttpError('CEP inválido', 400);
  }

  return digits;
}

export async function fetchAddressByCep(cep: string): Promise<AddressByCep> {
  const digits = parseCepParam(cep);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VIACEP_TIMEOUT_MS);

  try {
    const data = await fetchViaCepJson(digits, controller.signal);

    if (data.erro) {
      throw new HttpError('CEP não encontrado', 404);
    }

    const address: AddressByCep = {
      zipCode: data.cep ?? formatZipCode(digits),
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };

    const complement = data.complemento?.trim();
    if (complement) {
      address.complement = complement;
    }

    return address;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError('Não foi possível consultar o CEP', 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchViaCepJson(digits: string, signal: AbortSignal) {
  const urls = [
    `https://viacep.com.br/ws/${digits}/json/`,
    `http://viacep.com.br/ws/${digits}/json/`,
  ];

  let lastError: unknown;

  for (const url of urls) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new HttpError('Não foi possível consultar o CEP', 502);
      }

      return (await response.json()) as ViaCepResponse;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
