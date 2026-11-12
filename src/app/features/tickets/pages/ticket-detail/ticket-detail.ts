import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  exhaustMap,
  filter,
  finalize,
  interval,
  map,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { TicketsApi } from '../../data/tickets-api';
import { STATUS_LABELS, Ticket, TicketStatus } from '../../models/ticket';
import { SLA_LABELS, slaState } from '../../domain/sla';

@Component({
  selector: 'app-ticket-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  private readonly http = inject(HttpClient);
  private readonly api = inject(TicketsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statuses = Object.keys(STATUS_LABELS) as TicketStatus[];
  protected readonly slaLabels = SLA_LABELS;

  private readonly ticketId = this.route.snapshot.paramMap.get('id')!;

  protected readonly ticket = signal<Ticket | undefined>(undefined);
  protected readonly notFound = signal(false);
  protected readonly saving = signal(false);
  protected readonly statusError = signal<string | null>(null);
  protected readonly canEdit = computed(() => !!this.ticket());
  protected readonly sla = computed(() => {
    const t = this.ticket();
    return t ? slaState(t) : null;
  });

  protected readonly prevId = this.siblingId(-1);
  protected readonly nextId = this.siblingId(+1);

  // Pide el ticket una vez (carga inicial, refresco periódico y tras un error)
  private readonly refresh$ = new Subject<void>();
  // Cambios de estado solicitados por el usuario
  private readonly statusUpdate$ = new Subject<TicketStatus>();

  constructor() {
    this.setupRefresh();
    this.setupStatusUpdates();
  }

  private fetchTicket(): Observable<Ticket> {
    return this.http
      .get<any>(`/api/tickets/${this.ticketId}`)
      .pipe(map((dto) => this.api.toTicket(dto)));
  }

  private setupRefresh(): void {
    // Carga inicial inmediata y refresco cada 5 s para ver comentarios nuevos.
    // switchMap cancela la petición anterior si llega una nueva.
    merge(interval(5000), this.refresh$)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.fetchTicket().pipe(
            catchError(() => {
              this.notFound.set(true);
              return EMPTY;
            }),
          ),
        ),
        // No pisar el estado optimista mientras hay un cambio en curso
        filter(() => !this.saving()),
        takeUntilDestroyed(),
      )
      .subscribe((ticket) => this.ticket.set(ticket));
  }

  private setupStatusUpdates(): void {
    this.statusUpdate$
      .pipe(
        filter((status) => {
          const t = this.ticket();
          return !!t && t.status !== status;
        }),
        // exhaustMap ignora nuevos clics mientras hay un cambio en curso
        exhaustMap((status) => {
          const current = this.ticket()!;
          this.statusError.set(null);
          this.saving.set(true);
          // Actualización optimista: se revierte si el servidor rechaza el cambio
          this.ticket.set({ ...current, status });

          return this.api.updateStatus(current.id, status).pipe(
            tap((dto) => this.ticket.set(this.api.toTicket(dto))),
            catchError((err: HttpErrorResponse) => {
              this.ticket.set(current);
              this.statusError.set(
                `No se pudo cambiar el estado a "${STATUS_LABELS[status]}": ${err.statusText || 'error del servidor'}.`,
              );
              // Sincronizar con el estado real del servidor
              this.refresh$.next();
              return EMPTY;
            }),
            finalize(() => this.saving.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected changeStatus(status: TicketStatus): void {
    this.statusUpdate$.next(status);
  }

  // Necesario para que se muestren el formato y las imágenes de los comentarios
  protected html(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  private siblingId(offset: number): string {
    const n = Number(this.ticketId.replace('T-', '')) + offset;
    return `T-${n}`;
  }
}
