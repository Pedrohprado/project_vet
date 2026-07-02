import { endOfDay, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Matcher } from 'react-day-picker';

import { cn } from '@/lib/utils';
import {
  dateDisplayInputToValue,
  dateValueToDisplayInput,
  formatDateDisplay,
  formatDateInputMask,
  formatDateValue,
  isCompleteDateDisplayInput,
  parseDateDisplayInput,
  parseDateValue,
} from '@/lib/date-input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
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

function isDateAllowed(date: Date, fromDate?: Date, toDate?: Date) {
  if (fromDate && date < startOfDay(fromDate)) return false;
  if (toDate && date > endOfDay(toDate)) return false;
  return true;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'DD/MM/AAAA',
  id,
  className,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => dateValueToDisplayInput(value));
  const isFocusedRef = useRef(false);
  const selectedDate = parseDateValue(value);

  const disabledMatchers: Matcher[] = [];
  if (fromDate) disabledMatchers.push({ before: startOfDay(fromDate) });
  if (toDate) disabledMatchers.push({ after: endOfDay(toDate) });

  useEffect(() => {
    if (isFocusedRef.current) return;
    setInputText(dateValueToDisplayInput(value));
  }, [value]);

  function commitInput(nextInput: string) {
    if (!nextInput.trim()) {
      onChange('');
      setInputText('');
      return;
    }

    if (!isCompleteDateDisplayInput(nextInput)) {
      setInputText(dateValueToDisplayInput(value));
      return;
    }

    const parsed = parseDateDisplayInput(nextInput);
    if (!parsed || !isDateAllowed(parsed, fromDate, toDate)) {
      setInputText(dateValueToDisplayInput(value));
      return;
    }

    const nextValue = formatDateValue(parsed);
    onChange(nextValue);
    setInputText(formatDateDisplay(parsed));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const masked = formatDateInputMask(event.target.value);
    setInputText(masked);

    if (!isCompleteDateDisplayInput(masked)) return;

    const parsed = parseDateDisplayInput(masked);
    if (!parsed || !isDateAllowed(parsed, fromDate, toDate)) return;

    onChange(dateDisplayInputToValue(masked));
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        value={inputText}
        disabled={disabled}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        className="pr-9"
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          commitInput(inputText);
        }}
        onChange={handleInputChange}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir calendário"
              className="text-muted-foreground"
            />
          }
        >
          <CalendarIcon className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            defaultMonth={selectedDate}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            onSelect={(date) => {
              if (!date) return;

              onChange(formatDateValue(date));
              setInputText(formatDateDisplay(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
