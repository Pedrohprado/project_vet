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

export function formatDateInputMask(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isCompleteDateDisplayInput(value: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

export function parseDateDisplayInput(value: string | undefined) {
  if (!value?.trim()) return undefined;

  const parsed = parse(value.trim(), DATE_DISPLAY_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function dateValueToDisplayInput(value: string | undefined) {
  const parsed = parseDateValue(value);
  return parsed ? formatDateDisplay(parsed) : '';
}

export function dateDisplayInputToValue(display: string) {
  const parsed = parseDateDisplayInput(display);
  return parsed ? formatDateValue(parsed) : '';
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
