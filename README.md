# Tradle Cursor

A daily trading puzzle powered by real market data. Analyze charts, predict price targets, and compete for the top spot.

## How It Works

- **5 rounds** per day, each with a different asset
- **View 90 days** of historical OHLC candle data
- **Predict the close price** N trading days out (5, 10, or 20 day horizons)
- **Score based on** direction accuracy and magnitude — bigger moves = more points
- **Same puzzle for everyone**, resets daily at midnight ET

## Scoring

Scores are calculated using normalized error against ATR (Average True Range):

- **Direction bonus**: Correctly predicting up/down doubles your accuracy score
- **Magnitude multiplier**: Calling big moves correctly earns up to 3x
- **Perfect score**: A precise call in the right direction on a volatile move

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- [Vitest](https://vitest.dev/)
- Data via [Yahoo Finance API](https://query1.finance.yahoo.com/v8/finance/chart)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Asset Universe

60+ assets across US equities, ETFs, sectors, and crypto (BTC-USD, ETH-USD, SOL-USD). Each daily puzzle selects 5 random assets seeded by the date.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── daily/route.ts   # GET today's puzzles
│   │   └── resolve/route.ts # resolve a round
│   ├── play/page.tsx        # game page
│   ├── page.tsx             # landing page
│   ├── layout.tsx           # root layout
│   └── globals.css          # global styles
├── components/
│   ├── GameClient.tsx       # main game logic
│   ├── GameOver.tsx         # final results screen
│   ├── Leaderboard.tsx      # daily & all-time rankings
│   ├── PredictionInput.tsx  # price prediction form
│   ├── PuzzleChart.tsx      # OHLC chart
│   └── RoundResult.tsx      # round score breakdown
├── data/
│   └── universe.json        # tradable assets
└── lib/
    ├── atr.ts               # ATR calculation
    ├── daily.ts             # daily puzzle generation
    ├── date.ts              # date utilities
    ├── fixtures.ts          # fallback candle data
    ├── scoring.ts           # scoring engine
    ├── scoring.test.ts      # scoring tests
    ├── storage.ts           # localStorage leaderboard
    ├── types.ts             # shared types
    └── yahoo.ts             # Yahoo Finance fetcher
```
