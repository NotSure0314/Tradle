import universe from "@/data/universe.json";
import { atrPct } from "./atr";
import { nyDateKey, pickN, seededRng } from "./date";
import type { Candle, FullPuzzle, VisiblePuzzle } from "./types";
import { fetchRecentDailyOhlc } from "./yahoo";
import { getOrGenerateFixtures } from "./fixtures";

const HORIZONS = [5, 10, 20] as const;
const VISIBLE_BARS = 90;
const MIN_TAIL_BARS = 25;

const cache = new Map<string, { date: string; puzzles: FullPuzzle[] }>();

function slicePuzzle(
  ticker: string,
  candles: Candle[],
  visibleEndIndex: number,
  horizonDays: number,
  roundIndex: number,
): FullPuzzle | null {
  const visibleStart = visibleEndIndex - VISIBLE_BARS + 1;
  if (visibleStart < 0) return null;

  const targetIndex = visibleEndIndex + horizonDays;
  if (targetIndex >= candles.length) return null;

  const visibleCandles = candles.slice(visibleStart, visibleEndIndex + 1);
  const futureCandles = candles.slice(visibleEndIndex + 1, targetIndex + 1);
  if (visibleCandles.length < VISIBLE_BARS || futureCandles.length < horizonDays) {
    return null;
  }

  const lastClose = visibleCandles[visibleCandles.length - 1]!.close;
  const actualClose = futureCandles[futureCandles.length - 1]!.close;

  return {
    roundIndex,
    ticker,
    horizonDays,
    visibleCandles,
    futureCandles,
    lastClose,
    actualClose,
    atrPct: atrPct(visibleCandles),
  };
}

function buildFromCandles(
  tickerCandles: Map<string, Candle[]>,
  rng: () => number,
): FullPuzzle[] {
  const tickers = pickN(universe as string[], 12, rng);
  const puzzles: FullPuzzle[] = [];

  for (let round = 0; round < 5 && tickers.length > 0; round++) {
    const horizon = HORIZONS[round % HORIZONS.length]!;
    let placed: FullPuzzle | null = null;

    for (let attempt = 0; attempt < tickers.length && !placed; attempt++) {
      const ticker = tickers[(round + attempt) % tickers.length]!;
      const candles = tickerCandles.get(ticker);
      if (!candles || candles.length < VISIBLE_BARS + MIN_TAIL_BARS) continue;

      const maxEnd = candles.length - Math.max(...HORIZONS) - 1;
      const minEnd = VISIBLE_BARS - 1;
      if (maxEnd <= minEnd) continue;

      const endIndex = minEnd + Math.floor(rng() * (maxEnd - minEnd + 1));
      placed = slicePuzzle(ticker, candles, endIndex, horizon, round);
    }

    if (placed) puzzles.push(placed);
  }

  return puzzles;
}

export async function getDailySet(
  date = nyDateKey(),
): Promise<{ date: string; puzzles: FullPuzzle[] }> {
  const cached = cache.get(date);
  if (cached) return cached;

  const rng = seededRng(`tradle:${date}`);
  const candidateTickers = pickN(universe as string[], 15, rng);

  const tickerCandles = new Map<string, Candle[]>();

  await Promise.all(
    candidateTickers.map(async (ticker) => {
      try {
        const candles = await fetchRecentDailyOhlc(ticker, 500);
        if (candles.length > 0) {
          tickerCandles.set(ticker, candles);
        }
      } catch {
      }
    }),
  );

  let puzzles = buildFromCandles(tickerCandles, seededRng(`tradle:${date}`));

  if (puzzles.length < 5) {
    const fallback = getOrGenerateFixtures(candidateTickers);
    puzzles = buildFromCandles(fallback, seededRng(`tradle-fixture:${date}`));
  }

  if (puzzles.length < 5) {
    const base = getOrGenerateFixtures(
      ["SPY", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL"],
    );
    puzzles = [];
    for (let r = 0; r < 5; r++) {
      const horizon = HORIZONS[r % HORIZONS.length]!;
      const end = 495 - MIN_TAIL_BARS - r * 3 - 1;
      const spyCandles = base.get("SPY")!;
      if (end >= VISIBLE_BARS && end + horizon < spyCandles.length) {
        const p = slicePuzzle("SPY", spyCandles, end, horizon, r);
        if (p) puzzles.push(p);
      }
    }
  }

  const result = { date, puzzles: puzzles.slice(0, 5) };
  cache.set(date, result);
  return result;
}

export function toPublicPuzzle(p: FullPuzzle): VisiblePuzzle {
  return {
    roundIndex: p.roundIndex,
    ticker: p.ticker,
    horizonDays: p.horizonDays,
    visibleCandles: p.visibleCandles,
    lastClose: p.lastClose,
    atrPct: p.atrPct,
  };
}
