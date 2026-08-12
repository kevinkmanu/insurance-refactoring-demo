import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../api/customers';
import { usePolicies } from '../api/policies';
import { useRequestDecision } from '../api/underwriting';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/useToast';
import { getErrorMessage } from '../api/apiClient';
import './feature.css';

const TYPES = ['AUTO', 'HOME', 'LIFE', 'TRAVEL'];

export function Underwriting() {
  const { data: customers, isLoading: customersLoading, isError: customersError } = useCustomers();
  const { data: policies, isLoading, isError: policiesError } = usePolicies();
  const decision = useRequestDecision();
  const { push } = useToast();
  const [customerId, setCustomerId] = useState(0);
  const [policyType, setPolicyType] = useState('AUTO');
  const selectedCustomer = customers?.find((customer) => customer.id === customerId);
  const referrals = useMemo(() => (policies ?? []).filter((policy) => ['REFER', 'PENDING_REVIEW', 'ESCALATED', 'MANUAL_CHECK'].includes((policy.underwritingDecision ?? policy.status).toUpperCase())), [policies]);
  const runDecision = () => { if (!customerId) return; void decision.mutateAsync({ customerId, policyType }).then((result) => push(`Underwriting decision: ${result.decision}`, result.decision === 'DECLINE' ? 'danger' : result.decision === 'REFER' ? 'warning' : 'success')).catch((error: unknown) => push(getErrorMessage(error, 'Unable to execute underwriting decision.'), 'danger')); };
  return <div className="feature-page"><header className="feature-header"><div><h1 className="feature-title">Underwriting</h1><p className="feature-subtitle">Make explicit coverage decisions and manage referral work.</p></div></header><div className="detail-layout"><Card title="Decision workbench"><div className="feature-form">{customersLoading ? <SkeletonRows rows={3} /> : customersError ? <div className="form-error" role="alert">Customer data is unavailable. Try again before executing a decision.</div> : <><div className="feature-form__field"><label htmlFor="underwriting-customer">Customer</label><select id="underwriting-customer" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}><option value={0}>Select customer</option>{customers?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · risk {customer.riskScore ?? '—'}</option>)}</select></div><div className="feature-form__field"><label htmlFor="underwriting-type">Policy type</label><select id="underwriting-type" value={policyType} onChange={(e) => setPolicyType(e.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></div><div className="feature-stat"><span className="feature-stat__label">Selected risk score</span><strong className="feature-stat__value">{selectedCustomer?.riskScore ?? '—'}</strong></div><div className="feature-form__actions"><button className="button button--primary" disabled={!customerId || decision.isPending} onClick={runDecision}>{decision.isPending ? 'Evaluating…' : 'Execute decision'}</button></div>{decision.error && <div className="form-error" role="alert">{getErrorMessage(decision.error)}</div>}{decision.data && <div className="decision-panel" aria-live="polite"><span>{decision.data.policyType} result</span><strong>{decision.data.decision}</strong><p className="feature-muted">Decision recorded by the underwriting service.</p></div>}</>}</div></Card><Card title="Referral queue">{isLoading ? <SkeletonRows rows={5} /> : policiesError ? <EmptyState icon="⚠️" title="Referral queue unavailable" description="The underwriting worklist could not be loaded." /> : referrals.length ? <DataTable rows={referrals} rowKey={(row) => String(row.id)} columns={[{ key: 'id', header: 'Policy', render: (value) => <Link className="feature-link" to={`/policies/${value}`}>#{value}</Link> }, { key: 'customerId', header: 'Customer', render: (value) => customers?.find((customer) => customer.id === value)?.name ?? `#${value}` }, { key: 'policyType', header: 'Type' }, { key: 'underwritingDecision', header: 'Decision', render: (value, row) => <StatusBadge status={String(value ?? row.status)} /> }]} caption="Policies awaiting underwriting attention" /> : <EmptyState icon="✓" title="Referral queue is clear" description="No policies currently require manual underwriting." />}</Card></div></div>;
}
