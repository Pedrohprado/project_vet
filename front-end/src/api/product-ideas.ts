import { apiFetchJson } from '@/api/http';
import type {
  CreateProductIdeaPayload,
  MoveProductIdeaPayload,
  ProductIdea,
  ProductIdeaListResponse,
} from '@/types/product-idea';

export async function listProductIdeas(): Promise<ProductIdeaListResponse> {
  return apiFetchJson<ProductIdeaListResponse>('/product-ideas');
}

export async function createProductIdea(
  payload: CreateProductIdeaPayload,
): Promise<ProductIdea> {
  return apiFetchJson<ProductIdea>('/product-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function moveProductIdea(
  id: string,
  payload: MoveProductIdeaPayload,
): Promise<ProductIdea> {
  return apiFetchJson<ProductIdea>(`/product-ideas/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
