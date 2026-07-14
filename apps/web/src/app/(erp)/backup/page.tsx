'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiList, apiPost } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface BackupRecord {
  id: string;
  type?: string;
  status?: string;
  filePath?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
  createdById?: string | null;
}

function formatSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileName(path?: string | null) {
  if (!path) return 'backup';
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || path;
}

export default function BackupPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: () => apiList<BackupRecord>('/backups', { page: 1, pageSize: 20 }),
  });

  const createBackup = useMutation({
    mutationFn: () => apiPost('/backups', { type: 'MANUAL' }),
    onSuccess: () => {
      toast.success('Backup created');
      qc.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Backup failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'file', header: 'File', cell: (row: BackupRecord) => fileName(row.filePath) },
      { key: 'type', header: 'Type', cell: (row: BackupRecord) => row.type ?? 'MANUAL' },
      {
        key: 'status',
        header: 'Status',
        cell: (row: BackupRecord) => (
          <Badge variant={row.status === 'COMPLETED' ? 'success' : 'secondary'}>
            {row.status ?? '—'}
          </Badge>
        ),
      },
      { key: 'size', header: 'Size', cell: (row: BackupRecord) => formatSize(row.sizeBytes) },
      { key: 'date', header: 'Created', cell: (row: BackupRecord) => formatDate(row.createdAt) },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: () => (
          <Button variant="ghost" size="sm" disabled>
            <Download className="h-4 w-4" />
            Download
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup"
        description="Database backup and restore"
        actions={
          <Button onClick={() => createBackup.mutate()} disabled={createBackup.isPending}>
            <Database className="h-4 w-4" />
            {createBackup.isPending ? 'Creating…' : 'Create Backup'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup Policy</CardTitle>
          <CardDescription>
            Create manual backups regularly. Restore requires owner permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Backups are stored under the API <code>BACKUP_DIR</code> (default <code>./data/backups</code>).
          </p>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        emptyTitle="No backups yet"
        emptyDescription="Create your first backup to protect shop data."
      />
    </div>
  );
}
