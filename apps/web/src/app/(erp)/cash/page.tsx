'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiGet, apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface CashTxn {
  id: string;
  type: 'IN' | 'OUT' | string;
  amount?: string;
  reason?: string | null;
  createdAt?: string;
}

interface CashSession {
  id: string;
  sessionDate?: string;
  openedAt: string;
  closedAt?: string | null;
  openingCash?: string;
  closingCash?: string | null;
  status?: string;
  notes?: string | null;
  transactions?: CashTxn[];
}

export default function CashPage() {
  const queryClient = useQueryClient();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [closeDrawer, setCloseDrawer] = useState(false);
  const [inDrawer, setInDrawer] = useState(false);
  const [outDrawer, setOutDrawer] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cash-sessions'],
    queryFn: () => apiList<CashSession>('/cash/sessions', { page: 1, pageSize: 20 }),
  });

  const { data: openSessionRes } = useQuery({
    queryKey: ['cash-session-open'],
    queryFn: async () => {
      try {
        const res = await apiGet<CashSession | null>('/cash/sessions/open');
        return res.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const openSession = openSessionRes;
  const isOpen = openSession?.status === 'OPEN';

  const openForm = useForm({ defaultValues: { openingCash: '0.000', notes: '' } });
  const closeForm = useForm({ defaultValues: { closingCash: '0.000', notes: '' } });
  const moveForm = useForm({ defaultValues: { amount: '0.000', reason: '' } });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
    queryClient.invalidateQueries({ queryKey: ['cash-session-open'] });
  };

  const openMutation = useMutation({
    mutationFn: (values: { openingCash: string; notes: string }) =>
      apiPost('/cash/sessions/open', {
        openingCash: values.openingCash,
        notes: values.notes || null,
      }),
    onSuccess: () => {
      toast.success('Cash session opened');
      setOpenDrawer(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Open failed'),
  });

  const closeMutation = useMutation({
    mutationFn: (values: { closingCash: string; notes: string }) =>
      apiPost('/cash/sessions/close', {
        closingCash: values.closingCash,
        notes: values.notes || null,
      }),
    onSuccess: () => {
      toast.success('Cash session closed');
      setCloseDrawer(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Close failed'),
  });

  const inMutation = useMutation({
    mutationFn: (values: { amount: string; reason: string }) =>
      apiPost('/cash/in', { type: 'IN', amount: values.amount, reason: values.reason || null }),
    onSuccess: () => {
      toast.success('Cash in recorded');
      setInDrawer(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Cash in failed'),
  });

  const outMutation = useMutation({
    mutationFn: (values: { amount: string; reason: string }) =>
      apiPost('/cash/out', { type: 'OUT', amount: values.amount, reason: values.reason || null }),
    onSuccess: () => {
      toast.success('Cash out recorded');
      setOutDrawer(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Cash out failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'opened', header: 'Opened', cell: (row: CashSession) => formatDate(row.openedAt) },
      { key: 'closed', header: 'Closed', cell: (row: CashSession) => formatDate(row.closedAt) },
      {
        key: 'opening',
        header: 'Opening (OMR)',
        cell: (row: CashSession) => formatOmrDisplay(row.openingCash),
      },
      {
        key: 'closing',
        header: 'Closing (OMR)',
        cell: (row: CashSession) => formatOmrDisplay(row.closingCash),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: CashSession) => (
          <Badge variant={row.status === 'OPEN' ? 'success' : 'secondary'}>{row.status ?? '—'}</Badge>
        ),
      },
      { key: 'notes', header: 'Notes', cell: (row: CashSession) => row.notes ?? '—' },
    ],
    [],
  );

  const txnColumns = useMemo(
    () => [
      {
        key: 'type',
        header: 'Type',
        cell: (row: CashTxn) => (
          <Badge variant={row.type === 'IN' ? 'success' : 'secondary'}>{row.type}</Badge>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        cell: (row: CashTxn) => formatOmrDisplay(row.amount),
      },
      { key: 'reason', header: 'Reason', cell: (row: CashTxn) => row.reason || '—' },
      { key: 'at', header: 'When', cell: (row: CashTxn) => formatDate(row.createdAt) },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash"
        description="Daily till — open a session with opening float, record cash in/out during the day, then close with counted cash."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={isOpen}
              onClick={() => {
                openForm.reset({ openingCash: '0.000', notes: '' });
                setOpenDrawer(true);
              }}
            >
              Open Session
            </Button>
            <Button
              variant="outline"
              disabled={!isOpen}
              onClick={() => {
                closeForm.reset({ closingCash: '0.000', notes: '' });
                setCloseDrawer(true);
              }}
            >
              Close Session
            </Button>
            <Button
              disabled={!isOpen}
              onClick={() => {
                moveForm.reset({ amount: '0.000', reason: '' });
                setInDrawer(true);
              }}
            >
              Cash In
            </Button>
            <Button
              variant="secondary"
              disabled={!isOpen}
              onClick={() => {
                moveForm.reset({ amount: '0.000', reason: '' });
                setOutDrawer(true);
              }}
            >
              Cash Out
            </Button>
          </div>
        }
      />

      <StatCard
        title="Current Session"
        value={isOpen ? formatOmrDisplay(openSession?.openingCash) : 'No open session'}
        description={
          isOpen
            ? `Opened ${formatDate(openSession?.openedAt)}`
            : 'Open a session to record cash movements'
        }
        icon={Banknote}
        className="max-w-md"
      />

      {isOpen && (openSession?.transactions?.length ?? 0) > 0 ? (
        <DataTable
          columns={txnColumns}
          data={openSession?.transactions ?? []}
          getRowKey={(r) => r.id}
          emptyTitle="No transactions"
        />
      ) : null}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        emptyTitle="No cash sessions"
        emptyDescription="Cash session history will appear here."
      />

      <FormDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        title="Open Cash Session"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenDrawer(false)}>Cancel</Button>
            <Button
              disabled={openMutation.isPending}
              onClick={openForm.handleSubmit((v) => openMutation.mutate(v))}
            >
              {openMutation.isPending ? 'Opening…' : 'Open'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Opening Cash (OMR)</Label>
            <Input {...openForm.register('openingCash')} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input {...openForm.register('notes')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={closeDrawer}
        onOpenChange={setCloseDrawer}
        title="Close Cash Session"
        footer={
          <>
            <Button variant="outline" onClick={() => setCloseDrawer(false)}>Cancel</Button>
            <Button
              disabled={closeMutation.isPending}
              onClick={closeForm.handleSubmit((v) => closeMutation.mutate(v))}
            >
              {closeMutation.isPending ? 'Closing…' : 'Close'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Counted Closing Cash (OMR)</Label>
            <Input {...closeForm.register('closingCash')} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input {...closeForm.register('notes')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={inDrawer}
        onOpenChange={setInDrawer}
        title="Cash In"
        footer={
          <>
            <Button variant="outline" onClick={() => setInDrawer(false)}>Cancel</Button>
            <Button
              disabled={inMutation.isPending}
              onClick={moveForm.handleSubmit((v) => inMutation.mutate(v))}
            >
              {inMutation.isPending ? 'Saving…' : 'Record'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Amount (OMR)</Label>
            <Input {...moveForm.register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input {...moveForm.register('reason')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={outDrawer}
        onOpenChange={setOutDrawer}
        title="Cash Out"
        footer={
          <>
            <Button variant="outline" onClick={() => setOutDrawer(false)}>Cancel</Button>
            <Button
              disabled={outMutation.isPending}
              onClick={moveForm.handleSubmit((v) => outMutation.mutate(v))}
            >
              {outMutation.isPending ? 'Saving…' : 'Record'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Amount (OMR)</Label>
            <Input {...moveForm.register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input {...moveForm.register('reason')} />
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
