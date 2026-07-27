import type { Candle } from "./types";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
};

export async function fetchDailyOhlc(
  symbol: string,
  period1: number,
  period2: number,
): Promise<Candle[]> {
  const url = new URL(`${YAHOO_CHART}/${encodeURIComponent(symbol)}`);
  url.searchParams.set("interval", "1d");
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Tradle/0.1; +https://github.com/tradle)",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance error ${res.status} for ${symbol}`);
  }

  const data = (await res.json()) as YahooChartResponse;
  if (data.chart?.error) {
    throw new Error(
      data.chart.error.description ?? `Yahoo error for ${symbol}`,
    );
  }

  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0];
  if (!quote || timestamps.length === 0) {
    throw new Error(`No OHLC data for ${symbol}`);
  }

  const candles: Candle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i] ?? 0;
    if (
      open == null ||
      high == null ||
      low == null ||
      close == null ||
      !Number.isFinite(open) ||
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      !Number.isFinite(close)
    ) {
      continue;
    }
    candles.push({
      time: timestamps[i]!,
      open,
      high,
      low,
      close,
      volume: volume ?? 0,
    });
  }

  return candles;
}

export async function fetchRecentDailyOhlc(
  symbol: string,
  lookbackDays = 400,
): Promise<Candle[]> {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - lookbackDays * 24 * 60 * 60;
  return fetchDailyOhlc(symbol, period1, period2);
}
