import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { AlertProvider } from './context/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AlertToasts } from './components/Alerts/AlertToasts';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Watchlist } from './pages/Watchlist/Watchlist';
import { History } from './pages/History/History';
import { AppInit } from './AppInit';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <MarketProvider>
                  <AlertProvider>
                    <AppInit />
                    <AlertToasts />
                    <Layout />
                  </AlertProvider>
                </MarketProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="history" element={<History />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
