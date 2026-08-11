import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Customers, CustomerDetailPage } from './pages/Customers';
import { Policies, PolicyDetailPage } from './pages/Policies';
import { Claims } from './pages/Claims';
import { Billing } from './pages/Billing';
import { Underwriting } from './pages/Underwriting';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
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
      </AppShell>
    </BrowserRouter>
  );
}
