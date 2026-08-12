export function formatCurrency(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function normalizedStatus(value: string | null | undefined): string {
  return (value ?? 'UNKNOWN').toUpperCase().replace(/[\s-]+/g, '_');
}

export function isOpenClaim(status: string): boolean {
  return !['APPROVED', 'PAID', 'CLOSED', 'REJECTED'].includes(normalizedStatus(status));
}

export function isOutstanding(status: string): boolean {
  return ['PENDING', 'OVERDUE', 'DUE', 'UNPAID'].includes(normalizedStatus(status));
}

export function riskLabel(score: number | undefined): string {
  if (score === undefined) return 'Not scored';
  if (score >= 80) return 'High';
  if (score >= 50) return 'Moderate';
  return 'Low';
}
