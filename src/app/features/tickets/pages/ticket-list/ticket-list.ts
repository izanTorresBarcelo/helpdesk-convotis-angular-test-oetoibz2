import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, merge, of, switchMap, tap } from 'rxjs';
import { TicketsApi } from '../../data/tickets-api';
import { STATUS_LABELS, Ticket, TicketStatus } from '../../models/ticket';
import { TicketRow } from '../../components/ticket-row/ticket-row';

/** Tiempo sin teclear antes de buscar en el servidor. */
const SEARCH_DEBOUNCE_MS = 300;

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
  private readonly search$ = new Subject<string>();

  constructor() {
    // Mantiene la lista filtrada sincronizada con los tickets y el filtro
    effect(() => {
      const status = this.statusFilter();
      this.filtered.set(this.tickets().filter((t) => status === 'all' || t.status === status));
    });

    this.setupSearch();
  }

  protected onSearch(term: string): void {
    this.search = term;
    this.search$.next(term);
  }

  private setupSearch(): void {
    // Carga inicial (sin texto) y búsquedas posteriores tras una pausa al teclear
    merge(of(this.search), this.search$.pipe(debounceTime(SEARCH_DEBOUNCE_MS)))
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set('');
        }),
        // switchMap cancela la petición anterior: una respuesta antigua nunca pisa a la actual
        switchMap((term) =>
          this.api.search(term).pipe(
            map((tickets) => ({ tickets })),
            catchError(() => {
              this.errorMessage.set('No se han podido cargar los tickets. Inténtalo de nuevo.');
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ tickets }) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      });
  }

  protected open(ticket: Ticket): void {
    this.router.navigate(['/tickets', ticket.id]);
  }
}
