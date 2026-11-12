import { Ticket } from '../models/ticket';

/** Ver BUSINESS_RULES.md, sección 3. Longitudes contadas sin espacios al inicio y al final. */
export const COMMENT_MIN_LENGTH = 10;
export const COMMENT_MAX_LENGTH = 500;

export type CommentLengthError = 'too_short' | 'too_long';

export function commentLengthError(text: string): CommentLengthError | null {
  const length = text.trim().length;
  if (length < COMMENT_MIN_LENGTH) return 'too_short';
  if (length > COMMENT_MAX_LENGTH) return 'too_long';
  return null;
}

/** Los comentarios se pueden añadir en cualquier estado excepto `closed`. */
export function canAddComment(ticket: Pick<Ticket, 'status'>): boolean {
  return ticket.status !== 'closed';
}
