import { z } from 'zod';
import {
  AdvanceOrderStatus,
  DocumentStatus,
  GoldKarat,
  PaymentMethod,
  ProductOwnership,
  ProductType,
  StockMode,
} from './enums';

export const moneySchema = z
  .string()
  .regex(/^-?\d+(\.\d{1,3})?$/, 'Invalid OMR amount (max 3 decimals)');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const customerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  civilId: z.string().max(50).optional().nullable(),
  openingBalance: moneySchema.default('0.000'),
  notes: z.string().max(2000).optional().nullable(),
});

export const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  tradeLicense: z.string().max(100).optional().nullable(),
  openingBalance: moneySchema.default('0.000'),
  notes: z.string().max(2000).optional().nullable(),
});

export const productSchema = z.object({
  sku: z.string().min(1).max(50),
  barcode: z.string().max(100).optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  brandId: z.string().cuid().optional().nullable(),
  productType: z.nativeEnum(ProductType).default(ProductType.FINISHED),
  stockMode: z.nativeEnum(StockMode).default(StockMode.BOTH),
  ownership: z.nativeEnum(ProductOwnership).default(ProductOwnership.SUPPLIER),
  purityKarat: z.nativeEnum(GoldKarat).optional().nullable(),
  grossWeight: moneySchema.default('0.000'),
  netWeight: moneySchema.default('0.000'),
  stoneWeight: moneySchema.default('0.000'),
  makingCharges: moneySchema.default('0.000'),
  stoneCharges: moneySchema.default('0.000'),
  vatRate: moneySchema.optional().nullable(),
  purchasePrice: moneySchema.default('0.000'),
  sellingPrice: moneySchema.default('0.000'),
  minStockQty: z.coerce.number().default(0),
  minStockWeight: moneySchema.default('0.000'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

/** Create product — own stock can include opening quantity in the same step */
export const productCreateSchema = productSchema
  .extend({
    openingQty: z.coerce.number().min(0).optional(),
    openingWeight: moneySchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.ownership === ProductOwnership.OWN) {
      const qty = data.openingQty ?? 0;
      if (qty <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter opening quantity for own / workshop stock',
          path: ['openingQty'],
        });
      }
    }
  });

export const goldRateSchema = z.object({
  rateDate: z.string().or(z.coerce.date()),
  karat: z.nativeEnum(GoldKarat),
  ratePerGram: moneySchema,
});

export const saleItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  grossWeight: moneySchema.default('0.000'),
  netWeight: moneySchema.default('0.000'),
  stoneWeight: moneySchema.default('0.000'),
  karat: z.nativeEnum(GoldKarat).optional().nullable(),
  goldRateSnapshot: moneySchema.default('0.000'),
  unitPrice: moneySchema.default('0.000'),
  makingCharges: moneySchema.default('0.000'),
  stoneCharges: moneySchema.default('0.000'),
  lineDiscount: moneySchema.default('0.000'),
  vatRate: moneySchema.default('5.000'),
});

export const paymentRowSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  amount: moneySchema,
  bankAccountId: z.string().cuid().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  chequeNo: z.string().max(50).optional().nullable(),
  chequeBankName: z.string().max(100).optional().nullable(),
  chequeDueDate: z.string().optional().nullable(),
  idempotencyKey: z.string().max(100).optional().nullable(),
});

export const saleInvoiceSchema = z.object({
  customerId: z.string().cuid().optional().nullable(),
  invoiceDate: z.string().or(z.coerce.date()).optional(),
  discount: moneySchema.default('0.000'),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(saleItemSchema).min(1),
  payments: z.array(paymentRowSchema).optional(),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
});

export const companySettingsSchema = z.object({
  name: z.string().min(1).max(200),
  logoPath: z.string().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  crNumber: z.string().max(50).optional().nullable(),
  vatNumber: z.string().max(50).optional().nullable(),
  currency: z.literal('OMR').default('OMR'),
  defaultVatRate: moneySchema.default('5.000'),
  invoicePrefix: z.string().max(20).default('INV'),
  receiptFooter: z.string().max(500).optional().nullable(),
});

export const advanceOrderSchema = z.object({
  customerId: z.string().cuid(),
  expectedDelivery: z.string().or(z.coerce.date()).optional().nullable(),
  advancePaid: moneySchema.default('0.000'),
  totalAmount: moneySchema,
  notes: z.string().max(2000).optional().nullable(),
  description: z.string().min(1).max(1000),
  status: z.nativeEnum(AdvanceOrderStatus).default(AdvanceOrderStatus.PENDING),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type SaleInvoiceInput = z.infer<typeof saleInvoiceSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
