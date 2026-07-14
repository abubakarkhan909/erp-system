'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingState } from '@/components/shared/loading-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';

interface AccountRow {
  id: string;
  code: string;
  name: string;
  type: string;
  isCashBook?: boolean;
  isBankBook?: boolean;
}

interface TrialBalanceRow {
  code?: string;
  name?: string;
  debit?: string;
  credit?: string;
}

interface NamedAmount {
  name?: string;
  code?: string;
  amount?: string;
  balance?: string;
}

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AccountingPage() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const res = await apiGet<AccountRow[]>('/accounting/chart-of-accounts');
      return res.data ?? [];
    },
  });

  const { data: trialBalance, isLoading: loadingTb, refetch: refetchTb } = useQuery({
    queryKey: ['trial-balance', from, to],
    queryFn: async () => {
      const res = await apiGet<TrialBalanceRow[] | { rows?: TrialBalanceRow[]; data?: TrialBalanceRow[] }>(
        '/accounting/reports/trial-balance',
        { params: { from, to } },
      );
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === 'object') {
        const obj = payload as { rows?: TrialBalanceRow[]; data?: TrialBalanceRow[] };
        return obj.rows ?? obj.data ?? [];
      }
      return [];
    },
  });

  const { data: pnl, refetch: refetchPnl } = useQuery({
    queryKey: ['pnl', from, to],
    queryFn: async () => {
      const res = await apiGet<Record<string, unknown>>('/accounting/reports/profit-and-loss', {
        params: { from, to },
      });
      return res.data;
    },
  });

  const { data: balanceSheet, refetch: refetchBs } = useQuery({
    queryKey: ['balance-sheet', to],
    queryFn: async () => {
      const res = await apiGet<Record<string, unknown>>('/accounting/reports/balance-sheet', {
        params: { asOf: to },
      });
      return res.data;
    },
  });

  const accountColumns = useMemo(
    () => [
      { key: 'code', header: 'Code', cell: (row: AccountRow) => <code className="text-xs">{row.code}</code> },
      { key: 'name', header: 'Name', cell: (row: AccountRow) => row.name },
      {
        key: 'type',
        header: 'Type',
        cell: (row: AccountRow) => <Badge variant="secondary">{row.type}</Badge>,
      },
      {
        key: 'flags',
        header: 'Flags',
        cell: (row: AccountRow) =>
          [row.isCashBook ? 'Cash' : null, row.isBankBook ? 'Bank' : null].filter(Boolean).join(', ') ||
          '—',
      },
    ],
    [],
  );

  const tbColumns = useMemo(
    () => [
      { key: 'code', header: 'Code', cell: (row: TrialBalanceRow) => row.code ?? '—' },
      { key: 'name', header: 'Account', cell: (row: TrialBalanceRow) => row.name ?? '—' },
      {
        key: 'debit',
        header: 'Debit',
        cell: (row: TrialBalanceRow) => formatOmrDisplay(row.debit),
      },
      {
        key: 'credit',
        header: 'Credit',
        cell: (row: TrialBalanceRow) => formatOmrDisplay(row.credit),
      },
    ],
    [],
  );

  function renderNamedList(title: string, rows: unknown) {
    const list = Array.isArray(rows) ? (rows as NamedAmount[]) : [];
    if (!list.length) {
      return <p className="text-sm text-muted-foreground">No {title.toLowerCase()} lines</p>;
    }
    return (
      <ul className="space-y-1 text-sm">
        {list.map((r, i) => (
          <li key={i} className="flex justify-between gap-4 border-b border-dashed py-1">
            <span>{r.name || r.code || '—'}</span>
            <span className="tabular-nums">{formatOmrDisplay(r.amount ?? r.balance)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting"
        description="Chart of accounts and financial reports posted from sales, purchases, cash, and expenses"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report period</CardTitle>
          <CardDescription>Used for Trial Balance and Profit & Loss</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>To / As of</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void refetchTb();
              void refetchPnl();
              void refetchBs();
            }}
          >
            Refresh reports
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          {loadingAccounts ? (
            <LoadingState />
          ) : (
            <DataTable
              columns={accountColumns}
              data={accounts ?? []}
              getRowKey={(r) => r.id}
              emptyTitle="No accounts"
              emptyDescription="Run database seed to create the chart of accounts."
            />
          )}
        </TabsContent>

        <TabsContent value="trial">
          {loadingTb ? (
            <LoadingState />
          ) : (
            <DataTable
              columns={tbColumns}
              data={trialBalance ?? []}
              getRowKey={(r) => `${r.code ?? 'x'}-${r.name ?? ''}-${r.debit ?? ''}-${r.credit ?? ''}`}
              emptyTitle="No trial balance rows"
              emptyDescription="Post sales/purchases/expenses to generate journal activity."
            />
          )}
        </TabsContent>

        <TabsContent value="pnl">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-medium tabular-nums">
                {formatOmrDisplay(
                  typeof pnl?.revenue === 'string' || typeof pnl?.revenue === 'number'
                    ? String(pnl.revenue)
                    : undefined,
                )}{' '}
                OMR
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expenses</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-medium tabular-nums">
                {formatOmrDisplay(
                  typeof pnl?.expenses === 'string' || typeof pnl?.expenses === 'number'
                    ? String(pnl.expenses)
                    : undefined,
                )}{' '}
                OMR
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Net profit</CardTitle>
                <CardDescription>Profit &amp; Loss for selected period</CardDescription>
              </CardHeader>
              <CardContent className="text-lg font-medium tabular-nums">
                {formatOmrDisplay(
                  (pnl?.netProfit as string | undefined) ?? (pnl?.net as string | undefined),
                )}{' '}
                OMR
              </CardContent>
            </Card>
            {Array.isArray(pnl?.rows) && (pnl.rows as NamedAmount[]).length > 0 ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Account lines</CardTitle>
                </CardHeader>
                <CardContent>{renderNamedList('P&L lines', pnl.rows)}</CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="bs">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assets</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-medium tabular-nums">
                {formatOmrDisplay(typeof balanceSheet?.assets === 'string' ? balanceSheet.assets : undefined)}{' '}
                OMR
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liabilities</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-medium tabular-nums">
                {formatOmrDisplay(
                  typeof balanceSheet?.liabilities === 'string' ? balanceSheet.liabilities : undefined,
                )}{' '}
                OMR
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equity</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-medium tabular-nums">
                {formatOmrDisplay(typeof balanceSheet?.equity === 'string' ? balanceSheet.equity : undefined)}{' '}
                OMR
              </CardContent>
            </Card>
            {Array.isArray(balanceSheet?.rows) ? (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">Account lines</CardTitle>
                </CardHeader>
                <CardContent>{renderNamedList('Balance sheet', balanceSheet.rows)}</CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
