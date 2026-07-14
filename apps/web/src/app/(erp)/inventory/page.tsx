'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Input } from '@/components/ui/input';
import { apiList } from '@/lib/api/client';

interface InventoryRow {
  id: string;
  product?: { sku: string; name: string } | null;
  onHandQty?: string | number;
  onHandWeight?: string;
  reservedQty?: string | number;
  reservedWeight?: string;
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => apiList<InventoryRow>('/inventory/balances', { search, page: 1, pageSize: 50 }),
  });

  const columns = useMemo(
    () => [
      { key: 'sku', header: 'SKU', cell: (row: InventoryRow) => row.product?.sku ?? '—' },
      { key: 'name', header: 'Product', cell: (row: InventoryRow) => row.product?.name ?? '—' },
      { key: 'qty', header: 'Qty', cell: (row: InventoryRow) => String(row.onHandQty ?? 0) },
      {
        key: 'weight',
        header: 'Weight (g)',
        cell: (row: InventoryRow) => String(row.onHandWeight ?? '0.000'),
      },
      {
        key: 'reserved',
        header: 'Reserved Qty',
        cell: (row: InventoryRow) => String(row.reservedQty ?? 0),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Stock quantities and weights on hand" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />
    </div>
  );
}
