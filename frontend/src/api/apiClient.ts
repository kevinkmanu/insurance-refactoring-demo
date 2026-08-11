export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await parseErrorBody(res);
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(url, { method: 'GET', signal });
}

export function apiPost<TBody, TResponse>(
  url: string,
  body: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  return apiFetch<TResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
}

export function apiPut<TBody, TResponse>(
  url: string,
  body: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  return apiFetch<TResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    signal,
  });
}
