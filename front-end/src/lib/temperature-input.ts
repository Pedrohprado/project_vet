import { onlyDigits } from '@/lib/masks';

const MAX_TEMPERATURE_DIGITS = 3;

export const TEMPERATURE_INPUT_PLACEHOLDER = '0.0 ºC';

export function formatTemperatureFromDigits(digits: string): string {
  if (!digits) {
    return '';
  }

  const value = Number(digits) / 10;
  return `${value.toFixed(1)} ºC`;
}

export function handleTemperatureDigitsChange(
  raw: string,
  previousDigits: string,
): string {
  const previousDisplay = formatTemperatureFromDigits(previousDigits);
  const newDigits = onlyDigits(raw).slice(0, MAX_TEMPERATURE_DIGITS);

  if (
    previousDigits &&
    newDigits.length === previousDigits.length &&
    raw.length < previousDisplay.length
  ) {
    return previousDigits.slice(0, -1);
  }

  return newDigits;
}

export function parseTemperatureDigits(digits: string): number | null {
  if (!digits) {
    return null;
  }

  return Number(digits) / 10;
}

export function temperatureValueToDigits(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return '';
  }

  return String(Math.round(num * 10)).slice(0, MAX_TEMPERATURE_DIGITS);
}
