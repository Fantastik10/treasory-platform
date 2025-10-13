import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BureauProvider } from './contexts/BureauContext';
import Layout from './components/layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import { BureauList } from './pages/Bureau/BureauList';
import { BureauDetail } from './pages/Bureau/BureauDetail';
import { EspaceManagement } from './pages/Espace/EspaceManagement';
import { UserAdmin } from './pages/Admin/UserAdmin';
import { InternalMessaging } from './pages/Messaging/InternalMessaging';
import './index.css';
import { Accounts } from './pages/Financial/Accounts';
import { Transactions } from './pages/Financial/Transactions';
import { FinancialReports } from './pages/Reports/FinancialReports';
import { BankIntegration } from './pages/Settings/BankIntegration';
import { APIConfiguration } from './pages/Settings/APIConfiguration';
import { SyncManagement } from './pages/Settings/SyncManagement';
import { Statistics } from './pages/Analytics/Statistics';
import { Charts } from './pages/Analytics/Charts';
import { Reports } from './pages/Analytics/Reports';
import DonorManagement from './pages/Donors/DonorManagement';
import DonorAnalytics from './pages/Donors/DonorAnalytics';
import ReminderManagement from './pages/Donors/ReminderManagement';

function App() {
  return (
    <AuthProvider>
      <BureauProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<Layout />} />
            </Routes>
          </div>
        </Router>
      </BureauProvider>
    </AuthProvider>
  );
}

export default App;