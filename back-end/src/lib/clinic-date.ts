const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function toClinicNoon(date: Date) {
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

/**
 * Date-only values (`YYYY-MM-DD`) are parsed as UTC midnight by JS,
 * which becomes the previous calendar day in Brazil (UTC-3).
 * Store noon in America/Sao_Paulo so the intended day is preserved.
 */
export function parseClinicDateInput(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  const match = DATE_ONLY_PATTERN.exec(trimmed);

  if (!match) {
    return value;
  }

  return new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00-03:00`);
}
