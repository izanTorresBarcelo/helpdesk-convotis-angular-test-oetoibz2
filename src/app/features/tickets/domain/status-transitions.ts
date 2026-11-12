import { Ticket, TicketStatus } from '../models/ticket';

/** Transiciones permitidas entre estados. Ver BUSINESS_RULES.md, sección 2. */
const TRANSITIONS: Record<Exclude<TicketStatus, 'closed'>, TicketStatus[]> = {
  open: ['in_progress', 'closed'],
  in_progress: ['waiting_customer', 'closed'],
  waiting_customer: ['in_progress', 'closed'],
};

const REOPEN_WINDOW_MS = 7 * 24 * 3_600_000;

/**
 * Estados a los que se puede pasar desde el estado actual del ticket.
 * - closed -> open solo si se cerró hace 7 días o menos.
 */
export function allowedTransitions(
  ticket: Pick<Ticket, 'status' | 'closedAt'>,
  now: Date = new Date(),
): TicketStatus[] {
  if (ticket.status === 'closed') {
    if (!ticket.closedAt) return [];
    const elapsed = now.getTime() - new Date(ticket.closedAt).getTime();
    return elapsed <= REOPEN_WINDOW_MS ? ['open'] : [];
  }
  return TRANSITIONS[ticket.status];
}
