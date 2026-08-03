import {
  addMoney,
  subMoney,
  mulMoney,
  calcVat,
  calcGoldLine,
  calcSaleLine,
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

  it('calculates piece sale when weight is zero (qty × unitPrice)', () => {
    const line = calcSaleLine({
      quantity: 2,
      netWeightGram: '0.000',
      unitPrice: '150.000',
      vatRatePercent: 5,
    });
    expect(line.pieceValue).toBe('300.000');
    expect(line.lineNet).toBe('300.000');
    expect(line.vatAmount).toBe('15.000');
    expect(line.lineTotal).toBe('315.000');
  });

  it('ignores zero goldRateSnapshot and falls back to unitPrice for weight sales', () => {
    const line = calcSaleLine({
      quantity: 1,
      netWeightGram: '10.000',
      ratePerGram: '0.000',
      unitPrice: '25.000',
      vatRatePercent: 5,
    });
    expect(line.goldValue).toBe('250.000');
    expect(line.lineTotal).toBe('262.500');
  });

  it('converts minor units', () => {
    expect(fromMinorUnits(toMinorUnits('12.500'))).toBe('12.500');
  });
});
