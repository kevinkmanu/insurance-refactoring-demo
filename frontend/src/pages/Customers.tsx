import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer, type Customer } from '../api/customers';
import { usePoliciesByCustomer } from '../api/policies';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/SkeletonLoader';
import { useToast } from '../components/ui/useToast';
import { getErrorMessage } from '../api/apiClient';
import { riskLabel } from './featureUtils';
import './feature.css';

function CustomerForm({ initial, onCancel, onSave, busy, error }: { initial?: Customer; onCancel: () => void; onSave: (customer: Customer) => void; busy: boolean; error?: string }) {
  const [form, setForm] = useState<Customer>(initial ?? { name: '', email: '', phone: '', address: '', riskScore: 50 });
  const update = (key: keyof Customer, value: string) => setForm((current) => ({ ...current, [key]: key === 'riskScore' ? Number(value) : value }));
  return (
    <form className="feature-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="feature-form__grid">
        <FormField id="customer-name" label="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <FormField id="customer-email" label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        <FormField id="customer-phone" label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
        <FormField id="customer-risk" label="Risk score" type="number" min="0" max="100" value={form.riskScore ?? 50} onChange={(e) => update('riskScore', e.target.value)} />
        <FormField id="customer-address" label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
      </div>
      <div className="feature-form__actions">
        <button type="button" className="button" onClick={onCancel}>Cancel</button>
        <button className="button button--primary" disabled={busy}>{busy ? 'Saving…' : 'Save customer'}</button>
      </div>
    </form>
  );
}

function CustomerDetail({ customer, onEdit }: { customer: Customer; onEdit: () => void }) {
  const policies = usePoliciesByCustomer(customer.id ?? 0);
  return (
    <div className="detail-layout">
      <div>
        <Card title="Customer profile">
          <dl className="detail-list">
            <div className="detail-list__row"><dt>Name</dt><dd>{customer.name}</dd></div>
            <div className="detail-list__row"><dt>Email</dt><dd>{customer.email}</dd></div>
            <div className="detail-list__row"><dt>Phone</dt><dd>{customer.phone}</dd></div>
            <div className="detail-list__row"><dt>Address</dt><dd>{customer.address}</dd></div>
          </dl>
          <div className="feature-form__actions"><button className="button button--primary" onClick={onEdit}>Edit customer</button></div>
        </Card>
        <Card title="Linked policies">
          {policies.isLoading ? <SkeletonRows /> : policies.isError ? <EmptyState icon="⚠️" title="Policies unavailable" description={getErrorMessage(policies.error)} /> : policies.data?.length ? (
            <DataTable
              rows={policies.data}
              rowKey={(row) => String(row.id)}
              columns={[
                { key: 'id', header: 'Policy', render: (value) => <Link className="feature-link" to={`/policies/${value}`}>#{value}</Link> },
                { key: 'policyType', header: 'Type' },
                { key: 'status', header: 'Status' },
                { key: 'premium', header: 'Premium', render: (value) => `$${Number(value).toFixed(2)}` },
              ]}
            />
          ) : <EmptyState title="No linked policies" description="Policies connected to this customer will appear here." />}
        </Card>
      </div>
      <Card title="Risk profile">
        <div className="feature-stat"><span className="feature-stat__label">Risk score</span><strong className="feature-stat__value">{customer.riskScore ?? '—'}</strong><span className="feature-muted">{riskLabel(customer.riskScore)}</span></div>
        <div className="risk-meter" aria-label={`Risk score ${customer.riskScore ?? 0} out of 100`}><span style={{ width: `${Math.min(100, Math.max(0, customer.riskScore ?? 0))}%` }} /></div>
      </Card>
    </div>
  );
}

export function Customers() {
  const { data: customers, isLoading, isError, error } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const { push } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer>();
  const [editing, setEditing] = useState<Customer>();
  const [formOpen, setFormOpen] = useState(false);
  const filtered = useMemo(() => (customers ?? []).filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const save = (customer: Customer) => {
    const request = customer.id ? updateCustomer.mutateAsync({ id: customer.id, customer }) : createCustomer.mutateAsync(customer);
    void request.then((saved) => { setFormOpen(false); setEditing(undefined); setSelected(saved); push('Customer saved successfully.', 'success'); }).catch((error: unknown) => push(getErrorMessage(error, 'Unable to save customer.'), 'danger'));
  };
  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Customer', render: (value, row) => <button className="button button--small" onClick={() => { setSelected(row); navigate(`/customers/${row.id}`); }}>{String(value)}</button> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'riskScore', header: 'Risk', render: (value) => `${value ?? '—'} · ${riskLabel(value as number | undefined)}` },
    { key: 'id', header: 'Actions', render: (_, row) => <button className="button button--small" onClick={() => { setEditing(row); setFormOpen(true); }}>Edit</button> },
  ];
  return (
    <div className="feature-page">
      <header className="feature-header"><div><h1 className="feature-title">Customers</h1><p className="feature-subtitle">Search customer records, assess risk, and manage coverage relationships.</p></div><button className="button button--primary" onClick={() => { setEditing(undefined); setFormOpen(true); }}>Add customer</button></header>
      {selected && <CustomerDetail customer={selected} onEdit={() => { setEditing(selected); setFormOpen(true); }} />}
      <Card title="Customer directory">
        <div className="toolbar"><div className="toolbar__field toolbar__search"><label htmlFor="customer-search">Search</label><input id="customer-search" placeholder="Name, email, or phone" value={query} onChange={(e) => setQuery(e.target.value)} /></div><span className="feature-muted">{filtered.length} customers</span></div>
        {isLoading ? <SkeletonRows rows={6} /> : isError ? <EmptyState icon="⚠️" title="Customers unavailable" description={getErrorMessage(error, 'Check the API connection and try again.')} /> : filtered.length ? <DataTable rows={filtered} rowKey={(row) => String(row.id)} columns={columns} caption="Customer directory" /> : <EmptyState icon="👥" title="No matching customers" description="Try a different search or add a new customer." />}
      </Card>
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit customer' : 'Add customer'}><CustomerForm initial={editing} onCancel={() => setFormOpen(false)} onSave={save} busy={createCustomer.isPending || updateCustomer.isPending} error={getErrorMessage(createCustomer.error ?? updateCustomer.error, '') || undefined} /></Modal>
    </div>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const customer = useCustomer(Number(id));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer>();
  const updateCustomer = useUpdateCustomer();
  const { push } = useToast();
  if (customer.isLoading) return <SkeletonRows />;
  if (customer.isError || !customer.data) return <EmptyState title="Customer not found" description={getErrorMessage(customer.error, 'The requested customer could not be loaded.')} />;
  const save = (updated: Customer) => void updateCustomer.mutateAsync({ id: Number(id), customer: updated }).then(() => { setFormOpen(false); push('Customer updated successfully.', 'success'); }).catch((error: unknown) => push(getErrorMessage(error, 'Unable to update customer.'), 'danger'));
  return <div className="feature-page"><header className="feature-header"><div><h1 className="feature-title">{customer.data.name}</h1><p className="feature-subtitle">Customer profile and linked coverage.</p></div><Link className="button" to="/customers">Back to customers</Link></header><CustomerDetail customer={customer.data} onEdit={() => { setEditing(customer.data); setFormOpen(true); }} /><Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Edit customer"><CustomerForm initial={editing} onCancel={() => setFormOpen(false)} onSave={save} busy={updateCustomer.isPending} error={getErrorMessage(updateCustomer.error, '') || undefined} /></Modal></div>;
}
