import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { useMarket } from '../../context/MarketContext';
import { useHistory } from '../../hooks/useHistory';
import type { Candle } from '../../types/market';

const ALL_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'BTC-USD', 'ETH-USD'];
const LINE_COLORS = ['#b3c5ff', '#13ff43', '#ff5352', '#ffd700', '#c084fc', '#fb923c', '#22d3ee', '#f472b6'];
const INTERVALS = ['1D', '1W', '1M', 'YTD', 'MAX'] as const;

// Each symbol's history fetched at the top level (fixed set, no hooks-in-loop)
function useAllHistories() {
  const h0 = useHistory(ALL_SYMBOLS[0]!);
  const h1 = useHistory(ALL_SYMBOLS[1]!);
  const h2 = useHistory(ALL_SYMBOLS[2]!);
  const h3 = useHistory(ALL_SYMBOLS[3]!);
  const h4 = useHistory(ALL_SYMBOLS[4]!);
  const h5 = useHistory(ALL_SYMBOLS[5]!);
  const h6 = useHistory(ALL_SYMBOLS[6]!);
  const h7 = useHistory(ALL_SYMBOLS[7]!);

  return useMemo<Record<string, Candle[]>>(() => ({
    [ALL_SYMBOLS[0]!]: h0.candles,
    [ALL_SYMBOLS[1]!]: h1.candles,
    [ALL_SYMBOLS[2]!]: h2.candles,
    [ALL_SYMBOLS[3]!]: h3.candles,
    [ALL_SYMBOLS[4]!]: h4.candles,
    [ALL_SYMBOLS[5]!]: h5.candles,
    [ALL_SYMBOLS[6]!]: h6.candles,
    [ALL_SYMBOLS[7]!]: h7.candles,
  }), [h0.candles, h1.candles, h2.candles, h3.candles, h4.candles, h5.candles, h6.candles, h7.candles]);
}

export function History() {
  const { state } = useMarket();
  const allHistories = useAllHistories();

  const [selected, setSelected] = useState<string[]>(['AAPL', 'TSLA']);
  const [activeInterval, setActiveInterval] = useState('1M');
  const [searchInput, setSearchInput] = useState('');

  const chartData = useMemo(() => {
    const primary = selected[0];
    const baseCandies = allHistories[primary!] ?? [];
    if (!baseCandies.length) return [];

    return baseCandies.map((c, i) => {
      const point: Record<string, number | string> = {
        time: new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      for (const sym of selected) {
        const candle = allHistories[sym]?.[i];
        if (candle) point[sym] = candle.close;
      }
      return point;
    });
  }, [selected, allHistories]);

  const aggregateMetrics = useMemo(() => {
    const primary = selected[0];
    const candles = allHistories[primary!] ?? [];
    if (!candles.length) return null;

    const totalVolume = candles.reduce((s, c) => s + c.volume, 0);
    const closes = candles.map(c => c.close);
    const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
    const variance = closes.reduce((a, b) => a + (b - mean) ** 2, 0) / closes.length;
    const volatility = ((Math.sqrt(variance) / mean) * 100).toFixed(1);

    let correlation: number | null = null;
    if (selected.length >= 2) {
      const a = allHistories[selected[0]!]?.map(c => c.close) ?? [];
      const b = allHistories[selected[1]!]?.map(c => c.close) ?? [];
      const len = Math.min(a.length, b.length);
      if (len > 1) {
        const mA = a.slice(0, len).reduce((x, y) => x + y, 0) / len;
        const mB = b.slice(0, len).reduce((x, y) => x + y, 0) / len;
        const num = a.slice(0, len).reduce((s, v, i) => s + (v - mA) * (b[i]! - mB), 0);
        const dA = Math.sqrt(a.slice(0, len).reduce((s, v) => s + (v - mA) ** 2, 0));
        const dB = Math.sqrt(b.slice(0, len).reduce((s, v) => s + (v - mB) ** 2, 0));
        correlation = dA && dB ? parseFloat((num / (dA * dB)).toFixed(2)) : null;
      }
    }

    return {
      totalVolume,
      volatility,
      correlation,
      changePercent: state.tickers[primary!]?.changePercent ?? 0,
    };
  }, [selected, allHistories, state.tickers]);

  const archiveRows = useMemo(() =>
    selected
      .flatMap(sym => (allHistories[sym] ?? []).slice(-3).reverse().map(c => ({ ...c, symbol: sym })))
      .sort((a, b) => b.time - a.time),
    [selected, allHistories],
  );

  const addTicker = (sym: string) => {
    if (!selected.includes(sym) && selected.length < 4) setSelected(prev => [...prev, sym]);
    setSearchInput('');
  };

  const removeTicker = (sym: string) => setSelected(prev => prev.filter(s => s !== sym));

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-3 shrink-0 flex-wrap">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter' && searchInput.trim()) addTicker(searchInput.trim()); }}
          placeholder="Add Tickers (e.g., AAPL, TSLA...)"
          className="bg-background border border-border rounded px-3 py-1 text-xs font-mono text-on-surface
                     focus:border-primary focus:outline-none w-52 placeholder:text-outline"
        />
        <div className="flex gap-0.5">
          {INTERVALS.map(iv => (
            <button
              key={iv}
              onClick={() => setActiveInterval(iv)}
              className={`px-2.5 py-1 text-[11px] font-body rounded transition-colors ${
                activeInterval === iv
                  ? 'bg-primary-container text-white'
                  : 'text-outline hover:text-on-surface border border-border'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost flex items-center gap-1.5"><DownloadIcon /> CSV</button>
          <button className="btn-ghost flex items-center gap-1.5"><CodeIcon /> JSON</button>
        </div>
      </div>

      {/* Ticker chips */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 shrink-0 relative">
        {selected.map((sym, i) => (
          <span
            key={sym}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border"
            style={{ borderColor: LINE_COLORS[i], color: LINE_COLORS[i] }}
          >
            {sym}
            <button onClick={() => removeTicker(sym)} className="hover:opacity-60 leading-none text-sm">×</button>
          </span>
        ))}
        <div className="relative">
          <button
            onClick={() => setSearchInput(searchInput ? '' : ' ')}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-border text-outline hover:border-primary hover:text-primary transition-colors"
          >
            + ADD TICKER
          </button>
          {searchInput.trim() && (
            <div className="absolute top-full left-0 mt-1 bg-surface-high border border-border rounded shadow-lg z-20 min-w-[140px]">
              {ALL_SYMBOLS.filter(s => s.includes(searchInput.trim()) && !selected.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addTicker(s)}
                  className="block w-full text-left px-3 py-1.5 text-xs font-mono text-on-surface-muted hover:bg-surface-highest hover:text-on-surface"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: chart + archive */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <div className="flex-1 p-3 overflow-hidden">
            <div className="panel-header mb-3">
              <span className="panel-title">Comparative Performance</span>
              <DotsIcon />
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="86%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#424655" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#8c90a1', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={{ stroke: '#424655' }}
                  />
                  <YAxis
                    tick={{ fill: '#8c90a1', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2024',
                      border: '1px solid #424655',
                      borderRadius: 4,
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                      color: '#e2e2e8',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#8c90a1' }} />
                  {selected.map((sym, i) => (
                    <Line
                      key={sym}
                      type="monotone"
                      dataKey={sym}
                      stroke={LINE_COLORS[i]}
                      dot={false}
                      strokeWidth={1.5}
                      activeDot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[80%]">
                <span className="font-mono text-xs text-outline animate-pulse">Loading chart data...</span>
              </div>
            )}
          </div>

          {/* Daily Archive */}
          <div className="border-t border-border shrink-0 max-h-[240px] overflow-auto">
            <div className="panel-header sticky top-0 bg-background z-10">
              <span className="panel-title">Daily Archive</span>
              <span className="text-[10px] font-body text-outline">ROWS: {archiveRows.length}</span>
            </div>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Ticker', 'Open', 'High', 'Low', 'Close', 'Volume'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left text-[10px] font-body text-outline tracking-wider font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archiveRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-surface-low">
                    <td className="px-3 py-1.5 text-on-surface-muted whitespace-nowrap">
                      {new Date(row.time).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-3 py-1.5 text-primary">{row.symbol}</td>
                    <td className="px-3 py-1.5 text-on-surface-muted">{row.open.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-on-surface-muted">{row.high.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-on-surface-muted">{row.low.toFixed(2)}</td>
                    <td className={`px-3 py-1.5 ${row.close >= row.open ? 'text-gain' : 'text-loss'}`}>
                      {row.close.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 text-on-surface-muted">{row.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: aggregate metrics */}
        <div className="w-[260px] shrink-0 flex flex-col">
          <div className="panel-header border-b border-border">
            <span className="panel-title">Aggregate Metrics</span>
            <DotsIcon />
          </div>
          {aggregateMetrics ? (
            <div className="divide-y divide-border">
              <MetricCard
                label={`Total Volume (${activeInterval})`}
                value={formatVolume(aggregateMetrics.totalVolume)}
                change={`↑${Math.abs(aggregateMetrics.changePercent).toFixed(1)}%`}
                positive
              />
              <MetricCard
                label="Avg Volatility (30D)"
                value={`${aggregateMetrics.volatility}%`}
                change="↓1.1%"
                positive={false}
              />
              {aggregateMetrics.correlation !== null && (
                <MetricCard
                  label={`Correlation Coef (${selected[0]}/${selected[1]})`}
                  value={aggregateMetrics.correlation.toString()}
                  badge={correlationLabel(aggregateMetrics.correlation)}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 p-4">
              <span className="font-mono text-xs text-outline text-center">Select tickers to compute metrics</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label, value, change, positive, badge,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  badge?: string;
}) {
  return (
    <div className="px-4 py-5">
      <p className="font-body text-[10px] text-outline tracking-widest uppercase mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="font-headline text-xl font-bold text-on-surface">{value}</span>
        {change && (
          <span className={`font-mono text-xs ${positive ? 'text-gain' : 'text-loss'}`}>{change}</span>
        )}
        {badge && <span className="font-body text-[10px] text-outline tracking-wider">{badge}</span>}
      </div>
    </div>
  );
}

function correlationLabel(r: number): string {
  const a = Math.abs(r);
  if (a >= 0.8) return 'STRONG';
  if (a >= 0.5) return 'MODERATE';
  return 'WEAK';
}

function formatVolume(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString();
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8M5 7l3 3 3-3M2 13h12" strokeLinecap="round" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="5,4 1,8 5,12" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="11,4 15,8 11,12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12" cy="8" r="1.2" />
    </svg>
  );
}
