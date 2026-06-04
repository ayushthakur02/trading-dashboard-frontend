# trading-dashboard-frontend

React + TypeScript frontend for the real-time trading dashboard. Connects to the backend WebSocket feed and displays live candlestick charts, an order book, a watchlist with flash animations, historical price comparison charts, and price threshold alerts.

> Last updated: 5 June 2026, 01:58 AM IST

---

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (custom design system — dark terminal aesthetic)
- [lightweight-charts](https://github.com/tradingview/lightweight-charts) — candlestick chart
- Recharts — comparative line charts on the History page
- React Router v7

---

## Prerequisites

- Node.js 20+ and npm
- [trading-dashboard-backend](https://github.com/ayushthakur02/trading-dashboard-backend) running on port 4000
- Docker + Docker Compose (optional)

---

## Setup & Running

### Local development

```bash
# 1. Clone the repo
git clone https://github.com/ayushthakur02/trading-dashboard-frontend.git
cd trading-dashboard-frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

App runs on `http://localhost:3000`. Vite proxies `/api` and `/ws` to `localhost:4000` automatically — no extra config needed.

Make sure the backend is already running before you open the browser, otherwise the WebSocket connection will fail and prices won't load.

### Build for production

```bash
npm run build    # type-checks and bundles to dist/
npm run preview  # serves the production build locally
```

### Running with Docker

```bash
docker build -t trading-frontend .
docker run -p 3000:80 trading-frontend
```

For the full stack setup see the [backend README](https://github.com/ayushthakur02/trading-dashboard-backend).

---

## Auth

The app requires login before accessing any page. Use the demo credentials on the login screen:

```
trader / trade123
admin  / admin123
```

The JWT token is stored in `localStorage` and sent as a `Bearer` header on all API requests and as a query param on the WebSocket connection.

---

## Pages

### Dashboard `/`
Live candlestick chart for the selected ticker (lightweight-charts, updates on every WebSocket tick). Simulated order book with depth visualisation. Order entry panel with Limit / Market / Stop modes. Active orders table at the bottom. Switch tickers from the header bar.

### Watchlist `/watchlist`
All 8 tickers in a sortable table. Prices flash green or red on every change. Click the bell icon on any row to set a price threshold alert.

### History `/history`
Add up to 4 tickers to compare on a multi-series line chart. Aggregate metrics panel on the right (total volume, 30-day volatility, correlation coefficient). Daily OHLCV archive table at the bottom.

---

## Price Alerts

Set above/below threshold alerts from the Watchlist. When a ticker crosses the threshold a toast notification slides in from the top right and auto-dismisses after 6 seconds. Alerts are persisted in `localStorage` and survive page refreshes. Triggered alerts are marked and won't re-fire.

---

## Docker

```bash
docker build -t trading-frontend .
docker run -p 3000:80 trading-frontend
```

The nginx config inside the container proxies `/api` and `/ws` to `http://backend:4000`, so it expects the backend container to be reachable under that hostname (handled automatically by docker-compose).

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── AppInit.tsx                  # Initialises WebSocket + tickers fetch
├── context/
│   ├── MarketContext.tsx         # Live price state (useReducer)
│   └── AlertContext.tsx          # Price alerts state
├── hooks/
│   ├── useWebSocket.ts           # WS lifecycle + auto-reconnect
│   ├── useTickers.ts             # Initial REST fetch
│   └── useHistory.ts             # Per-symbol OHLCV fetch
├── services/
│   └── api.ts                    # Fetch wrapper with auth header
├── components/
│   ├── Layout/                   # Sidebar + Layout
│   ├── ProtectedRoute.tsx
│   └── Alerts/                   # AlertModal + AlertToasts
└── pages/
    ├── Login/
    ├── Dashboard/                # PriceChart, OrderBook, OrderEntry
    ├── Watchlist/
    └── History/
```
