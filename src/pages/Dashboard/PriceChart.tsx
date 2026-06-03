import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from 'lightweight-charts';
import type { Candle } from '../../types/market';
import { useMarket } from '../../context/MarketContext';

interface Props {
  candles: Candle[];
  symbol: string;
}

function toChartCandle(c: Candle): CandlestickData {
  return {
    time: Math.floor(c.time / 1000) as Time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

export function PriceChart({ candles, symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { state } = useMarket();

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#c2c6d8',
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#424655', style: LineStyle.Dotted },
        horzLines: { color: '#424655', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#b3c5ff', labelBackgroundColor: '#1e2024' },
        horzLine: { color: '#b3c5ff', labelBackgroundColor: '#1e2024' },
      },
      rightPriceScale: { borderColor: '#424655' },
      timeScale: { borderColor: '#424655', timeVisible: true, secondsVisible: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor:         '#13ff43',
      downColor:       '#ff5352',
      borderUpColor:   '#13ff43',
      borderDownColor: '#ff5352',
      wickUpColor:     '#13ff43',
      wickDownColor:   '#ff5352',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    seriesRef.current.setData(candles.map(toChartCandle));
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  useEffect(() => {
    const ticker = state.tickers[symbol];
    if (!seriesRef.current || !ticker) return;
    seriesRef.current.update({
      time: Math.floor(ticker.timestamp / 1000) as Time,
      open: ticker.price,
      high: ticker.price,
      low: ticker.price,
      close: ticker.price,
    });
  }, [state.tickers, symbol]);

  return <div ref={containerRef} className="w-full h-full" />;
}
