import { useTickers } from './hooks/useTickers';
import { useWebSocket } from './hooks/useWebSocket';

// Handles data initialization — lives inside MarketProvider but outside BrowserRouter
export function AppInit() {
  useTickers();
  useWebSocket();
  return null;
}
