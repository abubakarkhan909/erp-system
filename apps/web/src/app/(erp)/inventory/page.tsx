'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackagePlus, Search } from 'lucide-react';
import { ProductOwnership } from '@jewelry-erp/shared';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiList } from '@/lib/api/client';
import { AddOwnStockDrawer } from '../_components/add-own-stock-drawer';

interface InventoryRow {
  id: string;
  productId?: string;
  product?: {
    id?: string;
    sku: string;
    name: string;
    netWeight?: string;
    ownership?: string;
  } | null;
  onHandQty?: string | number;
  onHandWeight?: string;
  reservedQty?: string | number;
  reservedWeight?: string;
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [ownStockTarget, setOwnStockTarget] = useState<{
    id: string;
    sku: string;
    name: string;
    netWeight?: string | null;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => apiList<InventoryRow>('/inventory/balances', { search, page: 1, pageSize: 50 }),
  });

  const columns = useMemo(
    () => [
      { key: 'sku', header: 'SKU', cell: (row: InventoryRow) => row.product?.sku ?? '—' },
      { key: 'name', header: 'Product', cell: (row: InventoryRow) => row.product?.name ?? '—' },
      {
        key: 'source',
        header: 'Source',
        cell: (row: InventoryRow) =>
          row.product?.ownership === ProductOwnership.OWN || row.product?.ownership === 'OWN' ? (
            <Badge variant="success">Own</Badge>
          ) : (
            <Badge variant="secondary">Supplier</Badge>
          ),
      },
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
      {
        key: 'actions',
        header: '',
        className: 'w-[160px] text-right',
        cell: (row: InventoryRow) => {
          const productId = row.product?.id ?? row.productId;
          const isOwn =
            row.product?.ownership === ProductOwnership.OWN || row.product?.ownership === 'OWN';
          if (!productId || !row.product || !isOwn) return null;
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setOwnStockTarget({
                    id: productId,
                    sku: row.product!.sku,
                    name: row.product!.name,
                    netWeight: row.product!.netWeight,
                  })
                }
              >
                <PackagePlus className="h-3.5 w-3.5" />
                Add more
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Own products get stock on create (or Add more). Supplier products get stock from Purchases."
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
              placeholder="Search inventory…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <AddOwnStockDrawer
        open={!!ownStockTarget}
        onOpenChange={(open) => !open && setOwnStockTarget(null)}
        product={ownStockTarget}
      />
    </div>
  );
}
