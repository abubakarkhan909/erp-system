'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { GoldKarat, goldRateSchema } from '@jewelry-erp/shared';
import { formResolver, type FormInput } from '@/lib/form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

type GoldRateInput = FormInput<typeof goldRateSchema>;

interface GoldRate {
  id: string;
  rateDate: string;
  karat: GoldKarat;
  ratePerGram: string;
}

export default function GoldRatesPage() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['gold-rates'],
    queryFn: () => apiList<GoldRate>('/gold-rates', { page: 1, pageSize: 50 }),
  });

  const form = useForm<GoldRateInput>({
    resolver: formResolver(goldRateSchema),
    defaultValues: {
      rateDate: new Date().toISOString().slice(0, 10),
      karat: GoldKarat.K24,
      ratePerGram: '0.000',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: GoldRateInput) => apiPost('/gold-rates', values),
    onSuccess: () => {
      toast.success('Gold rate saved');
      queryClient.invalidateQueries({ queryKey: ['gold-rates'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'date', header: 'Date', cell: (row: GoldRate) => formatDate(row.rateDate) },
      { key: 'karat', header: 'Karat', cell: (row: GoldRate) => row.karat },
      {
        key: 'rate',
        header: 'Rate / gram (OMR)',
        cell: (row: GoldRate) => <span className="font-medium tabular-nums">{formatOmrDisplay(row.ratePerGram)}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gold Rates"
        description="Daily karat rates per gram in OMR"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Rate
          </Button>
        }
      />

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} getRowKey={(row) => row.id} />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New Gold Rate"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button disabled={saveMutation.isPending} onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>
              {saveMutation.isPending ? 'Saving…' : 'Save Rate'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Rate Date</Label>
            <Input type="date" {...form.register('rateDate')} />
          </div>
          <div className="space-y-2">
            <Label>Karat</Label>
            <Select value={form.watch('karat')} onValueChange={(v) => form.setValue('karat', v as GoldKarat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(GoldKarat).map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rate per Gram (OMR)</Label>
            <Input {...form.register('ratePerGram')} placeholder="0.000" />
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
