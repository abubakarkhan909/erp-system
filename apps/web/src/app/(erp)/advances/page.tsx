'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AdvanceOrderStatus, advanceOrderSchema } from '@jewelry-erp/shared';
import { formResolver, type FormInput } from '@/lib/form';
import { Plus, Search } from 'lucide-react';
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
import { apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface CustomerOption {
  id: string;
  name: string;
}

interface AdvanceOrder {
  id: string;
  orderNo?: string;
  description: string;
  customer?: { name: string } | null;
  customerId?: string;
  advancePaid?: string;
  totalAmount?: string;
  remaining?: string;
  expectedDelivery?: string | null;
  notes?: string | null;
  status: AdvanceOrderStatus;
}

function statusVariant(status: AdvanceOrderStatus) {
  switch (status) {
    case AdvanceOrderStatus.READY:
      return 'default' as const;
    case AdvanceOrderStatus.DELIVERED:
      return 'success' as const;
    case AdvanceOrderStatus.CANCELLED:
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export default function AdvancesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<AdvanceOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('0.000');
  const [cancelTarget, setCancelTarget] = useState<AdvanceOrder | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['advances', search],
    queryFn: () => apiList<AdvanceOrder>('/advances/advance-orders', { search, page: 1, pageSize: 50 }),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-select'],
    queryFn: async () => {
      const res = await apiList<CustomerOption>('/customers', { page: 1, pageSize: 100 });
      return res.data;
    },
  });

  const form = useForm<FormInput<typeof advanceOrderSchema>>({
    resolver: formResolver(advanceOrderSchema),
    defaultValues: {
      customerId: '',
      description: '',
      totalAmount: '0.000',
      advancePaid: '0.000',
      expectedDelivery: '',
      notes: '',
      status: AdvanceOrderStatus.PENDING,
    },
  });

  const openCreate = () => {
    form.reset({
      customerId: customers?.[0]?.id ?? '',
      description: '',
      totalAmount: '0.000',
      advancePaid: '0.000',
      expectedDelivery: '',
      notes: '',
      status: AdvanceOrderStatus.PENDING,
    });
    setDrawerOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormInput<typeof advanceOrderSchema>) =>
      apiPost('/advances/advance-orders', {
        ...values,
        expectedDelivery: values.expectedDelivery || null,
        notes: values.notes || null,
      }),
    onSuccess: () => {
      toast.success('Advance order created');
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Create failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdvanceOrderStatus }) =>
      apiPatch(`/advances/advance-orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      setCancelTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Status update failed'),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: string }) =>
      apiPost(`/advances/advance-orders/${id}/payments`, { amount }),
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      setPaymentTarget(null);
      setPaymentAmount('0.000');
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Payment failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'order', header: 'Order #', cell: (row: AdvanceOrder) => row.orderNo ?? '—' },
      { key: 'customer', header: 'Customer', cell: (row: AdvanceOrder) => row.customer?.name ?? '—' },
      { key: 'desc', header: 'Description', cell: (row: AdvanceOrder) => row.description },
      {
        key: 'advance',
        header: 'Advance (OMR)',
        cell: (row: AdvanceOrder) => formatOmrDisplay(row.advancePaid),
      },
      {
        key: 'total',
        header: 'Total (OMR)',
        cell: (row: AdvanceOrder) => formatOmrDisplay(row.totalAmount),
      },
      {
        key: 'delivery',
        header: 'Expected',
        cell: (row: AdvanceOrder) => formatDate(row.expectedDelivery),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: AdvanceOrder) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        className: 'min-w-[280px] text-right',
        cell: (row: AdvanceOrder) => (
          <div className="flex flex-wrap justify-end gap-1">
            {row.status === AdvanceOrderStatus.PENDING ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusMutation.mutate({ id: row.id, status: AdvanceOrderStatus.READY })}
              >
                Mark Ready
              </Button>
            ) : null}
            {row.status === AdvanceOrderStatus.READY ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusMutation.mutate({ id: row.id, status: AdvanceOrderStatus.DELIVERED })}
              >
                Mark Delivered
              </Button>
            ) : null}
            {row.status === AdvanceOrderStatus.PENDING || row.status === AdvanceOrderStatus.READY ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setPaymentAmount(row.remaining || '0.000');
                    setPaymentTarget(row);
                  }}
                >
                  Add Payment
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setCancelTarget(row)}>
                  Cancel
                </Button>
              </>
            ) : null}
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
        title="Advances"
        description="Custom orders with advance payments — track pending, ready, and delivered"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Advance
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search advance orders…"
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
        title="New Advance Order"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              disabled={createMutation.isPending}
              onClick={form.handleSubmit((v) => createMutation.mutate(v))}
            >
              {createMutation.isPending ? 'Saving…' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Customer *</Label>
            <Select
              value={form.watch('customerId') || undefined}
              onValueChange={(v) => form.setValue('customerId', v)}
            >
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {(customers ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Input {...form.register('description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Total Amount (OMR) *</Label>
              <Input {...form.register('totalAmount')} />
            </div>
            <div className="space-y-2">
              <Label>Advance Paid (OMR)</Label>
              <Input {...form.register('advancePaid')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expected Delivery</Label>
            <Input type="date" {...form.register('expectedDelivery')} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input {...form.register('notes')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        title="Add Payment"
        description={paymentTarget ? `Order ${paymentTarget.orderNo ?? paymentTarget.id}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentTarget(null)}>Cancel</Button>
            <Button
              disabled={paymentMutation.isPending}
              onClick={() => {
                if (paymentTarget) {
                  paymentMutation.mutate({ id: paymentTarget.id, amount: paymentAmount });
                }
              }}
            >
              {paymentMutation.isPending ? 'Saving…' : 'Record Payment'}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label>Amount (OMR)</Label>
          <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel advance order?"
        description={
          cancelTarget
            ? `Cancel ${cancelTarget.orderNo ?? cancelTarget.description}? This cannot be undone from the UI.`
            : undefined
        }
        confirmLabel="Cancel Order"
        variant="destructive"
        isLoading={statusMutation.isPending}
        onConfirm={() => {
          if (cancelTarget) {
            statusMutation.mutate({ id: cancelTarget.id, status: AdvanceOrderStatus.CANCELLED });
          }
        }}
      />
    </div>
  );
}
