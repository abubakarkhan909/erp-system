'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Input } from '@/components/ui/input';
import { apiList } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface AuditEntry {
  id: string;
  action: string;
  entity?: string;
  entityId?: string | null;
  actor?: { username: string; fullName?: string } | null;
  createdAt: string;
  ip?: string | null;
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['audit', search],
    queryFn: () => apiList<AuditEntry>('/audit-logs', { search, page: 1, pageSize: 50 }),
  });

  const columns = useMemo(
    () => [
      { key: 'time', header: 'Timestamp', cell: (row: AuditEntry) => formatDate(row.createdAt) },
      {
        key: 'user',
        header: 'User',
        cell: (row: AuditEntry) => row.actor?.fullName ?? row.actor?.username ?? '—',
      },
      { key: 'action', header: 'Action', cell: (row: AuditEntry) => row.action },
      {
        key: 'entity',
        header: 'Entity',
        cell: (row: AuditEntry) => `${row.entity ?? ''} ${row.entityId ?? ''}`.trim() || '—',
      },
      { key: 'ip', header: 'IP', cell: (row: AuditEntry) => row.ip ?? '—' },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Immutable activity trail for compliance" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search audit log…"
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
