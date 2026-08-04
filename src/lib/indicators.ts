import type { Candle } from "@/lib/types";

export function calcSMA(candles: Candle[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j]!.close;
    }
    result.push({ time: candles[i]!.time, value: sum / period });
  }
  return result;
}

export function calcEMA(candles: Candle[], period: number): { time: number; value: number }[] {
  const k = 2 / (period + 1);
  const result: { time: number; value: number }[] = [];
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  result.push({ time: candles[period - 1]!.time, value: ema });
  for (let i = period; i < candles.length; i++) {
    ema = candles[i]!.close * k + ema * (1 - k);
    result.push({ time: candles[i]!.time, value: ema });
  }
  return result;
}

export function calcBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2,
): { upper: { time: number; value: number }[]; middle: { time: number; value: number }[]; lower: { time: number; value: number }[] } {
  const middle = calcSMA(candles, period);
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + (c.close - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    const mid = middle[i - period + 1]!;
    upper.push({ time: candles[i]!.time, value: mid.value + stdDev * std });
    lower.push({ time: candles[i]!.time, value: mid.value - stdDev * std });
  }
  return { upper, middle, lower };
}

export function calcRSI(candles: Candle[], period: number = 14): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i]!.close - candles[i - 1]!.close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  let avgGain = gains.slice(0, period).reduce((s, g) => s + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, l) => s + l, 0) / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: candles[period]!.time, value: 100 - 100 / (1 + rs) });
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]!) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]!) / period;
    const r = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: candles[i + 1]!.time, value: 100 - 100 / (1 + r) });
  }
  return result;
}

export function calcMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): { macd: { time: number; value: number }[]; signal: { time: number; value: number }[]; histogram: { time: number; value: number }[] } {
  const fastEMA = calcEMA(candles, fastPeriod);
  const slowEMA = calcEMA(candles, slowPeriod);
  const macdLine: { time: number; value: number }[] = [];
  const offset = slowPeriod - fastPeriod;
  for (let i = 0; i < slowEMA.length; i++) {
    const fast = fastEMA[i + offset];
    if (fast) {
      macdLine.push({ time: slowEMA[i]!.time, value: fast.value - slowEMA[i]!.value });
    }
  }
  const signalLine = calcEMAVals(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => {
    const s = signalLine[i];
    return { time: m.time, value: s ? m.value - s.value : 0 };
  });
  return { macd: macdLine, signal: signalLine, histogram };
}

function calcEMAVals(data: { time: number; value: number }[], period: number): { time: number; value: number }[] {
  const k = 2 / (period + 1);
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;
  let ema = data.slice(0, period).reduce((s, d) => s + d.value, 0) / period;
  result.push({ time: data[period - 1]!.time, value: ema });
  for (let i = period; i < data.length; i++) {
    ema = data[i]!.value * k + ema * (1 - k);
    result.push({ time: data[i]!.time, value: ema });
  }
  return result;
}

export function calcVolume(candles: Candle[]): { time: number; value: number; color: string }[] {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume ?? 0,
    color: c.close >= c.open ? "rgba(52, 211, 153, 0.5)" : "rgba(248, 113, 113, 0.5)",
  }));
}
