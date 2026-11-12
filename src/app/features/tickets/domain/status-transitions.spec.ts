import { allowedTransitions } from './status-transitions';

const NOW = new Date('2026-03-10T12:00:00');
const DAY = 24 * 3_600_000;

describe('allowedTransitions', () => {
  it('open puede pasar a in_progress o closed', () => {
    expect(allowedTransitions({ status: 'open', closedAt: null }, NOW)).toEqual(['in_progress', 'closed']);
  });

  it('in_progress puede pasar a waiting_customer o closed', () => {
    expect(allowedTransitions({ status: 'in_progress', closedAt: null }, NOW)).toEqual(['waiting_customer', 'closed']);
  });

  it('waiting_customer puede pasar a in_progress o closed', () => {
    expect(allowedTransitions({ status: 'waiting_customer', closedAt: null }, NOW)).toEqual(['in_progress', 'closed']);
  });

  it('closed solo puede reabrirse si se cerró hace 7 días o menos', () => {
    const closedAt = new Date(NOW.getTime() - 7 * DAY);
    expect(allowedTransitions({ status: 'closed', closedAt }, NOW)).toEqual(['open']);
  });

  it('closed hace más de 7 días no tiene transiciones', () => {
    const closedAt = new Date(NOW.getTime() - 7 * DAY - 1);
    expect(allowedTransitions({ status: 'closed', closedAt }, NOW)).toEqual([]);
  });

  it('closed sin fecha de cierre no tiene transiciones', () => {
    expect(allowedTransitions({ status: 'closed', closedAt: null }, NOW)).toEqual([]);
  });
});
