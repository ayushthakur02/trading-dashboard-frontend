import { useEffect } from 'react';
import { api } from '../services/api';
import { useMarket } from '../context/MarketContext';

export function useTickers() {
  const { dispatch } = useMarket();

  useEffect(() => {
    api.getTickers()
      .then(tickers => dispatch({ type: 'SET_TICKERS', payload: tickers }))
      .catch(console.error);
  }, [dispatch]);
}
