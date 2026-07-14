'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { GoldKarat, ProductType, StockMode, productSchema, type ProductInput } from '@jewelry-erp/shared';
import { formResolver, type FormInput } from '@/lib/form';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

interface Product {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  purityKarat?: GoldKarat | null;
  sellingPrice?: string;
  status: string;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => apiList<Product>('/products', { search, page: 1, pageSize: 50 }),
  });

  const form = useForm<FormInput<typeof productSchema>>({
    resolver: formResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      productType: ProductType.FINISHED,
      stockMode: StockMode.BOTH,
      grossWeight: '0.000',
      netWeight: '0.000',
      sellingPrice: '0.000',
      purchasePrice: '0.000',
      status: 'ACTIVE',
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      sku: '',
      barcode: '',
      name: '',
      productType: ProductType.FINISHED,
      stockMode: StockMode.BOTH,
      grossWeight: '0.000',
      netWeight: '0.000',
      sellingPrice: '0.000',
      purchasePrice: '0.000',
      status: 'ACTIVE',
    });
    setDrawerOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditing(product);
    try {
      const res = await apiGet<ProductInput & { id: string }>(`/products/${product.id}`);
      form.reset(res.data);
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load product');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormInput<typeof productSchema>) => {
      const payload = values as ProductInput;
      if (editing) return apiPatch(`/products/${editing.id}`, payload);
      return apiPost('/products', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
      { key: 'name', header: 'Name', cell: (row: Product) => <span className="font-medium">{row.name}</span> },
      { key: 'type', header: 'Type', cell: (row: Product) => row.productType },
      { key: 'karat', header: 'Karat', cell: (row: Product) => row.purityKarat || '—' },
      {
        key: 'price',
        header: 'Selling (OMR)',
        cell: (row: Product) => <span className="tabular-nums">{formatOmrDisplay(row.sellingPrice)}</span>,
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
        className: 'w-[100px] text-right',
        cell: (row: Product) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => void openEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Jewelry catalog — weights in grams, prices in OMR"
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
            <Input placeholder="Search SKU, name, barcode…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? 'Edit Product' : 'New Product'}
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button disabled={saveMutation.isPending} onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(ProductType).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
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
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {Object.values(GoldKarat).map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
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
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(v) => form.setValue('status', v as 'ACTIVE' | 'INACTIVE')}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormDrawer>

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
