import { useNavigate } from 'react-router';
import { Calendar, PawPrint, Stethoscope, Syringe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatTimelineDate, isUpcomingTimelineEvent } from '@/lib/pet-format';
import {
  PET_TIMELINE_STATUS_LABELS,
  type PetTimelineEvent,
  type PetTimelineEventKind,
} from '@/types/pet-timeline';

const kindIcons: Record<PetTimelineEventKind, typeof Stethoscope> = {
  REGISTRATION: PawPrint,
  CONSULTATION: Stethoscope,
  APPOINTMENT: Calendar,
  VACCINATION: Syringe,
};

function TimelineEventItem({ event }: { event: PetTimelineEvent }) {
  const navigate = useNavigate();
  const Icon = kindIcons[event.kind];
  const isUpcoming = isUpcomingTimelineEvent(event.status);
  const isCancelled = event.status === 'CANCELLED';
  const isClickable =
    event.linkTo?.type === 'consultation' ||
    event.linkTo?.type === 'vaccination';

  function handleClick() {
    if (event.linkTo?.type === 'consultation') {
      void navigate(`/consultations/${event.linkTo.id}`);
    }
    if (event.linkTo?.type === 'vaccination') {
      void navigate(`/vaccinations/${event.linkTo.id}`);
    }
  }

  return (
    <li className='relative pb-8 last:pb-0'>
      <span
        className={cn(
          'absolute -left-6.5 top-1 flex size-3 rounded-full border-2 border-background',
          isUpcoming ? 'bg-muted-foreground/40' : 'bg-primary',
        )}
        aria-hidden='true'
      />
      <div
        className={cn(
          'rounded-lg border p-3 transition-colors',
          isClickable && 'cursor-pointer hover:bg-muted/50',
          isUpcoming && 'border-dashed bg-muted/20',
          isCancelled && 'opacity-60',
        )}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div className='flex min-w-0 items-start gap-2.5'>
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                isUpcoming
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className='size-4' />
            </div>
            <div className={cn('min-w-0', isCancelled && 'line-through')}>
              <p className='text-sm font-medium'>{event.title}</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {formatTimelineDate(event.occurredAt)}
              </p>
            </div>
          </div>
          {event.status ? (
            <Badge
              variant={isUpcoming ? 'outline' : 'secondary'}
              className='shrink-0'
            >
              {PET_TIMELINE_STATUS_LABELS[event.status] ?? event.status}
            </Badge>
          ) : null}
        </div>
      </div>
    </li>
  );
}

type PetTimelineProps = {
  events: PetTimelineEvent[] | undefined;
  isLoading?: boolean;
};

export function PetTimeline({ events, isLoading }: PetTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
          </div>
        ) : !events || events.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            Nenhum procedimento registrado ainda.
          </p>
        ) : (
          <ol className='ml-4 border-l border-border pl-6'>
            {events.map((event) => (
              <TimelineEventItem key={event.id} event={event} />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
