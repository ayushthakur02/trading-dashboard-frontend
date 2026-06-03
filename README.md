# Trading Dashboard — Frontend

A real-time trading dashboard built with React and TypeScript. Streams live price updates via WebSocket and visualises them with interactive charts.

## Features

- **Dashboard** — candlestick chart (lightweight-charts) with live WebSocket ticks, order book, and order entry panel
- **Watchlist** — all tickers with live price updates and colour-flash animations on change
- **History** — comparative multi-series chart (Recharts) across selected tickers with OHLCV archive table and aggregate metrics

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- [lightweight-charts](https://github.com/tradingview/lightweight-charts) for candlestick rendering
- Recharts for comparative line charts

## Getting Started

Make sure the [backend service](https://github.com/ayushthakur02/trading-dashboard-backend) is running on port 4000 first.

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`. Vite proxies `/api` and `/ws` to the backend automatically.

## Project Structure

```
src/
├── context/        # MarketContext — shared live price state
├── hooks/          # useWebSocket, useTickers, useHistory
├── services/       # REST API client
├── pages/
│   ├── Dashboard/  # Chart, OrderBook, OrderEntry
│   ├── Watchlist/
│   └── History/
└── components/
    └── Layout/     # Sidebar + Layout wrapper
```

## Environment

No environment variables required for development. The Vite dev server proxies all requests to `localhost:4000`.
