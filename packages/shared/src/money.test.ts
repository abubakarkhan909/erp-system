import {
  addMoney,
  subMoney,
  mulMoney,
  calcVat,
  calcGoldLine,
  roundMoney,
  toMinorUnits,
  fromMinorUnits,
} from '../src/money';

describe('OMR money helpers', () => {
  it('rounds to 3 decimals', () => {
    expect(roundMoney('1.2345')).toBe('1.235');
    expect(roundMoney(1.2)).toBe('1.200');
  });

  it('adds and subtracts without float drift', () => {
    expect(addMoney('10.100', '0.200')).toBe('10.300');
    expect(subMoney('10.000', '0.001')).toBe('9.999');
  });

  it('multiplies weight × rate', () => {
    expect(mulMoney('10.000', '22.500')).toBe('225.000');
  });

  it('calculates 5% Oman VAT', () => {
    const { net, vat, gross } = calcVat('100.000', 5);
    expect(net).toBe('100.000');
    expect(vat).toBe('5.000');
    expect(gross).toBe('105.000');
  });

  it('calculates gold line with making and stone', () => {
    const line = calcGoldLine({
      netWeightGram: '10.000',
      ratePerGram: '30.000',
      makingCharges: '5.000',
      stoneCharges: '2.000',
      lineDiscount: '1.000',
      vatRatePercent: 5,
    });
    expect(line.goldValue).toBe('300.000');
    expect(line.lineNet).toBe('306.000');
    expect(line.vatAmount).toBe('15.300');
    expect(line.lineTotal).toBe('321.300');
  });

  it('converts minor units', () => {
    expect(fromMinorUnits(toMinorUnits('12.500'))).toBe('12.500');
  });
});
