import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WalletProvider } from "./context/WalletContext"; // provides decrypted wallet in memory for the session
import ErrorBoundary from "./components/shared/ErrorBoundary";

// Pages
import PublicPage from "./pages/PublicPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, allowedRole }) => {
  const { role } = useAuth();
  if (role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            {/* WalletProvider is inside AuthProvider so loadWallet can be called after auth succeeds */}
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
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
