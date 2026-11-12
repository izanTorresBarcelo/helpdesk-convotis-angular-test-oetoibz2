import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, mergeMap, of, throwError, timer } from 'rxjs';
import { FAKE_DB, ServerTicket } from './fake-db';

/**
 * Simula un servidor REST bajo /api.
 *
 * Endpoints:
 *   GET    /api/tickets?q=&status=&priority=
 *   GET    /api/tickets/:id
 *   PATCH  /api/tickets/:id            body: { status }
 *   POST   /api/tickets/:id/comments   body: { body }
 *
 * Comportamiento "realista" del servidor (no es un bug a corregir aquí):
 *   - La latencia varía según la consulta.
 *   - Puede devolver errores 4xx/5xx en determinados casos.
 *
 * ⚠️ No modifiques este fichero salvo que lo justifiques en SOLUTION_NOTES.md.
 */
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  console.debug(`[fake-api] ${req.method} ${req.urlWithParams}`);
  return handle(req);
};

function handle(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  const path = req.url.replace(/^\/api/, '');
  const detail = path.match(/^\/tickets\/([^/]+)$/);
  const comments = path.match(/^\/tickets\/([^/]+)\/comments$/);

  if (req.method === 'GET' && path === '/tickets') {
    const q = (req.params.get('q') ?? '').trim().toLowerCase();
    const status = req.params.get('status');
    const priority = req.params.get('priority');

    if (q.includes('boom')) {
      return fail(500, 'Internal Server Error', 600);
    }

    const result = FAKE_DB.filter(
      (t) =>
        (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) &&
        (!status || t.status === status) &&
        (!priority || t.priority === priority),
    ).map(({ comments: _c, ...summary }) => summary);

    // Las búsquedas cortas son más "caras" en este servidor.
    const latency = Math.max(150, 1400 - q.length * 300);
    return ok(result, latency);
  }

  if (req.method === 'GET' && detail) {
    const ticket = find(detail[1]);
    return ticket ? ok(structuredClone(ticket), 350) : fail(404, 'Not Found', 300);
  }

  if (req.method === 'PATCH' && detail) {
    const ticket = find(detail[1]);
    if (!ticket) return fail(404, 'Not Found', 300);
    if (ticket.id === 'T-1007') {
      return fail(409, 'Conflict: ticket bloqueado por otro equipo', 700);
    }
    const body = req.body as Partial<Pick<ServerTicket, 'status'>>;
    if (body.status) {
      ticket.status = body.status;
      ticket.closed_at = body.status === 'closed' ? new Date().toISOString() : null;
    }
    return ok(structuredClone(ticket), 500);
  }

  if (req.method === 'POST' && comments) {
    const ticket = find(comments[1]);
    if (!ticket) return fail(404, 'Not Found', 300);
    const text = String((req.body as { body?: string })?.body ?? '');
    if (text.toLowerCase().includes('fail')) {
      return fail(503, 'Service Unavailable', 800);
    }
    const comment = {
      id: `C-${Date.now()}`,
      author: 'Tú',
      body_html: escapeHtml(text),
      created_at: new Date().toISOString(),
    };
    ticket.comments.push(comment);
    return ok(comment, 500);
  }

  return fail(404, 'Not Found', 100);
}

function find(id: string): ServerTicket | undefined {
  return FAKE_DB.find((t) => t.id === id);
}

function ok<T>(body: T, ms: number): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(ms));
}

function fail(status: number, statusText: string, ms: number): Observable<never> {
  return timer(ms).pipe(
    mergeMap(() => throwError(() => new HttpErrorResponse({ status, statusText, url: 'fake-api' }))),
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
