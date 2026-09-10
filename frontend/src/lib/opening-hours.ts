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

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/** Meia-noite local da data informada, para contar dias inteiros de diferença. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function labelForOffset(offset: number, weekday: Weekday): string {
  if (offset === 0) return 'hoje';
  if (offset === 1) return 'amanhã';
  return WEEKDAY_LABELS[weekday].toLowerCase();
}

/**
 * Primeira abertura agendada a partir de um instante qualquer.
 * O rótulo ("hoje", "amanhã") sai da distância até `now`, não até a referência —
 * durante uma pausa a busca começa na virada do dia, mas quem lê a frase ainda
 * está em hoje.
 */
function nextOpening(
  byWeekday: Map<Weekday, OpeningHour>,
  from: Date,
  now: Date,
): { schedule: OpeningHour; label: string } | null {
  const fromWeekday = from.getDay() as Weekday;
  const fromMinutes = from.getHours() * 60 + from.getMinutes();
  const dayShift = Math.round((startOfDay(from).getTime() - startOfDay(now).getTime()) / MS_IN_DAY);

  for (let offset = 0; offset < 8; offset += 1) {
    const weekday = shiftWeekday(fromWeekday, offset);
    const schedule = byWeekday.get(weekday);
    if (!schedule || schedule.closed) continue;
    if (offset === 0 && toMinutes(schedule.opensAt) <= fromMinutes) continue;

    return { schedule, label: labelForOffset(dayShift + offset, weekday) };
  }

  return null;
}

/**
 * Situação da loja agora.
 *
 * `pausaAte` é o fechamento avulso do dia decidido no painel. Ele vence sozinho
 * na virada, então basta compará-lo com o relógio: nunca fica um "fechado"
 * esquecido de ontem.
 */
export function getStoreStatus(
  hours: OpeningHour[],
  now = new Date(),
  pausaAte?: Date | null,
): StoreStatus {
  const byWeekday = new Map(hours.map((hour) => [hour.weekday, hour]));
  const today = now.getDay() as Weekday;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (pausaAte && pausaAte.getTime() > now.getTime()) {
    const abertura = nextOpening(byWeekday, pausaAte, now);
    return {
      isOpen: false,
      message: abertura
        ? `Fechado hoje · voltamos ${abertura.label} às ${formatTime(abertura.schedule.opensAt)}`
        : 'Fechado hoje · voltamos em breve',
      nextChange: abertura?.schedule.opensAt,
    };
  }

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

  const abertura = nextOpening(byWeekday, now, now);

  if (abertura) {
    return {
      isOpen: false,
      message: `Fechado · abre ${abertura.label} às ${formatTime(abertura.schedule.opensAt)}`,
      nextChange: abertura.schedule.opensAt,
    };
  }

  return { isOpen: false, message: 'Estamos fechados no momento.' };
}

export function formatScheduleLine(schedule: OpeningHour): string {
  if (schedule.closed) return 'Fechado';
  return `${formatTime(schedule.opensAt)} às ${formatTime(schedule.closesAt)}`;
}
