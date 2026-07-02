import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import {
  getCurrentTimeString,
  getDatePartFromDateTime,
  getDefaultDateTimeValue,
  getTimePartFromDateTime,
  mergeDateAndTime,
} from '@/lib/date-input';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  id,
  className,
}: DateTimePickerProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || value) return;

    initializedRef.current = true;
    onChange(getDefaultDateTimeValue());
  }, [onChange, value]);

  const dateValue = getDatePartFromDateTime(value);
  const timeValue = getTimePartFromDateTime(value);

  function handleDateChange(nextDate: string) {
    if (!nextDate) {
      onChange('');
      return;
    }

    onChange(mergeDateAndTime(nextDate, timeValue || getCurrentTimeString()));
  }

  function handleTimeChange(nextTime: string) {
    const baseDate = dateValue || getDatePartFromDateTime(getDefaultDateTimeValue());
    onChange(mergeDateAndTime(baseDate, nextTime));
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DatePicker
        id={id}
        value={dateValue}
        onChange={handleDateChange}
        disabled={disabled}
        fromDate={new Date()}
        placeholder="Selecione a data"
        className="min-w-0 flex-1"
      />
      <Input
        type="time"
        value={timeValue}
        disabled={disabled}
        className="w-32 shrink-0"
        onChange={(event) => handleTimeChange(event.target.value)}
      />
    </div>
  );
}
