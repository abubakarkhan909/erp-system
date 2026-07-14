export const ACCOUNT_CODES = {
  CASH: '1000',
  BANK: '1100',
  AR: '1200',
  INVENTORY: '1300',
  INPUT_VAT: '1400',
  AP: '2000',
  OUTPUT_VAT: '2100',
  ADVANCES: '2200',
  CAPITAL: '3000',
  SALES: '4000',
  MAKING: '4100',
  COGS: '5000',
  EXPENSES: '5100',
} as const;

export type AccountCode = (typeof ACCOUNT_CODES)[keyof typeof ACCOUNT_CODES];
