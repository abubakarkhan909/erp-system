'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  GoldKarat,
  PaymentMethod,
  addMoney,
  calcSaleLine,
  moneyNonZero,
  moneyOrZero,
  roundMoney,
  saleInvoiceSchema,
  subMoney,
  type SaleInvoiceInput,
} from '@jewelry-erp/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiDelete, apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formResolver, type FormInput } from '@/lib/form';
import { formatOmrDisplay } from '@/lib/utils';

interface CustomerOption {
  id: string;
  name: string;
  currentBalance?: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  sellingPrice?: string;
  netWeight?: string;
  grossWeight?: string;
  stoneWeight?: string;
  makingCharges?: string;
  stoneCharges?: string;
  purityKarat?: GoldKarat | null;
  vatRate?: string | null;
  stockBalance?: {
    onHandQty?: string;
    onHandWeight?: string;
  } | null;
}

type SaleFormValues = FormInput<typeof saleInvoiceSchema>;

function estimateLine(item: SaleFormValues['items'][number]) {
  return calcSaleLine({
    quantity: item.quantity ?? 1,
    netWeightGram: item.netWeight ?? '0.000',
    ratePerGram: moneyNonZero(item.goldRateSnapshot),
    unitPrice: moneyOrZero(item.unitPrice),
    makingCharges: item.makingCharges ?? '0.000',
    stoneCharges: item.stoneCharges ?? '0.000',
    lineDiscount: item.lineDiscount ?? '0.000',
    vatRatePercent: item.vatRate ?? '5.000',
  });
}

function estimateInvoiceTotal(values: SaleFormValues): string {
  const items = values.items ?? [];
  const subtotal = items.reduce((sum, item) => addMoney(sum, estimateLine(item).lineNet), '0.000');
  const vatBeforeDiscount = items.reduce(
    (sum, item) => addMoney(sum, estimateLine(item).vatAmount),
    '0.000',
  );

  const discount = roundMoney(values.discount ?? '0.000');
  const taxable = roundMoney(subMoney(subtotal, discount));
  const vatAmount =
    parseFloat(subtotal) > 0
      ? roundMoney(
          ((parseFloat(vatBeforeDiscount) * parseFloat(taxable)) / parseFloat(subtotal)).toFixed(3),
        )
      : '0.000';

  return addMoney(taxable, vatAmount);
}

function paymentTotal(values: SaleFormValues): string {
  return (values.payments ?? []).reduce(
    (sum, p) => addMoney(sum, p.amount || '0.000'),
    '0.000',
  );
}

interface SaleInvoiceFormProps {
  mode: 'create' | 'edit';
  invoiceId?: string;
  defaultValues: SaleFormValues;
  title: string;
  description: string;
}

export function SaleInvoiceForm({
  mode,
  invoiceId,
  defaultValues,
  title,
  description,
}: SaleInvoiceFormProps) {
  const router = useRouter();

  const { data: customers } = useQuery({
    queryKey: ['customers-select'],
    queryFn: async () => {
      const res = await apiList<CustomerOption>('/customers', { page: 1, pageSize: 100 });
      return res.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-select'],
    queryFn: async () => {
      const res = await apiList<ProductOption>('/products', { page: 1, pageSize: 100 });
      return res.data;
    },
  });

  const form = useForm<SaleFormValues>({
    resolver: formResolver(saleInvoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const watched = useWatch({ control: form.control });
  const estimatedTotal = useMemo(
    () => estimateInvoiceTotal(watched as SaleFormValues),
    [watched],
  );
  const estimatedPaid = useMemo(() => paymentTotal(watched as SaleFormValues), [watched]);
  const balanceDue = useMemo(() => {
    const raw = subMoney(estimatedTotal, estimatedPaid);
    return parseFloat(raw) < 0 ? '0.000' : raw;
  }, [estimatedTotal, estimatedPaid]);
  const paymentOver = parseFloat(subMoney(estimatedTotal, estimatedPaid)) < -0.001;
  const paymentStatus =
    parseFloat(estimatedTotal) <= 0
      ? 'EMPTY'
      : paymentOver
        ? 'OVER'
        : parseFloat(balanceDue) <= 0.001
          ? 'PAID'
          : parseFloat(estimatedPaid) > 0.001
            ? 'PARTIAL'
            : 'CREDIT';

  const applyProductDefaults = (index: number, productId: string) => {
    form.setValue(`items.${index}.productId`, productId);
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    form.setValue(`items.${index}.unitPrice`, product.sellingPrice ?? '0.000');
    form.setValue(`items.${index}.netWeight`, product.netWeight ?? '0.000');
    form.setValue(`items.${index}.grossWeight`, product.grossWeight ?? '0.000');
    form.setValue(`items.${index}.stoneWeight`, product.stoneWeight ?? '0.000');
    form.setValue(`items.${index}.makingCharges`, product.makingCharges ?? '0.000');
    form.setValue(`items.${index}.stoneCharges`, product.stoneCharges ?? '0.000');
    form.setValue(`items.${index}.vatRate`, product.vatRate ?? '5.000');
    // Never seed goldRateSnapshot with 0 — that used to mask unitPrice in totals
    form.setValue(`items.${index}.goldRateSnapshot`, '0.000');
    if (product.purityKarat) {
      form.setValue(`items.${index}.karat`, product.purityKarat);
    }
    const currentQty = form.getValues(`items.${index}.quantity`);
    if (!currentQty || currentQty < 1) {
      form.setValue(`items.${index}.quantity`, 1);
    }
  };

  const bumpQty = (index: number, delta: number) => {
    const current = Number(form.getValues(`items.${index}.quantity`) ?? 1);
    const productId = form.getValues(`items.${index}.productId`);
    const product = products?.find((p) => p.id === productId);
    const maxQty = product?.stockBalance?.onHandQty
      ? Math.max(0, Math.floor(parseFloat(product.stockBalance.onHandQty)))
      : undefined;
    let next = Math.max(1, current + delta);
    if (maxQty != null && next > maxQty) {
      next = Math.max(1, maxQty);
      toast.error(`Only ${maxQty} in stock`);
    }
    form.setValue(`items.${index}.quantity`, next, { shouldDirty: true, shouldValidate: true });
  };

  const stockHint = (productId: string | undefined) => {
    if (!productId) return null;
    const product = products?.find((p) => p.id === productId);
    if (!product?.stockBalance) return 'Stock: —';
    const qty = product.stockBalance.onHandQty ?? '0';
    const weight = product.stockBalance.onHandWeight ?? '0';
    return `Available: ${qty} pcs · ${weight} g`;
  };

  const validateStock = (values: SaleFormValues): string | null => {
    for (const item of values.items ?? []) {
      const product = products?.find((p) => p.id === item.productId);
      if (!product) continue;
      const onHandQty = parseFloat(product.stockBalance?.onHandQty ?? '0');
      const onHandWeight = parseFloat(product.stockBalance?.onHandWeight ?? '0');
      const needQty = Number(item.quantity ?? 0);
      const needWeight = parseFloat(item.netWeight ?? '0');
      if (needQty > onHandQty + 0.0005) {
        return `Insufficient stock for ${product.sku}: need ${needQty}, available ${onHandQty}`;
      }
      if (needWeight > 0 && needWeight > onHandWeight + 0.0005) {
        return `Insufficient weight for ${product.sku}: need ${needWeight} g, available ${onHandWeight} g`;
      }
    }
    return null;
  };

  const saveDraftMutation = useMutation({
    mutationFn: async (values: SaleFormValues) => {
      const { payments: _payments, status: _status, ...rest } = values;
      if (mode === 'edit' && invoiceId) {
        return apiPatch<{ id: string }>(`/sales/${invoiceId}`, rest as SaleInvoiceInput);
      }
      return apiPost<{ id: string }>('/sales', rest as SaleInvoiceInput);
    },
    onSuccess: () => {
      toast.success(mode === 'edit' ? 'Draft updated' : 'Draft invoice saved');
      router.push('/sales');
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const saveAndPostMutation = useMutation({
    mutationFn: async (values: SaleFormValues) => {
      const estimated = estimateInvoiceTotal(values);
      if (parseFloat(estimated) <= 0) {
        throw new ApiError(
          'Invoice total is 0.000 OMR. Select a product (auto-fills weight & price), or enter Net Weight / Qty × Unit Price.',
          400,
        );
      }

      const paid = paymentTotal(values);
      if (parseFloat(subMoney(estimated, paid)) < -0.001) {
        throw new ApiError(
          `Payments exceed invoice total (paid ${paid} OMR, invoice ${estimated} OMR)`,
          400,
        );
      }

      const remaining = parseFloat(subMoney(estimated, paid));
      if (remaining > 0.001 && !values.customerId) {
        throw new ApiError(
          'Partial or credit sales require a customer. Select a customer, or click “Pay full” to settle the invoice.',
          400,
        );
      }

      const stockError = validateStock(values);
      if (stockError) throw new ApiError(stockError, 400);

      const { payments, status: _status, ...rest } = values;
      let id = invoiceId;

      if (mode === 'edit' && invoiceId) {
        await apiPatch(`/sales/${invoiceId}`, rest as SaleInvoiceInput);
      } else {
        const created = await apiPost<{ id: string; total?: string }>(
          '/sales',
          rest as SaleInvoiceInput,
        );
        id = created.data.id;
      }

      const paymentRows =
        payments && payments.length > 0
          ? payments.filter((p) => parseFloat(p.amount || '0') > 0)
          : [{ method: PaymentMethod.CASH, amount: estimated }];

      try {
        await apiPost(`/sales/${id}/post`, { payments: paymentRows });
      } catch (err) {
        if (mode === 'create' && id) {
          try {
            await apiDelete(`/sales/${id}`);
          } catch {
            // ignore cleanup failure
          }
        }
        throw err;
      }

      return { id, remaining };
    },
    onSuccess: (result) => {
      if (result.remaining > 0.001) {
        toast.success(
          `Invoice posted (partial). Balance due ${formatOmrDisplay(String(result.remaining))} — collect later or set up installments.`,
        );
      } else {
        toast.success('Invoice saved and posted — fully paid');
      }
      router.push('/sales');
    },
    onError: (err: Error) =>
      toast.error(err instanceof ApiError ? err.message : 'Save & post failed'),
  });

  const busy = saveDraftMutation.isPending || saveAndPostMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" onClick={() => router.push('/sales')}>
            Cancel
          </Button>
        }
      />

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={form.watch('customerId') ?? 'walk-in'}
                onValueChange={(v) => form.setValue('customerId', v === 'walk-in' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in customer</SelectItem>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.currentBalance && parseFloat(c.currentBalance) > 0
                        ? ` (owes ${formatOmrDisplay(c.currentBalance)})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required when payment is partial or deferred (credit / installments).
              </p>
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input type="date" {...form.register('invoiceDate')} />
            </div>
            <div className="space-y-2">
              <Label>Discount (OMR)</Label>
              <Input {...form.register('discount')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const first = products?.[0];
                append({
                  productId: first?.id ?? '',
                  quantity: 1,
                  netWeight: first?.netWeight ?? '0.000',
                  unitPrice: first?.sellingPrice ?? '0.000',
                  makingCharges: first?.makingCharges ?? '0.000',
                  stoneCharges: first?.stoneCharges ?? '0.000',
                  vatRate: first?.vatRate ?? '5.000',
                  goldRateSnapshot: '0.000',
                });
              }}
            >
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const productId = form.watch(`items.${index}.productId`);
              const line = estimateLine(
                (watched.items?.[index] ?? form.getValues(`items.${index}`)) as SaleFormValues['items'][number],
              );
              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Product</Label>
                    <Select
                      value={productId}
                      onValueChange={(v) => applyProductDefaults(index, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.sku} — {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{stockHint(productId)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => bumpQty(index, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        step="1"
                        min={1}
                        className="text-center"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => bumpQty(index, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Net Weight (g)</Label>
                    <Input {...form.register(`items.${index}.netWeight`)} />
                    <p className="text-xs text-muted-foreground">
                      Jewelry: weight × unit price. Leave 0 for piece sales (qty × price).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price (OMR)</Label>
                    <Input {...form.register(`items.${index}.unitPrice`)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Making (OMR)</Label>
                    <Input {...form.register(`items.${index}.makingCharges`)} />
                  </div>

                  <div className="space-y-2">
                    <Label>VAT %</Label>
                    <Input {...form.register(`items.${index}.vatRate`)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Karat</Label>
                    <Select
                      value={form.watch(`items.${index}.karat`) ?? ''}
                      onValueChange={(v) => form.setValue(`items.${index}.karat`, v as GoldKarat)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GoldKarat).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Line total</Label>
                    <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium tabular-nums">
                      {formatOmrDisplay(line.lineTotal)}
                    </div>
                  </div>

                  {fields.length > 1 ? (
                    <div className="flex items-end sm:col-span-2 lg:col-span-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        Remove line
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Payment (applied on Post)</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue('payments.0.amount', estimatedTotal);
                  if (!form.getValues('payments.0.method')) {
                    form.setValue('payments.0.method', PaymentMethod.CASH);
                  }
                }}
              >
                Pay full
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => form.setValue('payments.0.amount', '0.000')}
              >
                Credit (0)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={form.watch('payments.0.method')}
                  onValueChange={(v) => form.setValue('payments.0.method', v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod)
                      .filter((m) => m !== PaymentMethod.MIXED)
                      .map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.replace('_', ' ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount paid now (OMR)</Label>
                <Input {...form.register('payments.0.amount')} />
              </div>
            </div>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  Invoice total:{' '}
                  <span className="font-medium tabular-nums">
                    {formatOmrDisplay(estimatedTotal)}
                  </span>
                </span>
                <span>
                  Paid now:{' '}
                  <span className="font-medium tabular-nums">
                    {formatOmrDisplay(estimatedPaid)}
                  </span>
                </span>
                <span>
                  Remaining balance:{' '}
                  <span className="font-medium tabular-nums">
                    {formatOmrDisplay(balanceDue)}
                  </span>
                </span>
                <span>
                  Status:{' '}
                  <span className="font-medium">
                    {paymentStatus === 'PAID'
                      ? 'Fully paid'
                      : paymentStatus === 'PARTIAL'
                        ? 'Partially paid'
                        : paymentStatus === 'CREDIT'
                          ? 'Credit (unpaid)'
                          : paymentStatus === 'OVER'
                            ? 'Overpayment'
                            : 'Enter line items'}
                  </span>
                </span>
              </div>
              {paymentOver ? (
                <p className="mt-2 text-destructive">
                  Payment cannot be higher than the invoice total.
                </p>
              ) : paymentStatus === 'PARTIAL' ? (
                <p className="mt-2 text-muted-foreground">
                  Partial payment will post with a remaining balance on the invoice and customer
                  ledger. Collect later from Installments or a follow-up receipt.
                </p>
              ) : paymentStatus === 'CREDIT' ? (
                <p className="mt-2 text-muted-foreground">
                  Full amount will be owed by the customer (requires a customer, not walk-in).
                </p>
              ) : paymentStatus === 'PAID' ? (
                <p className="mt-2 text-muted-foreground">
                  Paid amount matches invoice total — invoice will be marked fully paid.
                </p>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  Select products so the invoice total calculates, then enter payment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={form.handleSubmit((v) => saveDraftMutation.mutate(v))}
          >
            {saveDraftMutation.isPending
              ? 'Saving…'
              : mode === 'edit'
                ? 'Update Draft'
                : 'Save Draft'}
          </Button>
          <Button
            type="button"
            disabled={busy || paymentOver || parseFloat(estimatedTotal) <= 0}
            onClick={form.handleSubmit((v) => saveAndPostMutation.mutate(v))}
          >
            {saveAndPostMutation.isPending ? 'Posting…' : 'Save & Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
