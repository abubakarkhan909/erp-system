export const CURRENCY_CODE = 'OMR' as const;
export const CURRENCY_DECIMALS = 3;
export const DEFAULT_VAT_RATE = 5;

export enum RoleCode {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SALESMAN = 'SALESMAN',
  ACCOUNTANT = 'ACCOUNTANT',
}

export enum PermissionCode {
  CUSTOMERS_READ = 'customers.read',
  CUSTOMERS_WRITE = 'customers.write',
  SUPPLIERS_READ = 'suppliers.read',
  SUPPLIERS_WRITE = 'suppliers.write',
  PRODUCTS_READ = 'products.read',
  PRODUCTS_WRITE = 'products.write',
  SALES_READ = 'sales.read',
  SALES_WRITE = 'sales.write',
  SALES_POST = 'sales.post',
  SALES_VOID = 'sales.void',
  PURCHASES_READ = 'purchases.read',
  PURCHASES_WRITE = 'purchases.write',
  PURCHASES_POST = 'purchases.post',
  PURCHASES_VOID = 'purchases.void',
  INVENTORY_READ = 'inventory.read',
  INVENTORY_WRITE = 'inventory.write',
  CASH_READ = 'cash.read',
  CASH_WRITE = 'cash.write',
  CASH_CLOSE = 'cash.close',
  BANK_READ = 'bank.read',
  BANK_WRITE = 'bank.write',
  EXPENSES_READ = 'expenses.read',
  EXPENSES_WRITE = 'expenses.write',
  VAT_READ = 'vat.read',
  VAT_EXPORT = 'vat.export',
  ACCOUNTING_READ = 'accounting.read',
  ACCOUNTING_WRITE = 'accounting.write',
  ACCOUNTING_CLOSE_PERIOD = 'accounting.close_period',
  REPORTS_READ = 'reports.read',
  SETTINGS_MANAGE = 'settings.manage',
  USERS_MANAGE = 'users.manage',
  BACKUP_CREATE = 'backup.create',
  BACKUP_RESTORE = 'backup.restore',
  AUDIT_READ = 'audit.read',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOID = 'VOID',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  CHEQUE = 'CHEQUE',
  MIXED = 'MIXED',
}

export enum GoldKarat {
  K18 = 'K18',
  K21 = 'K21',
  K22 = 'K22',
  K24 = 'K24',
}

export enum ProductType {
  FINISHED = 'FINISHED',
  RAW_GOLD = 'RAW_GOLD',
  STONE = 'STONE',
  SERVICE = 'SERVICE',
  MAKING = 'MAKING',
}

export enum StockMode {
  PIECE = 'PIECE',
  WEIGHT = 'WEIGHT',
  BOTH = 'BOTH',
}

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  SALE_RETURN = 'SALE_RETURN',
  PURCHASE_RETURN = 'PURCHASE_RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  DAMAGE = 'DAMAGE',
  EXCHANGE_IN = 'EXCHANGE_IN',
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AdvanceOrderStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  LATE = 'LATE',
  PARTIAL = 'PARTIAL',
}

export enum UtilityBillType {
  ELECTRIC = 'ELECTRIC',
  WATER = 'WATER',
  GAS = 'GAS',
  INTERNET = 'INTERNET',
  MOBILE = 'MOBILE',
  RENT = 'RENT',
}

export enum UtilityBillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum ChequeStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
}

export enum FiscalPeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum JournalStatus {
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

export enum DocType {
  SALE = 'SALE',
  SALE_RETURN = 'SALE_RETURN',
  PURCHASE = 'PURCHASE',
  PURCHASE_RETURN = 'PURCHASE_RETURN',
  ADVANCE_ORDER = 'ADVANCE_ORDER',
  JOURNAL = 'JOURNAL',
  EXPENSE = 'EXPENSE',
  EXCHANGE = 'EXCHANGE',
  PAYMENT = 'PAYMENT',
  CASH_SESSION = 'CASH_SESSION',
}
