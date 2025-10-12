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