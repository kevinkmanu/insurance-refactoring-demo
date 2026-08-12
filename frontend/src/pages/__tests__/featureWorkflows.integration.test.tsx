import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Billing } from '../Billing';
import { Claims } from '../Claims';
import { Customers } from '../Customers';
import { Policies } from '../Policies';
import { Underwriting } from '../Underwriting';
import { ToastProvider } from '../../components/ui/ToastProvider';

const customers = [
  { id: 1, custNm: 'Jane Doe', email: 'jane@example.com', phone_no: '555-1234', address: '1 Main St', riskScore: 25 },
  { id: 2, custNm: 'John Smith', email: 'john@example.com', phone_no: '555-5678', address: '2 Oak Ave', riskScore: 80 },
];
const policies = [
  { policy_id: 10, customerId: 1, policyType: 'AUTO', premium: '750.00', status: 'ACTIVE', startDate: '2024-01-01', endDate: '2025-01-01', underwritingDecision: 'APPROVE' },
  { policy_id: 11, customerId: 2, policyType: 'HOME', premium: '1200.00', status: 'PENDING_REVIEW', startDate: '2024-02-01', endDate: '2025-02-01', underwritingDecision: 'REFER' },
];
const claims = [
  { id: 5, policyId: 10, claimAmount: '2500.50', claimReason: 'Accident', status: 'OPEN', incidentDate: '2024-03-15' },
  { id: 6, policyId: 11, claimAmount: '800.00', claimReason: 'Water damage', status: 'CLOSED', incidentDate: '2024-04-15' },
];
const billing = [
  { id: 3, policyId: 10, amount: '300.00', paymentStatus: 'OVERDUE', dueDate: '2024-02-01', paidDate: null },
];

const server = setupServer(
  http.get('/api/customers', () => HttpResponse.json(customers)),
  http.get('/api/policies', () => HttpResponse.json(policies)),
  http.get('/api/claims', () => HttpResponse.json(claims)),
  http.get('/api/billing', () => HttpResponse.json(billing)),
  http.get('/api/policies/customer/:customerId', () => HttpResponse.json([])),
  http.get('/api/claims/policy/:policyId', () => HttpResponse.json([])),
  http.get('/api/billing/policy/:policyId', () => HttpResponse.json(billing)),
  http.post('/api/customers', async ({ request }) => HttpResponse.json({ id: 3, ...(await request.json() as object) })),
  http.post('/api/policies', async ({ request }) => HttpResponse.json({ policy_id: 12, ...(await request.json() as object), premium: '500.00', status: 'NEW' })),
  http.post('/api/claims', async ({ request }) => HttpResponse.json({ id: 6, ...(await request.json() as object) })),
  http.post('/api/billing/payment', async ({ request }) => HttpResponse.json({ id: 4, ...(await request.json() as object) })),
  http.post('/api/underwriting/decision', () => HttpResponse.json({ customerId: 1, policyType: 'AUTO', decision: 'APPROVE' })),
);

function renderPage(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('enterprise feature workflows', () => {
  it('filters customers and submits a customer form with legacy wire fields', async () => {
    const user = userEvent.setup();
    let requestBody: Record<string, unknown> | undefined;
    server.use(http.post('/api/customers', async ({ request }) => {
      requestBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ id: 3, ...requestBody });
    }));
    renderPage(<Customers />);

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search'), 'john');
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add customer' }));
    await user.type(screen.getByLabelText('Full name'), 'Alice Jones');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Phone'), '555-0000');
    await user.type(screen.getByLabelText('Address'), '3 Pine St');
    await user.click(screen.getByRole('button', { name: 'Save customer' }));

    await waitFor(() => expect(requestBody).toMatchObject({ custNm: 'Alice Jones', phone_no: '555-0000' }));
  });

  it('walks the policy wizard and sends a domain-to-wire policy request', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    let requestBody: Record<string, unknown> | undefined;
    server.use(http.post('/api/policies', async ({ request }) => {
      requestUrl = request.url;
      requestBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ policy_id: 12, ...requestBody, premium: '500.00', status: 'NEW' });
    }));
    renderPage(<Policies />);

    await screen.findByText('Policy worklist');
    await user.click(screen.getByRole('button', { name: 'New policy' }));
    await user.selectOptions(screen.getByLabelText('Customer'), '1');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.selectOptions(screen.getByLabelText('Policy type'), 'HOME');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Create policy' }));

    await waitFor(() => {
      expect(requestUrl).toContain('age=35');
      expect(requestUrl).toContain('termMonths=12');
      expect(requestBody).toMatchObject({ customerId: 1, policyType: 'HOME', status: 'NEW' });
    });
  });

  it('submits a claim intake form with mocked policy data', async () => {
    const user = userEvent.setup();
    let requestBody: Record<string, unknown> | undefined;
    server.use(http.post('/api/claims', async ({ request }) => {
      requestBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ id: 6, ...requestBody });
    }));
    renderPage(<Claims />);

    await screen.findByText('Adjuster queue');
    await user.click(screen.getByRole('button', { name: 'New claim' }));
    await user.selectOptions(screen.getByLabelText('Policy'), '10');
    await user.type(screen.getByLabelText('Claim amount'), '1250');
    await user.type(screen.getByLabelText('Reason'), 'Wind damage');
    await user.click(screen.getByRole('button', { name: 'Submit claim' }));

    await waitFor(() => expect(requestBody).toMatchObject({ policyId: 10, claimAmount: 1250, claimReason: 'Wind damage', status: 'SUBMITTED' }));
  });

  it('records a billing payment through the payment form', async () => {
    const user = userEvent.setup();
    let requestBody: Record<string, unknown> | undefined;
    server.use(http.post('/api/billing/payment', async ({ request }) => {
      requestBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ id: 4, ...requestBody });
    }));
    renderPage(<Billing />);

    await screen.findByText('Policy payment history');
    await screen.findByRole('option', { name: '#10 · AUTO' });
    await user.selectOptions(screen.getByLabelText('Policy'), '10');
    await user.click(screen.getByRole('button', { name: 'Record payment' }));
    await user.clear(screen.getByLabelText('Payment amount'));
    await user.type(screen.getByLabelText('Payment amount'), '300');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Record payment' }));

    await waitFor(() => expect(requestBody).toMatchObject({ policyId: 10, amount: 300, paymentStatus: 'PAID' }));
  });

  it('executes underwriting after selecting a customer and policy type', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    server.use(http.post('/api/underwriting/decision', ({ request }) => {
      requestUrl = request.url;
      return HttpResponse.json({ customerId: 1, policyType: 'AUTO', decision: 'APPROVE' });
    }));
    renderPage(<Underwriting />);

    await screen.findByText('Decision workbench');
    await screen.findByLabelText('Customer');
    await user.selectOptions(screen.getByLabelText('Customer'), '1');
    await user.selectOptions(screen.getByLabelText('Policy type'), 'AUTO');
    await user.click(screen.getByRole('button', { name: 'Execute decision' }));

    await waitFor(() => {
      expect(requestUrl).toContain('customerId=1');
      expect(requestUrl).toContain('policyType=AUTO');
      expect(screen.getByText('APPROVE')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Underwriting' })).toBeInTheDocument();
  });

  it('exposes an accessible claim table and status filter', async () => {
    const user = userEvent.setup();
    renderPage(<Claims />);

    const table = await screen.findByRole('table', { name: 'Adjuster claim queue' });
    expect(within(table).getByRole('status', { name: 'Open' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Status'), 'CLOSED');
    expect(within(table).getByRole('status', { name: 'Closed' })).toBeInTheDocument();
    expect(within(table).queryByRole('status', { name: 'Open' })).not.toBeInTheDocument();
  });
});
