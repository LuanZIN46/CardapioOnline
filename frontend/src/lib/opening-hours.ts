import type { OpeningHour, StoreStatus, Weekday } from '@/types';
import { formatTime } from './format';

const MINUTES_IN_DAY = 24 * 60;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function shiftWeekday(weekday: number, offset: number): Weekday {
  return (((weekday + offset) % 7) + 7) % 7 as Weekday;
}

interface Window {
  start: number;
  end: number;
  closesAt: string;
}

/** Janela de funcionamento em minutos relativos ao início do dia informado. */
function windowFor(schedule: OpeningHour | undefined, dayOffset: number): Window | null {
  if (!schedule || schedule.closed) return null;
  const start = toMinutes(schedule.opensAt) + dayOffset * MINUTES_IN_DAY;
  const rawEnd = toMinutes(schedule.closesAt);
  // Fechamento menor ou igual à abertura significa que a loja vira o dia.
  const end =
    (rawEnd <= toMinutes(schedule.opensAt) ? rawEnd + MINUTES_IN_DAY : rawEnd) +
    dayOffset * MINUTES_IN_DAY;
  return { start, end, closesAt: schedule.closesAt };
}

export function getStoreStatus(hours: OpeningHour[], now = new Date()): StoreStatus {
  const byWeekday = new Map(hours.map((hour) => [hour.weekday, hour]));
  const today = now.getDay() as Weekday;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const activeWindows = [
    windowFor(byWeekday.get(shiftWeekday(today, -1)), -1),
    windowFor(byWeekday.get(today), 0),
  ].filter((window): window is Window => window !== null);

  const openWindow = activeWindows.find(
    (window) => nowMinutes >= window.start && nowMinutes < window.end,
  );

  if (openWindow) {
    return {
      isOpen: true,
      message: `Aberto agora · fecha às ${formatTime(openWindow.closesAt)}`,
      nextChange: openWindow.closesAt,
    };
  }

  for (let offset = 0; offset < 8; offset += 1) {
    const weekday = shiftWeekday(today, offset);
    const schedule = byWeekday.get(weekday);
    const window = windowFor(schedule, offset);
    if (!window || !schedule) continue;
    if (window.start <= nowMinutes) continue;

    const when =
      offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : WEEKDAY_LABELS[weekday].toLowerCase();
    return {
      isOpen: false,
      message: `Fechado · abre ${when} às ${formatTime(schedule.opensAt)}`,
      nextChange: schedule.opensAt,
    };
  }

  return { isOpen: false, message: 'Estamos fechados no momento.' };
}

export function formatScheduleLine(schedule: OpeningHour): string {
  if (schedule.closed) return 'Fechado';
  return `${formatTime(schedule.opensAt)} às ${formatTime(schedule.closesAt)}`;
}
