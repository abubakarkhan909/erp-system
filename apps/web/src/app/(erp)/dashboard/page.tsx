'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  Gem,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingState } from '@/components/shared/loading-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';

interface DashboardSummary {
  date?: string;
  today?: {
    sales?: string;
    purchases?: string;
    expenses?: string;
  };
  balances?: {
    cash?: string;
    bank?: string;
  };
  pending?: {
    customerPayments?: string;
    supplierPayments?: string;
  };
  upcomingInstallments?: number;
  lowStockCount?: number;
  vatMonthToDate?: {
    outputVat?: string;
    inputVat?: string;
    netVat?: string;
    taxableSales?: string;
    taxablePurchases?: string;
  };
}

interface GoldRateRow {
  karat: string;
  ratePerGram?: string;
}

interface LatestGoldRates {
  rateDate?: string | null;
  rates?: GoldRateRow[];
}

function rateFor(rates: GoldRateRow[] | undefined, karat: string) {
  return rates?.find((r) => r.karat === karat)?.ratePerGram;
}

export default function DashboardPage() {
  const { data: summaryRes, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiGet<DashboardSummary>('/dashboard/summary'),
  });

  const { data: ratesRes } = useQuery({
    queryKey: ['gold-rates-latest'],
    queryFn: async () => {
      try {
        return await apiGet<LatestGoldRates>('/gold-rates/latest');
      } catch {
        return { data: { rateDate: null, rates: [] } as LatestGoldRates };
      }
    },
    retry: false,
  });

  const summary = summaryRes?.data;
  const rates = ratesRes?.data?.rates ?? [];

  if (summaryLoading) {
    return <LoadingState label="Loading dashboard…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of today's shop performance — amounts in OMR (3 decimals)"
        actions={<Badge variant="secondary">Currency: OMR</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatOmrDisplay(summary?.today?.sales)}
          description="Posted invoices today"
          icon={Receipt}
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatOmrDisplay(summary?.pending?.customerPayments)}
          description="Customer balances"
          icon={Users}
        />
        <StatCard
          title="Bank Balance"
          value={formatOmrDisplay(summary?.balances?.bank)}
          description="Active bank accounts"
          icon={Gem}
        />
        <StatCard
          title="Cash on Hand"
          value={formatOmrDisplay(summary?.balances?.cash)}
          description="Open cash session"
          icon={Banknote}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Today &amp; pending
            </CardTitle>
            <CardDescription>Purchases, expenses, and follow-ups</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Today purchases</p>
              <p className="font-medium tabular-nums">{formatOmrDisplay(summary?.today?.purchases)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Today expenses</p>
              <p className="font-medium tabular-nums">{formatOmrDisplay(summary?.today?.expenses)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Supplier payables</p>
              <p className="font-medium tabular-nums">
                {formatOmrDisplay(summary?.pending?.supplierPayments)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Upcoming installments</p>
              <p className="font-medium tabular-nums">{summary?.upcomingInstallments ?? 0}</p>
            </div>
            <div className="rounded-lg border p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Low stock products</p>
              <p className="font-medium tabular-nums">{summary?.lowStockCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">VAT month to date</CardTitle>
            <CardDescription>Output vs input VAT for the current month</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Output VAT</p>
              <p className="font-medium tabular-nums">
                {formatOmrDisplay(summary?.vatMonthToDate?.outputVat)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Input VAT</p>
              <p className="font-medium tabular-nums">
                {formatOmrDisplay(summary?.vatMonthToDate?.inputVat)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Net VAT</p>
              <p className="font-medium tabular-nums">
                {formatOmrDisplay(summary?.vatMonthToDate?.netVat)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Taxable sales</p>
              <p className="font-medium tabular-nums">
                {formatOmrDisplay(summary?.vatMonthToDate?.taxableSales)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(['K24', 'K22', 'K21'] as const).map((karat) => (
          <Card key={karat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {karat} Rate / g
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-brand text-xl tabular-nums">
                {formatOmrDisplay(rateFor(rates, karat))}
              </p>
              {ratesRes?.data?.rateDate ? (
                <p className="mt-1 text-xs text-muted-foreground">As of {ratesRes.data.rateDate}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
