import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchSlot?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  getRowKey: (row: T) => string;
  className?: string;
}

function renderCellValue(value: React.ReactNode): React.ReactNode {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (Array.isArray(value)) {
    return value.map((v, i) => <span key={i}>{renderCellValue(v)}{i < value.length - 1 ? ', ' : ''}</span>);
  }
  // Avoid "Objects are not valid as a React child"
  if (typeof value === 'object' && value !== null && !('$$typeof' in (value as object))) {
    const obj = value as unknown as Record<string, unknown>;
    if (typeof obj.name === 'string') return obj.name;
    if (typeof obj.code === 'string') return obj.code;
    if (typeof obj.fullName === 'string') return obj.fullName;
    if (typeof obj.username === 'string') return obj.username;
    return '—';
  }
  return value;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
  searchSlot,
  toolbar,
  footer,
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {searchSlot || toolbar ? (
        <CardHeader className="flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
          {searchSlot}
          {toolbar}
        </CardHeader>
      ) : null}
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingState className="py-16" />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} className="py-16" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {renderCellValue(col.cell(row))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {footer ? <div className="border-t px-4 py-3 text-sm text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
