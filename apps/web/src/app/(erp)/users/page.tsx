'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, KeyRound, Plus, Search, Shield, ShieldQuestion, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FormDrawer } from '@/components/shared/form-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, apiList, apiPost, apiPut, ApiError } from '@/lib/api/client';

interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
  password?: string | null;
  isActive: boolean;
  roles: Array<{ id: string; code: string; name: string }>;
  securityQuestions: Array<{ id: string; question: string }>;
}

interface RoleInfo {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  userCount: number;
  permissions: Array<{ code: string; name: string }>;
}

const SUGGESTED_QUESTIONS = [
  'What is your favorite color?',
  'What is your favorite food?',
  'What city were you born in?',
  'What is your favorite jewelry item?',
  'What is your pet’s name?',
  'What is your favorite movie?',
];

const emptyCreate = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  roleIds: [] as string[],
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [questionsUser, setQuestionsUser] = useState<StaffUser | null>(null);
  const [resetUser, setResetUser] = useState<StaffUser | null>(null);
  const [rolesUser, setRolesUser] = useState<StaffUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [qForms, setQForms] = useState([
    { question: SUGGESTED_QUESTIONS[0], answer: '' },
    { question: SUGGESTED_QUESTIONS[1], answer: '' },
    { question: SUGGESTED_QUESTIONS[2], answer: '' },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => apiList<StaffUser>('/users', { search, page: 1, pageSize: 50 }),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiGet<RoleInfo[]>('/users/roles');
      return res.data ?? [];
    },
  });

  const { data: recoveryStatus } = useQuery({
    queryKey: ['recovery-key-status'],
    queryFn: async () => {
      const res = await apiGet<{ configured: boolean }>('/users/recovery-key/status');
      return res.data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      apiPost('/auth/reset-password', { userId: resetUser!.id, newPassword }),
    onSuccess: () => {
      toast.success('Password updated (also saved in owner vault)');
      setResetUser(null);
      setNewPassword('');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const questionsMutation = useMutation({
    mutationFn: () =>
      apiPut(`/users/${questionsUser!.id}/security-questions`, {
        questions: qForms.filter((q) => q.question.trim() && q.answer.trim()),
      }),
    onSuccess: () => {
      toast.success('Security questions saved');
      setQuestionsUser(null);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const recoveryMutation = useMutation({
    mutationFn: () => apiPut('/users/recovery-key', { recoveryKey }),
    onSuccess: () => {
      toast.success('Owner recovery key saved (keep it secret)');
      setRecoveryKey('');
      qc.invalidateQueries({ queryKey: ['recovery-key-status'] });
    },
    onError: (e: Error) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiPost('/users', {
        username: createForm.username.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim() || undefined,
        password: createForm.password,
        roleIds: createForm.roleIds,
      }),
    onSuccess: () => {
      toast.success('User created');
      setCreateOpen(false);
      setCreateForm(emptyCreate);
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (e: Error) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const rolesMutation = useMutation({
    mutationFn: () => apiPut(`/users/${rolesUser!.id}/roles`, { roleIds: selectedRoleIds }),
    onSuccess: () => {
      toast.success('Roles updated');
      setRolesUser(null);
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (e: Error) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  function toggleRole(roleId: string, current: string[], set: (ids: string[]) => void) {
    set(current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId]);
  }

  const columns = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        cell: (row: StaffUser) => (
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-xs text-muted-foreground">{row.username}</div>
          </div>
        ),
      },
      {
        key: 'password',
        header: 'Password (Owner vault)',
        cell: (row: StaffUser) =>
          showPasswords ? (
            <code className="text-xs">{row.password || '— not set —'}</code>
          ) : (
            <span className="text-muted-foreground">••••••••</span>
          ),
      },
      {
        key: 'roles',
        header: 'Roles',
        cell: (row: StaffUser) =>
          row.roles?.length ? (
            <div className="flex flex-wrap gap-1">
              {row.roles.map((r) => (
                <Badge key={r.id || r.code} variant="secondary">
                  {r.code}
                </Badge>
              ))}
            </div>
          ) : (
            '—'
          ),
      },
      {
        key: 'questions',
        header: 'Favorites Qs',
        cell: (row: StaffUser) => (
          <Badge variant="secondary">{row.securityQuestions?.length ?? 0}</Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row: StaffUser) => (
          <Badge variant={row.isActive ? 'success' : 'secondary'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (row: StaffUser) => (
          <div className="flex flex-wrap justify-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRolesUser(row);
                setSelectedRoleIds(row.roles?.map((r) => r.id).filter(Boolean) ?? []);
              }}
            >
              <UserCog className="h-4 w-4" />
              Roles
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQuestionsUser(row);
                setQForms([
                  {
                    question: row.securityQuestions[0]?.question || SUGGESTED_QUESTIONS[0]!,
                    answer: '',
                  },
                  {
                    question: row.securityQuestions[1]?.question || SUGGESTED_QUESTIONS[1]!,
                    answer: '',
                  },
                  {
                    question: row.securityQuestions[2]?.question || SUGGESTED_QUESTIONS[2]!,
                    answer: '',
                  },
                ]);
              }}
            >
              <ShieldQuestion className="h-4 w-4" />
              Favorites
            </Button>
            <Button size="sm" onClick={() => setResetUser(row)}>
              Reset password
            </Button>
          </div>
        ),
      },
    ],
    [showPasswords],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Logins"
        description="Create staff, assign roles (permissions come from the role), and manage the owner password vault"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowPasswords((v) => !v)}>
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </Button>
            <Button
              onClick={() => {
                setCreateForm(emptyCreate);
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New user
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Roles & permissions
          </CardTitle>
          <CardDescription>
            Permissions are not set per user — assign a <strong>role</strong>, and that role’s
            permissions apply. Only the Owner role can manage users and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{role.name}</div>
                <Badge variant="secondary">{role.code}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {role.userCount} user{role.userCount === 1 ? '' : 's'} ·{' '}
                {role.code === 'OWNER' ? 'All permissions' : `${role.permissions.length} permissions`}
              </p>
              <ul className="mt-2 max-h-28 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
                {role.code === 'OWNER' ? (
                  <li>Full access to every module</li>
                ) : (
                  role.permissions.slice(0, 8).map((p) => <li key={p.code}>• {p.name}</li>)
                )}
                {role.code !== 'OWNER' && role.permissions.length > 8 ? (
                  <li>…and {role.permissions.length - 8} more</li>
                ) : null}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Hidden owner recovery key
          </CardTitle>
          <CardDescription>
            Status:{' '}
            {recoveryStatus?.configured ? (
              <span className="text-emerald-600">Configured</span>
            ) : (
              <span className="text-amber-600">Not set yet</span>
            )}
            . Used on Forgot Password → Recovery key tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="password"
            placeholder="Set or replace recovery key (min 8 chars)"
            value={recoveryKey}
            onChange={(e) => setRecoveryKey(e.target.value)}
          />
          <Button
            onClick={() => recoveryMutation.mutate()}
            disabled={recoveryMutation.isPending || recoveryKey.length < 8}
          >
            Save recovery key
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        emptyTitle="No users found"
        emptyDescription="Create a user or run the demo seed to add manager, cashier, salesman, and accountant."
        searchSlot={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
        footer={
          data?.meta?.total != null
            ? `Showing ${data.data.length} of ${data.meta.total} users`
            : null
        }
      />

      <FormDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New user"
        description="Create a login and assign one or more roles."
      >
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              placeholder="e.g. fatima"
            />
          </div>
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="text"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="space-y-2 rounded-lg border p-3">
              {roles.map((role) => (
                <label key={role.id} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={createForm.roleIds.includes(role.id)}
                    onChange={() =>
                      toggleRole(role.id, createForm.roleIds, (roleIds) =>
                        setCreateForm({ ...createForm, roleIds }),
                      )
                    }
                  />
                  <span>
                    <span className="font-medium">{role.name}</span>
                    <span className="text-muted-foreground"> ({role.code})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={
              createMutation.isPending ||
              createForm.username.trim().length < 2 ||
              createForm.fullName.trim().length < 2 ||
              createForm.password.length < 8
            }
            onClick={() => createMutation.mutate()}
          >
            Create user
          </Button>
        </div>
      </FormDrawer>

      <FormDrawer
        open={Boolean(rolesUser)}
        onOpenChange={(open) => !open && setRolesUser(null)}
        title={`Roles — ${rolesUser?.username ?? ''}`}
        description="Pick which roles this login has. Permissions follow the role."
      >
        <div className="space-y-4 p-1">
          <div className="space-y-2 rounded-lg border p-3">
            {roles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id, selectedRoleIds, setSelectedRoleIds)}
                />
                <span>
                  <span className="font-medium">{role.name}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-xs text-muted-foreground">
                    {role.code === 'OWNER'
                      ? 'All permissions'
                      : role.permissions.map((p) => p.name).slice(0, 4).join(', ') +
                        (role.permissions.length > 4 ? '…' : '')}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={rolesMutation.isPending || selectedRoleIds.length === 0}
            onClick={() => rolesMutation.mutate()}
          >
            Save roles
          </Button>
        </div>
      </FormDrawer>

      <FormDrawer
        open={Boolean(resetUser)}
        onOpenChange={(open) => !open && setResetUser(null)}
        title={`Reset password — ${resetUser?.username ?? ''}`}
        description="New password is saved to the owner vault so you can view it later."
      >
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>New password</Label>
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
          </div>
          <Button
            className="w-full"
            disabled={newPassword.length < 8 || resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            Save new password
          </Button>
        </div>
      </FormDrawer>

      <FormDrawer
        open={Boolean(questionsUser)}
        onOpenChange={(open) => !open && setQuestionsUser(null)}
        title={`Favorite things — ${questionsUser?.username ?? ''}`}
        description="Used on Forgot Password to prove identity. Answers are stored hashed."
      >
        <div className="space-y-4 p-1">
          {qForms.map((row, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border p-3">
              <Label>Question {idx + 1}</Label>
              <Input
                value={row.question}
                onChange={(e) => {
                  const next = [...qForms];
                  next[idx] = { ...row, question: e.target.value };
                  setQForms(next);
                }}
                list="suggested-questions"
              />
              <Label>Answer</Label>
              <Input
                value={row.answer}
                onChange={(e) => {
                  const next = [...qForms];
                  next[idx] = { ...row, answer: e.target.value };
                  setQForms(next);
                }}
                placeholder="Private answer"
              />
            </div>
          ))}
          <datalist id="suggested-questions">
            {SUGGESTED_QUESTIONS.map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>
          <Button
            className="w-full"
            disabled={questionsMutation.isPending}
            onClick={() => questionsMutation.mutate()}
          >
            Save security questions
          </Button>
        </div>
      </FormDrawer>
    </div>
  );
}
