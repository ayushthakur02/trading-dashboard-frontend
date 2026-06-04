import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode,
} from 'react';
import { useMarket } from './MarketContext';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  threshold: number;
  triggered: boolean;
}

interface AlertContextValue {
  alerts: PriceAlert[];
  toasts: PriceAlert[];
  addAlert: (symbol: string, condition: 'above' | 'below', threshold: number) => void;
  removeAlert: (id: string) => void;
  dismissToast: (id: string) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);
const STORAGE_KEY = 'td_alerts';

function load(): PriceAlert[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as PriceAlert[];
  } catch {
    return [];
  }
}

function save(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(load);
  const [toasts, setToasts] = useState<PriceAlert[]>([]);
  const { state } = useMarket();
  const prevPrices = useRef<Record<string, number>>({});

  const addAlert = useCallback((symbol: string, condition: 'above' | 'below', threshold: number) => {
    setAlerts(prev => {
      const next = [...prev, { id: crypto.randomUUID(), symbol, condition, threshold, triggered: false }];
      save(next);
      return next;
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      save(next);
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Check alerts on every tick
  useEffect(() => {
    const triggered: PriceAlert[] = [];

    setAlerts(prev => {
      const next = prev.map(alert => {
        if (alert.triggered) return alert;
        const price = state.tickers[alert.symbol]?.price;
        if (price === undefined) return alert;

        const hit =
          (alert.condition === 'above' && price >= alert.threshold) ||
          (alert.condition === 'below' && price <= alert.threshold);

        if (hit) {
          triggered.push(alert);
          return { ...alert, triggered: true };
        }
        return alert;
      });

      if (triggered.length > 0) save(next);
      return next;
    });

    if (triggered.length > 0) {
      setToasts(prev => [...prev, ...triggered]);
    }

    prevPrices.current = Object.fromEntries(
      Object.entries(state.tickers).map(([s, t]) => [s, t.price]),
    );
  }, [state.tickers]);

  return (
    <AlertContext.Provider value={{ alerts, toasts, addAlert, removeAlert, dismissToast }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}
