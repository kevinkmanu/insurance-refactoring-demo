import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../api/customers';
import { usePolicies } from '../api/policies';
import { useClaims, type Claim } from '../api/claims';
import { useBilling } from '../api/billing';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getErrorMessage } from '../api/apiClient';
import { formatCurrency, isOpenClaim, isOutstanding, normalizedStatus } from './featureUtils';
import './Dashboard.css';
import './feature.css';

function KpiCard({ label, value, icon, detail }: { label: string; value: string; icon: string; detail?: string }) {
  return <article className="kpi-card"><div className="kpi-card__header"><span className="kpi-card__icon" aria-hidden="true">{icon}</span></div><div className="kpi-card__value">{value}</div><div className="kpi-card__label">{label}</div>{detail && <div className="feature-muted">{detail}</div>}</article>;
}

export function Dashboard() {
  const customers = useCustomers();
  const policies = usePolicies();
  const claims = useClaims();
  const billing = useBilling();
  const customerName = (policyId: number) => {
    const policy = policies.data?.find((item) => item.id === policyId);
    return customers.data?.find((customer) => customer.id === policy?.customerId)?.name ?? `Policy #${policyId}`;
  };
  const stats = useMemo(() => {
    const policyRows = policies.data ?? [];
    const claimRows = claims.data ?? [];
    const billingRows = billing.data ?? [];
    return {
      active: policyRows.filter((policy) => !['CANCELLED', 'EXPIRED'].includes(normalizedStatus(policy.status))).length,
      openClaims: claimRows.filter((claim) => isOpenClaim(claim.status)).length,
      referrals: policyRows.filter((policy) => ['REFER', 'PENDING_REVIEW', 'ESCALATED', 'MANUAL_CHECK'].includes(normalizedStatus(policy.underwritingDecision ?? policy.status))).length,
      outstanding: billingRows.filter((record) => isOutstanding(record.paymentStatus)).reduce((sum, record) => sum + record.amount, 0),
    };
  }, [policies.data, claims.data, billing.data]);
  const byStatus = useMemo(() => Object.entries((claims.data ?? []).reduce<Record<string, number>>((acc, claim) => { const status = normalizedStatus(claim.status); acc[status] = (acc[status] ?? 0) + 1; return acc; }, {})), [claims.data]);
  const recentClaims = useMemo(() => [...(claims.data ?? [])].slice(-6).reverse(), [claims.data]);
  const columns: Column<Claim>[] = [
    { key: 'id', header: 'Claim', render: (value) => <Link className="feature-link" to="/claims">#{value}</Link> },
    { key: 'policyId', header: 'Policy', render: (value) => <Link className="feature-link" to={`/policies/${value}`}>#{value}</Link> },
    { key: 'claimAmount', header: 'Amount', render: (value) => formatCurrency(value as number) },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> },
    { key: 'incidentDate', header: 'Incident' },
  ];
  const loading = policies.isLoading || claims.isLoading || billing.isLoading || customers.isLoading;
  const firstError = policies.error ?? claims.error ?? billing.error ?? customers.error;
  return <div className="dashboard feature-page"><div className="dashboard__header"><div><h1 className="dashboard__title">Dashboard</h1><p className="dashboard__subtitle">Live operational view across policies, claims, customers, and premium.</p></div><span className="dashboard__date">{new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())}</span></div>{loading ? <SkeletonRows rows={4} /> : firstError ? <EmptyState icon="⚠️" title="Dashboard data unavailable" description={getErrorMessage(firstError, 'Check the API connection and try again.')} /> : <><section aria-label="Key performance indicators" className="dashboard__kpi-grid"><KpiCard label="Active policies" value={String(stats.active)} icon="📋" /><KpiCard label="Open claims" value={String(stats.openClaims)} icon="🗂" /><KpiCard label="Pending underwriting" value={String(stats.referrals)} icon="🔍" /><KpiCard label="Outstanding premium" value={formatCurrency(stats.outstanding)} icon="💳" /></section><div className="dashboard__grid"><Card title="Claims by status" className="dashboard__claims"><div className="bar-list">{byStatus.length ? byStatus.map(([status, count]) => { const max = Math.max(...byStatus.map(([, value]) => value)); return <div className="bar-row" key={status}><span>{status.replace(/_/g, ' ')}</span><div className="bar"><span style={{ width: `${(count / max) * 100}%` }} /></div><strong>{count}</strong></div>; }) : <EmptyState title="No claims yet" />}</div></Card><Card title="Recent activity" className="dashboard__activity"><ul className="activity-list" role="list">{recentClaims.length ? recentClaims.map((claim) => <li key={claim.id} className="activity-item"><span className="activity-item__icon" aria-hidden="true">🗂</span><div className="activity-item__body"><p className="activity-item__desc">Claim #{claim.id} for {customerName(claim.policyId)} was recorded</p><div className="activity-item__meta"><span className="activity-item__time">{claim.incidentDate ?? 'Recent'}</span><StatusBadge status={claim.status} /></div></div></li>) : <li className="feature-empty">No recent claim activity.</li>}</ul></Card></div><Card title="Recent claims" noPadding>{recentClaims.length ? <DataTable rows={recentClaims} rowKey={(row) => String(row.id)} columns={columns} caption="Recent claims" /> : <EmptyState title="No recent claims" description="Claim activity will appear here as it is recorded." />}</Card></>}</div>;
}
