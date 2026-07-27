import type { Candle } from "./types";

export function atrPct(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) {
    return 0;
  }

  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i]!.high;
    const low = candles[i]!.low;
    const prevClose = candles[i - 1]!.close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
    trs.push(tr);
  }

  const recent = trs.slice(trs.length - period);
  const avgTr = recent.reduce((a, b) => a + b, 0) / period;
  const price = candles[candles.length - 1]!.close;
  return price > 0 ? avgTr / price : 0;
}
