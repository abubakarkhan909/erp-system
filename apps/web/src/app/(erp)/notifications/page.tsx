'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { apiList } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  isRead?: boolean;
  type?: string;
}

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiList<Notification>('/notifications', { page: 1, pageSize: 50 }),
  });

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        cell: (row: Notification) => <span className="font-medium">{row.title}</span>,
      },
      { key: 'message', header: 'Message', cell: (row: Notification) => row.body ?? '—' },
      { key: 'type', header: 'Type', cell: (row: Notification) => row.type ?? 'INFO' },
      { key: 'date', header: 'Date', cell: (row: Notification) => formatDate(row.createdAt) },
      {
        key: 'read',
        header: 'Status',
        cell: (row: Notification) => (
          <Badge variant={row.isRead ? 'secondary' : 'default'}>{row.isRead ? 'Read' : 'Unread'}</Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="System alerts and reminders" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} getRowKey={(r) => r.id} />
    </div>
  );
}
