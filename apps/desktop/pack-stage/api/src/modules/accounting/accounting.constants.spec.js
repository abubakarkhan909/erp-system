"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounting_constants_1 = require("./accounting.constants");
describe('ACCOUNT_CODES', () => {
    it('includes Oman shop GL codes', () => {
        expect(accounting_constants_1.ACCOUNT_CODES.CASH).toBe('1000');
        expect(accounting_constants_1.ACCOUNT_CODES.BANK).toBe('1100');
        expect(accounting_constants_1.ACCOUNT_CODES.AR).toBe('1200');
        expect(accounting_constants_1.ACCOUNT_CODES.INVENTORY).toBe('1300');
        expect(accounting_constants_1.ACCOUNT_CODES.INPUT_VAT).toBe('1400');
        expect(accounting_constants_1.ACCOUNT_CODES.AP).toBe('2000');
        expect(accounting_constants_1.ACCOUNT_CODES.OUTPUT_VAT).toBe('2100');
        expect(accounting_constants_1.ACCOUNT_CODES.ADVANCES).toBe('2200');
        expect(accounting_constants_1.ACCOUNT_CODES.SALES).toBe('4000');
        expect(accounting_constants_1.ACCOUNT_CODES.COGS).toBe('5000');
    });
});
//# sourceMappingURL=accounting.constants.spec.js.map