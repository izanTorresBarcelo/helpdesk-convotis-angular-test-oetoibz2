import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketDetail } from './ticket-detail';

const dto = (status: string, comments: any[] = []) => ({
  id: 'T-1007',
  title: 'Pagos duplicados en pasarela',
  description: 'Algunos clientes reportan cargos dobles.',
  status,
  priority: 'critical',
  requester: 'Sonia Vidal',
  assignee: 'Ana Gómez',
  created_at: new Date().toISOString(),
  closed_at: null,
  comments,
});

const VALID_COMMENT = 'Comentario de prueba válido';

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

describe('TicketDetail - añadir comentarios', () => {
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

  function setup(status = 'in_progress') {
    const fixture = TestBed.createComponent(TicketDetail);
    fixture.detectChanges();
    httpMock.expectOne('/api/tickets/T-1007').flush(dto(status));
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  const setBody = (component: TicketDetail, value: string) =>
    component['commentForm'].controls.body.setValue(value);

  it('envía el comentario sin espacios sobrantes y lo añade al listado', () => {
    const { fixture, component } = setup();
    setBody(component, `  ${VALID_COMMENT}  `);

    component['submitComment']();

    httpMock
      .expectOne({ method: 'POST', url: '/api/tickets/T-1007/comments' })
      .flush({ id: 'C-9', author: 'Tú', body_html: VALID_COMMENT, created_at: new Date().toISOString() });
    // Refresco posterior con el servidor como fuente de verdad
    httpMock
      .expectOne('/api/tickets/T-1007')
      .flush(
        dto('in_progress', [{ id: 'C-9', author: 'Tú', body_html: VALID_COMMENT, created_at: new Date().toISOString() }]),
      );
    fixture.detectChanges();

    expect(component['ticket']()?.comments.length).toBe(1);
    expect(component['commentForm'].controls.body.value).toBe('');
    expect(component['commentError']()).toBeNull();
  });

  it('no envía un comentario demasiado corto y muestra el error', () => {
    const { component } = setup();
    setBody(component, 'corto');

    component['submitComment']();

    httpMock.expectNone({ method: 'POST', url: '/api/tickets/T-1007/comments' });
    expect(component['commentErrorMessage']()).toContain('al menos 10 caracteres');
  });

  it('no envía dos veces mientras hay un envío en curso', () => {
    const { component } = setup();
    setBody(component, VALID_COMMENT);

    component['submitComment']();
    component['submitComment']();

    const requests = httpMock.match({ method: 'POST', url: '/api/tickets/T-1007/comments' });
    expect(requests.length).toBe(1);
    requests[0].flush({ id: 'C-9', author: 'Tú', body_html: VALID_COMMENT, created_at: new Date().toISOString() });
    httpMock.expectOne('/api/tickets/T-1007').flush(dto('in_progress'));
  });

  it('conserva el texto y avisa si el envío falla', () => {
    const { component } = setup();
    const text = `Esto debería fallar: fail ${VALID_COMMENT}`;
    setBody(component, text);

    component['submitComment']();

    httpMock
      .expectOne({ method: 'POST', url: '/api/tickets/T-1007/comments' })
      .flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(component['commentForm'].controls.body.value).toBe(text);
    expect(component['commentError']()).toContain('Tu texto se ha conservado');
    expect(component['postingComment']()).toBe(false);
  });

  it('no permite comentar en tickets cerrados', () => {
    const { fixture, component } = setup('closed');
    setBody(component, VALID_COMMENT);

    component['submitComment']();

    httpMock.expectNone({ method: 'POST', url: '/api/tickets/T-1007/comments' });
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
