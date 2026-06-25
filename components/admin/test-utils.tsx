import { render, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Enveloppe un composant dans un QueryClientProvider neuf (retry désactivé)
 * pour isoler chaque test TanStack Query.
 */
export function renderWithClient(ui: React.ReactElement): RenderResult {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}
