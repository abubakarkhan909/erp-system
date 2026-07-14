'use client';

import { AuthGuard } from '@/components/shared/auth-guard';
import { AppShell } from '@/components/shared/app-shell';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
