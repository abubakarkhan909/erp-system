export type PeriodGranularity = 'daily' | 'monthly' | 'yearly';

export function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function endOfDayUtc(d: Date): Date {
  const start = startOfDayUtc(d);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function resolveDateRange(query: {
  from?: string;
  to?: string;
  date?: string;
  year?: number | string;
  month?: number | string;
  period?: PeriodGranularity;
}): { from: Date; to: Date; period: PeriodGranularity } {
  const period = query.period ?? 'daily';
  const now = new Date();

  if (query.from && query.to) {
    return {
      from: startOfDayUtc(parseIsoDate(query.from) ?? now),
      to: endOfDayUtc(parseIsoDate(query.to) ?? now),
      period,
    };
  }

  if (query.date) {
    const d = parseIsoDate(query.date) ?? now;
    return { from: startOfDayUtc(d), to: endOfDayUtc(d), period: 'daily' };
  }

  const year = Number(query.year) || now.getUTCFullYear();
  const month = query.month != null ? Number(query.month) : now.getUTCMonth() + 1;

  if (period === 'yearly') {
    return {
      from: new Date(Date.UTC(year, 0, 1)),
      to: new Date(Date.UTC(year + 1, 0, 1)),
      period,
    };
  }

  if (period === 'monthly') {
    return {
      from: new Date(Date.UTC(year, month - 1, 1)),
      to: new Date(Date.UTC(year, month, 1)),
      period,
    };
  }

  const d = parseIsoDate(query.date) ?? now;
  return { from: startOfDayUtc(d), to: endOfDayUtc(d), period: 'daily' };
}

export function vatPeriodRange(
  year: number,
  month?: number,
  quarter?: number,
): { from: Date; to: Date; label: string } {
  if (quarter != null && quarter >= 1 && quarter <= 4) {
    const startMonth = (quarter - 1) * 3;
    return {
      from: new Date(Date.UTC(year, startMonth, 1)),
      to: new Date(Date.UTC(year, startMonth + 3, 1)),
      label: `${year}-Q${quarter}`,
    };
  }

  if (month != null && month >= 1 && month <= 12) {
    return {
      from: new Date(Date.UTC(year, month - 1, 1)),
      to: new Date(Date.UTC(year, month, 1)),
      label: `${year}-${String(month).padStart(2, '0')}`,
    };
  }

  return {
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year + 1, 0, 1)),
    label: `${year}`,
  };
}
