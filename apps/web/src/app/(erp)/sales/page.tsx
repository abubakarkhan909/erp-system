'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { DocumentStatus } from '@jewelry-erp/shared';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiDelete, apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface Sale {
  id: string;
  number: string;
  invoiceDate: string;
  status: DocumentStatus;
  customer?: { name: string } | null;
  total?: string;
  paid?: string;
  balance?: string;
  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID' | 'N/A';
}

function statusVariant(status: DocumentStatus) {
  switch (status) {
    case DocumentStatus.POSTED:
      return 'success' as const;
    case DocumentStatus.VOID:
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

function paymentBadge(row: Sale) {
  if (row.status !== DocumentStatus.POSTED) return null;
  const status =
    row.paymentStatus ??
    (Number(row.balance ?? 0) <= 0.001
      ? 'PAID'
      : Number(row.paid ?? 0) > 0.001
        ? 'PARTIAL'
        : 'UNPAID');
  if (status === 'PAID') return <Badge variant="success">Paid</Badge>;
  if (status === 'PARTIAL') return <Badge variant="warning">Partial</Badge>;
  return <Badge variant="secondary">Unpaid</Badge>;
}

export default function SalesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite =
    Boolean(user?.roles?.includes('OWNER')) ||
    Boolean(user?.permissions?.includes('sales.write'));
  const canVoid =
    Boolean(user?.roles?.includes('OWNER')) ||
    Boolean(user?.permissions?.includes('sales.void'));

  const [search, setSearch] = useState('');
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales', search],
    queryFn: () => apiList<Sale>('/sales', { search, page: 1, pageSize: 50 }),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/sales/${id}/void`),
    onSuccess: () => {
      toast.success('Invoice voided');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setVoidTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Void failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/sales/${id}`),
    onSuccess: () => {
      toast.success('Draft invoice deleted');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Delete failed'),
  });

  const columns = useMemo(
    () => [
      {
        key: 'invoice',
        header: 'Invoice #',
        cell: (row: Sale) => <span className="font-medium">{row.number}</span>,
      },
      { key: 'date', header: 'Date', cell: (row: Sale) => formatDate(row.invoiceDate) },
      { key: 'customer', header: 'Customer', cell: (row: Sale) => row.customer?.name ?? 'Walk-in' },
      {
        key: 'total',
        header: 'Total (OMR)',
        cell: (row: Sale) => <span className="tabular-nums">{formatOmrDisplay(row.total)}</span>,
      },
      {
        key: 'paid',
        header: 'Paid',
        cell: (row: Sale) => <span className="tabular-nums">{formatOmrDisplay(row.paid)}</span>,
      },
      {
        key: 'balance',
        header: 'Balance due',
        cell: (row: Sale) => <span className="tabular-nums">{formatOmrDisplay(row.balance)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: Sale) => (
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            {paymentBadge(row)}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[260px] text-right',
        cell: (row: Sale) => (
          <div className="flex justify-end gap-1">
            {row.status === DocumentStatus.DRAFT && canWrite ? (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/sales/${row.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit / Post
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  Delete
                </Button>
              </>
            ) : null}
            {row.status === DocumentStatus.POSTED && Number(row.balance ?? 0) > 0.001 ? (
              <Button size="sm" variant="outline" asChild>
                <Link href="/installments">Installments</Link>
              </Button>
            ) : null}
            {row.status === DocumentStatus.POSTED && canVoid ? (
              <Button size="sm" variant="destructive" onClick={() => setVoidTarget(row)}>
                Void
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canWrite, canVoid],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Create invoices, collect full or partial payment, then post. Remaining balances stay on the invoice and customer ledger — collect later via Installments."
        actions={
          canWrite ? (
            <Button asChild>
              <Link href="/sales/new">
                <Plus className="h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          ) : null
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
              placeholder="Search invoice #…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title="Void invoice?"
        description={
          voidTarget
            ? `Void ${voidTarget.number}? This reverses posted stock and accounting entries.`
            : undefined
        }
        confirmLabel="Void"
        variant="destructive"
        isLoading={voidMutation.isPending}
        onConfirm={() => {
          if (voidTarget) voidMutation.mutate(voidTarget.id);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete draft?"
        description={
          deleteTarget
            ? `Delete draft ${deleteTarget.number}? This cannot be undone. Only unfinished drafts can be deleted.`
            : undefined
        }
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
