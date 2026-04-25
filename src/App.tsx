/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import Operations from './pages/Operations';
import Verify from './pages/Verify';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { profile, loading } = useAuth();
  
  if (loading) return null;
  if (!profile) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
}

function AppRoutes() {
  const { profile } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:batchId" element={<Verify />} />
        
        {/* Protected Dashboards */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {profile?.role === 'producer' ? <FarmerDashboard /> : <Operations />}
            </ProtectedRoute>
          } 
        />
        
        {/* Role Specific Routes */}
        <Route 
          path="/transit" 
          element={
            <ProtectedRoute allowedRoles={['logistics']}>
              <Operations />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

