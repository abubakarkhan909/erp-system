'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FormDrawer } from '@/components/shared/form-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost, ApiError } from '@/lib/api/client';
import { roundMoney } from '@jewelry-erp/shared';

export interface OwnStockProduct {
  id: string;
  sku: string;
  name: string;
  netWeight?: string | null;
}

interface OwnStockForm {
  qty: number;
  weight: string;
  notes: string;
}

interface AddOwnStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: OwnStockProduct | null;
}

export function AddOwnStockDrawer({ open, onOpenChange, product }: AddOwnStockDrawerProps) {
  const queryClient = useQueryClient();
  const form = useForm<OwnStockForm>({
    defaultValues: { qty: 1, weight: '0.000', notes: '' },
  });

  useEffect(() => {
    if (!open || !product) return;
    const unitNet = parseFloat(product.netWeight ?? '0') || 0;
    form.reset({
      qty: 1,
      weight: unitNet > 0 ? roundMoney(unitNet.toFixed(3)) : '0.000',
      notes: 'Own / opening stock (workshop production)',
    });
  }, [open, product, form]);

  const qty = form.watch('qty');

  useEffect(() => {
    if (!product) return;
    const unitNet = parseFloat(product.netWeight ?? '0') || 0;
    if (unitNet <= 0) return;
    const q = Number(qty) || 0;
    if (q <= 0) return;
    form.setValue('weight', roundMoney((unitNet * q).toFixed(3)));
  }, [qty, product, form]);

  const mutation = useMutation({
    mutationFn: async (values: OwnStockForm) => {
      if (!product) throw new ApiError('No product selected', 400);
      return apiPost<{
        addedQty: string;
        addedWeight: string;
        onHandQty: string;
        onHandWeight: string;
      }>('/inventory/own-stock', {
        productId: product.id,
        qty: values.qty,
        weight: values.weight || '0.000',
        notes: values.notes || undefined,
      });
    },
    onSuccess: (res) => {
      const d = res.data;
      toast.success(
        `Added ${d.addedQty} pcs (${d.addedWeight} g). On hand now: ${d.onHandQty} pcs / ${d.onHandWeight} g`,
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products-select'] });
      onOpenChange(false);
    },
    onError: (err: Error) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed to add own stock'),
  });

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Own Stock"
      description={
        product
          ? `${product.sku} — ${product.name}. Use this when you make or already own the stock (no supplier purchase).`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending || !product}
            onClick={form.handleSubmit((v) => mutation.mutate(v))}
          >
            {mutation.isPending ? 'Adding…' : 'Add to Inventory'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <div className="font-medium">{product?.name ?? '—'}</div>
          <div className="text-muted-foreground">SKU: {product?.sku ?? '—'}</div>
          {product?.netWeight && parseFloat(product.netWeight) > 0 ? (
            <div className="text-muted-foreground">
              Unit net weight: {product.netWeight} g (weight auto-fills from qty × unit weight)
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Quantity (pcs) *</Label>
          <Input
            type="number"
            min={1}
            step={1}
            {...form.register('qty', { valueAsNumber: true, min: 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Total weight (g)</Label>
          <Input {...form.register('weight')} />
          <p className="text-xs text-muted-foreground">
            Optional for piece-only items. For jewelry, leave auto-calculated or edit.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Input {...form.register('notes')} placeholder="e.g. Opening stock / workshop batch" />
        </div>
      </form>
    </FormDrawer>
  );
}
