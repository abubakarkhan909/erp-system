export declare const ACCOUNT_CODES: {
    readonly CASH: "1000";
    readonly BANK: "1100";
    readonly AR: "1200";
    readonly INVENTORY: "1300";
    readonly INPUT_VAT: "1400";
    readonly AP: "2000";
    readonly OUTPUT_VAT: "2100";
    readonly ADVANCES: "2200";
    readonly CAPITAL: "3000";
    readonly SALES: "4000";
    readonly MAKING: "4100";
    readonly COGS: "5000";
    readonly EXPENSES: "5100";
};
export type AccountCode = (typeof ACCOUNT_CODES)[keyof typeof ACCOUNT_CODES];
