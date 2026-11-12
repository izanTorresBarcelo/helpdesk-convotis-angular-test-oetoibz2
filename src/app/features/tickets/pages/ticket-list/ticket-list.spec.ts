import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TicketList } from './ticket-list';

describe('TicketList - error de carga', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify({ ignoreCancelled: true }));

  it('quita el "Cargando" y muestra el error si la búsqueda falla', () => {
    const fixture = TestBed.createComponent(TicketList);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/tickets').flush([]);

    const component = fixture.componentInstance;
    component['onSearch']('boom');
    expect(component['loading']()).toBe(true);

    httpMock
      .expectOne((r) => r.url === '/api/tickets' && r.params.get('q') === 'boom')
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component['loading']()).toBe(false);
    expect(component['errorMessage']()).toContain('No se han podido cargar los tickets');
  });
});
