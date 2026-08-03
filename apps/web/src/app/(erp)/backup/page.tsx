'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiList, apiPost, getApiBaseUrl, TOKEN_STORAGE_KEY } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface BackupRecord {
  id: string;
  type?: string;
  status?: string;
  filePath?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
  createdById?: string | null;
  message?: string;
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

async function downloadBackup(id: string, name: string) {
  const base = getApiBaseUrl();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const res = await fetch(`${base}/backups/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.endsWith('.db') ? name : `${name}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
      toast.success('Database backup created');
      qc.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Backup failed'),
  });

  const restoreBackup = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiPost<BackupRecord>(`/backups/${id}/restore`, {});
      return res.data;
    },
    onSuccess: (row) => {
      toast.success(row?.message || 'Restore completed — restart the app');
      qc.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Restore failed'),
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
        cell: (row: BackupRecord) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={row.status !== 'COMPLETED' || row.type === 'RESTORE'}
              onClick={async () => {
                try {
                  await downloadBackup(row.id, fileName(row.filePath));
                  toast.success('Backup downloaded');
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Download failed');
                }
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={
                row.status !== 'COMPLETED' ||
                row.type === 'RESTORE' ||
                restoreBackup.isPending
              }
              onClick={() => {
                if (
                  !window.confirm(
                    'Restore this backup? Current data will be replaced. Restart the app after restore.',
                  )
                ) {
                  return;
                }
                restoreBackup.mutate(row.id);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
          </div>
        ),
      },
    ],
    [restoreBackup.isPending],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup"
        description="Local SQLite database backup and restore"
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
            Create a full copy of the local database regularly (USB / cloud folder). Restore
            requires owner permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Backups are <code>.db</code> files stored under the app data folder (
            <code>BACKUP_DIR</code>). Download a copy to an external drive so shop data is not
            lost if the PC fails.
          </p>
          <p>
            After restore, close and reopen the app so all services reload the restored database.
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
