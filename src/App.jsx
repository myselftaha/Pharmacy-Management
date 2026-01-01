import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import History from './pages/History';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import SupplierDetails from './pages/SupplierDetails';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import API_URL from './config/api';

import Users from './pages/Users';
import Customers from './pages/Customers';
import Vouchers from './pages/Vouchers';
import Return from './pages/Return';
import Expenses from './pages/Expenses';
import Report from './pages/Report';
import Staff from './pages/Staff';
import StaffEdit from './pages/StaffEdit';
import StaffPaySalary from './pages/StaffPaySalary';
import StaffAddAdvance from './pages/StaffAddAdvance';
import CashDrawer from './pages/CashDrawer';
import OwnerSetup from './pages/OwnerSetup';
import LoaderDemo from './pages/LoaderDemo';
import Loader from './components/common/Loader';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [setupStatus, setSetupStatus] = useState({ isSetupCompleted: false, loading: true });

  useEffect(() => {
    const checkSetup = async () => {
      try {
        console.log('Checking system setup status...');
        const response = await fetch(`${API_URL}/api/system/status`);
        const data = await response.json();
        console.log('Setup status received:', data);
        setSetupStatus({ isSetupCompleted: data.isSetupCompleted, loading: false });
      } catch (err) {
        console.error('Failed to check setup status', err);
        setSetupStatus({ isSetupCompleted: true, loading: false });
      }
    };
    checkSetup();
  }, []);


  const isSetup = setupStatus.isSetupCompleted;

  if (setupStatus.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  const RootRedirect = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) return <Navigate to="/login" replace />;

    // Roles that default to Dashboard
    const dashboardRoles = ['Admin', 'Super Admin', 'Pharmacist', 'Store Keeper', 'Delivery Rider'];

    if (dashboardRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    // Everyone else defaults to POS
    return <Navigate to="/pos" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Setup & Login - Mutual Exclusivity based on setup status */}
        <Route
          path="/setup"
          element={isSetup ? <Navigate to="/login" replace /> : <OwnerSetup onComplete={() => setSetupStatus({ isSetupCompleted: true, loading: false })} />}
        />
        <Route
          path="/login"
          element={!isSetup ? <Navigate to="/setup" replace /> : <LoginPage />}
        />

        {/* Protected Routes - Only accessible if setup is completed */}
        <Route element={!isSetup ? <Navigate to="/setup" replace /> : <ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute roles={['Admin', 'Super Admin']} />}>
              <Route path="staff" element={<Staff />} />
              <Route path="staff/:id/edit" element={<StaffEdit />} />
              <Route path="staff/:id/pay-salary" element={<StaffPaySalary />} />
              <Route path="staff/:id/add-advance" element={<StaffAddAdvance />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Report />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="vouchers" element={<Vouchers />} />
              <Route path="loaders" element={<LoaderDemo />} />
            </Route>

            {/* General Protected Routes */}
            <Route path="pos" element={<Home />} />
            <Route path="history" element={<History />} />
            <Route path="return" element={<Return />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/:id" element={<SupplierDetails />} />
            <Route path="customers" element={<Customers />} />
            <Route path="cash-drawer" element={<CashDrawer />} />
          </Route>
        </Route>
        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to={isSetup ? "/" : "/setup"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
