import { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useHistory } from '../../hooks/useHistory';
import { PriceChart } from './PriceChart';
import { OrderBook } from './OrderBook';
import { OrderEntry } from './OrderEntry';

const INTERVALS = ['1D', '1W', '1M', 'YTD'] as const;
const BOTTOM_TABS = ['ACTIVE ORDERS', 'TRADE HISTORY', 'POSITIONS'] as const;

export function Dashboard() {
  const { state, selectSymbol } = useMarket();
  const { selectedSymbol } = state;
  const ticker = state.tickers[selectedSymbol];
  const { candles, loading } = useHistory(selectedSymbol);

  const [interval, setInterval] = useState<string>('1W');
  const [bottomTab, setBottomTab] = useState<string>('ACTIVE ORDERS');

  const isGain = (ticker?.changePercent ?? 0) >= 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Ticker header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-headline text-sm font-bold text-on-surface">{selectedSymbol}</span>
          <span className="text-xs text-outline font-body">{ticker?.name}</span>
        </div>

        {ticker && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-on-surface font-medium">
              {ticker.price.toFixed(2)}
            </span>
            <span className={`font-mono text-xs ${isGain ? 'text-gain' : 'text-loss'}`}>
              {isGain ? '+' : ''}{ticker.change.toFixed(2)} ({isGain ? '+' : ''}{ticker.changePercent.toFixed(2)}%)
            </span>
          </div>
        )}

        <div className="flex items-center gap-0.5 ml-2">
          {INTERVALS.map(iv => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`px-2.5 py-1 text-[11px] font-body rounded transition-colors ${
                interval === iv
                  ? 'bg-primary-container text-white'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Symbol switcher */}
          <div className="flex items-center gap-1">
            {Object.keys(state.tickers).map(sym => (
              <button
                key={sym}
                onClick={() => selectSymbol(sym)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  sym === selectedSymbol
                    ? 'bg-surface-high text-on-surface border border-primary'
                    : 'text-outline hover:text-on-surface border border-transparent'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          <button className="text-outline hover:text-on-surface">
            <DotsIcon />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart area */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <div className="flex-1 relative p-2">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs text-outline animate-pulse">LOADING CHART DATA...</span>
              </div>
            ) : (
              <PriceChart candles={candles} symbol={selectedSymbol} />
            )}
          </div>

          {/* Bottom tabs */}
          <div className="border-t border-border shrink-0">
            <div className="flex border-b border-border">
              {BOTTOM_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-4 py-2 text-[10px] font-body tracking-wider transition-colors ${
                    bottomTab === tab
                      ? 'text-on-surface border-b-2 border-primary -mb-px'
                      : 'text-outline hover:text-on-surface-muted'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="h-[140px] overflow-auto">
              <OrdersTable tab={bottomTab} symbol={selectedSymbol} />
            </div>
          </div>
        </div>

        {/* Right panels */}
        <div className="w-[280px] shrink-0 flex flex-col">
          <div className="flex-1 overflow-auto border-b border-border">
            <OrderBook symbol={selectedSymbol} />
          </div>
          <div className="h-[370px] shrink-0">
            <OrderEntry symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ tab, symbol }: { tab: string; symbol: string }) {
  const mockOrders = [
    { time: '09:41:22', symbol, type: 'LIMIT', side: 'BUY',  price: 184.20, amount: 100 },
    { time: '09:35:10', symbol: 'MSFT', type: 'STOP', side: 'SELL', price: 412.50, amount: 50 },
  ];

  if (tab !== 'ACTIVE ORDERS') {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="font-mono text-xs text-outline">No {tab.toLowerCase()} to display</span>
      </div>
    );
  }

  return (
    <table className="w-full text-[11px] font-mono">
      <thead>
        <tr className="border-b border-border">
          {['TIME', 'SYMBOL', 'TYPE', 'SIDE', 'PRICE', 'AMOUNT'].map(h => (
            <th key={h} className="px-3 py-1.5 text-left text-[10px] font-body text-outline tracking-wider font-normal">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {mockOrders.map((o, i) => (
          <tr key={i} className="hover:bg-surface-high border-b border-border/40">
            <td className="px-3 py-1.5 text-on-surface-muted">{o.time}</td>
            <td className="px-3 py-1.5 text-primary">{o.symbol}</td>
            <td className="px-3 py-1.5 text-on-surface-muted">{o.type}</td>
            <td className={`px-3 py-1.5 ${o.side === 'BUY' ? 'text-gain' : 'text-loss'}`}>{o.side}</td>
            <td className="px-3 py-1.5 text-on-surface">{o.price.toFixed(2)}</td>
            <td className="px-3 py-1.5 text-on-surface-muted">{o.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="8" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="12" cy="8" r="1.2" />
    </svg>
  );
}
