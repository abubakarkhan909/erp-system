'use client';

import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { GoldKarat, PaymentMethod } from '@jewelry-erp/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
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
import { apiList, apiPost, ApiError } from '@/lib/api/client';

interface SupplierOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  purchasePrice?: string;
}

interface PurchaseFormValues {
  supplierId: string;
  invoiceDate: string;
  discount: string;
  notes: string;
  items: Array<{
    productId: string;
    quantity: number;
    netWeight: string;
    unitCost: string;
    vatRate: string;
    karat?: GoldKarat | null;
  }>;
  payments: Array<{ method: PaymentMethod; amount: string }>;
}

export default function NewPurchasePage() {
  const router = useRouter();

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-select'],
    queryFn: async () => {
      const res = await apiList<SupplierOption>('/suppliers', { page: 1, pageSize: 100 });
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

  const form = useForm<PurchaseFormValues>({
    defaultValues: {
      supplierId: '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      discount: '0.000',
      notes: '',
      items: [
        {
          productId: '',
          quantity: 1,
          netWeight: '0.000',
          unitCost: '0.000',
          vatRate: '5.000',
        },
      ],
      payments: [{ method: PaymentMethod.CASH, amount: '0.000' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const saveDraftMutation = useMutation({
    mutationFn: async (values: PurchaseFormValues) => {
      const { payments: _payments, ...rest } = values;
      return apiPost<{ id: string }>('/purchases', rest);
    },
    onSuccess: () => {
      toast.success('Draft purchase saved');
      router.push('/purchases');
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const saveAndPostMutation = useMutation({
    mutationFn: async (values: PurchaseFormValues) => {
      const { payments, ...rest } = values;
      const created = await apiPost<{ id: string; total?: string }>('/purchases', rest);
      const id = created.data.id;
      const paymentRows =
        payments && payments.length > 0
          ? payments
          : [{ method: PaymentMethod.CASH, amount: created.data.total || '0.000' }];
      await apiPost(`/purchases/${id}/post`, { payments: paymentRows });
      return created;
    },
    onSuccess: () => {
      toast.success('Purchase saved and posted');
      router.push('/purchases');
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save & post failed'),
  });

  const busy = saveDraftMutation.isPending || saveAndPostMutation.isPending;

  const onSubmit = (mode: 'draft' | 'post') => {
    const values = form.getValues();
    if (!values.supplierId) {
      toast.error('Supplier is required');
      return;
    }
    if (!values.items[0]?.productId) {
      toast.error('Add at least one product line');
      return;
    }
    if (mode === 'draft') saveDraftMutation.mutate(values);
    else saveAndPostMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase"
        description="Saved as DRAFT until you Post. Payments apply when you Save & Post (or Post from the list)."
        actions={
          <Button variant="outline" onClick={() => router.push('/purchases')}>
            Cancel
          </Button>
        }
      />

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select
                value={form.watch('supplierId') || undefined}
                onValueChange={(v) => form.setValue('supplierId', v)}
              >
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {(suppliers ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              onClick={() =>
                append({
                  productId: products?.[0]?.id ?? '',
                  quantity: 1,
                  netWeight: '0.000',
                  unitCost: '0.000',
                  vatRate: '5.000',
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Product</Label>
                  <Select
                    value={form.watch(`items.${index}.productId`)}
                    onValueChange={(v) => {
                      form.setValue(`items.${index}.productId`, v);
                      const product = products?.find((p) => p.id === v);
                      if (product?.purchasePrice) {
                        form.setValue(`items.${index}.unitCost`, product.purchasePrice);
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {(products ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qty</Label>
                  <Input type="number" step="1" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Net Weight (g)</Label>
                  <Input {...form.register(`items.${index}.netWeight`)} />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost (OMR)</Label>
                  <Input {...form.register(`items.${index}.unitCost`)} />
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
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(GoldKarat).map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment (applied on Post)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={form.watch('payments.0.method')}
                onValueChange={(v) => form.setValue('payments.0.method', v as PaymentMethod)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentMethod).filter((m) => m !== PaymentMethod.MIXED).map((m) => (
                    <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (OMR)</Label>
              <Input {...form.register('payments.0.amount')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => onSubmit('draft')}>
            {saveDraftMutation.isPending ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button type="button" disabled={busy} onClick={() => onSubmit('post')}>
            {saveAndPostMutation.isPending ? 'Posting…' : 'Save & Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
