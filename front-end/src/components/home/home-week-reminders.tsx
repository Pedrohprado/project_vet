import { Link } from 'react-router';
import { Calendar, ChevronRight, Syringe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OPEN_BOX_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';
import {
  WEEK_REMINDER_KIND_LABELS,
  type WeekReminderItem,
  type WeekReminderKind,
} from '@/types/home';

function formatReminderDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const kindBadgeClass: Record<WeekReminderKind, string> = {
  APPOINTMENT: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  VACCINE_DOSE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 sm:items-center sm:justify-start">
          <p className="min-w-0 truncate text-sm font-medium">{item.title}</p>
          <Badge
            variant="secondary"
            className={cn(
              'shrink-0 self-center px-1.5 py-0 text-[10px] leading-4',
              kindBadgeClass[item.kind],
            )}
          >
            {WEEK_REMINDER_KIND_LABELS[item.kind]}
          </Badge>
        </div>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{item.subtitle}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatReminderDate(item.at)}
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
    <Card className="rounded-2xl border border-border/50 bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to="/agenda">Ver agenda</Link>
          </Button>
        </div>
        <div className="space-y-1">
          <CardTitle>Lembretes da semana</CardTitle>
          <CardDescription>
            Agendamentos e próximas doses de vacina nos próximos 7 dias.
          </CardDescription>
        </div>
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
            <img
              src={OPEN_BOX_SRC}
              alt=""
              aria-hidden
              className="h-16 w-auto object-contain opacity-80"
            />
            <p className="text-sm text-muted-foreground">
              Nada agendado para esta semana. Que tal marcar um atendimento?
            </p>
            <Button size="sm" asChild>
              <Link to="/agenda">Ir para agenda</Link>
            </Button>
          </div>
        ) : (
          items.map((item) => <ReminderRow key={item.id} item={item} />)
        )}
      </CardContent>
    </Card>
  );
}
