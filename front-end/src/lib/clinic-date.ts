function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function toClinicDate(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso;

  if (Number.isNaN(date.getTime())) {
    return date;
  }

  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  if (!isUtcMidnight) {
    return date;
  }

  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  return new Date(`${year}-${month}-${day}T12:00:00-03:00`);
}

export function toClinicDatePayload(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  return `${dateValue}T12:00:00-03:00`;
}
