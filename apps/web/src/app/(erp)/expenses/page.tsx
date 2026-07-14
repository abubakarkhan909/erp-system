'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PaymentMethod } from '@jewelry-erp/shared';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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
import { apiDelete, apiGet, apiList, apiPatch, apiPost, ApiError } from '@/lib/api/client';
import { formatDate, formatOmrDisplay } from '@/lib/utils';

interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
}

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
}

interface Expense {
  id: string;
  number?: string;
  expenseDate: string;
  categoryId?: string;
  category?: ExpenseCategory | string | null;
  notes?: string | null;
  reference?: string | null;
  paymentMethod?: PaymentMethod | string;
  bankAccountId?: string | null;
  amount?: string;
}

interface ExpenseForm {
  expenseDate: string;
  categoryId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  bankAccountId: string;
  notes: string;
  reference: string;
}

const PAYMENT_METHODS = [
  PaymentMethod.CASH,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.CARD,
  PaymentMethod.CHEQUE,
] as const;

function categoryLabel(category: Expense['category']) {
  if (!category) return '—';
  if (typeof category === 'string') return category;
  return category.name || category.code || '—';
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: () => apiList<Expense>('/expenses', { search, page: 1, pageSize: 50 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await apiGet<ExpenseCategory[]>('/expenses/categories');
      return res.data ?? [];
    },
  });

  const { data: banks } = useQuery({
    queryKey: ['banks-select'],
    queryFn: async () => {
      const res = await apiList<BankAccount>('/banks', { page: 1, pageSize: 100 });
      return res.data;
    },
  });

  const form = useForm<ExpenseForm>({
    defaultValues: {
      expenseDate: todayIso(),
      categoryId: '',
      amount: '0.000',
      paymentMethod: PaymentMethod.CASH,
      bankAccountId: '',
      notes: '',
      reference: '',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const openCreate = () => {
    setEditing(null);
    form.reset({
      expenseDate: todayIso(),
      categoryId: categories?.[0]?.id ?? '',
      amount: '0.000',
      paymentMethod: PaymentMethod.CASH,
      bankAccountId: '',
      notes: '',
      reference: '',
    });
    setDrawerOpen(true);
  };

  const openEdit = async (expense: Expense) => {
    setEditing(expense);
    try {
      const res = await apiGet<Expense>(`/expenses/${expense.id}`);
      const e = res.data;
      form.reset({
        expenseDate: (e.expenseDate || '').slice(0, 10) || todayIso(),
        categoryId: e.categoryId || (typeof e.category === 'object' && e.category ? e.category.id : '') || '',
        amount: e.amount || '0.000',
        paymentMethod: (e.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
        bankAccountId: e.bankAccountId || '',
        notes: e.notes || '',
        reference: e.reference || '',
      });
      setDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load expense');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ExpenseForm) => {
      const payload = {
        expenseDate: values.expenseDate,
        categoryId: values.categoryId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        bankAccountId:
          values.paymentMethod === PaymentMethod.CASH ? null : values.bankAccountId || null,
        notes: values.notes || null,
        reference: values.reference || null,
      };
      if (editing) return apiPatch(`/expenses/${editing.id}`, payload);
      return apiPost('/expenses', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Expense updated' : 'Expense created');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDrawerOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success('Expense deleted');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Delete failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'number', header: 'No.', cell: (row: Expense) => row.number || '—' },
      { key: 'date', header: 'Date', cell: (row: Expense) => formatDate(row.expenseDate) },
      { key: 'category', header: 'Category', cell: (row: Expense) => categoryLabel(row.category) },
      { key: 'desc', header: 'Notes', cell: (row: Expense) => row.notes || row.reference || '—' },
      { key: 'method', header: 'Method', cell: (row: Expense) => row.paymentMethod || '—' },
      {
        key: 'amount',
        header: 'Amount (OMR)',
        cell: (row: Expense) => <span className="tabular-nums">{formatOmrDisplay(row.amount)}</span>,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[100px] text-right',
        cell: (row: Expense) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => void openEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Shop operating expenses — amounts in OMR"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? 'Edit Expense' : 'New Expense'}
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={form.handleSubmit((v) => {
                if (!v.categoryId) {
                  toast.error('Category is required');
                  return;
                }
                saveMutation.mutate(v);
              })}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...form.register('expenseDate')} />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.watch('categoryId') || undefined}
              onValueChange={(v) => form.setValue('categoryId', v)}
            >
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (OMR) *</Label>
            <Input {...form.register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => form.setValue('paymentMethod', v as PaymentMethod)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paymentMethod !== PaymentMethod.CASH ? (
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={form.watch('bankAccountId') || undefined}
                onValueChange={(v) => form.setValue('bankAccountId', v)}
              >
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {(banks ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.bankName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Reference</Label>
            <Input {...form.register('reference')} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input {...form.register('notes')} />
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete expense?"
        description={`Remove expense ${deleteTarget?.number || deleteTarget?.id}?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
