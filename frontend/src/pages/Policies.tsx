import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCustomers } from '../api/customers';
import { usePolicies, usePolicy, useCreatePolicy, type Policy } from '../api/policies';
import { useClaimsByPolicy } from '../api/claims';
import { useBillingByPolicy } from '../api/billing';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { formatCurrency, formatDate, normalizedStatus } from './featureUtils';
import './feature.css';

const POLICY_TYPES = ['AUTO', 'HOME', 'LIFE', 'TRAVEL'];

function estimatePremium(type: string, age: number, risk: number, term: number): number {
  const base = type === 'AUTO' ? 350 : type === 'HOME' ? 250 : type === 'LIFE' ? 410 : 200;
  return base + (age > 45 ? 90 : 0) + (risk > 70 ? 130 : 0) + (term > 24 ? 75 : 0);
}

function PolicyWizard({ onClose, onCreated }: { onClose: () => void; onCreated: (policy: Policy) => void }) {
  const { data: customers } = useCustomers();
  const create = useCreatePolicy();
  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState(0);
  const [policyType, setPolicyType] = useState('AUTO');
  const [age, setAge] = useState(35);
  const [term, setTerm] = useState(12);
  const customer = customers?.find((item) => item.id === customerId);
  const quote = estimatePremium(policyType, age, customer?.riskScore ?? 50, term);
  const submit = () => {
    if (!customerId) return;
    void create.mutateAsync({ policy: { customerId, policyType, premium: 0, status: 'NEW', startDate: null, endDate: null, underwritingDecision: null }, age, termMonths: term }).then((created) => onCreated(created));
  };
  return (
    <div className="feature-form">
      <div className="wizard-steps">{['Customer', 'Coverage', 'Quote', 'Confirm'].map((label, index) => <div key={label} className={`wizard-step${step === index + 1 ? ' wizard-step--active' : ''}`}>{index + 1}. {label}</div>)}</div>
      {step === 1 && <div className="feature-form__field"><label htmlFor="policy-customer">Customer</label><select id="policy-customer" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}><option value={0}>Select customer</option>{customers?.map((item) => <option key={item.id} value={item.id}>{item.name} (risk {item.riskScore ?? '—'})</option>)}</select></div>}
      {step === 2 && <div className="feature-form__grid"><div className="feature-form__field"><label htmlFor="policy-type">Policy type</label><select id="policy-type" value={policyType} onChange={(e) => setPolicyType(e.target.value)}>{POLICY_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div><div className="feature-form__field"><label htmlFor="policy-age">Customer age</label><input id="policy-age" type="number" min="18" max="100" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div><div className="feature-form__field"><label htmlFor="policy-term">Term (months)</label><input id="policy-term" type="number" min="1" max="120" value={term} onChange={(e) => setTerm(Number(e.target.value))} /></div></div>}
      {step === 3 && <div className="decision-panel"><span className="feature-muted">Estimated premium</span><strong>{formatCurrency(quote)}</strong><p className="feature-muted">Final premium is calculated by the existing policy API when the policy is created.</p></div>}
      {step === 4 && <div><p>Confirm {policyType} coverage for <strong>{customer?.name ?? 'the selected customer'}</strong>.</p><dl className="detail-list"><div className="detail-list__row"><dt>Age / term</dt><dd>{age} / {term} months</dd></div><div className="detail-list__row"><dt>Estimated premium</dt><dd>{formatCurrency(quote)}</dd></div></dl></div>}
      <div className="feature-form__actions"><button type="button" className="button" onClick={step === 1 ? onClose : () => setStep((current) => current - 1)}>Back</button>{step < 4 ? <button type="button" className="button button--primary" disabled={step === 1 && !customerId} onClick={() => setStep((current) => current + 1)}>Continue</button> : <button type="button" className="button button--primary" disabled={create.isPending} onClick={submit}>{create.isPending ? 'Creating…' : 'Create policy'}</button>}</div>
    </div>
  );
}

function PolicyDetail({ policy }: { policy: Policy }) {
  const claims = useClaimsByPolicy(policy.id ?? 0);
  const billing = useBillingByPolicy(policy.id ?? 0);
  return <div className="detail-layout"><div><Card title="Policy details"><dl className="detail-list"><div className="detail-list__row"><dt>Policy ID</dt><dd>#{policy.id}</dd></div><div className="detail-list__row"><dt>Type</dt><dd>{policy.policyType}</dd></div><div className="detail-list__row"><dt>Status</dt><dd><StatusBadge status={policy.status} /></dd></div><div className="detail-list__row"><dt>Premium</dt><dd>{formatCurrency(policy.premium)}</dd></div><div className="detail-list__row"><dt>Coverage period</dt><dd>{formatDate(policy.startDate)} – {formatDate(policy.endDate)}</dd></div><div className="detail-list__row"><dt>Underwriting</dt><dd>{policy.underwritingDecision ?? 'Pending'}</dd></div></dl></Card><Card title="Linked claims">{claims.isLoading ? <SkeletonRows /> : claims.data?.length ? <DataTable rows={claims.data} rowKey={(row) => String(row.id)} columns={[{ key: 'id', header: 'Claim', render: (value) => `#${value}` }, { key: 'claimAmount', header: 'Amount', render: (value) => formatCurrency(value as number) }, { key: 'status', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> }]} /> : <div className="feature-empty">No claims filed.</div>}</Card></div><Card title="Billing history">{billing.isLoading ? <SkeletonRows /> : billing.data?.length ? <DataTable rows={billing.data} rowKey={(row) => String(row.id)} columns={[{ key: 'dueDate', header: 'Due', render: (value) => formatDate(value as string) }, { key: 'amount', header: 'Amount', render: (value) => formatCurrency(value as number) }, { key: 'paymentStatus', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> }]} /> : <div className="feature-empty">No billing records.</div>}</Card></div>;
}

export function PolicyDetailPage() {
  const { id } = useParams();
  const policy = usePolicy(Number(id));
  if (policy.isLoading) return <SkeletonRows />;
  if (policy.isError || !policy.data) return <EmptyState title="Policy not found" description="The requested policy could not be loaded." />;
  return <div className="feature-page"><header className="feature-header"><div><h1 className="feature-title">Policy #{policy.data.id}</h1><p className="feature-subtitle">Coverage, claims, and billing at a glance.</p></div><Link className="button" to="/policies">Back to policies</Link></header><PolicyDetail policy={policy.data} /></div>;
}

export function Policies() {
  const { data: policies, isLoading, isError } = usePolicies();
  const { data: customers } = useCustomers();
  const { toasts, push, dismiss } = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [wizardOpen, setWizardOpen] = useState(false);
  const customerName = (id: number) => customers?.find((customer) => customer.id === id)?.name ?? `Customer #${id}`;
  const filtered = useMemo(() => (policies ?? []).filter((policy) => (type === 'ALL' || policy.policyType === type) && (status === 'ALL' || normalizedStatus(policy.status) === status)), [policies, type, status]);
  const columns: Column<Policy>[] = [
    { key: 'id', header: 'Policy', render: (value) => <Link className="feature-link" to={`/policies/${value}`}>#{value}</Link> },
    { key: 'customerId', header: 'Customer', render: (value) => customerName(value as number) },
    { key: 'policyType', header: 'Type' },
    { key: 'premium', header: 'Premium', render: (value) => formatCurrency(value as number) },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> },
    { key: 'startDate', header: 'Starts', render: (value) => formatDate(value as string) },
  ];
  return <div className="feature-page"><ToastContainer toasts={toasts} onDismiss={dismiss} /><header className="feature-header"><div><h1 className="feature-title">Policies</h1><p className="feature-subtitle">Manage coverage worklists and review linked claims and billing.</p></div><button className="button button--primary" onClick={() => setWizardOpen(true)}>New policy</button></header><Card title="Policy worklist"><div className="toolbar"><div className="toolbar__field"><label htmlFor="policy-type-filter">Type</label><select id="policy-type-filter" value={type} onChange={(e) => setType(e.target.value)}><option value="ALL">All types</option>{POLICY_TYPES.map((item) => <option key={item}>{item}</option>)}</select></div><div className="toolbar__field"><label htmlFor="policy-status-filter">Status</label><select id="policy-status-filter" value={status} onChange={(e) => setStatus(e.target.value)}><option value="ALL">All statuses</option>{['ACTIVE', 'NEW', 'PENDING_REVIEW', 'ESCALATED', 'CANCELLED', 'EXPIRED'].map((item) => <option key={item}>{item}</option>)}</select></div><span className="feature-muted">{filtered.length} policies</span></div>{isLoading ? <SkeletonRows rows={6} /> : isError ? <EmptyState title="Policies unavailable" description="Check the API connection and try again." /> : filtered.length ? <DataTable rows={filtered} rowKey={(row) => String(row.id)} columns={columns} caption="Policy worklist" /> : <EmptyState icon="📋" title="No policies match these filters" />}</Card><Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="New policy wizard" size="md"><PolicyWizard onClose={() => setWizardOpen(false)} onCreated={(created) => { setWizardOpen(false); push(`Policy #${created.id} created.`, 'success'); navigate(`/policies/${created.id}`); }} /></Modal></div>;
}
