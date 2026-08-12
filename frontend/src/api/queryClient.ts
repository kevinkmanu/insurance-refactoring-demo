import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export const queryKeys = {
  customers: {
    all: () => ['customers'] as const,
    one: (id: number) => ['customers', id] as const,
  },
  policies: {
    all: () => ['policies'] as const,
    one: (id: number) => ['policies', id] as const,
    byCustomer: (customerId: number) => ['policies', 'customer', customerId] as const,
  },
  claims: {
    all: () => ['claims'] as const,
    one: (id: number) => ['claims', id] as const,
    byPolicy: (policyId: number) => ['claims', 'policy', policyId] as const,
  },
  billing: {
    all: () => ['billing'] as const,
    byPolicy: (policyId: number) => ['billing', 'policy', policyId] as const,
  },
  underwriting: {
    decision: (customerId: number, policyType: string) =>
      ['underwriting', 'decision', customerId, policyType] as const,
  },
} as const;
