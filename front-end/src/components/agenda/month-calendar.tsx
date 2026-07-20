import * as React from 'react';
import { addMonths, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type DayButton,
} from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  formatEventTime,
  getIndexedEventsForDay,
  indexEventsByDay,
} from '@/lib/calendar-events';
import type { CalendarEvent } from '@/types/calendar-event';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

type MonthCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  events: CalendarEvent[];
};

function getEventChipClass(event: CalendarEvent) {
  if (event.kind === 'CONSULTATION') {
    if (event.status === 'OPEN') {
      return 'bg-primary/20 text-foreground';
    }
    if (event.status === 'RETURN_SCHEDULED') {
      return 'bg-amber-500/20 text-amber-950 dark:text-amber-100';
    }
    if (event.status === 'FINISHED') {
      return 'bg-secondary text-secondary-foreground';
    }
    return 'bg-muted text-muted-foreground';
  }

  if (event.status === 'CANCELLED' || event.status === 'NO_SHOW') {
    return 'bg-muted text-muted-foreground line-through';
  }

  if (event.appointmentType === 'VACCINATION') {
    return 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100';
  }

  return 'bg-primary/15 text-foreground';
}

function createDayButton(
  eventsByDay: Map<string, CalendarEvent[]>,
  onSelectDay: (day: Date) => void,
) {
  return function AgendaDayButton({
    day,
    modifiers,
    className,
    onClick,
    ...props
  }: React.ComponentProps<typeof DayButton>) {
    const ref = React.useRef<HTMLButtonElement>(null);
    const dayEvents = getIndexedEventsForDay(eventsByDay, day.date);

    React.useEffect(() => {
      if (modifiers.focused) {
        ref.current?.focus();
      }
    }, [modifiers.focused]);

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      onSelectDay(day.date);
    }

    return (
      <button
        ref={ref}
        type="button"
        data-day={day.date.toLocaleDateString()}
        onClick={handleClick}
        className={cn(
          'absolute inset-0 flex w-full flex-col items-stretch justify-start overflow-hidden rounded-md p-1.5 text-left transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          modifiers.selected && 'bg-primary/10 ring-1 ring-primary/40',
          modifiers.outside && 'text-muted-foreground/70',
          modifiers.disabled && 'pointer-events-none opacity-40',
          className,
        )}
        {...props}
      >
        <span className="shrink-0 text-xs font-semibold leading-none">
          {day.date.getDate()}
        </span>
        <span className="mt-1 flex min-h-0 w-full flex-1 flex-col gap-0.5 overflow-hidden">
          {dayEvents.slice(0, 3).map((event) => (
            <span
              key={`${event.kind}-${event.id}`}
              className={cn(
                'flex w-full min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight',
                getEventChipClass(event),
              )}
            >
              <span className="shrink-0 whitespace-nowrap tabular-nums">
                {event.appointmentType === 'VACCINATION' ? 'Vac. ' : ''}
                {formatEventTime(event.startsAt)}
              </span>
              <span className="min-w-0 truncate">{event.pet.name}</span>
            </span>
          ))}
          {dayEvents.length > 3 ? (
            <span className="w-full truncate px-0.5 text-[10px] text-muted-foreground">
              +{dayEvents.length - 3} mais
            </span>
          ) : null}
        </span>
      </button>
    );
  };
}

export function MonthCalendar({
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  events,
}: MonthCalendarProps) {
  const eventsByDay = React.useMemo(() => indexEventsByDay(events), [events]);

  const DayButtonComponent = React.useMemo(
    () => createDayButton(eventsByDay, onSelectDay),
    [eventsByDay, onSelectDay],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              onSelectDay(now);
              onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onMonthChange(subMonths(month, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        locale={ptBR}
        month={month}
        onMonthChange={onMonthChange}
        selected={selectedDay}
        onSelect={(day) => {
          if (day) {
            onSelectDay(day);
          }
        }}
        formatters={{
          formatWeekdayName: (date) => WEEKDAY_LABELS[date.getDay()],
        }}
        modifiers={{
          hasEvents: (date) => getIndexedEventsForDay(eventsByDay, date).length > 0,
        }}
        modifiersClassNames={{
          hasEvents: 'font-medium',
        }}
        className="w-full"
        classNames={{
          months: 'relative w-full',
          month: 'flex w-full flex-col gap-4',
          month_grid: 'w-full',
          weekdays: 'grid w-full grid-cols-7 gap-1',
          weekday:
            'flex items-center justify-center py-1 text-[0.8rem] font-medium text-muted-foreground',
          week: 'grid w-full grid-cols-7 gap-1',
          day: cn(
            'group/day relative min-h-24 min-w-0 overflow-hidden rounded-md border border-border/50 bg-muted/20 p-0 sm:min-h-28',
          ),
          button_previous: 'hidden',
          button_next: 'hidden',
          month_caption: 'hidden',
        }}
        components={{
          DayButton: DayButtonComponent,
        }}
      />
    </div>
  );
}
