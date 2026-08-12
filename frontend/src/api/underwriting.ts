import { useQuery, useMutation } from '@tanstack/react-query';
import { apiPost } from './apiClient';
import { queryKeys } from './queryClient';

// --- Wire DTO (backend returns a plain map) ---
export interface UnderwritingDecisionWireDto {
  customerId: number;
  policyType: string;
  decision: string;
}

// --- Clean domain type ---
export interface UnderwritingDecision {
  customerId: number;
  policyType: string;
  decision: string;
}

// --- Mapper (field names match; provided for symmetry and future safety) ---
export function fromWire(w: UnderwritingDecisionWireDto): UnderwritingDecision {
  return {
    customerId: w.customerId,
    policyType: w.policyType,
    decision: w.decision,
  };
}

// --- API function ---
export function requestDecision(customerId: number, policyType: string): Promise<UnderwritingDecisionWireDto> {
  return apiPost<Record<string, never>, UnderwritingDecisionWireDto>(
    `/api/underwriting/decision?${new URLSearchParams({ customerId: String(customerId), policyType }).toString()}`,
    {},
  );
}

// --- Hooks ---
export function useUnderwritingDecision(customerId: number, policyType: string) {
  return useQuery({
    queryKey: queryKeys.underwriting.decision(customerId, policyType),
    queryFn: () => requestDecision(customerId, policyType).then(fromWire),
    enabled: false, // only trigger on demand via refetch
  });
}

export function useRequestDecision() {
  return useMutation({
    mutationFn: ({ customerId, policyType }: { customerId: number; policyType: string }) =>
      requestDecision(customerId, policyType).then(fromWire),
  });
}
