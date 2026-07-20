import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Matcher } from 'react-day-picker';

import { listAppointments } from '@/api/appointments';
import { Calendar } from '@/components/ui/calendar';
import { DurationInput } from '@/components/ui/duration-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCalendarFetchRange } from '@/lib/calendar-events';
import {
  formatDateValue,
  getDatePartFromDateTime,
  getTimePartFromDateTime,
  mergeDateAndTime,
  parseDateTimeValue,
  parseDateValue,
} from '@/lib/date-input';
import {
  findFirstAvailableTime,
  generateDayTimeOptions,
  isDayFullyBooked,
} from '@/lib/schedule-availability';
import {
  minutesToDurationDigits,
  parseDurationDigits,
} from '@/lib/duration-input';
import { cn } from '@/lib/utils';

type ReturnSchedulePickerProps = {
  value: string;
  durationMinutes: number;
  durationDigits: string;
  onChange: (value: string) => void;
  onDurationChange: (durationMinutes: number, durationDigits: string) => void;
  disabled?: boolean;
  veterinarianId: string;
  excludeAppointmentId?: string;
};

export function ReturnSchedulePicker({
  value,
  durationMinutes,
  durationDigits,
  onChange,
  onDurationChange,
  disabled = false,
  veterinarianId,
  excludeAppointmentId,
}: ReturnSchedulePickerProps) {
  const selectedDate = parseDateTimeValue(value) ?? parseDateValue(getDatePartFromDateTime(value));
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());

  const { start, end } = getCalendarFetchRange(visibleMonth);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [
      'return-schedule-appointments',
      veterinarianId,
      start.toISOString(),
      end.toISOString(),
    ],
    queryFn: () =>
      listAppointments({
        start: start.toISOString(),
        end: end.toISOString(),
      }),
    enabled: Boolean(veterinarianId),
  });

  const dateValue = getDatePartFromDateTime(value);
  const timeValue = value ? getTimePartFromDateTime(value) : '';
  const parsedSelectedDate = parseDateValue(dateValue);

  const timeOptions = useMemo(() => {
    if (!parsedSelectedDate || durationMinutes <= 0) return [];

    return generateDayTimeOptions(
      parsedSelectedDate,
      durationMinutes,
      appointments,
      veterinarianId,
      excludeAppointmentId,
    );
  }, [
    appointments,
    durationMinutes,
    excludeAppointmentId,
    parsedSelectedDate,
    veterinarianId,
  ]);

  const disabledMatchers = useMemo(() => {
    const matchers: Matcher[] = [{ before: startOfDay(new Date()) }];

    matchers.push((date) =>
      isDayFullyBooked(
        date,
        durationMinutes,
        appointments,
        veterinarianId,
        excludeAppointmentId,
      ),
    );

    return matchers;
  }, [appointments, durationMinutes, excludeAppointmentId, veterinarianId]);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;

    const nextDateValue = formatDateValue(date);
    const firstAvailable = findFirstAvailableTime(
      date,
      durationMinutes,
      appointments,
      veterinarianId,
      excludeAppointmentId,
    );

    if (!firstAvailable) {
      onChange('');
      return;
    }

    onChange(mergeDateAndTime(nextDateValue, firstAvailable));
  }

  function handleTimeChange(nextTime: string | null) {
    if (!nextTime || !dateValue) return;
    onChange(mergeDateAndTime(dateValue, nextTime));
  }

  function handleDurationDigitsChange(nextDigits: string) {
    const nextMinutes = parseDurationDigits(nextDigits) || 30;
    onDurationChange(nextMinutes, nextDigits || minutesToDurationDigits(30));

    if (!parsedSelectedDate) return;

    const currentTime = getTimePartFromDateTime(value);
    const selectedOption = generateDayTimeOptions(
      parsedSelectedDate,
      nextMinutes,
      appointments,
      veterinarianId,
      excludeAppointmentId,
    ).find((option) => option.value === currentTime);

    if (selectedOption && !selectedOption.disabled) {
      onChange(mergeDateAndTime(dateValue, currentTime));
      return;
    }

    const firstAvailable = findFirstAvailableTime(
      parsedSelectedDate,
      nextMinutes,
      appointments,
      veterinarianId,
      excludeAppointmentId,
    );

    if (firstAvailable) {
      onChange(mergeDateAndTime(dateValue, firstAvailable));
      return;
    }

    onChange('');
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando agenda...</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="rounded-lg border bg-card p-2">
          <Calendar
            mode="single"
            locale={ptBR}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={parsedSelectedDate}
            disabled={disabled ? true : disabledMatchers}
            onSelect={handleDateSelect}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="return-duration">Duração</Label>
            <DurationInput
              id="return-duration"
              value={durationDigits}
              disabled={disabled}
              onChange={handleDurationDigitsChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="return-time">Horário</Label>
            <Select
              items={timeOptions.map((option) => ({
                value: option.value,
                label: option.label,
                disabled: option.disabled,
              }))}
              value={timeValue || null}
              onValueChange={handleTimeChange}
            >
              <SelectTrigger
                id="return-time"
                className="w-full"
                disabled={disabled || !parsedSelectedDate || durationMinutes <= 0}
              >
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {timeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(option.disabled && 'text-muted-foreground')}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!parsedSelectedDate ? (
              <p className="text-sm text-muted-foreground">
                Selecione uma data disponível no calendário.
              </p>
            ) : null}
            {parsedSelectedDate && durationMinutes <= 0 ? (
              <p className="text-sm text-destructive">
                Informe uma duração válida.
              </p>
            ) : null}
            {parsedSelectedDate &&
            durationMinutes > 0 &&
            timeOptions.every((option) => option.disabled) ? (
              <p className="text-sm text-destructive">
                Nenhum horário disponível nesta data para a duração informada.
              </p>
            ) : null}
          </div>

          {value ? (
            <p className="text-sm text-muted-foreground">
              Retorno:{' '}
              {parseDateTimeValue(value)?.toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
