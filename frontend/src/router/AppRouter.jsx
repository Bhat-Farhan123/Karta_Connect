
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import App from '../App';
import LoginPage from '../features/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AcceptInvitePage from '../features/auth/AcceptInvitePage';

export default function AppRouter() {
  console.log('APP ROUTER FILE LOADED');
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public login page */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/auth/accept-invite"
            element={<AcceptInvitePage />}
          />

          {/* Default route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Scholar portal */}
          <Route element={<ProtectedRoute allowedRole="scholar" />}>
            <Route
              path="/scholar/*"
              element={<App initialRole="Scholar" />}
            />
          </Route>

          {/* Alumni portal */}
          <Route element={<ProtectedRoute allowedRole="alumni" />}>
            <Route
              path="/alumni/*"
              element={<App initialRole="Alumni" />}
            />
          </Route>

          {/* Organization portal */}
          <Route element={<ProtectedRoute allowedRole="organization" />}>
            <Route
              path="/organization/*"
              element={<App initialRole="Organization" />}
            />
          </Route>

          {/* Admin portal */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route
              path="/admin/*"
              element={<App initialRole="Admin" />}
            />
          </Route>

          {/* Unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
