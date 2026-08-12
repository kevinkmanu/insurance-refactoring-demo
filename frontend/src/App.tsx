import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SkeletonRows } from './components/ui/SkeletonLoader';

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Customers = lazy(() => import('./pages/Customers').then((module) => ({ default: module.Customers })));
const CustomerDetailPage = lazy(() => import('./pages/Customers').then((module) => ({ default: module.CustomerDetailPage })));
const Policies = lazy(() => import('./pages/Policies').then((module) => ({ default: module.Policies })));
const PolicyDetailPage = lazy(() => import('./pages/Policies').then((module) => ({ default: module.PolicyDetailPage })));
const Claims = lazy(() => import('./pages/Claims').then((module) => ({ default: module.Claims })));
const Billing = lazy(() => import('./pages/Billing').then((module) => ({ default: module.Billing })));
const Underwriting = lazy(() => import('./pages/Underwriting').then((module) => ({ default: module.Underwriting })));

function RouteLoading() {
  return (
    <div role="status" aria-live="polite">
      <SkeletonRows rows={6} />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ErrorBoundary title="Unable to load this page">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/policies/:id" element={<PolicyDetailPage />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/underwriting" element={<Underwriting />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </BrowserRouter>
  );
}
