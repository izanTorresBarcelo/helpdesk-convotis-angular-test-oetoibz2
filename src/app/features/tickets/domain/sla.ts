import { Ticket, TicketPriority } from '../models/ticket';

export type SlaState = 'ok' | 'at_risk' | 'breached';

export const SLA_HOURS: Record<TicketPriority, number> = {
  low: 72,
  medium: 24,
  high: 4,
  critical: 8,
};

/**
 * Calcula el estado de SLA de un ticket.
 * Ver BUSINESS_RULES.md
 */
export function slaState(ticket: Pick<Ticket, 'priority' | 'createdAt'>, now: Date = new Date()): SlaState {
  const elapsedHours = (now.getTime() - ticket.createdAt.getTime()) / 3_600_000;
  const limit = SLA_HOURS[ticket.priority];

  if (elapsedHours > limit) return 'breached';
  if (elapsedHours > limit * 0.75) return 'at_risk';
  return 'ok';
}
