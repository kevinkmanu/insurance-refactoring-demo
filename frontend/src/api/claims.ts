import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from './apiClient';
import { queryKeys } from './queryClient';

// --- Wire DTOs ---
export interface ClaimWireDto {
  id?: number;
  policyId: number;
  claimAmount: string | number;
  claimReason: string | null;
  status: string;
  incidentDate: string | null;
}

// --- Clean domain type ---
export interface Claim {
  id?: number;
  policyId: number;
  claimAmount: number;
  claimReason: string | null;
  status: string;
  incidentDate: string | null;
}

// --- Mappers ---
export function fromWire(w: ClaimWireDto): Claim {
  return {
    id: w.id,
    policyId: w.policyId,
    claimAmount: Number(w.claimAmount),
    claimReason: w.claimReason,
    status: w.status,
    incidentDate: w.incidentDate,
  };
}

export function toWire(c: Claim): ClaimWireDto {
  return {
    id: c.id,
    policyId: c.policyId,
    claimAmount: c.claimAmount,
    claimReason: c.claimReason,
    status: c.status,
    incidentDate: c.incidentDate,
  };
}

// --- API functions ---
export function fetchClaims(signal?: AbortSignal): Promise<ClaimWireDto[]> {
  return apiGet<ClaimWireDto[]>('/api/claims', signal);
}

export function fetchClaimsByPolicy(policyId: number, signal?: AbortSignal): Promise<ClaimWireDto[]> {
  return apiGet<ClaimWireDto[]>(`/api/claims/policy/${policyId}`, signal);
}

export interface SubmitClaimParams {
  claim: ClaimWireDto;
  adjuster?: string;
  docs?: number;
}

export function submitClaim({ claim, adjuster, docs }: SubmitClaimParams): Promise<ClaimWireDto> {
  const params = new URLSearchParams();
  if (adjuster) params.set('adjuster', adjuster);
  if (docs !== undefined) params.set('docs', String(docs));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiPost<ClaimWireDto, ClaimWireDto>(`/api/claims${qs}`, claim);
}

export function approveClaim(id: number, force = false): Promise<ClaimWireDto> {
  return apiPost<Record<string, never>, ClaimWireDto>(`/api/claims/${id}/approve?force=${force}`, {});
}

// --- Hooks ---
export function useClaims() {
  return useQuery({
    queryKey: queryKeys.claims.all(),
    queryFn: ({ signal }) => fetchClaims(signal).then((list) => list.map(fromWire)),
  });
}

export function useClaimsByPolicy(policyId: number) {
  return useQuery({
    queryKey: queryKeys.claims.byPolicy(policyId),
    queryFn: ({ signal }) => fetchClaimsByPolicy(policyId, signal).then((list) => list.map(fromWire)),
    enabled: policyId > 0,
  });
}

export function useSubmitClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claim, adjuster, docs }: { claim: Claim; adjuster?: string; docs?: number }) =>
      submitClaim({ claim: toWire(claim), adjuster, docs }).then(fromWire),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: queryKeys.claims.all() });
      void qc.invalidateQueries({ queryKey: queryKeys.claims.byPolicy(created.policyId) });
    },
  });
}

export function useApproveClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) => approveClaim(id, force).then(fromWire),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: queryKeys.claims.all() });
      void qc.invalidateQueries({ queryKey: queryKeys.claims.byPolicy(updated.policyId) });
    },
  });
}
