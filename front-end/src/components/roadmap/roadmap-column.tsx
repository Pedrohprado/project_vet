import { Plus } from 'lucide-react';
import { RoadmapCard } from '@/components/roadmap/roadmap-card';
import { cn } from '@/lib/utils';
import type { ProductIdea, ProductIdeaStatus } from '@/types/product-idea';

type RoadmapColumnProps = {
  title: string;
  hint: string;
  status: ProductIdeaStatus;
  ideas: ProductIdea[];
  canMove: boolean;
  draggingId: string | null;
  accentClassName: string;
  onDragStart: (idea: ProductIdea) => void;
  onDragEnd: () => void;
  onDrop: (ideaId: string, status: ProductIdeaStatus, index: number) => void;
};

export function RoadmapColumn({
  title,
  hint,
  status,
  ideas,
  canMove,
  draggingId,
  accentClassName,
  onDragStart,
  onDragEnd,
  onDrop,
}: RoadmapColumnProps) {
  return (
    <section
      onDragOver={(event) => {
        if (!canMove) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        if (!canMove) return;
        event.preventDefault();
        const ideaId = event.dataTransfer.getData('text/plain');
        if (!ideaId) return;
        onDrop(ideaId, status, ideas.length);
      }}
      className="flex min-h-[28rem] min-w-[16.5rem] flex-1 flex-col rounded-2xl border border-border bg-muted/40 p-3"
    >
      <header className="mb-3 flex items-start justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('size-2.5 rounded-full', accentClassName)} />
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {ideas.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2">
        {ideas.map((idea, index) => (
          <RoadmapCard
            key={idea.id}
            idea={idea}
            canMove={canMove}
            isDragging={draggingId === idea.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDropOnCard={(ideaId) => onDrop(ideaId, status, index)}
          />
        ))}

        {ideas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
            <Plus className="mb-2 size-4 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              {canMove ? 'Solte um card aqui' : 'Nenhuma ideia nesta coluna'}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
