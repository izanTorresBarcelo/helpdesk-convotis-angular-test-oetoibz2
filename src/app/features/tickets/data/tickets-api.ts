import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Ticket, TicketComment, TicketStatus } from '../models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketsApi {
  private readonly http = inject(HttpClient);

  search(q: string): Observable<Ticket[]> {
    return this.http
      .get<any[]>('/api/tickets', { params: { q } })
      .pipe(map((list) => list.map((dto) => this.toTicket(dto))));
  }

  updateStatus(id: string, status: TicketStatus): Observable<any> {
    return this.http.patch(`/api/tickets/${id}`, { status });
  }

  addComment(id: string, body: string): Observable<any> {
    return this.http.post(`/api/tickets/${id}/comments`, { body });
  }

  // TODO: tipar el contrato del servidor
  toTicket(dto: any): Ticket {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      requester: dto.requester,
      assignee: dto.assignee,
      createdAt: new Date(dto.created_at),
      closedAt: dto.closed_at ? new Date(dto.closed_at) : null,
      // Del más antiguo al más reciente (BUSINESS_RULES.md, sección 3)
      comments: (dto.comments ?? []).map((c: any) => this.toComment(c)).sort((a: TicketComment, b: TicketComment) => a.createdAt.getTime() - b.createdAt.getTime()),
    };
  }

  toComment(dto: any): TicketComment {
    return {
      id: dto.id,
      author: dto.author,
      bodyHtml: dto.body_html,
      createdAt: new Date(dto.created_at),
    };
  }
}
