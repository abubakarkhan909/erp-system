'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DocumentStatus, InstallmentStatus } from '@jewelry-erp/shared';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
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
import { apiGet, apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface SaleOption {
  id: string;
  number: string;
  status: DocumentStatus;
  balance?: string;
  customer?: { name: string } | null;
}

interface InstallmentPlan {
  id: string;
  saleInvoice?: { number: string; customerId?: string } | null;
  totalAmount?: string;
  remainingAmount?: string;
  installmentCount?: number;
  paidCount?: number;
  createdAt?: string;
}

interface ScheduleRow {
  id: string;
  dueDate: string;
  amount?: string;
  paidAmount?: string;
  remaining?: string;
  status?: InstallmentStatus | string;
}

interface PlanForm {
  saleInvoiceId: string;
  installmentCount: number;
  firstDueDate: string;
  advanceAmount: string;
}

export default function InstallmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [planOpen, setPlanOpen] = useState(false);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<InstallmentPlan | null>(null);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['installments', search],
    queryFn: () => apiList<InstallmentPlan>('/installments/plans', { search, page: 1, pageSize: 50 }),
  });

  const { data: sales } = useQuery({
    queryKey: ['sales-with-balance'],
    queryFn: async () => {
      const res = await apiList<SaleOption>('/sales', { page: 1, pageSize: 100 });
      return res.data.filter(
        (s) => s.status === DocumentStatus.POSTED && Number(s.balance ?? 0) > 0,
      );
    },
  });

  const form = useForm<PlanForm>({
    defaultValues: {
      saleInvoiceId: '',
      installmentCount: 3,
      firstDueDate: new Date().toISOString().slice(0, 10),
      advanceAmount: '0.000',
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: PlanForm) =>
      apiPost('/installments/plans', {
        saleInvoiceId: values.saleInvoiceId,
        installmentCount: values.installmentCount,
        firstDueDate: values.firstDueDate,
        advanceAmount: values.advanceAmount || '0.000',
      }),
    onSuccess: () => {
      toast.success('Installment plan created');
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      setPlanOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Create failed'),
  });

  const payMutation = useMutation({
    mutationFn: ({ scheduleId, amount }: { scheduleId: string; amount: string }) =>
      apiPost(`/installments/schedules/${scheduleId}/payments`, { amount }),
    onSuccess: async () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      if (activePlan) await loadSchedules(activePlan);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Payment failed'),
  });

  const loadSchedules = async (plan: InstallmentPlan) => {
    setActivePlan(plan);
    setSchedulesOpen(true);
    setSchedulesLoading(true);
    try {
      const res = await apiGet<ScheduleRow[] | { data: ScheduleRow[] }>(
        `/installments/plans/${plan.id}/schedules`,
        { params: { page: 1, pageSize: 100 } },
      );
      const rows = Array.isArray(res.data)
        ? res.data
        : ((res.data as { data?: ScheduleRow[] })?.data ?? []);
      setSchedules(rows);
      const amounts: Record<string, string> = {};
      for (const row of rows) {
        amounts[row.id] = row.remaining || row.amount || '0.000';
      }
      setPayAmounts(amounts);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load schedules');
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'invoice',
        header: 'Sale Invoice',
        cell: (row: InstallmentPlan) => row.saleInvoice?.number ?? '—',
      },
      {
        key: 'total',
        header: 'Total (OMR)',
        cell: (row: InstallmentPlan) => formatOmrDisplay(row.totalAmount),
      },
      {
        key: 'remaining',
        header: 'Remaining',
        cell: (row: InstallmentPlan) => formatOmrDisplay(row.remainingAmount),
      },
      {
        key: 'progress',
        header: 'Paid / Count',
        cell: (row: InstallmentPlan) => `${row.paidCount ?? 0} / ${row.installmentCount ?? 0}`,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: InstallmentPlan) => {
          const done = (row.paidCount ?? 0) >= (row.installmentCount ?? 0);
          const remaining = Number(row.remainingAmount ?? 0);
          return (
            <Badge variant={done || remaining <= 0 ? 'success' : 'secondary'}>
              {done || remaining <= 0 ? 'COMPLETED' : 'ACTIVE'}
            </Badge>
          );
        },
      },
      {
        key: 'created',
        header: 'Created',
        cell: (row: InstallmentPlan) => formatDate(row.createdAt),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[120px] text-right',
        cell: (row: InstallmentPlan) => (
          <Button size="sm" variant="outline" onClick={() => void loadSchedules(row)}>
            Schedules
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Installments"
        description="Payment plans for posted sales with outstanding balance"
        actions={
          <Button
            onClick={() => {
              form.reset({
                saleInvoiceId: sales?.[0]?.id ?? '',
                installmentCount: 3,
                firstDueDate: new Date().toISOString().slice(0, 10),
                advanceAmount: '0.000',
              });
              setPlanOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Plan
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
              placeholder="Search installments…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <FormDrawer
        open={planOpen}
        onOpenChange={setPlanOpen}
        title="New Installment Plan"
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button
              disabled={createMutation.isPending}
              onClick={form.handleSubmit((v) => {
                if (!v.saleInvoiceId) {
                  toast.error('Select a sale invoice');
                  return;
                }
                createMutation.mutate(v);
              })}
            >
              {createMutation.isPending ? 'Creating…' : 'Create Plan'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Sale Invoice *</Label>
            <Select
              value={form.watch('saleInvoiceId') || undefined}
              onValueChange={(v) => form.setValue('saleInvoiceId', v)}
            >
              <SelectTrigger><SelectValue placeholder="Posted sales with balance" /></SelectTrigger>
              <SelectContent>
                {(sales ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.number} — bal {formatOmrDisplay(s.balance)}
                    {s.customer?.name ? ` (${s.customer.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Installment Count *</Label>
            <Input
              type="number"
              min={1}
              max={60}
              {...form.register('installmentCount', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>First Due Date *</Label>
            <Input type="date" {...form.register('firstDueDate')} />
          </div>
          <div className="space-y-2">
            <Label>Advance Amount (OMR)</Label>
            <Input {...form.register('advanceAmount')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={schedulesOpen}
        onOpenChange={setSchedulesOpen}
        title="Installment Schedules"
        description={
          activePlan?.saleInvoice?.number
            ? `Invoice ${activePlan.saleInvoice.number}`
            : undefined
        }
      >
        {schedulesLoading ? (
          <p className="text-sm text-muted-foreground">Loading schedules…</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules found.</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((row) => (
              <div key={row.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Due {formatDate(row.dueDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatOmrDisplay(row.amount)} · paid {formatOmrDisplay(row.paidAmount)} · rem{' '}
                      {formatOmrDisplay(row.remaining)}
                    </p>
                  </div>
                  <Badge variant="secondary">{row.status ?? '—'}</Badge>
                </div>
                {row.status !== InstallmentStatus.PAID ? (
                  <div className="flex gap-2">
                    <Input
                      value={payAmounts[row.id] ?? ''}
                      onChange={(e) =>
                        setPayAmounts((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      placeholder="Amount"
                    />
                    <Button
                      size="sm"
                      disabled={payMutation.isPending}
                      onClick={() =>
                        payMutation.mutate({
                          scheduleId: row.id,
                          amount: payAmounts[row.id] || row.remaining || '0.000',
                        })
                      }
                    >
                      Pay
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </FormDrawer>
    </div>
  );
}
