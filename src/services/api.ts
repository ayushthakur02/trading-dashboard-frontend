import type { Ticker, Candle } from '../types/market';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getTickers: () => get<Ticker[]>('/tickers'),
  getHistory: (symbol: string, limit = 200) =>
    get<Candle[]>(`/tickers/${symbol}/history?limit=${limit}`),
};
