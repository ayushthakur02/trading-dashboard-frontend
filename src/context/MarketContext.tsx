import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Ticker } from '../types/market';

interface MarketState {
  tickers: Record<string, Ticker>;
  selectedSymbol: string;
  connected: boolean;
}

type Action =
  | { type: 'TICK'; payload: Ticker }
  | { type: 'SET_TICKERS'; payload: Ticker[] }
  | { type: 'SELECT'; payload: string }
  | { type: 'CONNECTION'; payload: boolean };

function reducer(state: MarketState, action: Action): MarketState {
  switch (action.type) {
    case 'SET_TICKERS': {
      const tickers = { ...state.tickers };
      for (const t of action.payload) tickers[t.symbol] = t;
      return { ...state, tickers };
    }
    case 'TICK':
      return { ...state, tickers: { ...state.tickers, [action.payload.symbol]: action.payload } };
    case 'SELECT':
      return { ...state, selectedSymbol: action.payload };
    case 'CONNECTION':
      return { ...state, connected: action.payload };
  }
}

interface MarketContextValue {
  state: MarketState;
  dispatch: React.Dispatch<Action>;
  selectSymbol: (symbol: string) => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

const INITIAL: MarketState = {
  tickers: {},
  selectedSymbol: 'AAPL',
  connected: false,
};

export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const selectSymbol = useCallback((symbol: string) => {
    dispatch({ type: 'SELECT', payload: symbol });
  }, []);

  return (
    <MarketContext.Provider value={{ state, dispatch, selectSymbol }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
