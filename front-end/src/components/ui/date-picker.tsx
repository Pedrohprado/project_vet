import { endOfDay, startOfDay } from 'date-fns';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Matcher } from 'react-day-picker';

import { cn } from '@/lib/utils';
import {
  formatDateDisplay,
  formatDateValue,
  parseDateValue,
} from '@/lib/date-input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
};

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione a data',
  id,
  className,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);

  const disabledMatchers: Matcher[] = [];
  if (fromDate) disabledMatchers.push({ before: startOfDay(fromDate) });
  if (toDate) disabledMatchers.push({ after: endOfDay(toDate) });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn('w-full', className)}
        render={
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {selectedDate ? formatDateDisplay(selectedDate) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selectedDate}
          defaultMonth={selectedDate}
          disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
          onSelect={(date) => {
            onChange(date ? formatDateValue(date) : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
