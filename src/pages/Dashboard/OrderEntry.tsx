import { useState } from 'react';
import { useMarket } from '../../context/MarketContext';

type OrderType = 'LIMIT' | 'MARKET' | 'STOP';

export function OrderEntry({ symbol }: { symbol: string }) {
  const { state } = useMarket();
  const ticker = state.tickers[symbol];
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  const currentPrice = ticker?.price ?? 0;
  const entryPrice = orderType === 'MARKET' ? currentPrice : parseFloat(price) || currentPrice;
  const totalValue = entryPrice * (parseFloat(amount) || 0);
  const estFee = totalValue * 0.001;

  const handleFill = (pct: number) => {
    const units = (10_000 * pct) / currentPrice;
    setAmount(units.toFixed(2));
  };

  const handleOrder = (side: 'BUY' | 'SELL') => {
    // In a real app this would hit an order endpoint
    // For demo, just reset the form
    alert(`${side} ${amount || 0} ${symbol} @ ${entryPrice.toFixed(2)} (${orderType})`);
    setAmount('');
    setPrice('');
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Order Entry</span>
        <button className="text-outline hover:text-on-surface transition-colors">
          <SettingsIcon />
        </button>
      </div>

      {/* Order type tabs */}
      <div className="flex border-b border-border">
        {(['LIMIT', 'MARKET', 'STOP'] as const).map(t => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-2 text-[11px] font-body font-medium tracking-wide transition-colors ${
              orderType === t
                ? 'text-on-surface border-b-2 border-primary -mb-px'
                : 'text-outline hover:text-on-surface-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 flex flex-col gap-3 flex-1">
        {/* Price input */}
        <div>
          <label className="block text-[10px] text-outline font-body tracking-wider uppercase mb-1">
            Price (USD)
          </label>
          <input
            type="number"
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-mono text-on-surface
                       focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
            placeholder={currentPrice.toFixed(2)}
            value={orderType === 'MARKET' ? currentPrice.toFixed(2) : price}
            onChange={e => setPrice(e.target.value)}
            disabled={orderType === 'MARKET'}
          />
        </div>

        {/* Amount input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-outline font-body tracking-wider uppercase">
              Amount (Shares)
            </label>
            <button
              className="text-[10px] text-primary font-body hover:opacity-80"
              onClick={() => handleFill(1)}
            >
              MAX
            </button>
          </div>
          <input
            type="number"
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-mono text-on-surface
                       focus:border-primary focus:outline-none transition-colors"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {/* Quick fill */}
        <div className="grid grid-cols-4 gap-1">
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <button
              key={pct}
              onClick={() => handleFill(pct)}
              className="btn-ghost py-1 text-[10px]"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-2 space-y-1">
          <div className="flex justify-between text-[11px] font-body">
            <span className="text-outline">Total Value</span>
            <span className="font-mono text-on-surface">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-[11px] font-body">
            <span className="text-outline">Est. Fee</span>
            <span className="font-mono text-on-surface-muted">
              ${estFee.toFixed(2)}
            </span>
          </div>
        </div>

        {/* BUY / SELL */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOrder('BUY')}
            className="py-2.5 rounded text-sm font-headline font-semibold text-background bg-gain
                       hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            BUY
          </button>
          <button
            onClick={() => handleOrder('SELL')}
            className="py-2.5 rounded text-sm font-headline font-semibold text-background bg-loss
                       hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            SELL
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41" strokeLinecap="round" />
    </svg>
  );
}
