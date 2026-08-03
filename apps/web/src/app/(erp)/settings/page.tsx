'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { companySettingsSchema } from '@jewelry-erp/shared';
import { formResolver, type FormInput } from '@/lib/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiGet, apiPatch, ApiError } from '@/lib/api/client';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<FormInput<typeof companySettingsSchema>>('/company-settings'),
  });

  const form = useForm<FormInput<typeof companySettingsSchema>>({
    resolver: formResolver(companySettingsSchema),
    defaultValues: {
      name: 'Al Zahid Jewelry',
      currency: 'OMR',
      defaultVatRate: '5.000',
      invoicePrefix: 'INV',
    },
  });

  useEffect(() => {
    if (data?.data) {
      form.reset({
        ...data.data,
        currency: 'OMR',
        defaultVatRate: String(data.data.defaultVatRate ?? '5.000'),
        email: data.data.email ?? '',
        phone: data.data.phone ?? '',
        address: data.data.address ?? '',
        crNumber: data.data.crNumber ?? '',
        vatNumber: data.data.vatNumber ?? '',
        receiptFooter: data.data.receiptFooter ?? '',
      });
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (values: FormInput<typeof companySettingsSchema>) =>
      apiPatch('/company-settings', { ...values, currency: 'OMR' }),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Company profile and ERP defaults"
        actions={
          <Button disabled={saveMutation.isPending} onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Profile</CardTitle>
          <CardDescription>Shown on invoices and reports — currency fixed to OMR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input {...form.register('name')} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>CR Number</Label>
              <Input {...form.register('crNumber')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input {...form.register('address')} />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value="OMR" disabled />
            </div>
            <div className="space-y-2">
              <Label>Default VAT Rate (%)</Label>
              <Input {...form.register('defaultVatRate')} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input {...form.register('invoicePrefix')} />
            </div>
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <Input {...form.register('vatNumber')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Receipt Footer</Label>
              <Input {...form.register('receiptFooter')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
