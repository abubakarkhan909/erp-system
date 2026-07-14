'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { DocumentStatus } from '@jewelry-erp/shared';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface Sale {
  id: string;
  number: string;
  invoiceDate: string;
  status: DocumentStatus;
  customer?: { name: string } | null;
  total?: string;
  paid?: string;
  balance?: string;
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

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [postTarget, setPostTarget] = useState<Sale | null>(null);
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales', search],
    queryFn: () => apiList<Sale>('/sales', { search, page: 1, pageSize: 50 }),
  });

  const postMutation = useMutation({
    mutationFn: (row: Sale) => apiPost(`/sales/${row.id}/post`, { payments: [] }),
    onSuccess: () => {
      toast.success('Invoice posted');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setPostTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Post failed'),
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
        key: 'balance',
        header: 'Balance',
        cell: (row: Sale) => <span className="tabular-nums">{formatOmrDisplay(row.balance)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: Sale) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[140px] text-right',
        cell: (row: Sale) => (
          <div className="flex justify-end gap-1">
            {row.status === DocumentStatus.DRAFT ? (
              <Button size="sm" variant="outline" onClick={() => setPostTarget(row)}>
                Post
              </Button>
            ) : null}
            {row.status === DocumentStatus.POSTED ? (
              <Button size="sm" variant="destructive" onClick={() => setVoidTarget(row)}>
                Void
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Draft = not finalized. Post posts stock and accounting. Void reverses a posted invoice."
        actions={
          <Button asChild>
            <Link href="/sales/new">
              <Plus className="h-4 w-4" />
              New Invoice
            </Link>
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
              placeholder="Search invoice #…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={!!postTarget}
        onOpenChange={(open) => !open && setPostTarget(null)}
        title="Post invoice?"
        description={
          postTarget
            ? `Post ${postTarget.number}? This finalizes stock and accounting. Payments already on the invoice (or none = credit/balance) are applied.`
            : undefined
        }
        confirmLabel="Post"
        isLoading={postMutation.isPending}
        onConfirm={() => {
          if (postTarget) postMutation.mutate(postTarget);
        }}
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
    </div>
  );
}
