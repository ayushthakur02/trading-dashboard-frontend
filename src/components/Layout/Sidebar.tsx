import { NavLink } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: DashboardIcon },
  { to: '/watchlist', label: 'Watchlist',  icon: WatchlistIcon },
  { to: '/history',   label: 'History',    icon: HistoryIcon },
];

export function Sidebar() {
  const { state } = useMarket();

  return (
    <aside className="w-[200px] shrink-0 flex flex-col border-r border-border bg-background h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-border">
        <p className="font-headline text-sm font-bold text-on-surface tracking-tight">
          TRADING ENGINE
        </p>
        <p className="font-mono text-[10px] text-outline mt-0.5">V2.4.0-STABLE</p>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-xs font-body transition-colors duration-100 ${
                isActive
                  ? 'text-on-surface bg-surface-high border-r-2 border-primary'
                  : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-low'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border space-y-3">
        <button className="flex items-center gap-3 px-0 py-1 text-xs font-body text-on-surface-muted hover:text-on-surface w-full transition-colors duration-100">
          <SupportIcon />
          Support
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${state.connected ? 'bg-gain' : 'bg-loss'}`}
            style={{ boxShadow: state.connected ? '0 0 6px #13ff43' : '0 0 6px #ff5352' }}
          />
          <span className="font-mono text-[10px] text-outline">
            {state.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" opacity=".9" />
      <rect x="9" y="1" width="6" height="6" rx="1" opacity=".9" />
      <rect x="1" y="9" width="6" height="6" rx="1" opacity=".9" />
      <rect x="9" y="9" width="6" height="6" rx="1" opacity=".9" />
    </svg>
  );
}

function WatchlistIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="2,12 6,7 10,9 14,4" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <polyline points="8,4 8,8 11,10" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M6 6a2 2 0 1 1 2 2v1" strokeLinecap="round" />
      <circle cx="8" cy="12" r=".5" fill="currentColor" />
    </svg>
  );
}
