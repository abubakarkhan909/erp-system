'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiList, apiPost, ApiError } from '@/lib/api/client';
import { formatOmrDisplay } from '@/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNo?: string | null;
  iban?: string | null;
  currentBalance?: string;
  isActive?: boolean;
}

interface AccountForm {
  name: string;
  bankName: string;
  accountNo: string;
  iban: string;
  openingBalance: string;
}

interface TxnForm {
  amount: string;
  reference: string;
  memo: string;
}

export default function BanksPage() {
  const queryClient = useQueryClient();
  const [accountOpen, setAccountOpen] = useState(false);
  const [depositTarget, setDepositTarget] = useState<BankAccount | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<BankAccount | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => apiList<BankAccount>('/banks', { page: 1, pageSize: 50 }),
  });

  const accountForm = useForm<AccountForm>({
    defaultValues: {
      name: '',
      bankName: '',
      accountNo: '',
      iban: '',
      openingBalance: '0.000',
    },
  });

  const txnForm = useForm<TxnForm>({
    defaultValues: { amount: '0.000', reference: '', memo: '' },
  });

  const createMutation = useMutation({
    mutationFn: (values: AccountForm) =>
      apiPost('/banks', {
        name: values.name,
        bankName: values.bankName,
        accountNo: values.accountNo || null,
        iban: values.iban || null,
        openingBalance: values.openingBalance || '0.000',
        isActive: true,
      }),
    onSuccess: () => {
      toast.success('Bank account created');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setAccountOpen(false);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Create failed'),
  });

  const depositMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TxnForm }) =>
      apiPost(`/banks/${id}/deposit`, {
        amount: values.amount,
        reference: values.reference || null,
        memo: values.memo || null,
      }),
    onSuccess: () => {
      toast.success('Deposit recorded');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setDepositTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Deposit failed'),
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TxnForm }) =>
      apiPost(`/banks/${id}/withdraw`, {
        amount: values.amount,
        reference: values.reference || null,
        memo: values.memo || null,
      }),
    onSuccess: () => {
      toast.success('Withdrawal recorded');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setWithdrawTarget(null);
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Withdraw failed'),
  });

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Account', cell: (row: BankAccount) => <span className="font-medium">{row.name}</span> },
      { key: 'bank', header: 'Bank', cell: (row: BankAccount) => row.bankName },
      { key: 'number', header: 'Account #', cell: (row: BankAccount) => row.accountNo ?? '—' },
      { key: 'iban', header: 'IBAN', cell: (row: BankAccount) => row.iban ?? '—' },
      {
        key: 'balance',
        header: 'Balance (OMR)',
        cell: (row: BankAccount) => <span className="tabular-nums">{formatOmrDisplay(row.currentBalance)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: BankAccount) => (
          <Badge variant={row.isActive === false ? 'secondary' : 'success'}>
            {row.isActive === false ? 'Inactive' : 'Active'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-[180px] text-right',
        cell: (row: BankAccount) => (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                txnForm.reset({ amount: '0.000', reference: '', memo: '' });
                setDepositTarget(row);
              }}
            >
              Deposit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                txnForm.reset({ amount: '0.000', reference: '', memo: '' });
                setWithdrawTarget(row);
              }}
            >
              Withdraw
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
        title="Banks"
        description="Shop bank accounts for transfers, card, and cheque settlements."
        actions={
          <Button
            onClick={() => {
              accountForm.reset({
                name: '',
                bankName: '',
                accountNo: '',
                iban: '',
                openingBalance: '0.000',
              });
              setAccountOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
      />

      <FormDrawer
        open={accountOpen}
        onOpenChange={setAccountOpen}
        title="Add Bank Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setAccountOpen(false)}>Cancel</Button>
            <Button
              disabled={createMutation.isPending}
              onClick={accountForm.handleSubmit((v) => createMutation.mutate(v))}
            >
              {createMutation.isPending ? 'Saving…' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Account Name *</Label>
            <Input {...accountForm.register('name')} />
          </div>
          <div className="space-y-2">
            <Label>Bank Name *</Label>
            <Input {...accountForm.register('bankName')} />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input {...accountForm.register('accountNo')} />
          </div>
          <div className="space-y-2">
            <Label>IBAN</Label>
            <Input {...accountForm.register('iban')} />
          </div>
          <div className="space-y-2">
            <Label>Opening Balance (OMR)</Label>
            <Input {...accountForm.register('openingBalance')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={!!depositTarget}
        onOpenChange={(open) => !open && setDepositTarget(null)}
        title="Deposit"
        description={depositTarget ? depositTarget.name : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setDepositTarget(null)}>Cancel</Button>
            <Button
              disabled={depositMutation.isPending}
              onClick={txnForm.handleSubmit((v) => {
                if (depositTarget) depositMutation.mutate({ id: depositTarget.id, values: v });
              })}
            >
              {depositMutation.isPending ? 'Saving…' : 'Deposit'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Amount (OMR)</Label>
            <Input {...txnForm.register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>Reference</Label>
            <Input {...txnForm.register('reference')} />
          </div>
          <div className="space-y-2">
            <Label>Memo</Label>
            <Input {...txnForm.register('memo')} />
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        open={!!withdrawTarget}
        onOpenChange={(open) => !open && setWithdrawTarget(null)}
        title="Withdraw"
        description={withdrawTarget ? withdrawTarget.name : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setWithdrawTarget(null)}>Cancel</Button>
            <Button
              disabled={withdrawMutation.isPending}
              onClick={txnForm.handleSubmit((v) => {
                if (withdrawTarget) withdrawMutation.mutate({ id: withdrawTarget.id, values: v });
              })}
            >
              {withdrawMutation.isPending ? 'Saving…' : 'Withdraw'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Amount (OMR)</Label>
            <Input {...txnForm.register('amount')} />
          </div>
          <div className="space-y-2">
            <Label>Reference</Label>
            <Input {...txnForm.register('reference')} />
          </div>
          <div className="space-y-2">
            <Label>Memo</Label>
            <Input {...txnForm.register('memo')} />
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
