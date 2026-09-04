import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Products } from './pages/Products/Products';
import { Orders } from './pages/Orders/Orders';
import { SyncLogs } from './pages/SyncLogs/SyncLogs';
import { Login } from './pages/Login/Login';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

export const App = () => {
  return (
    <Routes>
      {/* Public Route: Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="sync-logs" element={<SyncLogs />} />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
