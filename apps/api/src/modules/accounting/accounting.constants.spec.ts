import { ACCOUNT_CODES } from './accounting.constants';

describe('ACCOUNT_CODES', () => {
  it('includes Oman shop GL codes', () => {
    expect(ACCOUNT_CODES.CASH).toBe('1000');
    expect(ACCOUNT_CODES.BANK).toBe('1100');
    expect(ACCOUNT_CODES.AR).toBe('1200');
    expect(ACCOUNT_CODES.INVENTORY).toBe('1300');
    expect(ACCOUNT_CODES.INPUT_VAT).toBe('1400');
    expect(ACCOUNT_CODES.AP).toBe('2000');
    expect(ACCOUNT_CODES.OUTPUT_VAT).toBe('2100');
    expect(ACCOUNT_CODES.ADVANCES).toBe('2200');
    expect(ACCOUNT_CODES.SALES).toBe('4000');
    expect(ACCOUNT_CODES.COGS).toBe('5000');
  });
});
