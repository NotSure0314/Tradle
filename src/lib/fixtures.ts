import type { Candle } from "./types";
import { readFileSync } from "fs";
import { join } from "path";

export function loadFixtureCandles(ticker: string): Candle[] | null {
  try {
    const filePath = join(process.cwd(), "src", "data", "fixtures", `${ticker}.json`);
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown[];
    if (!Array.isArray(data) || data.length === 0) return null;
    const candles = data as Candle[];
    candles.sort((a, b) => a.time - b.time);
    return candles;
  } catch {
    return null;
  }
}

export function generateSyntheticCandles(
  seed: number,
  count: number,
  startPrice = 200,
  vol = 0.015,
  startTime?: number,
): Candle[] {
  let price = startPrice;
  let t = startTime ?? 1735689600;

  const candles: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const r1 = Math.sin(seed * 9301 + i * 49297) * 0.5 + 0.5;
    const r2 = Math.cos(seed * 49297 + i * 9301) * 0.5 + 0.5;
    const r3 = Math.sin(seed * 381 + i * 781) * 0.5 + 0.5;
    const change = (r1 - 0.5) * 2 * vol;
    const open = price;
    const close = open * (1 + change);
    const hiMulti = 1 + r2 * vol * 0.8;
    const loMulti = 1 - (1 - r3) * vol * 0.8;
    const high = Math.max(open, close) * hiMulti;
    const low = Math.min(open, close) * loMulti;
    const volume = Math.floor(50000000 + r1 * 100000000);

    candles.push({
      time: t,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });

    price = close;
    t += 86400;
  }

  return candles;
}

export function getOrGenerateFixtures(
  tickers: string[],
): Map<string, Candle[]> {
  const map = new Map<string, Candle[]>();

  for (const t of tickers) {
    const fromFile = loadFixtureCandles(t);
    if (fromFile) {
      map.set(t, fromFile);
    } else {
      const seed = t.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      map.set(
        t,
        generateSyntheticCandles(seed, 500, seed % 100 === 0 ? 100 : 200 + (seed % 300)),
      );
    }
  }

  return map;
}
