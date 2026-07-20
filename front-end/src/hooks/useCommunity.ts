import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCommunityCase,
  createCommunityCaseComment,
  deleteCommunityCase,
  deleteCommunityCaseComment,
  getCommunityCase,
  likeCommunityCase,
  listCommunityCaseComments,
  listCommunityCases,
  unlikeCommunityCase,
  updateCommunityCase,
} from '@/api/community';
import type {
  CreateCommunityCasePayload,
  UpdateCommunityCasePayload,
} from '@/types/community';

export const COMMUNITY_CASES_QUERY_KEY = 'community-cases';

export function useCommunityCases(
  page = 1,
  limit = 20,
  filters: { q?: string; species?: string; sex?: string } = {},
) {
  return useQuery({
    queryKey: [COMMUNITY_CASES_QUERY_KEY, page, limit, filters],
    queryFn: () =>
      listCommunityCases({
        page,
        limit,
        q: filters.q,
        species: filters.species,
        sex: filters.sex,
      }),
  });
}

export function useCommunityCase(id: string | undefined) {
  return useQuery({
    queryKey: [COMMUNITY_CASES_QUERY_KEY, id],
    queryFn: () => getCommunityCase(id!),
    enabled: Boolean(id),
  });
}

export function useCommunityCaseComments(caseId: string | undefined) {
  return useQuery({
    queryKey: [COMMUNITY_CASES_QUERY_KEY, caseId, 'comments'],
    queryFn: () => listCommunityCaseComments(caseId!),
    enabled: Boolean(caseId),
  });
}

export function useCreateCommunityCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommunityCasePayload) =>
      createCommunityCase(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: ['consultation'] });
    },
  });
}

export function useUpdateCommunityCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCommunityCasePayload;
    }) => updateCommunityCase(id, payload),
    onSuccess: (communityCase) => {
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
      queryClient.setQueryData(
        [COMMUNITY_CASES_QUERY_KEY, communityCase.id],
        communityCase,
      );
    },
  });
}

export function useDeleteCommunityCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCommunityCase(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: ['consultation'] });
    },
  });
}

export function useLikeCommunityCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => likeCommunityCase(id),
    onSuccess: (communityCase) => {
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
      queryClient.setQueryData(
        [COMMUNITY_CASES_QUERY_KEY, communityCase.id],
        communityCase,
      );
    },
  });
}

export function useUnlikeCommunityCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unlikeCommunityCase(id),
    onSuccess: (communityCase) => {
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
      queryClient.setQueryData(
        [COMMUNITY_CASES_QUERY_KEY, communityCase.id],
        communityCase,
      );
    },
  });
}

export function useCreateCommunityCaseComment(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      createCommunityCaseComment(caseId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [COMMUNITY_CASES_QUERY_KEY, caseId, 'comments'],
      });
      void queryClient.invalidateQueries({
        queryKey: [COMMUNITY_CASES_QUERY_KEY, caseId],
      });
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
    },
  });
}

export function useDeleteCommunityCaseComment(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteCommunityCaseComment(caseId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [COMMUNITY_CASES_QUERY_KEY, caseId, 'comments'],
      });
      void queryClient.invalidateQueries({
        queryKey: [COMMUNITY_CASES_QUERY_KEY, caseId],
      });
      void queryClient.invalidateQueries({ queryKey: [COMMUNITY_CASES_QUERY_KEY] });
    },
  });
}
