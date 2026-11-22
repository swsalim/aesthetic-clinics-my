type HourSlot = {
  day_of_week?: number;
  open_time?: string | null;
  close_time?: string | null;
};

type SpecialSlot = {
  date?: string;
  is_closed?: boolean | null;
  open_time?: string | null;
  close_time?: string | null;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function malaysiaParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    dayOfWeek: WEEKDAYS.indexOf(value('weekday')),
    dateKey: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  };
}

function clock(value: string | null | undefined) {
  const text = (value ?? '').trim();
  return text.length >= 5 ? text.slice(0, 5) : '';
}

function minutes(value: string) {
  const [hour, minute] = value.split(':');
  if (hour == null || minute == null) return null;
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);
  if (!Number.isFinite(parsedHour) || !Number.isFinite(parsedMinute)) return null;
  return parsedHour * 60 + parsedMinute;
}

function isWithin(time: string, open: string, close: string) {
  return Boolean(open && close && time >= open && time <= close);
}

/** Same 30-minute window the clinic card uses for "Closing Soon". */
function isClosingSoon(time: string, close: string) {
  const current = minutes(time);
  const closing = minutes(close);
  if (current == null || closing == null) return false;
  return Math.abs(current - closing) <= 30;
}

function shiftIsOpen(time: string, openTime: string | null | undefined, closeTime: string | null | undefined) {
  const open = clock(openTime);
  const close = clock(closeTime);
  if (!open || !close) return false;
  return isWithin(time, open, close) || isClosingSoon(time, close);
}

/**
 * True when the clinic is open or closing soon in Malaysia.
 * Closing soon is still open: the card has not switched to Closed.
 */
export function isClinicOpenNow(hours: HourSlot[], specialHours: SpecialSlot[], date = new Date()) {
  const { dayOfWeek, dateKey, time } = malaysiaParts(date);
  const special = specialHours.find((slot) => (slot.date ?? '').slice(0, 10) === dateKey);

  if (special) {
    if (special.is_closed) return false;
    return shiftIsOpen(time, special.open_time, special.close_time);
  }

  if (dayOfWeek < 0) return false;

  return hours.some(
    (slot) => slot.day_of_week === dayOfWeek && shiftIsOpen(time, slot.open_time, slot.close_time),
  );
}
