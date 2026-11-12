import { slaState } from './sla';

describe('slaState', () => {
  it('devuelve "ok" para un ticket recién creado', () => {
    const now = new Date('2026-03-04T10:00:00');
    const ticket = { priority: 'medium' as const, createdAt: new Date('2026-03-04T09:30:00') };

    expect(slaState(ticket, now)).toBe('ok');
  });
});
