import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DayTimeline } from '@/components/agenda/day-timeline';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { formatDayTitle } from '@/lib/calendar-events';
import type { CalendarEvent } from '@/types/calendar-event';

type DayTimelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date;
  events: CalendarEvent[];
};

export function DayTimelineDialog({
  open,
  onOpenChange,
  selectedDay,
  events,
}: DayTimelineDialogProps) {
  useBodyScrollLock(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        overlayClassName="bg-black/50 backdrop-blur-sm"
      >
        <DialogHeader>
          <DialogTitle className="capitalize">{formatDayTitle(selectedDay)}</DialogTitle>
          <DialogDescription>
            Agendamentos e atendimentos do dia
          </DialogDescription>
        </DialogHeader>
        <DayTimeline selectedDay={selectedDay} events={events} />
      </DialogContent>
    </Dialog>
  );
}
