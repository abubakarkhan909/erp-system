'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingState } from '@/components/shared/loading-state';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!isAuthenticated && !accessToken) {
      router.replace('/login');
    }
  }, [isAuthenticated, accessToken, router]);

  if (!isAuthenticated && !accessToken) {
    return <LoadingState label="Checking session…" className="min-h-screen" />;
  }

  return <>{children}</>;
}
