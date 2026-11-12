export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TicketComment {
  id: string;
  author: string;
  bodyHtml: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester: string;
  assignee: string | null;
  createdAt: Date;
  closedAt: Date | null;
  comments: TicketComment[];
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  waiting_customer: 'Esperando cliente',
  closed: 'Cerrado',
};
