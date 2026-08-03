import { CURRENCY_DECIMALS } from './enums';

/** Parse money string/number to scaled integer (baisa for OMR), half-up. */
export function toMinorUnits(value: string | number, decimals = CURRENCY_DECIMALS): bigint {
  const str =
    typeof value === 'number'
      ? value.toFixed(Math.max(decimals + 4, 8))
      : value.trim();
  const negative = str.startsWith('-');
  const cleaned = negative ? str.slice(1) : str;
  const [whole, frac = ''] = cleaned.split('.');
  const fracExtended = (frac + '0'.repeat(decimals + 1)).slice(0, decimals + 1);
  const main = fracExtended.slice(0, decimals);
  const nextDigit = Number(fracExtended[decimals] || '0');
  let minor = BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(main || '0');
  if (nextDigit >= 5) minor += 1n;
  return negative ? -minor : minor;
}

export function fromMinorUnits(minor: bigint, decimals = CURRENCY_DECIMALS): string {
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = (abs % base).toString().padStart(decimals, '0');
  return `${negative ? '-' : ''}${whole}.${frac}`;
}

export function roundMoney(value: string | number, decimals = CURRENCY_DECIMALS): string {
  const minor = toMinorUnits(value, decimals);
  return fromMinorUnits(minor, decimals);
}

export function addMoney(...values: Array<string | number>): string {
  const sum = values.reduce((acc, v) => acc + toMinorUnits(v), 0n);
  return fromMinorUnits(sum);
}

export function subMoney(a: string | number, b: string | number): string {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
}

export function mulMoney(a: string | number, b: string | number, decimals = CURRENCY_DECIMALS): string {
  const aMinor = toMinorUnits(a, decimals);
  const bMinor = toMinorUnits(b, decimals);
  const scale = 10n ** BigInt(decimals);
  // Round half up
  const product = aMinor * bMinor;
  const half = scale / 2n;
  const rounded = product >= 0n ? (product + half) / scale : (product - half) / scale;
  return fromMinorUnits(rounded, decimals);
}

export function calcVat(
  netAmount: string | number,
  vatRatePercent: string | number,
  decimals = CURRENCY_DECIMALS,
): { net: string; vat: string; gross: string } {
  const net = roundMoney(netAmount, decimals);
  const rate = typeof vatRatePercent === 'number' ? vatRatePercent : parseFloat(vatRatePercent);
  const vatMinor =
    (toMinorUnits(net, decimals) * BigInt(Math.round(rate * 1000))) / 100000n;
  // rate e.g. 5 => 5% ; use: net * rate / 100
  const vatFromMul = mulMoney(net, (rate / 100).toFixed(6), decimals);
  // Prefer precise: netMinor * rateNumerator / 100
  const preciseVat = fromMinorUnits(
    (toMinorUnits(net, decimals) * BigInt(Math.round(rate * 1000))) / (100n * 1000n),
    decimals,
  );
  void vatMinor;
  void vatFromMul;
  const vat = preciseVat;
  return { net, vat, gross: addMoney(net, vat) };
}

/** Normalize money-like values; blank/null → 0.000 */
export function moneyOrZero(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0.000';
  return roundMoney(value);
}

/** Positive money only; blank/zero → null (for fallback chains). */
export function moneyNonZero(value: string | number | null | undefined): string | null {
  const n = parseFloat(moneyOrZero(value));
  return Number.isFinite(n) && n > 0 ? moneyOrZero(value) : null;
}

/**
 * Sale line pricing for jewelry ERP:
 * - Weight > 0 → goldValue = netWeight × (goldRate || unitPrice)  [jewelry by weight]
 * - Weight = 0 → pieceValue = quantity × unitPrice               [finished / piece sales]
 * Then: lineNet = goldValue + pieceValue + making + stone − discount (+ VAT)
 */
export function calcSaleLine(input: {
  quantity?: string | number;
  netWeightGram?: string | number;
  ratePerGram?: string | number | null;
  unitPrice?: string | number | null;
  makingCharges?: string | number;
  stoneCharges?: string | number;
  lineDiscount?: string | number;
  vatRatePercent: string | number;
}): {
  goldValue: string;
  pieceValue: string;
  lineNet: string;
  vatAmount: string;
  lineTotal: string;
} {
  const weight = moneyOrZero(input.netWeightGram);
  const unitPrice = moneyOrZero(input.unitPrice);
  const qtyRaw = Number(input.quantity ?? 1);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

  let goldValue = '0.000';
  let pieceValue = '0.000';

  if (parseFloat(weight) > 0) {
    // Jewelry: weight × rate. Prefer explicit gold rate; else unit price as rate/gram.
    const rate = moneyNonZero(input.ratePerGram) ?? moneyNonZero(unitPrice) ?? '0.000';
    goldValue = mulMoney(weight, rate);
  } else {
    // Piece / finished goods: quantity × unit price
    pieceValue = mulMoney(String(qty), unitPrice);
  }

  const making = moneyOrZero(input.makingCharges);
  const stone = moneyOrZero(input.stoneCharges);
  const discount = moneyOrZero(input.lineDiscount);
  const lineNet = subMoney(addMoney(goldValue, pieceValue, making, stone), discount);
  const { vat, gross } = calcVat(lineNet, input.vatRatePercent);
  return { goldValue, pieceValue, lineNet, vatAmount: vat, lineTotal: gross };
}

/** Classic jewelry line: weight × rate + making + stone − discount (+ VAT). */
export function calcGoldLine(input: {
  netWeightGram: string | number;
  ratePerGram: string | number;
  makingCharges?: string | number;
  stoneCharges?: string | number;
  lineDiscount?: string | number;
  vatRatePercent: string | number;
}): {
  goldValue: string;
  lineNet: string;
  vatAmount: string;
  lineTotal: string;
} {
  const goldValue = mulMoney(input.netWeightGram, input.ratePerGram);
  const making = roundMoney(input.makingCharges ?? 0);
  const stone = roundMoney(input.stoneCharges ?? 0);
  const discount = roundMoney(input.lineDiscount ?? 0);
  const lineNet = subMoney(addMoney(goldValue, making, stone), discount);
  const { vat, gross } = calcVat(lineNet, input.vatRatePercent);
  return { goldValue, lineNet, vatAmount: vat, lineTotal: gross };
}

export function formatOmr(value: string | number): string {
  return `${roundMoney(value)} OMR`;
}
