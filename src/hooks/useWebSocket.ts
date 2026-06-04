import { useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import type { WsOutgoingMessage } from '../types/market';

const SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'BTC-USD', 'ETH-USD'];

function getWsUrl(): string {
  const token = localStorage.getItem('td_token') ?? '';
  return `ws://${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}

export function useWebSocket() {
  const { dispatch } = useMarket();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function connect() {
      const socket = new WebSocket(getWsUrl());
      ws.current = socket;

      socket.onopen = () => {
        dispatch({ type: 'CONNECTION', payload: true });
        socket.send(JSON.stringify({ action: 'subscribe', symbols: SYMBOLS }));
      };

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as WsOutgoingMessage;
          if (msg.type === 'tick') {
            dispatch({
              type: 'TICK',
              payload: {
                symbol: msg.symbol,
                name: '',
                price: msg.price,
                change: msg.change,
                changePercent: msg.changePercent,
                volume: msg.volume,
                timestamp: msg.timestamp,
              },
            });
          }
        } catch {
          // skip bad frames
        }
      };

      socket.onclose = () => {
        dispatch({ type: 'CONNECTION', payload: false });
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      socket.onerror = () => socket.close();
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [dispatch]);
}
