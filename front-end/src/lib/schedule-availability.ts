import {
  addMinutes,
  endOfDay,
  isBefore,
  isSameDay,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import type { Appointment } from '@/types/appointment';

const DEFAULT_SLOT_STEP_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

const ACTIVE_APPOINTMENT_STATUSES = new Set(['SCHEDULED', 'CONFIRMED']);

export type TimeSlotOption = {
  value: string;
  label: string;
  disabled: boolean;
};

export type BusyInterval = {
  start: Date;
  end: Date;
};

export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
) {
  return aStart < bEnd && aEnd > bStart;
}

export function getVetBusyIntervals(
  appointments: Appointment[],
  veterinarianId: string,
  date: Date,
  excludeAppointmentId?: string,
): BusyInterval[] {
  return appointments
    .filter(
      (appointment) =>
        appointment.veterinarianId === veterinarianId &&
        ACTIVE_APPOINTMENT_STATUSES.has(appointment.status) &&
        appointment.id !== excludeAppointmentId &&
        isSameDay(new Date(appointment.scheduledAt), date),
    )
    .map((appointment) => {
      const start = new Date(appointment.scheduledAt);
      const end = addMinutes(start, appointment.durationMinutes);
      return { start, end };
    });
}

function buildSlotDate(date: Date, totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return setMinutes(setHours(startOfDay(date), hours), minutes);
}

function isSlotInPast(slotStart: Date, durationMinutes: number, now: Date) {
  const slotEnd = addMinutes(slotStart, durationMinutes);
  return isBefore(slotEnd, now) || slotStart < now;
}

function isSlotAvailable(
  slotStart: Date,
  durationMinutes: number,
  busyIntervals: BusyInterval[],
  now: Date,
) {
  if (isSlotInPast(slotStart, durationMinutes, now)) {
    return false;
  }

  const slotEnd = addMinutes(slotStart, durationMinutes);
  if (slotEnd > endOfDay(slotStart)) {
    return false;
  }

  return !busyIntervals.some((interval) =>
    intervalsOverlap(slotStart, slotEnd, interval.start, interval.end),
  );
}

export function generateDayTimeOptions(
  date: Date,
  durationMinutes: number,
  appointments: Appointment[],
  veterinarianId: string,
  excludeAppointmentId?: string,
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES,
): TimeSlotOption[] {
  const busyIntervals = getVetBusyIntervals(
    appointments,
    veterinarianId,
    date,
    excludeAppointmentId,
  );
  const now = new Date();
  const options: TimeSlotOption[] = [];

  for (
    let totalMinutes = 0;
    totalMinutes < MINUTES_PER_DAY;
    totalMinutes += stepMinutes
  ) {
    const slotStart = buildSlotDate(date, totalMinutes);
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    const timeValue = `${hours}:${minutes}`;
    const available = isSlotAvailable(
      slotStart,
      durationMinutes,
      busyIntervals,
      now,
    );

    options.push({
      value: timeValue,
      label: available ? timeValue : `${timeValue} (indisponível)`,
      disabled: !available,
    });
  }

  return options;
}

export function hasDayAvailability(
  date: Date,
  durationMinutes: number,
  appointments: Appointment[],
  veterinarianId: string,
  excludeAppointmentId?: string,
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES,
) {
  if (isBefore(endOfDay(date), startOfDay(new Date()))) {
    return false;
  }

  return generateDayTimeOptions(
    date,
    durationMinutes,
    appointments,
    veterinarianId,
    excludeAppointmentId,
    stepMinutes,
  ).some((option) => !option.disabled);
}

export function isDayFullyBooked(
  date: Date,
  durationMinutes: number,
  appointments: Appointment[],
  veterinarianId: string,
  excludeAppointmentId?: string,
  stepMinutes = DEFAULT_SLOT_STEP_MINUTES,
) {
  if (isBefore(endOfDay(date), startOfDay(new Date()))) {
    return true;
  }

  return !hasDayAvailability(
    date,
    durationMinutes,
    appointments,
    veterinarianId,
    excludeAppointmentId,
    stepMinutes,
  );
}

export function isTimeSlotAvailable(
  date: Date,
  timeValue: string,
  durationMinutes: number,
  appointments: Appointment[],
  veterinarianId: string,
  excludeAppointmentId?: string,
) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  const slotStart = setMinutes(setHours(startOfDay(date), hours), minutes);
  const busyIntervals = getVetBusyIntervals(
    appointments,
    veterinarianId,
    date,
    excludeAppointmentId,
  );

  return isSlotAvailable(slotStart, durationMinutes, busyIntervals, new Date());
}

export function findFirstAvailableTime(
  date: Date,
  durationMinutes: number,
  appointments: Appointment[],
  veterinarianId: string,
  excludeAppointmentId?: string,
) {
  return generateDayTimeOptions(
    date,
    durationMinutes,
    appointments,
    veterinarianId,
    excludeAppointmentId,
  ).find((option) => !option.disabled)?.value;
}
