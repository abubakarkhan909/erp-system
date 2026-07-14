export function parsePagination(query: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const skip = (page - 1) * pageSize;
  const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
  return { page, pageSize, skip, take: pageSize, search: query.search?.trim(), sortBy: query.sortBy, sortDir };
}

export function paginatedResult<T>(data: T[], total: number, page: number, pageSize: number) {
  return { data, meta: { page, pageSize, total } };
}

export function decimalStr(value: unknown): string {
  if (value == null) return '0.000';
  if (typeof value === 'object' && value !== null && 'toFixed' in value) {
    return (value as { toFixed: (n: number) => string }).toFixed(3);
  }
  const n = Number(value);
  if (Number.isNaN(n)) return '0.000';
  return n.toFixed(3);
}
