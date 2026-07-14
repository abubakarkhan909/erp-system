'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Percent } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiGet } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';

interface VatReport {
  label: string;
  from: string;
  to: string;
  output: {
    taxableSales: string;
    outputVat: string;
    netTaxableSales: string;
    netOutputVat: string;
  };
  input: {
    taxablePurchases: string;
    inputVat: string;
    netTaxablePurchases: string;
    netInputVat: string;
  };
  netVat: string;
  locked?: { lockedAt: string } | null;
}

export default function VatPage() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [enabled, setEnabled] = useState(true);

  const queryParams = useMemo(
    () => ({
      year,
      month: month === 'all' ? undefined : month,
    }),
    [year, month],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['vat-report', queryParams],
    enabled,
    queryFn: async () => {
      const res = await apiGet<VatReport>('/vat/report', { params: queryParams });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="VAT"
        description="Oman VAT 5% — output from sales, input from purchases, net payable for the period"
        actions={
          <Button
            onClick={() => {
              setEnabled(true);
              void refetch();
            }}
            disabled={isFetching}
          >
            {isFetching ? 'Loading…' : 'Load report'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Period</CardTitle>
          <CardDescription>Choose year and month (or whole year)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              className="w-28"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full year</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(2000, i, 1).toLocaleString('en', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Output VAT"
              value={`${formatOmrDisplay(data.output.netOutputVat)} OMR`}
              description="Net sales VAT collected"
              icon={Percent}
            />
            <StatCard
              title="Input VAT"
              value={`${formatOmrDisplay(data.input.netInputVat)} OMR`}
              description="Net purchase VAT paid"
            />
            <StatCard
              title="Net Payable"
              value={`${formatOmrDisplay(data.netVat)} OMR`}
              description={data.label}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{data.label}</CardTitle>
              <CardDescription>
                {data.from.slice(0, 10)} → {data.to.slice(0, 10)}
                {data.locked ? ` · Locked ${data.locked.lockedAt.slice(0, 10)}` : ' · Open'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1 rounded-lg border p-3">
                <div className="font-medium">Sales (output)</div>
                <div>Taxable: {formatOmrDisplay(data.output.netTaxableSales)} OMR</div>
                <div>VAT: {formatOmrDisplay(data.output.netOutputVat)} OMR</div>
              </div>
              <div className="space-y-1 rounded-lg border p-3">
                <div className="font-medium">Purchases (input)</div>
                <div>Taxable: {formatOmrDisplay(data.input.netTaxablePurchases)} OMR</div>
                <div>VAT: {formatOmrDisplay(data.input.netInputVat)} OMR</div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Choose a period and click Load report
          </CardContent>
        </Card>
      )}
    </div>
  );
}
