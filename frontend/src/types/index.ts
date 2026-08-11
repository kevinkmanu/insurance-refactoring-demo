export type Status = 'active' | 'pending' | 'cancelled' | 'expired' | 'approved' | 'rejected' | 'open' | 'closed' | 'paid' | 'overdue';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface KpiCardData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  time: string;
  status: Status;
  type: 'policy' | 'claim' | 'customer' | 'billing';
}
