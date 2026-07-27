# 📈 Tradle Cursor

> **Read the chart. Call the move.** 🎯

A daily trading puzzle powered by real market data. Analyze charts, predict price targets, and compete for the top spot.

---

## 🎮 How It Works

| Step | What happens |
|------|-------------|
| **1** | You're shown **90 days** of historical OHLC candles for a random asset |
| **2** | Predict the close price **N trading days out** (5, 10, or 20 day horizons) |
| **3** | Get scored on **direction accuracy × magnitude** — bigger moves = more points |
| **4** | Repeat for **5 rounds** with different assets |
| **5** | See your final score and rank on the **leaderboard** 🏆 |

Same puzzle for everyone. Resets daily at midnight ET. 🔄

## 🧮 Scoring

Scores are calculated using normalized error against **ATR** (Average True Range):

| Factor | Effect |
|--------|--------|
| ✅ **Direction bonus** | Correctly predict up/down → 2× accuracy score |
| 📊 **Magnitude multiplier** | Call big moves correctly → up to **3× multiplier** |
| 🎯 **Perfect call** | Precise prediction in the right direction on a volatile move = maximum points |

```
roundScore = directionCorrect ? accuracy × magnitude : accuracy × 0.15
```

## ⚡ Tech Stack

| What | Why |
|------|-----|
| ⚛️ **Next.js 15** (App Router) | Full-stack React framework |
| 🟦 **TypeScript** | Type safety everywhere |
| 🎨 **Tailwind CSS 4** | Utility-first styling |
| 📉 **Lightweight Charts** | TradingView's charting library |
| 🧪 **Vitest** | Unit tests |
| 📡 **Yahoo Finance API** | Real market data |

## 🚀 Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server
```

Open **[http://localhost:3000](http://localhost:3000)** and start predicting. ⚡

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🛠️ Start development server |
| `npm run build` | 📦 Build for production |
| `npm start` | 🚀 Start production server |
| `npm test` | 🧪 Run tests |
| `npm run test:watch` | 🔄 Run tests in watch mode |
| `npm run lint` | 🔍 Lint with ESLint |

## 🌐 Asset Universe

60+ tradable assets across:

- **🇺🇸 US Equities** — AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, JPM, JNJ, ...
- **📊 ETFs** — SPY, QQQ, IWM, DIA
- **🏭 Sectors** — Energy, Pharma, Tech, Consumer, Financials
- **₿ Crypto** — BTC-USD, ETH-USD, SOL-USD

Each daily puzzle selects **5 random assets** seeded by the date — everyone gets the same set. 🎲

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── daily/route.ts       # GET today's puzzles
│   │   └── resolve/route.ts     # Resolve a round
│   ├── play/page.tsx            # Game page 🎮
│   ├── page.tsx                 # Landing page 🏠
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── GameClient.tsx           # Main game logic 🧠
│   ├── GameOver.tsx             # Final results screen 🏁
│   ├── Leaderboard.tsx          # Daily & all-time rankings 🏆
│   ├── PredictionInput.tsx      # Price prediction form ✏️
│   ├── PuzzleChart.tsx          # OHLC chart 📉
│   └── RoundResult.tsx          # Round score breakdown 💯
├── data/
│   └── universe.json            # Tradable assets 🌐
└── lib/
    ├── atr.ts                   # ATR calculation 📐
    ├── daily.ts                 # Daily puzzle generation 🧩
    ├── date.ts                  # Date utilities 📅
    ├── fixtures.ts              # Fallback candle data
    ├── scoring.ts               # Scoring engine 🧮
    ├── scoring.test.ts          # Scoring tests 🧪
    ├── storage.ts               # localStorage leaderboard 💾
    ├── types.ts                 # Shared types
    └── yahoo.ts                 # Yahoo Finance fetcher 📡
```

---

<div align="center">
  <p><strong>📈 Tradle Cursor</strong> — <em>Sharpen your market instincts.</em></p>
  <p>
    <a href="https://github.com/NotSure0314/Tradle">GitHub</a> •
    <a href="#-tradle-cursor">Back to top ↑</a>
  </p>
</div>
