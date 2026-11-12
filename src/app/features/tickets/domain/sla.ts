import { Ticket, TicketPriority } from '../models/ticket';

export type SlaState = 'ok' | 'at_risk' | 'breached';

/** Horas laborables máximas de resolución por prioridad. */
export const SLA_HOURS: Record<TicketPriority, number> = {
  low: 72,
  medium: 24,
  high: 8,
  critical: 4,
};

export const SLA_LABELS: Record<SlaState, string> = {
  ok: 'OK',
  at_risk: 'En riesgo',
  breached: 'Incumplido',
};

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // lunes a viernes
}

/**
 * Horas laborables (lunes a viernes, 09:00–18:00, hora local) entre dos instantes.
 * Fuera de ese horario el reloj del SLA está parado.
 */
export function businessHoursBetween(start: Date, end: Date): number {
  if (end.getTime() <= start.getTime()) return 0;

  let minutes = 0;
  let cursor = new Date(start);

  while (cursor.getTime() < end.getTime()) {
    if (isWorkday(cursor)) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const d = cursor.getDate();
      const dayStart = new Date(y, m, d, WORK_START_HOUR, 0, 0);
      const dayEnd = new Date(y, m, d, WORK_END_HOUR, 0, 0);

      const from = Math.max(cursor.getTime(), dayStart.getTime());
      const to = Math.min(end.getTime(), dayEnd.getTime());
      if (to > from) minutes += (to - from) / 60_000;
    }
    // Avanzar al inicio del día siguiente
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
  }

  return minutes / 60;
}

/**
 * Calcula el estado de SLA de un ticket.
 * Devuelve `null` para tickets cerrados (no muestran indicador).
 * Ver BUSINESS_RULES.md, sección 1.
 */
export function slaState(
  ticket: Pick<Ticket, 'priority' | 'createdAt' | 'status'>,
  now: Date = new Date(),
): SlaState | null {
  if (ticket.status === 'closed') return null;

  const elapsedHours = businessHoursBetween(ticket.createdAt, now);
  const limit = SLA_HOURS[ticket.priority];

  if (elapsedHours > limit) return 'breached';
  if (elapsedHours >= limit * 0.75) return 'at_risk';
  return 'ok';
}
