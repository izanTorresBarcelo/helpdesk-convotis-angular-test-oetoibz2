import { TicketPriority, TicketStatus } from '../models/ticket';
import { SLA_HOURS, slaState } from './sla';

// 2026-03-04 es miércoles. Las fechas sin "Z" son hora local.
const make = (priority: TicketPriority, createdAt: string, status: TicketStatus = 'open') => ({
  priority,
  createdAt: new Date(createdAt),
  status,
});

describe('slaState', () => {
  it('devuelve "ok" para un ticket recién creado', () => {
    const now = new Date('2026-03-04T10:00:00');
    const ticket = make('medium', '2026-03-04T09:30:00');

    expect(slaState(ticket, now)).toBe('ok');
  });

  it('usa los límites de BUSINESS_RULES.md (critical 4 h, high 8 h)', () => {
    expect(SLA_HOURS).toEqual({ low: 72, medium: 24, high: 8, critical: 4 });
  });

  it('pasa a "at_risk" al consumir exactamente el 75 % (critical: 3 h laborables)', () => {
    const ticket = make('critical', '2026-03-04T09:00:00');

    expect(slaState(ticket, new Date('2026-03-04T11:59:00'))).toBe('ok');
    expect(slaState(ticket, new Date('2026-03-04T12:00:00'))).toBe('at_risk');
  });

  it('pasa a "breached" al superar el límite (high: más de 8 h laborables)', () => {
    const ticket = make('high', '2026-03-04T09:00:00');

    expect(slaState(ticket, new Date('2026-03-04T17:00:00'))).toBe('at_risk');
    expect(slaState(ticket, new Date('2026-03-04T17:01:00'))).toBe('breached');
  });

  it('no consume SLA fuera del horario laborable', () => {
    // Creado a las 17:00 y consultado a las 09:00 del día siguiente: solo 1 h laborable
    const ticket = make('high', '2026-03-04T17:00:00');

    expect(slaState(ticket, new Date('2026-03-05T09:00:00'))).toBe('ok');
  });

  it('no consume SLA durante el fin de semana', () => {
    // Viernes 10:00 -> lunes 10:00: 8 h el viernes + 1 h el lunes = 9 h laborables (> 8 h de high)
    const ticket = make('high', '2026-03-06T10:00:00');

    expect(slaState(ticket, new Date('2026-03-09T10:00:00'))).toBe('breached');
  });

  it('devuelve null para tickets cerrados', () => {
    const ticket = make('critical', '2026-03-04T09:00:00', 'closed');

    expect(slaState(ticket, new Date('2026-03-04T17:00:00'))).toBeNull();
  });
});
