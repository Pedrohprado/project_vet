import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductIdea } from '@/types/product-idea';

type RoadmapCardProps = {
  idea: ProductIdea;
  canMove: boolean;
  isDragging: boolean;
  onDragStart: (idea: ProductIdea) => void;
  onDragEnd: () => void;
  onDropOnCard: (draggedId: string) => void;
};

export function RoadmapCard({
  idea,
  canMove,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropOnCard,
}: RoadmapCardProps) {
  return (
    <article
      draggable={canMove}
      onDragStart={(event) => {
        if (!canMove) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', idea.id);
        onDragStart(idea);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!canMove) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        if (!canMove) return;
        event.preventDefault();
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        onDropOnCard(draggedId);
      }}
      className={cn(
        'rounded-xl border border-border bg-background p-3',
        canMove && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        {canMove ? (
          <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm leading-snug font-medium">{idea.title}</h3>
          {idea.description ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {idea.description}
            </p>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            {idea.author.name} ·{' '}
            {format(new Date(idea.createdAt), "d MMM yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
    </article>
  );
}
