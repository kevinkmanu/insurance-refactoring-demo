import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from './apiClient';
import { queryKeys } from './queryClient';

// --- Wire DTOs (preserve backend field names exactly) ---
export interface CustomerWireDto {
  id?: number;
  custNm: string;
  email: string;
  phone_no: string;
  address: string;
  riskScore?: number;
}

// --- Clean domain type ---
export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  riskScore?: number;
}

// --- Wire <-> Domain mappers ---
export function fromWire(w: CustomerWireDto): Customer {
  return {
    id: w.id,
    name: w.custNm,
    email: w.email,
    phone: w.phone_no,
    address: w.address,
    riskScore: w.riskScore,
  };
}

export function toWire(c: Customer): CustomerWireDto {
  return {
    id: c.id,
    custNm: c.name,
    email: c.email,
    phone_no: c.phone,
    address: c.address,
    riskScore: c.riskScore,
  };
}

// --- API functions ---
export function fetchCustomers(signal?: AbortSignal): Promise<CustomerWireDto[]> {
  return apiGet<CustomerWireDto[]>('/api/customers', signal);
}

export function fetchCustomer(id: number, signal?: AbortSignal): Promise<CustomerWireDto> {
  return apiGet<CustomerWireDto>(`/api/customers/${id}`, signal);
}

export function createCustomer(body: CustomerWireDto): Promise<CustomerWireDto> {
  return apiPost<CustomerWireDto, CustomerWireDto>('/api/customers', body);
}

export function updateCustomer(id: number, body: CustomerWireDto): Promise<CustomerWireDto> {
  return apiPut<CustomerWireDto, CustomerWireDto>(`/api/customers/${id}`, body);
}

// --- TanStack Query hooks ---
export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.all(),
    queryFn: ({ signal }) => fetchCustomers(signal).then((list) => list.map(fromWire)),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customers.one(id),
    queryFn: ({ signal }) => fetchCustomer(id, signal).then(fromWire),
    enabled: id > 0,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customer: Customer) => createCustomer(toWire(customer)).then(fromWire),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customer }: { id: number; customer: Customer }) =>
      updateCustomer(id, toWire(customer)).then(fromWire),
    onMutate: async ({ id, customer }) => {
      await qc.cancelQueries({ queryKey: queryKeys.customers.all() });
      await qc.cancelQueries({ queryKey: queryKeys.customers.one(id) });
      const previousList = qc.getQueryData<Customer[]>(queryKeys.customers.all());
      const previousCustomer = qc.getQueryData<Customer>(queryKeys.customers.one(id));
      qc.setQueryData<Customer[]>(queryKeys.customers.all(), (current) =>
        current?.map((item) => item.id === id ? { ...item, ...customer, id } : item),
      );
      qc.setQueryData<Customer>(queryKeys.customers.one(id), { ...customer, id });
      return { previousList, previousCustomer };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        qc.setQueryData(queryKeys.customers.all(), context.previousList);
      }
      if (context?.previousCustomer) {
        qc.setQueryData(queryKeys.customers.one(variables.id), context.previousCustomer);
      }
    },
    onSettled: (_updated, _error, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.customers.one(variables.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}
