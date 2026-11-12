import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketsApi } from '../../data/tickets-api';
import { STATUS_LABELS, Ticket, TicketStatus } from '../../models/ticket';
import { TicketRow } from '../../components/ticket-row/ticket-row';

@Component({
  selector: 'app-ticket-list',
  imports: [FormsModule, TicketRow],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketList {
  private readonly api = inject(TicketsApi);
  private readonly router = inject(Router);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statuses = Object.keys(STATUS_LABELS) as TicketStatus[];

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly filtered = signal<Ticket[]>([]);
  protected readonly statusFilter = signal<TicketStatus | 'all'>('all');
  protected readonly loading = signal(false);

  protected readonly errorMessage = signal('');

  protected search = '';

  constructor() {
    // Mantiene la lista filtrada sincronizada con los tickets y el filtro
    effect(() => {
      const status = this.statusFilter();
      this.filtered.set(this.tickets().filter((t) => status === 'all' || t.status === status));
    });

    this.load();
  }

  protected onSearch(term: string): void {
    this.search = term;
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api.search(this.search).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se han podido cargar los tickets. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  protected open(ticket: Ticket): void {
    this.router.navigate(['/tickets', ticket.id]);
  }
}
