import { Link } from 'react-router';
import { Calendar, ChevronRight, Syringe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  WEEK_REMINDER_KIND_LABELS,
  type WeekReminderItem,
  type WeekReminderKind,
} from '@/types/home';

function formatReminderWhen(value: string) {
  const date = new Date(value);
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Amanhã, ${time}`;
  if (diffDays === -1) return `Ontem, ${time}`;

  return date.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const kindBadgeClass: Record<WeekReminderKind, string> = {
  APPOINTMENT: 'border-transparent bg-sky-700 text-white',
  VACCINE_DOSE: 'border-transparent bg-emerald-700 text-white',
};

const kindIconWrapClass: Record<WeekReminderKind, string> = {
  APPOINTMENT: 'bg-sky-700/10 text-sky-800',
  VACCINE_DOSE: 'bg-emerald-700/10 text-emerald-800',
};

const kindIcon: Record<WeekReminderKind, typeof Calendar> = {
  APPOINTMENT: Calendar,
  VACCINE_DOSE: Syringe,
};

function ReminderRow({ item }: { item: WeekReminderItem }) {
  const Icon = kindIcon[item.kind];

  return (
    <Link
      to={item.href}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 transition-colors hover:bg-muted/60"
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          kindIconWrapClass[item.kind],
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-medium">{item.title}</p>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 self-center px-1.5 py-0 text-[10px] leading-4',
              kindBadgeClass[item.kind],
            )}
          >
            {WEEK_REMINDER_KIND_LABELS[item.kind]}
          </Badge>
        </div>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          {item.subtitle}
        </p>
        <p className="mt-0.5 text-xs font-medium text-foreground/80">
          {formatReminderWhen(item.at)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

type HomeWeekRemindersProps = {
  items?: WeekReminderItem[];
  isLoading?: boolean;
  error?: boolean;
};

export function HomeWeekReminders({
  items = [],
  isLoading,
  error,
}: HomeWeekRemindersProps) {
  return (
    <Card
      id="lembretes"
      className="scroll-mt-4 rounded-2xl border border-border/50 bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm"
    >
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <CardTitle>Lembretes da semana</CardTitle>
        {!isLoading && !error && items.length > 0 ? (
          <Button size="sm" className="w-fit shrink-0" asChild>
            <Link to="/agenda">Ir para agenda</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os lembretes.
          </p>
        ) : isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Button size="sm" asChild>
              <Link to="/agenda">Ir para agenda</Link>
            </Button>
            <p className="ellipsis-dots text-xs text-muted-foreground">
              Não conseguimos encontrar nenhum lembrete
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <ReminderRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
