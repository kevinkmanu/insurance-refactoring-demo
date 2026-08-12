import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from './apiClient';
import { queryKeys } from './queryClient';

// --- Wire DTOs ---
export interface BillingWireDto {
  id?: number;
  policyId: number;
  amount: string | number;
  paymentStatus: string;
  dueDate: string | null;
  paidDate: string | null;
}

// --- Clean domain type ---
export interface BillingRecord {
  id?: number;
  policyId: number;
  amount: number;
  paymentStatus: string;
  dueDate: string | null;
  paidDate: string | null;
}

// --- Mappers ---
export function fromWire(w: BillingWireDto): BillingRecord {
  return {
    id: w.id,
    policyId: w.policyId,
    amount: Number(w.amount),
    paymentStatus: w.paymentStatus,
    dueDate: w.dueDate,
    paidDate: w.paidDate,
  };
}

export function toWire(b: BillingRecord): BillingWireDto {
  return {
    id: b.id,
    policyId: b.policyId,
    amount: b.amount,
    paymentStatus: b.paymentStatus,
    dueDate: b.dueDate,
    paidDate: b.paidDate,
  };
}

// --- API functions ---
export function fetchBilling(signal?: AbortSignal): Promise<BillingWireDto[]> {
  return apiGet<BillingWireDto[]>('/api/billing', signal);
}

export function fetchBillingByPolicy(policyId: number, signal?: AbortSignal): Promise<BillingWireDto[]> {
  return apiGet<BillingWireDto[]>(`/api/billing/policy/${policyId}`, signal);
}

export function processPayment(body: BillingWireDto): Promise<BillingWireDto> {
  return apiPost<BillingWireDto, BillingWireDto>('/api/billing/payment', body);
}

// --- Hooks ---
export function useBilling() {
  return useQuery({
    queryKey: queryKeys.billing.all(),
    queryFn: ({ signal }) => fetchBilling(signal).then((list) => list.map(fromWire)),
  });
}

export function useBillingByPolicy(policyId: number) {
  return useQuery({
    queryKey: queryKeys.billing.byPolicy(policyId),
    queryFn: ({ signal }) => fetchBillingByPolicy(policyId, signal).then((list) => list.map(fromWire)),
    enabled: policyId > 0,
  });
}

export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record: BillingRecord) => processPayment(toWire(record)).then(fromWire),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: queryKeys.billing.all() });
      void qc.invalidateQueries({ queryKey: queryKeys.billing.byPolicy(created.policyId) });
    },
  });
}
