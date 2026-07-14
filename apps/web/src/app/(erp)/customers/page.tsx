'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { customerSchema, type CustomerInput } from '@jewelry-erp/shared';
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
import { apiDelete, apiGet, apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  civilId?: string | null;
  currentBalance?: string;
  createdAt?: string;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => apiList<Customer>('/customers', { search, page: 1, pageSize: 50 }),
  });

  const form = useForm<FormInput<typeof customerSchema>>({
    resolver: formResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      civilId: '',
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
      civilId: '',
      openingBalance: '0.000',
      notes: '',
    });
    setDrawerOpen(true);
  };

  const openEdit = async (customer: Customer) => {
    setEditing(customer);
    try {
      const res = await apiGet<Customer>(`/customers/${customer.id}`);
      const c = res.data;
      form.reset({
        name: c.name,
        phone: c.phone ?? '',
        email: c.email ?? '',
        address: c.address ?? '',
        civilId: c.civilId ?? '',
        openingBalance: '0.000',
        notes: '',
      });
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load customer');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormInput<typeof customerSchema>) => {
      const payload = values as CustomerInput;
      if (editing) {
        return apiPatch<Customer>(`/customers/${editing.id}`, payload);
      }
      return apiPost<Customer>('/customers', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Customer updated' : 'Customer created');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/customers/${id}`),
    onSuccess: () => {
      toast.success('Customer deleted');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    },
  });

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        cell: (row: Customer) => <span className="font-medium">{row.name}</span>,
      },
      {
        key: 'phone',
        header: 'Phone',
        cell: (row: Customer) => row.phone || '—',
      },
      {
        key: 'balance',
        header: 'Balance (OMR)',
        cell: (row: Customer) => (
          <span className="tabular-nums">{formatOmrDisplay(row.currentBalance)}</span>
        ),
      },
      {
        key: 'created',
        header: 'Created',
        cell: (row: Customer) => formatDate(row.createdAt),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[100px] text-right',
        cell: (row: Customer) => (
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
        title="Customers"
        description="Manage customer accounts and receivables in OMR"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        emptyDescription="Add your first customer to start recording sales."
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, civil ID…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
        footer={
          data?.meta?.total != null
            ? `${data.meta.total} customer${data.meta.total === 1 ? '' : 's'} total`
            : undefined
        }
      />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? 'Edit Customer' : 'New Customer'}
        description="Customer details for invoicing and ledger tracking"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={form.handleSubmit((v) => saveMutation.mutate(v))}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register('name')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="civilId">Civil ID</Label>
              <Input id="civilId" {...form.register('civilId')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register('address')} />
          </div>
          {!editing ? (
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Balance (OMR)</Label>
              <Input id="openingBalance" {...form.register('openingBalance')} />
            </div>
          ) : (
            <Badge variant="secondary">Balance edits via ledger / payments</Badge>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...form.register('notes')} />
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete customer?"
        description={`Remove ${deleteTarget?.name}? This action may be reversible depending on server policy.`}
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
