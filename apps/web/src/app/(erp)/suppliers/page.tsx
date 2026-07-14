'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supplierSchema, type SupplierInput } from '@jewelry-erp/shared';
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
import { apiDelete, apiGet, apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  tradeLicense?: string | null;
  currentBalance?: string;
  createdAt?: string;
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => apiList<Supplier>('/suppliers', { search, page: 1, pageSize: 50 }),
  });

  const form = useForm<FormInput<typeof supplierSchema>>({
    resolver: formResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      tradeLicense: '',
      openingBalance: '0.000',
      notes: '',
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: '',
      phone: '',
      email: '',
      address: '',
      tradeLicense: '',
      openingBalance: '0.000',
      notes: '',
    });
    setDrawerOpen(true);
  };

  const openEdit = async (supplier: Supplier) => {
    setEditing(supplier);
    try {
      const res = await apiGet<Supplier>(`/suppliers/${supplier.id}`);
      const s = res.data;
      form.reset({
        name: s.name,
        phone: s.phone ?? '',
        email: s.email ?? '',
        address: '',
        tradeLicense: s.tradeLicense ?? '',
        openingBalance: '0.000',
        notes: '',
      });
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load supplier');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormInput<typeof supplierSchema>) => {
      const payload = values as SupplierInput;
      if (editing) return apiPatch(`/suppliers/${editing.id}`, payload);
      return apiPost('/suppliers', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Supplier updated' : 'Supplier created');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/suppliers/${id}`),
    onSuccess: () => {
      toast.success('Supplier deleted');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Delete failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Name', cell: (row: Supplier) => <span className="font-medium">{row.name}</span> },
      { key: 'phone', header: 'Phone', cell: (row: Supplier) => row.phone || '—' },
      { key: 'license', header: 'Trade License', cell: (row: Supplier) => row.tradeLicense || '—' },
      {
        key: 'balance',
        header: 'Balance (OMR)',
        cell: (row: Supplier) => <span className="tabular-nums">{formatOmrDisplay(row.currentBalance)}</span>,
      },
      { key: 'created', header: 'Created', cell: (row: Supplier) => formatDate(row.createdAt) },
      {
        key: 'actions',
        header: '',
        className: 'w-[100px] text-right',
        cell: (row: Supplier) => (
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
        title="Suppliers"
        description="Vendor accounts and payables"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Supplier
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
            <Input placeholder="Search suppliers…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? 'Edit Supplier' : 'New Supplier'}
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
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input {...form.register('name')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Trade License</Label>
              <Input {...form.register('tradeLicense')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register('email')} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...form.register('address')} />
          </div>
          {!editing ? (
            <div className="space-y-2">
              <Label>Opening Balance (OMR)</Label>
              <Input {...form.register('openingBalance')} />
            </div>
          ) : null}
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete supplier?"
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
