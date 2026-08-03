"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeRecord = serializeRecord;
exports.serializeMany = serializeMany;
const pagination_1 = require("./pagination");
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
function serializeRecord(record) {
    const out = { ...record };
    for (const key of Object.keys(out)) {
        if (DECIMAL_FIELDS.has(key)) {
            out[key] = (0, pagination_1.decimalStr)(out[key]);
        }
    }
    return out;
}
function serializeMany(records) {
    return records.map((r) => serializeRecord(r));
}
//# sourceMappingURL=serialize.js.map