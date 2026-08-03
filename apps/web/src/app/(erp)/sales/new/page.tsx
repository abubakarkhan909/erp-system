'use client';

import { PaymentMethod } from '@jewelry-erp/shared';
import { SaleInvoiceForm } from '../_components/sale-invoice-form';

export default function NewSalePage() {
  return (
    <SaleInvoiceForm
      mode="create"
      title="New Sales Invoice"
      description="Select products (auto-fills weight & price), set qty, enter payment (full or partial), then Save & Post. Remaining balance stays on the invoice and customer ledger."
      defaultValues={{
        customerId: null,
        invoiceDate: new Date().toISOString().slice(0, 10),
        discount: '0.000',
        notes: '',
        items: [
          {
            productId: '',
            quantity: 1,
            netWeight: '0.000',
            unitPrice: '0.000',
            vatRate: '5.000',
          },
        ],
        payments: [{ method: PaymentMethod.CASH, amount: '0.000' }],
      }}
    />
  );
}
