// src/lib/indicatorStore.ts

export type IndicatorName =
  | "sma20" | "sma50" | "sma200"
  | "ema12" | "ema26"
  | "bb" | "volume" | "rsi" | "macd";

export type IndicatorState = Record<IndicatorName, boolean>;

const STORAGE_KEY = "tradle-indicators";

const DEFAULTS: IndicatorState = {
  sma20: false, sma50: false, sma200: false,
  ema12: false, ema26: false,
  bb: false, volume: false, rsi: false, macd: false,
};

export function getIndicators(): IndicatorState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function setIndicator(name: IndicatorName, enabled: boolean): void {
  const state = getIndicators();
  state[name] = enabled;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}