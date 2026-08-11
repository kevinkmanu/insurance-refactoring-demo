import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClaims, useSubmitClaim, useApproveClaim, type Claim } from '../api/claims';
import { usePolicies } from '../api/policies';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../components/ui/useToast';
import { formatCurrency, formatDate, normalizedStatus } from './featureUtils';
import './feature.css';

function ClaimIntake({ onCancel, onSave, busy }: { onCancel: () => void; onSave: (claim: Claim, adjuster: string, docs: number) => void; busy: boolean }) {
  const [policyId, setPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [adjuster, setAdjuster] = useState('');
  const [docs, setDocs] = useState(0);
  const { data: policies } = usePolicies();
  return <form className="feature-form" onSubmit={(event) => { event.preventDefault(); onSave({ policyId: Number(policyId), claimAmount: Number(amount), claimReason: reason || null, status: 'SUBMITTED', incidentDate: incidentDate || null }, adjuster, docs); }}><div className="feature-form__grid"><div className="feature-form__field"><label htmlFor="claim-policy">Policy</label><select id="claim-policy" required value={policyId} onChange={(e) => setPolicyId(e.target.value)}><option value="">Select policy</option>{policies?.map((policy) => <option key={policy.id} value={policy.id}>#{policy.id} · {policy.policyType}</option>)}</select></div><div className="feature-form__field"><label htmlFor="claim-amount">Claim amount</label><input id="claim-amount" type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div><div className="feature-form__field"><label htmlFor="claim-date">Incident date</label><input id="claim-date" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} /></div><div className="feature-form__field"><label htmlFor="claim-adjuster">Adjuster</label><input id="claim-adjuster" placeholder="Optional adjuster name" value={adjuster} onChange={(e) => setAdjuster(e.target.value)} /></div><div className="feature-form__field"><label htmlFor="claim-docs">Documents</label><input id="claim-docs" type="number" min="0" value={docs} onChange={(e) => setDocs(Number(e.target.value))} /></div><div className="feature-form__field feature-form__field--full"><label htmlFor="claim-reason">Reason</label><textarea id="claim-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div></div><div className="feature-form__actions"><button type="button" className="button" onClick={onCancel}>Cancel</button><button className="button button--primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit claim'}</button></div></form>;
}

export function Claims() {
  const { data: claims, isLoading, isError } = useClaims();
  const { data: policies } = usePolicies();
  const submit = useSubmitClaim();
  const approve = useApproveClaim();
  const { toasts, push, dismiss } = useToast();
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<Claim>();
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const policyLabel = (id: number) => <Link className="feature-link" to={`/policies/${id}`}>#{id}</Link>;
  const filtered = useMemo(() => (claims ?? []).filter((claim) => filter === 'ALL' || normalizedStatus(claim.status) === filter), [claims, filter]);
  const statuses = useMemo(() => Array.from(new Set((claims ?? []).map((claim) => normalizedStatus(claim.status)))), [claims]);
  const columns: Column<Claim>[] = [
    { key: 'id', header: 'Claim', render: (value) => <button className="button button--small" onClick={() => setSelected(filtered.find((claim) => claim.id === value))}>#{value}</button> },
    { key: 'policyId', header: 'Policy', render: (value) => policyLabel(value as number) },
    { key: 'claimAmount', header: 'Amount', render: (value) => formatCurrency(value as number) },
    { key: 'incidentDate', header: 'Incident', render: (value) => formatDate(value as string) },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={String(value)} /> },
  ];
  const saveClaim = (claim: Claim, adjuster: string, docs: number) => void submit.mutateAsync({ claim, adjuster, docs }).then(() => { setIntakeOpen(false); push('Claim submitted to the adjuster queue.', 'success'); }).catch(() => push('Unable to submit claim.', 'danger'));
  const approveClaim = (force: boolean) => { if (!selected?.id) return; void approve.mutateAsync({ id: selected.id, force }).then((updated) => { setSelected(updated); setForceOpen(false); push(force ? 'Claim force approved.' : 'Claim approval processed.', 'success'); }).catch(() => push('Unable to approve claim.', 'danger')); };
  return <div className="feature-page"><ToastContainer toasts={toasts} onDismiss={dismiss} /><header className="feature-header"><div><h1 className="feature-title">Claims</h1><p className="feature-subtitle">Triage adjuster work, intake new claims, and approve eligible submissions.</p></div><button className="button button--primary" onClick={() => setIntakeOpen(true)}>New claim</button></header><Card title="Adjuster queue"><div className="toolbar"><div className="toolbar__field"><label htmlFor="claim-status-filter">Status</label><select id="claim-status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ALL">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div><span className="feature-muted">{filtered.length} claims</span></div>{isLoading ? <SkeletonRows rows={6} /> : isError ? <EmptyState title="Claims unavailable" description="Check the API connection and try again." /> : filtered.length ? <DataTable rows={filtered} rowKey={(row) => String(row.id)} columns={columns} caption="Adjuster claim queue" /> : <EmptyState icon="🗂" title="No claims in this queue" />}</Card><Modal isOpen={Boolean(selected)} onClose={() => setSelected(undefined)} title={`Claim #${selected?.id ?? ''}`}><div className="feature-form">{selected && <><dl className="detail-list"><div className="detail-list__row"><dt>Policy</dt><dd>{policyLabel(selected.policyId)}</dd></div><div className="detail-list__row"><dt>Amount</dt><dd>{formatCurrency(selected.claimAmount)}</dd></div><div className="detail-list__row"><dt>Incident</dt><dd>{formatDate(selected.incidentDate)}</dd></div><div className="detail-list__row"><dt>Reason</dt><dd>{selected.claimReason ?? '—'}</dd></div><div className="detail-list__row"><dt>Status</dt><dd><StatusBadge status={selected.status} /></dd></div></dl><div className="feature-form__actions"><button className="button button--primary" disabled={approve.isPending} onClick={() => approveClaim(false)}>Approve</button><button className="button button--danger" disabled={approve.isPending} onClick={() => setForceOpen(true)}>Force approve</button></div></>}</div></Modal><Modal isOpen={forceOpen} onClose={() => setForceOpen(false)} title="Confirm force approval" size="sm"><p>Force approval overrides the normal claim decision rules. Continue?</p><div className="feature-form__actions"><button className="button" onClick={() => setForceOpen(false)}>Cancel</button><button className="button button--danger" onClick={() => approveClaim(true)}>Confirm override</button></div></Modal><span className="feature-muted" hidden>{policies?.length ?? 0} policies available</span><Modal isOpen={intakeOpen} onClose={() => setIntakeOpen(false)} title="Claim intake" size="lg"><ClaimIntake onCancel={() => setIntakeOpen(false)} onSave={saveClaim} busy={submit.isPending} /></Modal></div>;
}
