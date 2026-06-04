import { useEffect } from 'react';
import { useAlerts } from '../../context/AlertContext';

export function AlertToasts() {
  const { toasts, dismissToast } = useAlerts();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: { id: string; symbol: string; condition: 'above' | 'below'; threshold: number };
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 bg-surface border-l-4 border-primary
                 rounded shadow-lg px-4 py-3 min-w-[280px] animate-slide-in"
    >
      <div className="mt-0.5">
        <BellIcon />
      </div>
      <div className="flex-1">
        <p className="font-headline text-xs font-semibold text-on-surface">
          Price Alert — {toast.symbol}
        </p>
        <p className="font-mono text-[11px] text-on-surface-muted mt-0.5">
          {toast.symbol} is now {toast.condition} ${toast.threshold.toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-outline hover:text-on-surface transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#b3c5ff" strokeWidth="1.5">
      <path d="M8 1.5a5 5 0 0 1 5 5v3l1.5 2h-13L3 9.5v-3a5 5 0 0 1 5-5z" strokeLinejoin="round" />
      <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
    </svg>
  );
}
