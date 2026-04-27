import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import PublicPage from './pages/PublicPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UniversityDashboard from './pages/UniversityDashboard';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, allowedRole }) => {
  const { role, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* University Routes */}
          <Route 
            path="/university/*" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="university">
                  <UniversityDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
