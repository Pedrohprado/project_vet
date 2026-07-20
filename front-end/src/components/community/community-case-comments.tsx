import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateCommunityCaseComment,
  useDeleteCommunityCaseComment,
} from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { getAuthorInitials } from '@/lib/pet-icons';
import type { CommunityCaseComment } from '@/types/community';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function CommunityCaseComments({
  caseId,
  comments,
  isLoading,
}: {
  caseId: string;
  comments: CommunityCaseComment[] | undefined;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const createComment = useCreateCommunityCaseComment(caseId);
  const deleteComment = useDeleteCommunityCaseComment(caseId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      await createComment.mutateAsync(trimmed);
      setContent('');
      toast.success('Comentário publicado');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao comentar',
      );
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment.mutateAsync(commentId);
      toast.success('Comentário removido');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao remover comentário',
      );
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">
        Comentários
      </h2>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Compartilhe sua experiência ou dúvida sobre o caso..."
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || createComment.isPending}
          >
            Comentar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando comentários...</p>
      ) : !comments?.length ? (
        <p className="text-sm text-muted-foreground">
          Seja o primeiro a comentar neste caso.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border bg-card p-3 text-sm"
            >
              <div className="flex gap-3">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {getAuthorInitials(comment.author.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {comment.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    {user?.id === comment.authorId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir comentário"
                        disabled={deleteComment.isPending}
                        onClick={() => void handleDelete(comment.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
