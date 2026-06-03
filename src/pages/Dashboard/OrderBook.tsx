import { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import type { OrderBook } from '../../types/market';

function generateOrderBook(midPrice: number): OrderBook {
  const spread = parseFloat((midPrice * 0.0003).toFixed(2));
  const bestAsk = parseFloat((midPrice + spread / 2).toFixed(2));
  const bestBid = parseFloat((midPrice - spread / 2).toFixed(2));

  const asks = Array.from({ length: 6 }, (_, i) => {
    const price = parseFloat((bestAsk + i * spread * 0.8).toFixed(2));
    const size  = Math.floor(Math.random() * 2000) + 200;
    return { price, size, total: 0 };
  });

  const bids = Array.from({ length: 6 }, (_, i) => {
    const price = parseFloat((bestBid - i * spread * 0.8).toFixed(2));
    const size  = Math.floor(Math.random() * 2000) + 200;
    return { price, size, total: 0 };
  });

  let cumAsk = 0;
  asks.forEach(l => { cumAsk += l.size; l.total = cumAsk; });
  let cumBid = 0;
  bids.forEach(l => { cumBid += l.size; l.total = cumBid; });

  return { asks: asks.reverse(), bids, spread };
}

export function OrderBook({ symbol }: { symbol: string }) {
  const { state } = useMarket();
  const ticker = state.tickers[symbol];

  const book = useMemo(
    () => (ticker ? generateOrderBook(ticker.price) : null),
    // regenerate on each price change for a "live" feel
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticker?.price],
  );

  if (!book || !ticker) {
    return <div className="panel-header"><span className="panel-title">Order Book</span></div>;
  }

  const maxTotal = Math.max(book.asks[0]?.total ?? 0, book.bids[book.bids.length - 1]?.total ?? 0);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Order Book</span>
      </div>

      <div className="px-3 py-1 grid grid-cols-3 text-[10px] text-outline font-mono uppercase tracking-wider">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (sell side) */}
      <div className="flex flex-col-reverse">
        {book.asks.map((level, i) => (
          <OrderRow key={i} level={level} side="ask" maxTotal={maxTotal} />
        ))}
      </div>

      {/* Spread row */}
      <div className="px-3 py-1 border-y border-border flex items-center justify-between">
        <span className="font-mono text-[11px] text-on-surface font-medium">
          {ticker.price.toFixed(2)}
        </span>
        <span className="font-mono text-[10px] text-outline">
          SPREAD {book.spread.toFixed(2)}
        </span>
        <span className="font-mono text-[11px] text-on-surface font-medium">
          {book.asks[book.asks.length - 1]?.price.toFixed(2)}
        </span>
      </div>

      {/* Bids (buy side) */}
      <div>
        {book.bids.map((level, i) => (
          <OrderRow key={i} level={level} side="bid" maxTotal={maxTotal} />
        ))}
      </div>
    </div>
  );
}

function OrderRow({
  level,
  side,
  maxTotal,
}: {
  level: { price: number; size: number; total: number };
  side: 'ask' | 'bid';
  maxTotal: number;
}) {
  const pct = Math.min((level.total / maxTotal) * 100, 100);
  const color = side === 'ask' ? 'rgba(255,83,82,0.1)' : 'rgba(19,255,67,0.1)';
  const textColor = side === 'ask' ? 'text-loss' : 'text-gain';

  return (
    <div
      className="relative px-3 py-[3px] grid grid-cols-3 text-[11px] font-mono hover:bg-surface-high cursor-default"
      style={{
        background: `linear-gradient(to left, ${color} ${pct}%, transparent ${pct}%)`,
      }}
    >
      <span className={textColor}>{level.price.toFixed(2)}</span>
      <span className="text-right text-on-surface-muted">{level.size.toLocaleString()}</span>
      <span className="text-right text-on-surface-muted">{level.total.toLocaleString()}</span>
    </div>
  );
}
