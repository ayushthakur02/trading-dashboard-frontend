import { useState, type FormEvent } from 'react';
import { useAlerts } from '../../context/AlertContext';

interface Props {
  symbol: string;
  currentPrice: number;
  onClose: () => void;
}

export function AlertModal({ symbol, currentPrice, onClose }: Props) {
  const { alerts, addAlert, removeAlert } = useAlerts();
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState(currentPrice.toFixed(2));

  const symbolAlerts = alerts.filter(a => a.symbol === symbol);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const value = parseFloat(threshold);
    if (isNaN(value) || value <= 0) return;
    addAlert(symbol, condition, value);
    setThreshold(currentPrice.toFixed(2));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="panel rounded-md w-[360px] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header">
          <span className="panel-title">Price Alerts — {symbol}</span>
          <button onClick={onClose} className="text-outline hover:text-on-surface text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleAdd} className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-body text-outline tracking-widest uppercase mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as 'above' | 'below')}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-mono
                           text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="above">Price above</option>
                <option value="below">Price below</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-body text-outline tracking-widest uppercase mb-1.5">
                Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-mono
                           text-on-surface focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-1.5">
            Add Alert
          </button>
        </form>

        {symbolAlerts.length > 0 && (
          <div className="border-t border-border">
            <p className="px-4 py-2 text-[10px] font-body text-outline tracking-widest uppercase">
              Active Alerts
            </p>
            <div className="pb-2">
              {symbolAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-4 py-1.5 hover:bg-surface-low"
                >
                  <span className="font-mono text-xs text-on-surface-muted">
                    {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold.toFixed(2)}
                    {alert.triggered && (
                      <span className="ml-2 text-[9px] text-outline uppercase tracking-wider">triggered</span>
                    )}
                  </span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-outline hover:text-loss text-xs transition-colors"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
