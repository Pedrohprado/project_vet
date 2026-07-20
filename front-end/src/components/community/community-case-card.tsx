import { useState } from 'react';
import {
  EllipsisVertical,
  Heart,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import {
  CommunityCaseBody,
  hasExpandableCaseContent,
} from '@/components/community/community-case-body';
import { CommunityCaseMeta } from '@/components/community/community-case-meta';
import { EditCommunityCaseDialog } from '@/components/community/edit-community-case-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import {
  useDeleteCommunityCase,
  useLikeCommunityCase,
  useUnlikeCommunityCase,
} from '@/hooks/useCommunity';
import { getAuthorInitials } from '@/lib/pet-icons';
import { cn } from '@/lib/utils';
import type { CommunityCase } from '@/types/community';

function formatPostDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

type CommunityCaseCardProps = {
  communityCase: CommunityCase;
  onOpenDetail: (communityCase: CommunityCase) => void;
};

export function CommunityCaseCard({
  communityCase,
  onOpenDetail,
}: CommunityCaseCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const likeMutation = useLikeCommunityCase();
  const unlikeMutation = useUnlikeCommunityCase();
  const deleteMutation = useDeleteCommunityCase();
  const isLiking = likeMutation.isPending || unlikeMutation.isPending;
  const canExpand = hasExpandableCaseContent(communityCase);
  const isAuthor = user?.id === communityCase.authorId;

  async function handleToggleLike() {
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
    if (!window.confirm('Excluir este caso da comunidade?')) return;
    try {
      await deleteMutation.mutateAsync(communityCase.id);
      toast.success('Caso removido da comunidade');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao excluir caso',
      );
    }
  }

  return (
    <article className="w-full py-4 sm:py-5">
      {/* Mobile: header estilo feed (avatar + nome + menu) */}
      <div className="flex w-full items-start gap-3 sm:hidden">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {getAuthorInitials(communityCase.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {communityCase.author.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{communityCase.clinic.name}</span>
              </p>
            </div>

            {isAuthor ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="-mr-1 text-muted-foreground"
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
          </div>
        </div>
      </div>

      {/* Mobile body full-width */}
      <div className="mt-3 w-full space-y-3 sm:hidden">
        <CommunityCaseMeta communityCase={communityCase} showVitals />

        <div className="w-full space-y-2">
          <h2 className="text-base font-semibold tracking-tight">
            {communityCase.title}
          </h2>

          {communityCase.authorNote ? (
            <p
              className={cn(
                'whitespace-pre-wrap text-sm text-muted-foreground',
                !expanded && 'line-clamp-3',
              )}
            >
              {communityCase.authorNote}
            </p>
          ) : null}

          {expanded ? (
            <CommunityCaseBody
              mainComplaint={communityCase.mainComplaint}
              history={communityCase.history}
              physicalExam={communityCase.physicalExam}
              diagnosis={communityCase.diagnosis}
              conduct={communityCase.conduct}
              observations={communityCase.observations}
              temperature={communityCase.temperature}
            />
          ) : null}

          {canExpand || communityCase.authorNote ? (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Ver menos' : 'Ler mais...'}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 transition-colors hover:text-rose-500',
              communityCase.likedByMe && 'text-rose-500',
            )}
            disabled={isLiking}
            onClick={() => void handleToggleLike()}
          >
            <Heart
              className={cn(
                'size-4',
                communityCase.likedByMe && 'fill-rose-500',
              )}
            />
            <span className="tabular-nums">{communityCase.likesCount}</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-600"
            onClick={() => onOpenDetail(communityCase)}
          >
            <MessageCircle className="size-4" />
            <span className="tabular-nums">{communityCase.commentsCount}</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {formatPostDate(communityCase.createdAt)}
        </p>
      </div>

      {/* Desktop: layout com coluna ao lado do avatar */}
      <div className="hidden w-full gap-3 sm:flex">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {getAuthorInitials(communityCase.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-1.5">
                <p className="truncate text-sm font-medium">
                  {communityCase.author.name}
                </p>
                {communityCase.author.crmv ? (
                  <span className="truncate text-sm text-muted-foreground">
                    · CRMV {communityCase.author.crmv}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{communityCase.clinic.name}</span>
                <span className="mx-0.5">·</span>
                <span>{formatPostDate(communityCase.createdAt)}</span>
              </p>
            </div>

            {isAuthor ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
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
          </div>

          <CommunityCaseMeta communityCase={communityCase} showVitals />

          <div className="w-full space-y-2">
            <h2 className="text-base font-semibold tracking-tight">
              {communityCase.title}
            </h2>

            {communityCase.authorNote ? (
              <p
                className={cn(
                  'whitespace-pre-wrap text-sm text-muted-foreground',
                  !expanded && 'line-clamp-3',
                )}
              >
                {communityCase.authorNote}
              </p>
            ) : null}

            {expanded ? (
              <CommunityCaseBody
                mainComplaint={communityCase.mainComplaint}
                history={communityCase.history}
                physicalExam={communityCase.physicalExam}
                diagnosis={communityCase.diagnosis}
                conduct={communityCase.conduct}
                observations={communityCase.observations}
                temperature={communityCase.temperature}
              />
            ) : null}

            {canExpand || communityCase.authorNote ? (
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? 'Ver menos' : 'Ler mais...'}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1.5 transition-colors hover:text-rose-500',
                communityCase.likedByMe && 'text-rose-500',
              )}
              disabled={isLiking}
              onClick={() => void handleToggleLike()}
            >
              <Heart
                className={cn(
                  'size-4',
                  communityCase.likedByMe && 'fill-rose-500',
                )}
              />
              <span className="tabular-nums">{communityCase.likesCount}</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-600"
              onClick={() => onOpenDetail(communityCase)}
            >
              <MessageCircle className="size-4" />
              <span className="tabular-nums">{communityCase.commentsCount}</span>
            </button>
          </div>
        </div>
      </div>

      <EditCommunityCaseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        communityCase={communityCase}
      />
    </article>
  );
}
