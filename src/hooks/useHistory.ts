import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Candle } from '../types/market';

export function useHistory(symbol: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    api.getHistory(symbol, 200)
      .then(setCandles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [symbol]);

  return { candles, loading };
}
