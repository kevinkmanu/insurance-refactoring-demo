import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from './apiClient';
import { queryKeys } from './queryClient';

// --- Wire DTOs ---
export interface PolicyWireDto {
  policy_id?: number;
  customerId: number;
  policyType: string;
  premium: string | number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  underwritingDecision: string | null;
}

// --- Clean domain type ---
export interface Policy {
  id?: number;
  customerId: number;
  policyType: string;
  premium: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  underwritingDecision: string | null;
}

// --- Mappers ---
export function fromWire(w: PolicyWireDto): Policy {
  return {
    id: w.policy_id,
    customerId: w.customerId,
    policyType: w.policyType,
    premium: Number(w.premium),
    status: w.status,
    startDate: w.startDate,
    endDate: w.endDate,
    underwritingDecision: w.underwritingDecision,
  };
}

export function toWire(p: Policy): PolicyWireDto {
  return {
    policy_id: p.id,
    customerId: p.customerId,
    policyType: p.policyType,
    premium: p.premium,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    underwritingDecision: p.underwritingDecision,
  };
}

// --- API functions ---
export function fetchPolicies(signal?: AbortSignal): Promise<PolicyWireDto[]> {
  return apiGet<PolicyWireDto[]>('/api/policies', signal);
}

export function fetchPolicy(id: number, signal?: AbortSignal): Promise<PolicyWireDto> {
  return apiGet<PolicyWireDto>(`/api/policies/${id}`, signal);
}

export function fetchPoliciesByCustomer(customerId: number, signal?: AbortSignal): Promise<PolicyWireDto[]> {
  return apiGet<PolicyWireDto[]>(`/api/policies/customer/${customerId}`, signal);
}

export interface CreatePolicyParams {
  policy: PolicyWireDto;
  age?: number;
  termMonths?: number;
}

export function createPolicy({ policy, age, termMonths }: CreatePolicyParams): Promise<PolicyWireDto> {
  const params = new URLSearchParams();
  if (age !== undefined) params.set('age', String(age));
  if (termMonths !== undefined) params.set('termMonths', String(termMonths));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiPost<PolicyWireDto, PolicyWireDto>(`/api/policies${qs}`, policy);
}

// --- Hooks ---
export function usePolicies() {
  return useQuery({
    queryKey: queryKeys.policies.all(),
    queryFn: ({ signal }) => fetchPolicies(signal).then((list) => list.map(fromWire)),
  });
}

export function usePolicy(id: number) {
  return useQuery({
    queryKey: queryKeys.policies.one(id),
    queryFn: ({ signal }) => fetchPolicy(id, signal).then(fromWire),
    enabled: id > 0,
  });
}

export function usePoliciesByCustomer(customerId: number) {
  return useQuery({
    queryKey: queryKeys.policies.byCustomer(customerId),
    queryFn: ({ signal }) => fetchPoliciesByCustomer(customerId, signal).then((list) => list.map(fromWire)),
    enabled: customerId > 0,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policy, age, termMonths }: { policy: Policy; age?: number; termMonths?: number }) =>
      createPolicy({ policy: toWire(policy), age, termMonths }).then(fromWire),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: queryKeys.policies.all() });
      if (created.customerId) {
        void qc.invalidateQueries({ queryKey: queryKeys.policies.byCustomer(created.customerId) });
      }
    },
  });
}
