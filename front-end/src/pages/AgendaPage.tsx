import { useState } from 'react';
import { Plus } from 'lucide-react';
import { NewAtendimentoSheet } from '@/components/atendimento/new-atendimento-sheet';
import { DayTimelineDialog } from '@/components/agenda/day-timeline-dialog';
import { MonthCalendar } from '@/components/agenda/month-calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import {
  actionBarClassName,
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function AgendaPage() {
  const today = startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(today);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: events = [], isLoading, isError } = useCalendarEvents(currentMonth);

  function handleMonthChange(month: Date) {
    setCurrentMonth(month);

    const isSameMonth =
      selectedDay.getFullYear() === month.getFullYear() &&
      selectedDay.getMonth() === month.getMonth();

    if (!isSameMonth) {
      setSelectedDay(new Date(month.getFullYear(), month.getMonth(), 1));
    }
  }

  function handleSelectDay(day: Date) {
    setSelectedDay(startOfDay(day));
    setDialogOpen(true);

    if (
      day.getFullYear() !== currentMonth.getFullYear() ||
      day.getMonth() !== currentMonth.getMonth()
    ) {
      setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  return (
    <div className={pageShellClassName}>
      <div className={actionBarClassName}>
        <div>
          <h1 className={pageTitleClassName}>Agenda</h1>
          <p className={pageDescriptionClassName}>
            Veja agendamentos e atendimentos por dia
          </p>
        </div>
        <Button type="button" className="w-full sm:w-auto" onClick={() => setSheetOpen(true)}>
          <Plus className="size-4" />
          Novo agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[420px] w-full rounded-lg" />
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar a agenda. Tente novamente.
            </p>
          ) : (
            <MonthCalendar
              month={currentMonth}
              onMonthChange={handleMonthChange}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              events={events}
            />
          )}
        </CardContent>
      </Card>

      <DayTimelineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDay={selectedDay}
        events={events}
      />

      <NewAtendimentoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode="agendamento"
        defaultScheduledDay={selectedDay}
      />
    </div>
  );
}
