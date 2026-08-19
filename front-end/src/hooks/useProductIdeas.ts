import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProductIdea, listProductIdeas, moveProductIdea } from '@/api/product-ideas';
import type {
  CreateProductIdeaPayload,
  MoveProductIdeaPayload,
  ProductIdea,
} from '@/types/product-idea';

export const PRODUCT_IDEAS_QUERY_KEY = 'product-ideas';

export function useProductIdeas() {
  return useQuery({
    queryKey: [PRODUCT_IDEAS_QUERY_KEY],
    queryFn: listProductIdeas,
  });
}

export function useCreateProductIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductIdeaPayload) => createProductIdea(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PRODUCT_IDEAS_QUERY_KEY] });
    },
  });
}

export function useMoveProductIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: MoveProductIdeaPayload;
    }) => moveProductIdea(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: [PRODUCT_IDEAS_QUERY_KEY] });
      const previous = queryClient.getQueryData<{ items: ProductIdea[] }>([
        PRODUCT_IDEAS_QUERY_KEY,
      ]);

      queryClient.setQueryData<{ items: ProductIdea[] }>(
        [PRODUCT_IDEAS_QUERY_KEY],
        (current) => {
          if (!current) return current;

          const moving = current.items.find((item) => item.id === id);
          if (!moving) return current;

          const others = current.items.filter((item) => item.id !== id);
          const targetColumn = others
            .filter((item) => item.status === payload.status)
            .sort((a, b) => a.position - b.position);

          const index = Math.max(0, Math.min(payload.index, targetColumn.length));
          const nextTarget = [
            ...targetColumn.slice(0, index),
            { ...moving, status: payload.status, position: index },
            ...targetColumn.slice(index),
          ].map((item, position) => ({ ...item, position }));

          const rest = others.filter((item) => item.status !== payload.status);
          return { items: [...rest, ...nextTarget] };
        },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([PRODUCT_IDEAS_QUERY_KEY], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [PRODUCT_IDEAS_QUERY_KEY] });
    },
  });
}
