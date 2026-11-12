import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TicketList } from './ticket-list';

const isSearch = (term: string) => (r: { url: string; params: { get(k: string): string | null } }) =>
  r.url === '/api/tickets' && (r.params.get('q') ?? '') === term;

const ticketDto = (id: string, title: string) => ({
  id,
  title,
  description: '',
  status: 'open',
  priority: 'low',
  requester: 'Test',
  assignee: null,
  created_at: new Date().toISOString(),
  closed_at: null,
  comments: [],
});

describe('TicketList - búsqueda y errores', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify({ ignoreCancelled: true });
    vi.useRealTimers();
  });

  function create() {
    const fixture = TestBed.createComponent(TicketList);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/tickets').flush([]);
    return { fixture, component: fixture.componentInstance };
  }

  it('no lanza una petición por cada tecla: espera a que el usuario pause', () => {
    const { component } = create();

    component['onSearch']('p');
    component['onSearch']('pa');
    component['onSearch']('pago');
    vi.advanceTimersByTime(299);
    httpMock.expectNone(isSearch('pago'));

    vi.advanceTimersByTime(1);
    httpMock.expectOne(isSearch('pago')).flush([ticketDto('T-1', 'Pagos duplicados')]);

    expect(component['tickets']().map((t) => t.id)).toEqual(['T-1']);
  });

  it('una respuesta antigua no pisa el resultado de la búsqueda actual', () => {
    const { component } = create();

    component['onSearch']('p');
    vi.advanceTimersByTime(300);
    const slow = httpMock.expectOne(isSearch('p'));

    component['onSearch']('pago');
    vi.advanceTimersByTime(300);
    const fast = httpMock.expectOne(isSearch('pago'));

    fast.flush([ticketDto('T-1', 'Pagos duplicados')]);
    expect(slow.cancelled).toBe(true);
    expect(component['tickets']().map((t) => t.id)).toEqual(['T-1']);
  });

  it('quita el "Cargando" y muestra el error si la búsqueda falla', () => {
    const { component } = create();

    component['onSearch']('boom');
    vi.advanceTimersByTime(300);
    expect(component['loading']()).toBe(true);

    httpMock
      .expectOne(isSearch('boom'))
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component['loading']()).toBe(false);
    expect(component['errorMessage']()).toContain('No se han podido cargar los tickets');
  });
});
