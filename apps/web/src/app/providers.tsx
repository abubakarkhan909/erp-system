'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useUiStore } from '@/stores/ui-store';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </QueryClientProvider>
  );
}
