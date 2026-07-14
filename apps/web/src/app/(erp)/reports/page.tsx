'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Package,
  PiggyBank,
  TrendingUp,
  Wallet,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiGet, ApiError } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';

type ReportKey =
  | 'sales'
  | 'inventory'
  | 'profit'
  | 'expenses'
  | 'cash-flow'
  | 'installments'
  | 'advance-orders';

const REPORTS: Array<{
  key: ReportKey;
  title: string;
  description: string;
  icon: typeof BarChart3;
  needsRange: boolean;
}> = [
  { key: 'sales', title: 'Sales Summary', description: 'Posted sales totals for the range', icon: BarChart3, needsRange: true },
  { key: 'inventory', title: 'Inventory Valuation', description: 'Stock quantities and estimated value', icon: Package, needsRange: false },
  { key: 'profit', title: 'Profit & Loss', description: 'Revenue vs purchases and expenses', icon: TrendingUp, needsRange: true },
  { key: 'expenses', title: 'Expenses', description: 'Operating expenses by category', icon: FileSpreadsheet, needsRange: true },
  { key: 'cash-flow', title: 'Cash Flow', description: 'Cash and bank movements', icon: Wallet, needsRange: true },
  { key: 'installments', title: 'Installments', description: 'Schedules due in range', icon: PiggyBank, needsRange: true },
  { key: 'advance-orders', title: 'Advance Orders', description: 'Custom orders and advances', icon: ClipboardList, needsRange: true },
];

function monthStartIso() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function summarize(key: ReportKey, data: Record<string, unknown>): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const totals = (data.totals as Record<string, unknown> | undefined) ?? data;

  const pushMoney = (label: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      rows.push({ label, value: formatOmrDisplay(String(value)) });
    }
  };

  if (key === 'sales') {
    pushMoney('Total sales', totals.total ?? (totals as { total?: string }).total);
    pushMoney('VAT', totals.vatAmount);
    pushMoney('Paid', totals.paid);
    pushMoney('Balance', totals.balance);
    if (data.count != null) rows.push({ label: 'Invoices', value: String(data.count) });
  } else if (key === 'inventory') {
    const summary = (data.summary as Record<string, unknown>) ?? totals;
    pushMoney('Total value', summary.totalValue);
    if (summary.totalQty != null) rows.push({ label: 'Total qty', value: String(summary.totalQty) });
    if (summary.totalWeight != null) rows.push({ label: 'Total weight (g)', value: String(summary.totalWeight) });
  } else if (key === 'profit') {
    pushMoney('Revenue', data.revenue ?? totals.revenue);
    pushMoney('Purchases', data.purchasesTotal ?? totals.purchasesTotal);
    pushMoney('Expenses', data.expenses ?? totals.expenses);
    pushMoney('Profit', data.profit ?? totals.profit);
  } else if (key === 'expenses') {
    pushMoney('Total expenses', data.total ?? totals.total);
  } else if (key === 'cash-flow') {
    pushMoney('Cash in', (data as { cashIn?: string }).cashIn ?? totals.cashIn);
    pushMoney('Cash out', (data as { cashOut?: string }).cashOut ?? totals.cashOut);
    pushMoney('Bank deposits', (data as { bankDeposits?: string }).bankDeposits ?? totals.bankDeposits);
    pushMoney('Bank withdrawals', (data as { bankWithdrawals?: string }).bankWithdrawals ?? totals.bankWithdrawals);
  } else if (key === 'installments') {
    const summary = (data.summary as Record<string, unknown>) ?? totals;
    pushMoney('Due amount', summary.dueAmount ?? summary.totalDue ?? summary.amount);
    if (data.meta && typeof data.meta === 'object' && 'total' in (data.meta as object)) {
      rows.push({ label: 'Schedules', value: String((data.meta as { total: number }).total) });
    }
  } else if (key === 'advance-orders') {
    const byStatus = data.byStatus as Array<{ status?: string; totalAmount?: string; count?: number }> | undefined;
    if (Array.isArray(byStatus)) {
      for (const s of byStatus) {
        rows.push({
          label: s.status ?? 'Status',
          value: `${s.count ?? 0} · ${formatOmrDisplay(s.totalAmount)}`,
        });
      }
    }
  }

  if (rows.length === 0) {
    rows.push({ label: 'Result', value: 'Loaded — see raw JSON below' });
  }
  return rows;
}

export default function ReportsPage() {
  const [from, setFrom] = useState(monthStartIso);
  const [to, setTo] = useState(todayIso);
  const [loadingKey, setLoadingKey] = useState<ReportKey | null>(null);
  const [active, setActive] = useState<{
    key: ReportKey;
    title: string;
    data: Record<string, unknown>;
  } | null>(null);

  const summaryRows = useMemo(
    () => (active ? summarize(active.key, active.data) : []),
    [active],
  );

  const generate = async (report: (typeof REPORTS)[number]) => {
    setLoadingKey(report.key);
    try {
      const params = report.needsRange ? { from, to } : undefined;
      const res = await apiGet<Record<string, unknown>>(`/reports/${report.key}`, { params });
      setActive({ key: report.key, title: report.title, data: (res.data ?? {}) as Record<string, unknown> });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to generate report');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Business summaries for the selected date range" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date range</CardTitle>
          <CardDescription>Used by sales, profit, expenses, cash-flow, installments, and advances</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 max-w-lg">
          <div className="space-y-2">
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.key} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <report.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={loadingKey === report.key}
                onClick={() => void generate(report)}
              >
                {loadingKey === report.key ? 'Generating…' : 'Generate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {active ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{active.title}</CardTitle>
            <CardDescription>Key totals from the report response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summaryRows.map((row) => (
                <div key={row.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-medium tabular-nums">{row.value}</p>
                </div>
              ))}
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs">
              {JSON.stringify(active.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
