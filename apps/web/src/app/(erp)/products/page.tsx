'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import {
  GoldKarat,
  ProductOwnership,
  ProductType,
  StockMode,
  productCreateSchema,
  productSchema,
  roundMoney,
  type ProductCreateInput,
  type ProductInput,
} from '@jewelry-erp/shared';
import { formResolver, type FormInput } from '@/lib/form';
import { PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiDelete, apiGet, apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';
import { AddOwnStockDrawer } from '../_components/add-own-stock-drawer';

type ProductFormValues = FormInput<typeof productCreateSchema>;

interface Product {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  ownership?: ProductOwnership | string;
  purityKarat?: GoldKarat | null;
  netWeight?: string;
  sellingPrice?: string;
  status: string;
  stockBalance?: {
    onHandQty?: string | number;
    onHandWeight?: string;
  } | null;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [ownStockTarget, setOwnStockTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => apiList<Product>('/products', { search, page: 1, pageSize: 50 }),
  });

  const form = useForm<ProductFormValues>({
    resolver: formResolver(productCreateSchema),
    defaultValues: {
      sku: '',
      name: '',
      productType: ProductType.FINISHED,
      stockMode: StockMode.BOTH,
      ownership: ProductOwnership.SUPPLIER,
      grossWeight: '0.000',
      netWeight: '0.000',
      sellingPrice: '0.000',
      purchasePrice: '0.000',
      status: 'ACTIVE',
      openingQty: 0,
      openingWeight: '0.000',
    },
  });

  const ownership = useWatch({ control: form.control, name: 'ownership' });
  const openingQty = useWatch({ control: form.control, name: 'openingQty' });
  const netWeight = useWatch({ control: form.control, name: 'netWeight' });
  const isOwn = ownership === ProductOwnership.OWN;

  useEffect(() => {
    if (!drawerOpen || editing || !isOwn) return;
    const unitNet = parseFloat(netWeight ?? '0') || 0;
    const qty = Number(openingQty) || 0;
    if (unitNet > 0 && qty > 0) {
      form.setValue('openingWeight', roundMoney((unitNet * qty).toFixed(3)));
    }
  }, [openingQty, netWeight, isOwn, drawerOpen, editing, form]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      sku: '',
      barcode: '',
      name: '',
      productType: ProductType.FINISHED,
      stockMode: StockMode.BOTH,
      ownership: ProductOwnership.SUPPLIER,
      grossWeight: '0.000',
      netWeight: '0.000',
      sellingPrice: '0.000',
      purchasePrice: '0.000',
      status: 'ACTIVE',
      openingQty: 0,
      openingWeight: '0.000',
    });
    setDrawerOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditing(product);
    try {
      const res = await apiGet<ProductInput & { id: string }>(`/products/${product.id}`);
      form.reset({
        ...res.data,
        ownership: (res.data.ownership as ProductOwnership) ?? ProductOwnership.SUPPLIER,
        openingQty: 0,
        openingWeight: '0.000',
      });
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load product');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (editing) {
        const { openingQty: _q, openingWeight: _w, ...rest } = values;
        return apiPatch(`/products/${editing.id}`, rest as ProductInput);
      }
      return apiPost('/products', values as ProductCreateInput);
    },
    onSuccess: (_res, values) => {
      if (editing) {
        toast.success('Product updated');
      } else if (values.ownership === ProductOwnership.OWN) {
        toast.success(
          `Own product created with ${values.openingQty} pcs in stock — ready to sell`,
        );
      } else {
        toast.success(
          'Supplier product created (stock 0). Add stock via Purchases when you buy from supplier.',
        );
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products-select'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Delete failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'sku', header: 'SKU', cell: (row: Product) => <code className="text-xs">{row.sku}</code> },
      {
        key: 'name',
        header: 'Name',
        cell: (row: Product) => <span className="font-medium">{row.name}</span>,
      },
      {
        key: 'source',
        header: 'Source',
        cell: (row: Product) =>
          row.ownership === ProductOwnership.OWN || row.ownership === 'OWN' ? (
            <Badge variant="success">Own</Badge>
          ) : (
            <Badge variant="secondary">Supplier</Badge>
          ),
      },
      { key: 'karat', header: 'Karat', cell: (row: Product) => row.purityKarat || '—' },
      {
        key: 'stock',
        header: 'Stock',
        cell: (row: Product) => (
          <span className="tabular-nums text-sm">
            {String(row.stockBalance?.onHandQty ?? 0)} pcs
            {row.stockBalance?.onHandWeight ? ` · ${row.stockBalance.onHandWeight} g` : ''}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Selling (OMR)',
        cell: (row: Product) => (
          <span className="tabular-nums">{formatOmrDisplay(row.sellingPrice)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: Product) => (
          <Badge variant={row.status === 'ACTIVE' ? 'success' : 'secondary'}>{row.status}</Badge>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[160px] text-right',
        cell: (row: Product) => {
          const isOwnRow = row.ownership === ProductOwnership.OWN || row.ownership === 'OWN';
          return (
            <div className="flex justify-end gap-1">
              {isOwnRow ? (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Add more own stock"
                  onClick={() => setOwnStockTarget(row)}
                >
                  <PackagePlus className="h-4 w-4" />
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={() => void openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Choose Own (workshop stock entered on create) or Supplier (stock added later via Purchases)."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SKU, name, barcode…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? 'Edit Product' : 'New Product'}
        description={
          editing
            ? 'Update product details. Stock quantity is managed separately.'
            : 'Select Own or Supplier — this controls how stock is added.'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() => {
                if (editing) {
                  const raw = form.getValues();
                  const { openingQty: _q, openingWeight: _w, ...rest } = raw;
                  const parsed = productSchema.safeParse(rest);
                  if (!parsed.success) {
                    const msg = parsed.error.issues[0]?.message ?? 'Invalid product';
                    toast.error(msg);
                    return;
                  }
                  saveMutation.mutate({
                    ...parsed.data,
                    openingQty: 0,
                    openingWeight: '0.000',
                  } as ProductFormValues);
                  return;
                }
                void form.handleSubmit((v) => saveMutation.mutate(v))();
              }}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {!editing ? (
            <div className="space-y-3 rounded-lg border p-3">
              <Label>Product source *</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-md border px-3 py-3 text-left text-sm transition ${
                    isOwn
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    form.setValue('ownership', ProductOwnership.OWN, { shouldValidate: true });
                    if (!form.getValues('openingQty') || Number(form.getValues('openingQty')) <= 0) {
                      form.setValue('openingQty', 1);
                    }
                  }}
                >
                  <div className="font-medium">Own / Workshop</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You make or already own this stock. Enter quantity now — it goes into inventory
                    immediately.
                  </p>
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-3 py-3 text-left text-sm transition ${
                    !isOwn
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    form.setValue('ownership', ProductOwnership.SUPPLIER, { shouldValidate: true });
                    form.setValue('openingQty', 0);
                    form.setValue('openingWeight', '0.000');
                  }}
                >
                  <div className="font-medium">Supplier</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bought from a supplier. Stock stays 0 until you post a Purchase invoice.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Product source</Label>
              <Select
                value={form.watch('ownership') ?? ProductOwnership.SUPPLIER}
                onValueChange={(v) => form.setValue('ownership', v as ProductOwnership)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductOwnership.OWN}>Own / Workshop</SelectItem>
                  <SelectItem value={ProductOwnership.SUPPLIER}>Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input {...form.register('sku')} />
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input {...form.register('barcode')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input {...form.register('name')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select
                value={form.watch('productType')}
                onValueChange={(v) => form.setValue('productType', v as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Karat</Label>
              <Select
                value={form.watch('purityKarat') ?? ''}
                onValueChange={(v) => form.setValue('purityKarat', v as GoldKarat)}
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Net Weight (g)</Label>
              <Input {...form.register('netWeight')} />
            </div>
            <div className="space-y-2">
              <Label>Selling Price (OMR)</Label>
              <Input {...form.register('sellingPrice')} />
            </div>
          </div>

          {!editing && isOwn ? (
            <div className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 sm:grid-cols-2 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="space-y-2">
                <Label>Opening quantity (pcs) *</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...form.register('openingQty', { valueAsNumber: true })}
                />
                {form.formState.errors.openingQty ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.openingQty.message ?? 'Required')}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Opening weight (g)</Label>
                <Input {...form.register('openingWeight')} />
                <p className="text-xs text-muted-foreground">
                  Auto = qty × net weight. Edit if needed.
                </p>
              </div>
            </div>
          ) : null}

          {!editing && !isOwn ? (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Supplier products start at 0 stock. After create, go to{' '}
              <strong>Purchases → New</strong>, add this product, and Post to increase inventory.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(v) => form.setValue('status', v as 'ACTIVE' | 'INACTIVE')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormDrawer>

      <AddOwnStockDrawer
        open={!!ownStockTarget}
        onOpenChange={(open) => !open && setOwnStockTarget(null)}
        product={ownStockTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        description={`Remove ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
