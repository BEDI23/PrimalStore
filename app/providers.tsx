"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failCount, error: unknown) => {
              const status = (
                error as { response?: { status?: number } } | undefined
              )?.response?.status;
              if (status === 401 || status === 403) return false;
              return failCount < 2;
            },
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <QueryClientProvider client={qc}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
