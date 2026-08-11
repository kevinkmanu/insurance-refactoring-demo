import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../api/customers';
import { usePolicies } from '../api/policies';
import { useRequestDecision } from '../api/underwriting';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../components/ui/useToast';
import './feature.css';

const TYPES = ['AUTO', 'HOME', 'LIFE', 'TRAVEL'];

export function Underwriting() {
  const { data: customers } = useCustomers();
  const { data: policies, isLoading } = usePolicies();
  const decision = useRequestDecision();
  const { toasts, push, dismiss } = useToast();
  const [customerId, setCustomerId] = useState(0);
  const [policyType, setPolicyType] = useState('AUTO');
  const selectedCustomer = customers?.find((customer) => customer.id === customerId);
  const referrals = useMemo(() => (policies ?? []).filter((policy) => ['REFER', 'PENDING_REVIEW', 'ESCALATED', 'MANUAL_CHECK'].includes((policy.underwritingDecision ?? policy.status).toUpperCase())), [policies]);
  const runDecision = () => { if (!customerId) return; void decision.mutateAsync({ customerId, policyType }).then((result) => push(`Underwriting decision: ${result.decision}`, result.decision === 'DECLINE' ? 'danger' : result.decision === 'REFER' ? 'warning' : 'success')).catch(() => push('Unable to execute underwriting decision.', 'danger')); };
  return <div className="feature-page"><ToastContainer toasts={toasts} onDismiss={dismiss} /><header className="feature-header"><div><h1 className="feature-title">Underwriting</h1><p className="feature-subtitle">Make explicit coverage decisions and manage referral work.</p></div></header><div className="detail-layout"><Card title="Decision workbench"><div className="feature-form"><div className="feature-form__field"><label htmlFor="underwriting-customer">Customer</label><select id="underwriting-customer" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}><option value={0}>Select customer</option>{customers?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · risk {customer.riskScore ?? '—'}</option>)}</select></div><div className="feature-form__field"><label htmlFor="underwriting-type">Policy type</label><select id="underwriting-type" value={policyType} onChange={(e) => setPolicyType(e.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></div><div className="feature-stat"><span className="feature-stat__label">Selected risk score</span><strong className="feature-stat__value">{selectedCustomer?.riskScore ?? '—'}</strong></div><div className="feature-form__actions"><button className="button button--primary" disabled={!customerId || decision.isPending} onClick={runDecision}>{decision.isPending ? 'Evaluating…' : 'Execute decision'}</button></div>{decision.data && <div className="decision-panel" aria-live="polite"><span>{decision.data.policyType} result</span><strong>{decision.data.decision}</strong><p className="feature-muted">Decision recorded by the underwriting service.</p></div>}</div></Card><Card title="Referral queue">{isLoading ? <p className="feature-muted">Loading referrals…</p> : referrals.length ? <DataTable rows={referrals} rowKey={(row) => String(row.id)} columns={[{ key: 'id', header: 'Policy', render: (value) => <Link className="feature-link" to={`/policies/${value}`}>#{value}</Link> }, { key: 'customerId', header: 'Customer', render: (value) => customers?.find((customer) => customer.id === value)?.name ?? `#${value}` }, { key: 'policyType', header: 'Type' }, { key: 'underwritingDecision', header: 'Decision', render: (value, row) => <StatusBadge status={String(value ?? row.status)} /> }]} caption="Policies awaiting underwriting attention" /> : <EmptyState icon="✓" title="Referral queue is clear" description="No policies currently require manual underwriting." />}</Card></div></div>;
}
