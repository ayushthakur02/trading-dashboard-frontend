import type { Ticker, Candle } from '../types/market';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('td_token');
}

async function get<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getTickers:  () => get<Ticker[]>('/tickers'),
  getHistory:  (symbol: string, limit = 200) =>
    get<Candle[]>(`/tickers/${symbol}/history?limit=${limit}`),
};
