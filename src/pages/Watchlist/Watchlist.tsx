import { useRef, useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { AlertModal } from '../../components/Alerts/AlertModal';
import type { Ticker } from '../../types/market';

export function Watchlist() {
  const { state, selectSymbol } = useMarket();
  const tickers = Object.values(state.tickers);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h1 className="font-headline text-sm font-bold text-on-surface tracking-tight">Watchlist</h1>
        <span className="font-mono text-[10px] text-outline">
          {tickers.length} instruments · live
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] px-4 py-2 border-b border-border sticky top-0 bg-background z-10">
          {['Symbol', 'Price', 'Change', 'Change %', 'Volume', ''].map((h, i) => (
            <span key={i} className="text-[10px] font-body text-outline tracking-wider uppercase">
              {h}
            </span>
          ))}
        </div>

        {tickers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="font-mono text-xs text-outline animate-pulse">Connecting to feed...</span>
          </div>
        ) : (
          tickers.map(ticker => (
            <TickerRow
              key={ticker.symbol}
              ticker={ticker}
              isSelected={ticker.symbol === state.selectedSymbol}
              onSelect={() => selectSymbol(ticker.symbol)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TickerRow({
  ticker,
  isSelected,
  onSelect,
}: {
  ticker: Ticker;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [alertOpen, setAlertOpen] = useState(false);
  const prevPrice = useRef(ticker.price);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (ticker.price === prevPrice.current) return;
    const cls = ticker.price > prevPrice.current ? 'flash-gain' : 'flash-loss';
    setFlashClass(cls);
    prevPrice.current = ticker.price;
    const t = setTimeout(() => setFlashClass(''), 350);
    return () => clearTimeout(t);
  }, [ticker.price]);

  const isGain = ticker.changePercent >= 0;

  return (
    <>
      <div
        onClick={onSelect}
        className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] px-4 py-3 border-b border-border/50 cursor-pointer
                    transition-colors duration-100 ${flashClass}
                    ${isSelected ? 'bg-surface-high' : 'hover:bg-surface-low'}`}
      >
        <div>
          <p className="font-mono text-xs font-medium text-on-surface">{ticker.symbol}</p>
          <p className="font-body text-[10px] text-outline mt-0.5">{ticker.name}</p>
        </div>
        <span className="font-mono text-xs text-on-surface self-center">
          {formatPrice(ticker.symbol, ticker.price)}
        </span>
        <span className={`font-mono text-xs self-center ${isGain ? 'text-gain' : 'text-loss'}`}>
          {isGain ? '+' : ''}{ticker.change.toFixed(2)}
        </span>
        <span className={`font-mono text-xs self-center ${isGain ? 'text-gain' : 'text-loss'}`}>
          {isGain ? '+' : ''}{ticker.changePercent.toFixed(2)}%
        </span>
        <span className="font-mono text-xs text-on-surface-muted self-center">
          {(ticker.volume / 1000).toFixed(1)}K
        </span>
        <button
          onClick={e => { e.stopPropagation(); setAlertOpen(true); }}
          className="self-center text-outline hover:text-primary transition-colors p-1"
          title="Set price alert"
        >
          <BellIcon />
        </button>
      </div>

      {alertOpen && (
        <AlertModal
          symbol={ticker.symbol}
          currentPrice={ticker.price}
          onClose={() => setAlertOpen(false)}
        />
      )}
    </>
  );
}

function BellIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5a5 5 0 0 1 5 5v3l1.5 2h-13L3 9.5v-3a5 5 0 0 1 5-5z" strokeLinejoin="round" />
      <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
    </svg>
  );
}

function formatPrice(symbol: string, price: number): string {
  if (symbol.includes('-USD')) {
    return price >= 1000
      ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price.toFixed(2);
  }
  return price.toFixed(2);
}
