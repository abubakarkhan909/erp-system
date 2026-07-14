import { decimalStr } from './pagination';

const DECIMAL_FIELDS = new Set([
  'openingBalance',
  'currentBalance',
  'grossWeight',
  'netWeight',
  'stoneWeight',
  'makingCharges',
  'stoneCharges',
  'vatRate',
  'purchasePrice',
  'sellingPrice',
  'minStockWeight',
  'ratePerGram',
  'subtotal',
  'discount',
  'taxable',
  'vatAmount',
  'total',
  'paid',
  'balance',
  'onHandQty',
  'onHandWeight',
  'reservedQty',
  'reservedWeight',
  'damagedQty',
  'damagedWeight',
  'amount',
]);

export function serializeRecord<T extends Record<string, unknown>>(record: T): T {
  const out: Record<string, unknown> = { ...record };
  for (const key of Object.keys(out)) {
    if (DECIMAL_FIELDS.has(key)) {
      out[key] = decimalStr(out[key]);
    }
  }
  return out as T;
}

export function serializeMany<T extends Record<string, unknown>>(records: T[]): T[] {
  return records.map((r) => serializeRecord(r));
}
