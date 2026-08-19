import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { CreateIdeaDialog } from '@/components/roadmap/create-idea-dialog';
import { RoadmapColumn } from '@/components/roadmap/roadmap-column';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMoveProductIdea, useProductIdeas } from '@/hooks/useProductIdeas';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { isSuperAdmin } from '@/types/auth';
import {
  PRODUCT_IDEA_COLUMNS,
  type ProductIdea,
  type ProductIdeaStatus,
} from '@/types/product-idea';

const COLUMN_ACCENTS: Record<ProductIdeaStatus, string> = {
  IDEA: 'bg-sky-500',
  TODO: 'bg-zinc-400',
  DOING: 'bg-amber-500',
  DONE: 'bg-emerald-500',
};

export function RoadmapPage() {
  const { user } = useAuth();
  const canMove = isSuperAdmin(user);
  const { data, isLoading, isError } = useProductIdeas();
  const moveIdea = useMoveProductIdea();
  const [createOpen, setCreateOpen] = useState(false);
  const [dragging, setDragging] = useState<ProductIdea | null>(null);

  const items = data?.items ?? [];

  async function handleDrop(
    ideaId: string,
    status: ProductIdeaStatus,
    index: number,
  ) {
    if (!canMove) return;

    const idea = items.find((item) => item.id === ideaId);
    if (!idea) return;

    const sameColumn = idea.status === status;
    const currentIndex = items
      .filter((item) => item.status === status)
      .sort((a, b) => a.position - b.position)
      .findIndex((item) => item.id === ideaId);

    if (sameColumn && (currentIndex === index || currentIndex + 1 === index)) {
      setDragging(null);
      return;
    }

    const nextIndex =
      sameColumn && currentIndex >= 0 && currentIndex < index
        ? index - 1
        : index;

    try {
      await moveIdea.mutateAsync({
        id: ideaId,
        payload: { status, index: Math.max(0, nextIndex) },
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível mover o card',
      );
    } finally {
      setDragging(null);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Roadmap</h1>
          <p className={pageDescriptionClassName}>
            Construímos em público. Envie uma ideia e acompanhe o que está na
            fila, em construção e já entregue.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus />
          Nova ideia
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PRODUCT_IDEA_COLUMNS.map((column) => (
            <Skeleton key={column.status} className="h-[28rem] min-w-[16.5rem] flex-1 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar o roadmap. Tente de novo em instantes.
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PRODUCT_IDEA_COLUMNS.map((column) => (
            <RoadmapColumn
              key={column.status}
              title={column.title}
              hint={column.hint}
              status={column.status}
              accentClassName={COLUMN_ACCENTS[column.status]}
              canMove={canMove}
              draggingId={dragging?.id ?? null}
              ideas={items
                .filter((item) => item.status === column.status)
                .sort((a, b) => a.position - b.position)}
              onDragStart={setDragging}
              onDragEnd={() => setDragging(null)}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : null}

      <CreateIdeaDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
