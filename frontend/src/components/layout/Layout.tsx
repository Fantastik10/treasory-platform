import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard/Dashboard';
import { BureauList } from '../../pages/Bureau/BureauList';
import { BureauDetail } from '../../pages/Bureau/BureauDetail';
import { EspaceManagement } from '../../pages/Espace/EspaceManagement';
import { UserAdmin } from '../../pages/Admin/UserAdmin';
import { InternalMessaging } from '../../pages/Messaging/InternalMessaging';
import { Accounts } from '../../pages/Financial/Accounts';
import { Transactions } from '../../pages/Financial/Transactions';
import { FinancialReports } from '../../pages/Reports/FinancialReports';
import { BankIntegration } from '../../pages/Settings/BankIntegration';
import { APIConfiguration } from '../../pages/Settings/APIConfiguration';
import { SyncManagement } from '../../pages/Settings/SyncManagement';
import { Statistics } from '../../pages/Analytics/Statistics';
import { Charts } from '../../pages/Analytics/Charts';
import { Reports } from '../../pages/Analytics/Reports';
import DonorManagement from '../../pages/Donors/DonorManagement';
import DonorAnalytics from '../../pages/Donors/DonorAnalytics';
import ReminderManagement from '../../pages/Donors/ReminderManagement';

const Layout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bureaux" element={<BureauList />} />
            <Route path="/bureaux/:id" element={<BureauDetail />} />
            <Route path="/espaces" element={<EspaceManagement />} />
            <Route path="/messagerie" element={<InternalMessaging />} />
            <Route path="/admin" element={<UserAdmin />} />
            <Route path="/comptes" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/rapports" element={<FinancialReports />} />
            <Route path="/integrations" element={<BankIntegration />} />
            <Route path="/apis" element={<APIConfiguration />} />
            <Route path="/synchronisation" element={<SyncManagement />} />
            <Route path="/statistiques" element={<Statistics />} />
            <Route path="/graphiques" element={<Charts />} />
            <Route path="/rapports" element={<Reports />} />
            <Route path="/donors" element={<DonorManagement />} />
            <Route path="/analytics" element={<DonorAnalytics />} />
            <Route path='/bureau/:bureauId/reminders' element={<ReminderManagement />} />'
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;