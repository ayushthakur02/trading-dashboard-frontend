import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Watchlist } from './pages/Watchlist/Watchlist';
import { History } from './pages/History/History';
import { AppInit } from './AppInit';

export default function App() {
  return (
    <MarketProvider>
      <AppInit />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MarketProvider>
  );
}
