import { useState } from 'react';
import {
  EllipsisVertical,
  Heart,
  Calendar,
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
import { Card, CardContent } from '@/components/ui/card';
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
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Há ${diffDays} d`;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
    <Card className='rounded-2xl bg-card shadow-none ring-0'>
      <CardContent className='space-y-3'>
        <div className='flex items-start gap-3'>
          <Avatar className='size-10 shrink-0 sm:size-11'>
            <AvatarFallback className='bg-primary/10 text-xs font-medium text-primary sm:text-sm'>
              {getAuthorInitials(communityCase.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold'>
                  {communityCase.author.name}
                </p>
                {communityCase.author.crmv ? (
                  <p className='truncate text-xs text-muted-foreground'>
                    CRMV {communityCase.author.crmv}
                  </p>
                ) : null}
                <div className='mt-1 space-y-0.5 text-xs text-muted-foreground sm:text-sm'>
                  <p className='hidden min-w-0 items-center gap-1 sm:flex'>
                    <MapPin className='size-3.5 shrink-0' aria-hidden />
                    <span className='min-w-0 truncate'>
                      {communityCase.clinic.name}
                    </span>
                    <span className='shrink-0'>·</span>
                    <span className='shrink-0'>
                      {formatPostDate(communityCase.createdAt)}
                    </span>
                  </p>

                  <div className='space-y-0.5 sm:hidden'>
                    <p className='flex min-w-0 items-start gap-1'>
                      <MapPin
                        className='mt-0.5 size-3.5 shrink-0'
                        aria-hidden
                      />
                      <span className='min-w-0 wrap-break-word'>
                        {communityCase.clinic.name}
                      </span>
                    </p>
                    <p className='flex min-w-0 items-start gap-1'>
                      <Calendar
                        className='mt-0.5 size-3.5 shrink-0'
                        aria-hidden
                      />
                      <span>{formatPostDate(communityCase.createdAt)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {isAuthor ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        className='-mr-1 text-muted-foreground'
                        aria-label='Mais opções'
                      />
                    }
                  >
                    <EllipsisVertical className='size-4' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className='size-4' />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant='destructive'
                      disabled={deleteMutation.isPending}
                      onClick={() => void handleDelete()}
                    >
                      <Trash2 className='size-4' />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>

        <CommunityCaseMeta communityCase={communityCase} showVitals />

        <div className='space-y-2'>
          <h2 className='text-base font-semibold tracking-tight'>
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
              type='button'
              className='text-sm font-medium text-primary hover:underline'
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Ver menos' : 'Ler mais'}
            </button>
          ) : null}
        </div>

        <div className='flex items-center gap-2 pt-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className={cn(
              'h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-rose-500',
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
            <span className='tabular-nums'>{communityCase.likesCount}</span>
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-sky-700'
            onClick={() => onOpenDetail(communityCase)}
          >
            <MessageCircle className='size-4' />
            <span className='tabular-nums'>{communityCase.commentsCount}</span>
            <span className='hidden sm:inline'>Comentários</span>
          </Button>
        </div>
      </CardContent>

      <EditCommunityCaseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        communityCase={communityCase}
      />
    </Card>
  );
}
