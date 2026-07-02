import { apiFetchJson } from '@/api/http';

export type AddressByCep = {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
};

export async function fetchAddressByCep(cep: string): Promise<AddressByCep> {
  const digits = cep.replace(/\D/g, '');

  return apiFetchJson<AddressByCep>(`/address/cep/${digits}`);
}
