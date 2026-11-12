import { canAddComment, commentLengthError } from './comment-rules';

describe('commentLengthError', () => {
  it('rechaza textos de menos de 10 caracteres', () => {
    expect(commentLengthError('123456789')).toBe('too_short');
  });

  it('acepta exactamente 10 caracteres', () => {
    expect(commentLengthError('1234567890')).toBeNull();
  });

  it('no cuenta los espacios al inicio y al final', () => {
    expect(commentLengthError('   123456789   ')).toBe('too_short');
    expect(commentLengthError('   1234567890   ')).toBeNull();
  });

  it('acepta exactamente 500 caracteres y rechaza 501', () => {
    expect(commentLengthError('a'.repeat(500))).toBeNull();
    expect(commentLengthError('a'.repeat(501))).toBe('too_long');
  });

  it('rechaza un texto vacío', () => {
    expect(commentLengthError('')).toBe('too_short');
  });
});

describe('canAddComment', () => {
  it('permite comentar en cualquier estado excepto closed', () => {
    expect(canAddComment({ status: 'open' })).toBe(true);
    expect(canAddComment({ status: 'in_progress' })).toBe(true);
    expect(canAddComment({ status: 'waiting_customer' })).toBe(true);
    expect(canAddComment({ status: 'closed' })).toBe(false);
  });
});
