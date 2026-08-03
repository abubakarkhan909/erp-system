'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentStatus, PaymentMethod } from '@jewelry-erp/shared';
import { SaleInvoiceForm } from '../../_components/sale-invoice-form';
import { apiGet, ApiError } from '@/lib/api/client';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SaleDetail {
  id: string;
  status: DocumentStatus;
  customerId?: string | null;
  invoiceDate: string;
  discount?: string;
  notes?: string | null;
  items: Array<{
    productId: string;
    quantity: number | string;
    netWeight?: string;
    unitPrice?: string;
    vatRate?: string;
    karat?: string | null;
    makingCharges?: string;
    stoneCharges?: string;
    lineDiscount?: string;
    goldRateSnapshot?: string;
  }>;
  payments?: Array<{ method: PaymentMethod; amount: string }>;
}

export default function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      const res = await apiGet<SaleDetail>(`/sales/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading invoice…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Edit Sales Invoice" description="Invoice not found." />
        <Button asChild variant="outline">
          <Link href="/sales">Back to Sales</Link>
        </Button>
        <p className="text-sm text-destructive">
          {error instanceof ApiError ? error.message : 'Could not load invoice'}
        </p>
      </div>
    );
  }

  if (data.status !== DocumentStatus.DRAFT) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Edit Sales Invoice"
          description="Only draft invoices can be edited. Posted invoices must be voided instead."
        />
        <Button asChild variant="outline">
          <Link href="/sales">Back to Sales</Link>
        </Button>
      </div>
    );
  }

  return (
    <SaleInvoiceForm
      mode="edit"
      invoiceId={id}
      title="Edit Sales Invoice"
      description="Update this draft, then Save & Post when payment is ready. Payment must not exceed the invoice total."
      defaultValues={{
        customerId: data.customerId ?? null,
        invoiceDate: data.invoiceDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        discount: data.discount ?? '0.000',
        notes: data.notes ?? '',
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity,
          netWeight: item.netWeight ?? '0.000',
          unitPrice: item.unitPrice ?? '0.000',
          vatRate: item.vatRate ?? '5.000',
          karat: (item.karat as never) ?? undefined,
          makingCharges: item.makingCharges ?? '0.000',
          stoneCharges: item.stoneCharges ?? '0.000',
          lineDiscount: item.lineDiscount ?? '0.000',
          goldRateSnapshot:
            item.goldRateSnapshot && parseFloat(item.goldRateSnapshot) > 0
              ? item.goldRateSnapshot
              : '0.000',
        })),
        payments:
          data.payments && data.payments.length > 0
            ? data.payments.map((p) => ({ method: p.method, amount: p.amount }))
            : [{ method: PaymentMethod.CASH, amount: '0.000' }],
      }}
    />
  );
}
