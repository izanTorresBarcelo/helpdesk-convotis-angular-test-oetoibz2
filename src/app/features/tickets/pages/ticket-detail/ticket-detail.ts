import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { allowedTransitions } from '../../domain/status-transitions';
import { CommentLengthError, canAddComment, commentLengthError, COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from '../../domain/comment-rules';

const COMMENT_ERROR_MESSAGES: Record<CommentLengthError, string> = {
  too_short: `El comentario debe tener al menos ${COMMENT_MIN_LENGTH} caracteres (sin contar espacios al inicio y al final).`,
  too_long: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`,
};

function commentValidator(control: AbstractControl): ValidationErrors | null {
  const error = commentLengthError(control.value ?? '');
  return error ? { length: error } : null;
}

@Component({
  selector: 'app-ticket-detail',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  private readonly http = inject(HttpClient);
  private readonly api = inject(TicketsApi);
  private readonly route = inject(ActivatedRoute);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly slaLabels = SLA_LABELS;
  protected readonly commentLimits = { min: COMMENT_MIN_LENGTH, max: COMMENT_MAX_LENGTH };

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
  // Solo se ofrecen los estados permitidos por BUSINESS_RULES.md
  protected readonly allowedStatuses = computed(() => {
    const t = this.ticket();
    return t ? allowedTransitions(t) : [];
  });
  protected readonly canComment = computed(() => {
    const t = this.ticket();
    return !!t && canAddComment(t);
  });

  // Formulario de comentario
  protected readonly commentForm = new FormGroup({
    body: new FormControl('', { nonNullable: true, validators: [commentValidator] }),
  });
  protected readonly postingComment = signal(false);
  protected readonly commentError = signal<string | null>(null);

  protected readonly prevId = this.siblingId(-1);
  protected readonly nextId = this.siblingId(+1);

  // Pide el ticket una vez (carga inicial, refresco periódico y tras un error)
  private readonly refresh$ = new Subject<void>();
  // Cambios de estado solicitados por el usuario
  private readonly statusUpdate$ = new Subject<TicketStatus>();
  // Envíos de comentario solicitados por el usuario
  private readonly commentSubmit$ = new Subject<void>();

  constructor() {
    this.setupRefresh();
    this.setupStatusUpdates();
    this.setupCommentSubmit();
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
          return !!t && allowedTransitions(t).includes(status);
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

  private setupCommentSubmit(): void {
    this.commentSubmit$
      .pipe(
        filter(() => this.canComment() && this.commentForm.valid),
        // exhaustMap ignora nuevos envíos mientras hay uno en curso (no se puede enviar dos veces)
        exhaustMap(() => {
          const current = this.ticket();
          if (!current) return EMPTY;

          const body = this.commentForm.controls.body.value.trim();
          this.commentError.set(null);
          this.postingComment.set(true);

          return this.api.addComment(current.id, body).pipe(
            tap((dto) => {
              this.ticket.update((t) =>
                t ? { ...t, comments: [...t.comments, this.api.toComment(dto)] } : t,
              );
              this.commentForm.reset();
              // Sincroniza con el servidor y descarta cualquier refresco anterior en vuelo
              this.refresh$.next();
            }),
            // Si falla, el texto se conserva en el formulario para que el usuario pueda reintentarlo
            catchError(() => {
              this.commentError.set(
                'No se ha podido añadir el comentario. Tu texto se ha conservado; inténtalo de nuevo.',
              );
              return EMPTY;
            }),
            finalize(() => this.postingComment.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected changeStatus(status: TicketStatus): void {
    this.statusUpdate$.next(status);
  }

  protected submitComment(): void {
    this.commentForm.markAllAsTouched();
    if (this.postingComment()) return;
    this.commentSubmit$.next();
  }

  protected commentErrorMessage(): string | null {
    const error = this.commentForm.controls.body.errors?.['length'] as CommentLengthError | undefined;
    return error ? COMMENT_ERROR_MESSAGES[error] : null;
  }

  private siblingId(offset: number): string {
    const n = Number(this.ticketId.replace('T-', '')) + offset;
    return `T-${n}`;
  }
}
