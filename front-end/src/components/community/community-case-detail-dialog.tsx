import { useState } from 'react';
import {
  EllipsisVertical,
  Heart,
  MessageCircle,
  Pencil,
  Trash2,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { CommunityCaseBody } from '@/components/community/community-case-body';
import { CommunityCaseComments } from '@/components/community/community-case-comments';
import { CommunityCaseMeta } from '@/components/community/community-case-meta';
import { EditCommunityCaseDialog } from '@/components/community/edit-community-case-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import {
  useCommunityCase,
  useCommunityCaseComments,
  useDeleteCommunityCase,
  useLikeCommunityCase,
  useUnlikeCommunityCase,
} from '@/hooks/useCommunity';
import { getAuthorInitials } from '@/lib/pet-icons';
import { cn } from '@/lib/utils';
import type { CommunityCase } from '@/types/community';

function formatPostDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

type CommunityCaseDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string | null;
  initialCase?: CommunityCase | null;
};

export function CommunityCaseDetailDialog({
  open,
  onOpenChange,
  caseId,
  initialCase = null,
}: CommunityCaseDetailDialogProps) {
  const { user } = useAuth();
  const { data: fetchedCase } = useCommunityCase(
    open ? (caseId ?? undefined) : undefined,
  );
  const communityCase = fetchedCase ?? initialCase;
  const { data: comments, isLoading: commentsLoading } =
    useCommunityCaseComments(open ? (caseId ?? undefined) : undefined);
  const likeMutation = useLikeCommunityCase();
  const unlikeMutation = useUnlikeCommunityCase();
  const deleteMutation = useDeleteCommunityCase();
  const isLiking = likeMutation.isPending || unlikeMutation.isPending;
  const isAuthor = user?.id === communityCase?.authorId;
  const [editOpen, setEditOpen] = useState(false);

  async function handleToggleLike() {
    if (!communityCase) return;
    try {
      if (communityCase.likedByMe) {
        await unlikeMutation.mutateAsync(communityCase.id);
      } else {
        await likeMutation.mutateAsync(communityCase.id);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao atualizar curtida',
      );
    }
  }

  async function handleDelete() {
    if (!communityCase) return;
    if (!window.confirm('Excluir este caso da comunidade?')) return;

    try {
      await deleteMutation.mutateAsync(communityCase.id);
      toast.success('Caso removido da comunidade');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao excluir caso',
      );
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-white/80 supports-backdrop-filter:bg-white/70"
          className="flex w-full max-h-[90vh] flex-col gap-0 overflow-hidden border bg-white p-0 text-foreground sm:max-w-2xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {communityCase?.title ?? 'Detalhe do caso'}
            </DialogTitle>
            <DialogDescription>
              Publicação completa e comentários da comunidade.
            </DialogDescription>
          </DialogHeader>

          {!communityCase ? (
            <div className="p-6 text-sm text-muted-foreground">
              Carregando publicação...
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-11 rounded-t-xl bg-white" />
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-0.5">
                {isAuthor ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="bg-white text-muted-foreground hover:bg-white"
                          aria-label="Mais opções"
                        />
                      }
                    >
                      <EllipsisVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => void handleDelete()}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="bg-white text-muted-foreground hover:bg-white"
                      aria-label="Fechar"
                    />
                  }
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Fechar</span>
                </DialogClose>
              </div>

              <div className="min-h-0 w-full flex-1 overflow-y-auto bg-white">
                <div className="w-full space-y-3 border-b px-4 pt-11 pb-4 sm:space-y-4 sm:px-6 sm:pb-5">
                  <div className="flex items-start gap-3 pr-14">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary sm:text-sm">
                        {getAuthorInitials(communityCase.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="truncate text-sm font-medium">
                        {communityCase.author.name}
                        {communityCase.author.crmv
                          ? ` · CRMV ${communityCase.author.crmv}`
                          : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {communityCase.clinic.name}
                        <span className="mx-1">·</span>
                        {formatPostDate(communityCase.createdAt)}
                      </p>
                    </div>
                  </div>

                  <CommunityCaseMeta
                    communityCase={communityCase}
                    showVitals
                  />

                  <div className="w-full space-y-2 text-left">
                    <h2 className="text-base font-semibold tracking-tight">
                      {communityCase.title}
                    </h2>
                    {communityCase.authorNote ? (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {communityCase.authorNote}
                      </p>
                    ) : null}
                    <CommunityCaseBody
                      mainComplaint={communityCase.mainComplaint}
                      history={communityCase.history}
                      physicalExam={communityCase.physicalExam}
                      diagnosis={communityCase.diagnosis}
                      conduct={communityCase.conduct}
                      observations={communityCase.observations}
                      temperature={communityCase.temperature}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-1.5 transition-colors hover:text-rose-500',
                        communityCase.likedByMe && 'text-rose-500',
                      )}
                      disabled={isLiking}
                      aria-label="Curtir"
                      onClick={() => void handleToggleLike()}
                    >
                      <Heart
                        className={cn(
                          'size-4',
                          communityCase.likedByMe && 'fill-rose-500',
                        )}
                      />
                      <span className="tabular-nums">
                        {communityCase.likesCount}
                      </span>
                      <span className="hidden sm:inline">
                        {communityCase.likesCount === 1
                          ? 'curtida'
                          : 'curtidas'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5"
                      aria-label="Comentários"
                    >
                      <MessageCircle className="size-4" />
                      <span className="tabular-nums">
                        {communityCase.commentsCount}
                      </span>
                      <span className="hidden sm:inline">
                        {communityCase.commentsCount === 1
                          ? 'comentário'
                          : 'comentários'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="w-full px-4 py-4 text-left sm:px-6 sm:py-5">
                  <CommunityCaseComments
                    caseId={communityCase.id}
                    comments={comments}
                    isLoading={commentsLoading}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {communityCase ? (
        <EditCommunityCaseDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          communityCase={communityCase}
        />
      ) : null}
    </>
  );
}
