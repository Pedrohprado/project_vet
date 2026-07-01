import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DATE_VALUE_FORMAT = 'yyyy-MM-dd';
const DATE_TIME_VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy';

export function getCurrentTimeString() {
  return format(new Date(), 'HH:mm');
}

export function getDefaultDateTimeValue() {
  return formatDateTimeValue(new Date());
}

export function formatDateValue(date: Date) {
  return format(date, DATE_VALUE_FORMAT);
}

export function formatDateTimeValue(date: Date) {
  return format(date, DATE_TIME_VALUE_FORMAT);
}

export function formatDateDisplay(date: Date) {
  return format(date, DATE_DISPLAY_FORMAT, { locale: ptBR });
}

export function parseDateValue(value: string | undefined) {
  if (!value) return undefined;

  const parsed = parse(value, DATE_VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function parseDateTimeValue(value: string | undefined) {
  if (!value) return undefined;

  const parsed = parse(value, DATE_TIME_VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function getDatePartFromDateTime(value: string | undefined) {
  const parsed = parseDateTimeValue(value);
  return parsed ? formatDateValue(parsed) : '';
}

export function getTimePartFromDateTime(value: string | undefined) {
  const parsed = parseDateTimeValue(value);
  return parsed ? format(parsed, 'HH:mm') : getCurrentTimeString();
}

export function mergeDateAndTime(dateValue: string, timeValue: string) {
  const date = parseDateValue(dateValue);
  if (!date) return '';

  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return formatDateTimeValue(date);
  }

  date.setHours(hours, minutes, 0, 0);
  return formatDateTimeValue(date);
}
