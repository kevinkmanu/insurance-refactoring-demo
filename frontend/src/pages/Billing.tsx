import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBilling, useBillingByPolicy, useProcessPayment, type BillingRecord } from '../api/billing';
import { usePolicies } from '../api/policies';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../components/ui/useToast';
import { formatCurrency, formatDate, isOutstanding } from './featureUtils';
import './feature.css';

function PaymentForm({ policyId, balance, onCancel, onSave, busy }: { policyId: number; balance: number; onCancel: () => void; onSave: (payment: BillingRecord) => void; busy: boolean }) {
  const [amount, setAmount] = useState(String(balance > 0 ? balance : ''));
  const [status, setStatus] = useState('PAID');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  return <form className="feature-form" onSubmit={(event) => { event.preventDefault(); onSave({ policyId, amount: Number(amount), paymentStatus: status, dueDate, paidDate: status === 'PAID' ? new Date().toISOString().slice(0, 10) : null }); }}><div className="feature-form__field"><label htmlFor="payment-amount">Payment amount</label><input id="payment-amount" type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div><div className="feature-form__field"><label htmlFor="payment-status">Payment status</label><select id="payment-status" value={status} onChange={(e) => setStatus(e.target.value)}><option>PAID</option><option>PENDING</option><option>OVERDUE</option></select></div><div className="feature-form__field"><label htmlFor="payment-due">Due date</label><input id="payment-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div><div className="feature-form__actions"><button type="button" className="button" onClick={onCancel}>Cancel</button><button className="button button--primary" disabled={busy}>{busy ? 'Recording…' : 'Record payment'}</button></div></form>;
}

export function Billing() {
  const { data: records, isLoading, isError } = useBilling();
  const { data: policies } = usePolicies();
  const processPayment = useProcessPayment();
  const { toasts, push, dismiss } = useToast();
  const [policyId, setPolicyId] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const selectedRecords = useBillingByPolicy(policyId);
  const policyRecords = useMemo(() => policyId ? selectedRecords.data ?? [] : records ?? [], [policyId, selectedRecords.data, records]);
  const balance = useMemo(() => policyRecords.filter((record) => isOutstanding(record.paymentStatus)).reduce((sum, record) => sum + record.amount, 0), [policyRecords]);
  const allOutstanding = (records ?? []).filter((record) => isOutstanding(record.paymentStatus)).reduce((sum, record) => sum + record.amount, 0);
  const policyLabel = (id: number) => <Link className="feature-link" to={`/policies/${id}`}>Policy #{id}</Link>;
  const submitPayment = (payment: BillingRecord) => void processPayment.mutateAsync(payment).then(() => { setPaymentOpen(false); push('Payment recorded successfully.', 'success'); }).catch(() => push('Unable to record payment.', 'danger'));
  return <div className="feature-page"><ToastContainer toasts={toasts} onDismiss={dismiss} /><header className="feature-header"><div><h1 className="feature-title">Billing</h1><p className="feature-subtitle">Review policy payment history, outstanding balances, and payment status.</p></div><button className="button button--primary" disabled={!policyId} onClick={() => setPaymentOpen(true)}>Record payment</button></header><div className="feature-grid feature-grid--three"><div className="feature-stat"><span className="feature-stat__label">Outstanding premium</span><strong className="feature-stat__value">{formatCurrency(allOutstanding)}</strong></div><div className="feature-stat"><span className="feature-stat__label">Billing records</span><strong className="feature-stat__value">{records?.length ?? 0}</strong></div><div className="feature-stat"><span className="feature-stat__label">Selected balance</span><strong className="feature-stat__value">{formatCurrency(balance)}</strong></div></div><Card title="Policy payment history"><div className="toolbar"><div className="toolbar__field"><label htmlFor="billing-policy">Policy</label><select id="billing-policy" value={policyId} onChange={(e) => setPolicyId(Number(e.target.value))}><option value={0}>All policies</option>{policies?.map((policy) => <option key={policy.id} value={policy.id}>#{policy.id} · {policy.policyType}</option>)}</select></div>{policyId && <span className="feature-muted">{policyLabel(policyId)}</span>}</div>{isLoading || (policyId > 0 && selectedRecords.isLoading) ? <SkeletonRows rows={5} /> : isError ? <EmptyState title="Billing unavailable" description="Check the API connection and try again." /> : policyRecords.length ? <DataTable rows={policyRecords} rowKey={(row) => String(row.id)} columns={[{ key: 'id', header: 'Record' }, { key: 'policyId', header: 'Policy', render: (value) => policyLabel(value as number) }, { key: 'amount', header: 'Amount', render: (value) => formatCurrency(value as number) }, { key: 'paymentStatus', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> }, { key: 'dueDate', header: 'Due date', render: (value) => formatDate(value as string) }, { key: 'paidDate', header: 'Paid date', render: (value) => formatDate(value as string) }]} caption="Payment history" /> : <EmptyState icon="💳" title="No billing records" description="Policies and approved claims will create billing records here." />}</Card><Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record payment"><PaymentForm policyId={policyId} balance={balance} onCancel={() => setPaymentOpen(false)} onSave={submitPayment} busy={processPayment.isPending} /></Modal></div>;
}
