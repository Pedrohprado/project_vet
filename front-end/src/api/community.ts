import { apiFetchJson } from '@/api/http';
import type {
  CommunityCase,
  CommunityCaseComment,
  CommunityCaseListResponse,
  CreateCommunityCasePayload,
  UpdateCommunityCasePayload,
} from '@/types/community';

export async function listCommunityCases(
  options: {
    page?: number;
    limit?: number;
    q?: string;
    species?: string;
    sex?: string;
  } = {},
): Promise<CommunityCaseListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.q?.trim()) {
    params.set('q', options.q.trim());
  }
  if (options.species) {
    params.set('species', options.species);
  }
  if (options.sex) {
    params.set('sex', options.sex);
  }

  return apiFetchJson<CommunityCaseListResponse>(`/community/cases?${params}`);
}

export async function getCommunityCase(id: string): Promise<CommunityCase> {
  return apiFetchJson<CommunityCase>(`/community/cases/${id}`);
}

export async function createCommunityCase(
  payload: CreateCommunityCasePayload,
): Promise<CommunityCase> {
  return apiFetchJson<CommunityCase>('/community/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateCommunityCase(
  id: string,
  payload: UpdateCommunityCasePayload,
): Promise<CommunityCase> {
  return apiFetchJson<CommunityCase>(`/community/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteCommunityCase(id: string): Promise<void> {
  await apiFetchJson<void>(`/community/cases/${id}`, {
    method: 'DELETE',
  });
}

export async function likeCommunityCase(id: string): Promise<CommunityCase> {
  return apiFetchJson<CommunityCase>(`/community/cases/${id}/likes`, {
    method: 'POST',
  });
}

export async function unlikeCommunityCase(id: string): Promise<CommunityCase> {
  return apiFetchJson<CommunityCase>(`/community/cases/${id}/likes`, {
    method: 'DELETE',
  });
}

export async function listCommunityCaseComments(
  caseId: string,
): Promise<CommunityCaseComment[]> {
  return apiFetchJson<CommunityCaseComment[]>(
    `/community/cases/${caseId}/comments`,
  );
}

export async function createCommunityCaseComment(
  caseId: string,
  content: string,
): Promise<CommunityCaseComment> {
  return apiFetchJson<CommunityCaseComment>(
    `/community/cases/${caseId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
  );
}

export async function deleteCommunityCaseComment(
  caseId: string,
  commentId: string,
): Promise<void> {
  await apiFetchJson<void>(
    `/community/cases/${caseId}/comments/${commentId}`,
    { method: 'DELETE' },
  );
}
