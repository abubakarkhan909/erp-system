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

interface Purchase {
  id: string;
  number: string;
  invoiceDate: string;
  status: DocumentStatus;
  supplier?: { name: string } | null;
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

export default function PurchasesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [postTarget, setPostTarget] = useState<Purchase | null>(null);
  const [voidTarget, setVoidTarget] = useState<Purchase | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', search],
    queryFn: () => apiList<Purchase>('/purchases', { search, page: 1, pageSize: 50 }),
  });

  const postMutation = useMutation({
    mutationFn: (row: Purchase) => apiPost(`/purchases/${row.id}/post`, { payments: [] }),
    onSuccess: () => {
      toast.success('Purchase posted');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setPostTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Post failed'),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/purchases/${id}/void`),
    onSuccess: () => {
      toast.success('Purchase voided');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setVoidTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Void failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'invoice', header: 'Invoice #', cell: (row: Purchase) => <span className="font-medium">{row.number}</span> },
      { key: 'date', header: 'Date', cell: (row: Purchase) => formatDate(row.invoiceDate) },
      { key: 'supplier', header: 'Supplier', cell: (row: Purchase) => row.supplier?.name ?? '—' },
      {
        key: 'total',
        header: 'Total (OMR)',
        cell: (row: Purchase) => <span className="tabular-nums">{formatOmrDisplay(row.total)}</span>,
      },
      {
        key: 'balance',
        header: 'Balance',
        cell: (row: Purchase) => <span className="tabular-nums">{formatOmrDisplay(row.balance)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: Purchase) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[140px] text-right',
        cell: (row: Purchase) => (
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
        title="Purchases"
        description="Draft = not finalized. Post updates stock and accounting. Void reverses a posted purchase."
        actions={
          <Button asChild>
            <Link href="/purchases/new">
              <Plus className="h-4 w-4" />
              New Purchase
            </Link>
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
              placeholder="Search purchases…"
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
        title="Post purchase?"
        description={
          postTarget
            ? `Post ${postTarget.number}? This receives stock and posts accounting. Unpaid balance stays on the supplier.`
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
        title="Void purchase?"
        description={
          voidTarget
            ? `Void ${voidTarget.number}? This reverses posted stock and accounting.`
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
