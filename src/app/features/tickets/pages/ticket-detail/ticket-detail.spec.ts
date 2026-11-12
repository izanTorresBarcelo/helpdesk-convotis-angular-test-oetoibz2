import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketDetail } from './ticket-detail';

const dto = (status: string) => ({
  id: 'T-1007',
  title: 'Pagos duplicados en pasarela',
  description: 'Algunos clientes reportan cargos dobles.',
  status,
  priority: 'critical',
  requester: 'Sonia Vidal',
  assignee: 'Ana Gómez',
  created_at: new Date().toISOString(),
  closed_at: null,
  comments: [],
});

describe('TicketDetail - cambio de estado', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'T-1007' }) } },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify({ ignoreCancelled: true }));

  it('revierte el estado y muestra un aviso si el servidor rechaza el cambio (409)', () => {
    const fixture = TestBed.createComponent(TicketDetail);
    fixture.detectChanges();
    httpMock.expectOne('/api/tickets/T-1007').flush(dto('open'));
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component['changeStatus']('in_progress');
    fixture.detectChanges();
    expect(component['ticket']()?.status).toBe('in_progress');

    httpMock
      .expectOne({ method: 'PATCH', url: '/api/tickets/T-1007' })
      .flush({}, { status: 409, statusText: 'Conflict: ticket bloqueado por otro equipo' });

    // Tras el error se vuelve a pedir el estado real del servidor
    httpMock.expectOne('/api/tickets/T-1007').flush(dto('open'));
    fixture.detectChanges();

    expect(component['ticket']()?.status).toBe('open');
    expect(component['saving']()).toBe(false);
    expect(component['statusError']()).toContain('Conflict: ticket bloqueado por otro equipo');
  });

  it('cancela el refresco periódico al destruir el componente', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(TicketDetail);
      fixture.detectChanges();
      httpMock.expectOne('/api/tickets/T-1007').flush(dto('open'));

      fixture.destroy();
      vi.advanceTimersByTime(20_000);

      httpMock.expectNone('/api/tickets/T-1007');
    } finally {
      vi.useRealTimers();
    }
  });

  it('no envía transiciones no permitidas (open -> waiting_customer)', () => {
    const fixture = TestBed.createComponent(TicketDetail);
    fixture.detectChanges();
    httpMock.expectOne('/api/tickets/T-1007').flush(dto('open'));

    fixture.componentInstance['changeStatus']('waiting_customer');

    httpMock.expectNone({ method: 'PATCH', url: '/api/tickets/T-1007' });
  });

  it('confirma el cambio cuando el servidor lo acepta', () => {
    const fixture = TestBed.createComponent(TicketDetail);
    fixture.detectChanges();
    httpMock.expectOne('/api/tickets/T-1007').flush(dto('open'));

    const component = fixture.componentInstance;
    component['changeStatus']('in_progress');

    httpMock.expectOne({ method: 'PATCH', url: '/api/tickets/T-1007' }).flush(dto('in_progress'));

    expect(component['ticket']()?.status).toBe('in_progress');
    expect(component['saving']()).toBe(false);
    expect(component['statusError']()).toBeNull();
  });
});
