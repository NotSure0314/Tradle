## Task 3: Indicator Calculations — DONE

### What was done
- Created `src/lib/indicators.ts` with 7 exported functions:
  - `calcSMA` — Simple Moving Average
  - `calcEMA` — Exponential Moving Average
  - `calcBollingerBands` — Bollinger Bands (upper, middle, lower)
  - `calcRSI` — Relative Strength Index
  - `calcMACD` — MACD line, signal line, histogram
  - `calcVolume` — Volume bars with color
  - Internal helper: `calcEMAVals` for MACD signal line

### Test results
- `npm run build` passed — compiled successfully, no type errors.

### Commits
- `b27cdf9` — `feat: add SMA, EMA, Bollinger Bands, RSI, MACD, Volume calculations`

### Concerns
None.
