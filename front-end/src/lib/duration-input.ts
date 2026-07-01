const MAX_DURATION_MINUTES = 99 * 60 + 59;

function digitsToParts(digits: string) {
  const normalized = digits.replace(/\D/g, '').slice(0, 4);
  if (!normalized) return null;

  const padded = normalized.padStart(4, '0');
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2, 4));

  if (hours === 0 && minutes === 0) return null;
  if (minutes > 59) return null;

  return { hours, minutes };
}

function formatDurationParts(hours: number, minutes: number) {
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  if (hours === 0) {
    return `00:${mm}`;
  }

  return `${hh}:${mm}h`;
}

export function formatDurationFromDigits(digits: string) {
  const parts = digitsToParts(digits);
  if (!parts) return '';

  return formatDurationParts(parts.hours, parts.minutes);
}

export function formatDurationFromMinutes(minutes: number) {
  if (minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return formatDurationParts(hours, mins);
}

export function minutesToDurationDigits(minutes: number) {
  if (minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const code = `${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}`;

  return String(Number(code));
}

export function parseDurationDigits(digits: string) {
  const parts = digitsToParts(digits);
  if (!parts) return 0;

  const total = parts.hours * 60 + parts.minutes;
  return Math.min(total, MAX_DURATION_MINUTES);
}

export function appendDurationDigit(currentDigits: string, digit: string) {
  const next = `${currentDigits}${digit}`.slice(0, 4);
  const padded = next.padStart(4, '0');
  const minutes = Number(padded.slice(2, 4));

  if (minutes > 59) {
    return currentDigits;
  }

  return next;
}

export function removeDurationDigit(currentDigits: string) {
  return currentDigits.slice(0, -1);
}

/** @deprecated Use parseDurationDigits with raw digit buffer */
export function parseDurationInput(value: string) {
  return parseDurationDigits(value);
}
