# Chart Tools & Indicators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TradingView-style drawing tools and technical indicators to the chart, with drawings resetting each round and indicators persisting via localStorage.

**Architecture:** Extend `lightweight-charts` v5 using npm plugins (`lightweight-charts-drawing` for 68 drawing tools, `lightweight-charts-indicators` for technical indicators). Add a vertical toolbar component and indicator calculation utilities.

**Tech Stack:** Next.js 15, React 19, lightweight-charts v5, lightweight-charts-drawing, lightweight-charts-indicators, TypeScript, Tailwind CSS

## Global Constraints

- lightweight-charts v5.2.0 (already installed)
- React 19 (already installed)
- Tailwind CSS (already installed)
- Dark theme: background `#111113`, accent violet `#8b5cf6`
- All new components must be client components (`"use client"`)
- Drawings reset each round, indicators persist via localStorage

---

## File Structure

| File | Purpose |
|------|---------|
| `src/components/ChartToolbar.tsx` | Vertical toolbar with tool selection, indicator toggles, delete |
| `src/components/IndicatorPanel.tsx` | Modal/dropdown for toggling indicators on/off |
| `src/lib/indicators.ts` | Indicator calculation functions (SMA, EMA, RSI, MACD, Bollinger Bands) |
| `src/lib/indicatorStore.ts` | localStorage read/write for indicator preferences |
| `src/components/PuzzleChart.tsx` | Modified: integrate drawing plugins, indicators, expose chart API |
| `src/components/GameClient.tsx` | Modified: pass roundKey to PuzzleChart |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: none
- Produces: npm packages available for import

- [ ] **Step 1: Install drawing tools plugin**

Run: `npm install lightweight-charts-drawing`

- [ ] **Step 2: Install indicators plugin**

Run: `npm install lightweight-charts-indicators`

- [ ] **Step 3: Verify installation**

Run: `npm ls lightweight-charts-drawing lightweight-charts-indicators`
Expected: both packages listed with versions

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add lightweight-charts drawing and indicators plugins"
```

---

### Task 2: Create Indicator Store (localStorage persistence)

**Files:**
- Create: `src/lib/indicatorStore.ts`

**Interfaces:**
- Consumes: none
- Produces: `getIndicators()`, `setIndicator(name, enabled)`, `IndicatorState` type

- [ ] **Step 1: Create indicatorStore.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/indicatorStore.ts
git commit -m "feat: add indicator localStorage persistence"
```

---

### Task 3: Create Indicator Calculations

**Files:**
- Create: `src/lib/indicators.ts`

**Interfaces:**
- Consumes: `Candle` type from `@/lib/types`
- Produces: `calcSMA()`, `calcEMA()`, `calcBollingerBands()`, `calcRSI()`, `calcMACD()`, `calcVolume()` functions

- [ ] **Step 1: Create indicators.ts with SMA**

```typescript
// src/lib/indicators.ts
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
```

- [ ] **Step 2: Add EMA calculation**

Append to `src/lib/indicators.ts`:

```typescript
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
```

- [ ] **Step 3: Add Bollinger Bands calculation**

Append to `src/lib/indicators.ts`:

```typescript
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
```

- [ ] **Step 4: Add RSI calculation**

Append to `src/lib/indicators.ts`:

```typescript
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
```

- [ ] **Step 5: Add MACD calculation**

Append to `src/lib/indicators.ts`:

```typescript
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
```

- [ ] **Step 6: Add Volume calculation**

Append to `src/lib/indicators.ts`:

```typescript
export function calcVolume(candles: Candle[]): { time: number; value: number; color: string }[] {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume ?? 0,
    color: c.close >= c.open ? "rgba(52, 211, 153, 0.5)" : "rgba(248, 113, 113, 0.5)",
  }));
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/indicators.ts
git commit -m "feat: add SMA, EMA, Bollinger Bands, RSI, MACD, Volume calculations"
```

---

### Task 4: Create Indicator Panel Component

**Files:**
- Create: `src/components/IndicatorPanel.tsx`

**Interfaces:**
- Consumes: `getIndicators()`, `setIndicator()`, `IndicatorName` from `@/lib/indicatorStore`
- Produces: `<IndicatorPanel onClose={fn} />` component

- [ ] **Step 1: Create IndicatorPanel.tsx**

```tsx
// src/components/IndicatorPanel.tsx
"use client";

import { useState } from "react";
import { getIndicators, setIndicator, type IndicatorName } from "@/lib/indicatorStore";

const INDICATORS: { name: IndicatorName; label: string }[] = [
  { name: "sma20", label: "SMA 20" },
  { name: "sma50", label: "SMA 50" },
  { name: "sma200", label: "SMA 200" },
  { name: "ema12", label: "EMA 12" },
  { name: "ema26", label: "EMA 26" },
  { name: "bb", label: "Bollinger Bands" },
  { name: "volume", label: "Volume" },
  { name: "rsi", label: "RSI (14)" },
  { name: "macd", label: "MACD" },
];

type Props = { onClose: () => void; onChange: () => void };

export default function IndicatorPanel({ onClose, onChange }: Props) {
  const [state, setState] = useState(getIndicators);

  function toggle(name: IndicatorName) {
    const next = !state[name];
    setIndicator(name, next);
    setState((prev) => ({ ...prev, [name]: next }));
    onChange();
  }

  return (
    <div className="absolute left-full top-0 ml-2 glass-card p-3 w-52 z-50 space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Indicators</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-xs">✕</button>
      </div>
      {INDICATORS.map((ind) => (
        <button
          key={ind.name}
          onClick={() => toggle(ind.name)}
          className="flex items-center justify-between w-full px-2 py-1.5 rounded text-sm hover:bg-white/[0.06] transition-colors"
        >
          <span className="text-zinc-300">{ind.label}</span>
          <span className={`w-2 h-2 rounded-full ${state[ind.name] ? "bg-emerald-400" : "bg-zinc-600"}`} />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/IndicatorPanel.tsx
git commit -m "feat: add indicator toggle panel component"
```

---

### Task 5: Create Chart Toolbar Component

**Files:**
- Create: `src/components/ChartToolbar.tsx`

**Interfaces:**
- Consumes: none (tool selection is local state, communicated via callback)
- Produces: `<ChartToolbar activeTool={string} onSelectTool={fn} onOpenIndicators={fn} onDelete={fn} />` component

- [ ] **Step 1: Create ChartToolbar.tsx**

```tsx
// src/components/ChartToolbar.tsx
"use client";

import { useState } from "react";
import IndicatorPanel from "./IndicatorPanel";

export type DrawingTool =
  | "crosshair" | "trendline" | "ray" | "horizontalLine" | "horizontalRay"
  | "parallelChannel" | "pitchfork" | "fibRetracement" | "rectangle"
  | "text" | "brush" | "priceRange" | "magnet";

type Props = {
  activeTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  onIndicatorChange: () => void;
};

const Divider = () => <div className="h-px bg-white/[0.08] my-1" />;

function ToolButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
        active ? "bg-violet-500/20 text-violet-400" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {icon}
    </button>
  );
}

const CrosshairIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
  </svg>
);

const TrendlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 20L20 4" /><circle cx="4" cy="20" r="2" /><circle cx="20" cy="4" r="2" />
  </svg>
);

const RayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 20L20 4" /><circle cx="4" cy="20" r="2" />
  </svg>
);

const HorizontalLineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12h20" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const HorizontalRayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12h18" /><circle cx="4" cy="12" r="2" />
  </svg>
);

const ChannelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 8L20 4M4 16l12 4" /><circle cx="4" cy="8" r="1.5" /><circle cx="20" cy="4" r="1.5" /><circle cx="4" cy="16" r="1.5" />
  </svg>
);

const PitchforkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4v16M4 8l8-4 8 4" /><circle cx="4" cy="8" r="1.5" /><circle cx="12" cy="4" r="1.5" /><circle cx="20" cy="8" r="1.5" />
  </svg>
);

const FibIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16M4 20h16" /><path d="M4 10h16" strokeDasharray="2 2" /><path d="M4 14h16" strokeDasharray="2 2" /><circle cx="4" cy="4" r="1.5" /><circle cx="4" cy="20" r="1.5" />
  </svg>
);

const RectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="6" width="16" height="12" rx="1" />
  </svg>
);

const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 4h12M12 4v16" />
  </svg>
);

const BrushIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M14.06 6.19l3.75 3.75" />
  </svg>
);

const PriceRangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 17l4 4 4-4" /><path d="M6 12h12" />
  </svg>
);

const MagnetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2v6a6 6 0 0 0 12 0V2" /><path d="M6 8H2v4a2 2 0 0 0 2 2h2" /><path d="M18 8h4v4a2 2 0 0 1-2 2h-2" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6" /><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </svg>
);

const IndicatorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 4-8" />
  </svg>
);

export default function ChartToolbar({ activeTool, onSelectTool, onDelete, onIndicatorChange }: Props) {
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="relative flex flex-col items-center gap-0.5 p-1 rounded-lg bg-[#1a1a2e] border border-white/[0.06]">
      <ToolButton icon={<CrosshairIcon />} label="Crosshair" active={activeTool === "crosshair"} onClick={() => onSelectTool("crosshair")} />
      <Divider />
      <ToolButton icon={<TrendlineIcon />} label="Trend Line" active={activeTool === "trendline"} onClick={() => onSelectTool("trendline")} />
      <ToolButton icon={<RayIcon />} label="Ray" active={activeTool === "ray"} onClick={() => onSelectTool("ray")} />
      <ToolButton icon={<HorizontalLineIcon />} label="Horizontal Line" active={activeTool === "horizontalLine"} onClick={() => onSelectTool("horizontalLine")} />
      <ToolButton icon={<HorizontalRayIcon />} label="Horizontal Ray" active={activeTool === "horizontalRay"} onClick={() => onSelectTool("horizontalRay")} />
      <Divider />
      <ToolButton icon={<ChannelIcon />} label="Parallel Channel" active={activeTool === "parallelChannel"} onClick={() => onSelectTool("parallelChannel")} />
      <ToolButton icon={<PitchforkIcon />} label="Pitchfork" active={activeTool === "pitchfork"} onClick={() => onSelectTool("pitchfork")} />
      <Divider />
      <ToolButton icon={<FibIcon />} label="Fib Retracement" active={activeTool === "fibRetracement"} onClick={() => onSelectTool("fibRetracement")} />
      <ToolButton icon={<RectIcon />} label="Rectangle" active={activeTool === "rectangle"} onClick={() => onSelectTool("rectangle")} />
      <Divider />
      <ToolButton icon={<TextIcon />} label="Text" active={activeTool === "text"} onClick={() => onSelectTool("text")} />
      <ToolButton icon={<BrushIcon />} label="Brush" active={activeTool === "brush"} onClick={() => onSelectTool("brush")} />
      <ToolButton icon={<PriceRangeIcon />} label="Price Range" active={activeTool === "priceRange"} onClick={() => onSelectTool("priceRange")} />
      <Divider />
      <ToolButton icon={<MagnetIcon />} label="Magnet" active={activeTool === "magnet"} onClick={() => onSelectTool("magnet")} />
      <ToolButton icon={<DeleteIcon />} label="Delete" active={false} onClick={onDelete} />
      <Divider />
      <div className="relative">
        <ToolButton icon={<IndicatorIcon />} label="Indicators" active={showIndicators} onClick={() => setShowIndicators((p) => !p)} />
        {showIndicators && <IndicatorPanel onClose={() => setShowIndicators(false)} onChange={onIndicatorChange} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChartToolbar.tsx
git commit -m "feat: add vertical chart toolbar with drawing tool icons"
```

---

### Task 6: Integrate Drawing Plugin into PuzzleChart

**Files:**
- Modify: `src/components/PuzzleChart.tsx`

**Interfaces:**
- Consumes: `DrawingTool` from `@/components/ChartToolbar`, `IndicatorState` from `@/lib/indicatorStore`
- Produces: `onChartReady` callback exposing chart API for toolbar interaction

- [ ] **Step 1: Update PuzzleChart imports and props**

Replace the existing `PuzzleChart.tsx` with:

```tsx
// src/components/PuzzleChart.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type HistogramData,
} from "lightweight-charts";
import { TrendLine, DrawingManager } from "lightweight-charts-drawing";
import type { Candle } from "@/lib/types";
import type { DrawingTool } from "@/components/ChartToolbar";
import type { IndicatorName } from "@/lib/indicatorStore";
import { getIndicators } from "@/lib/indicatorStore";
import { calcSMA, calcEMA, calcBollingerBands, calcRSI, calcMACD, calcVolume } from "@/lib/indicators";

type Props = {
  candles: Candle[];
  prediction?: number;
  actual?: number;
  height?: number;
  roundKey: number;
  activeTool: DrawingTool;
  indicatorVersion: number;
};

const ACCENT = "#8b5cf6";

export default function PuzzleChart({
  candles, prediction, actual, height = 500, roundKey, activeTool, indicatorVersion,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const predRef = useRef<ISeriesApi<"Line"> | null>(null);
  const actualRef = useRef<ISeriesApi<"Line"> | null>(null);
  const drawingManagerRef = useRef<DrawingManager | null>(null);
  const indicatorSeriesRef = useRef<ISeriesApi<any>[]>([]);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#111113" },
        textColor: "#a1a1aa",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      width: containerRef.current.clientWidth,
      height,
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(167, 139, 250, 0.3)", labelBackgroundColor: "#6366f1" },
        horzLine: { color: "rgba(167, 139, 250, 0.3)", labelBackgroundColor: "#6366f1" },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    const drawingManager = new DrawingManager(chart);

    chartRef.current = chart;
    candleRef.current = series;
    drawingManagerRef.current = drawingManager;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      indicatorSeriesRef.current.forEach((s) => {
        try { chart.removeSeries(s); } catch {}
      });
      indicatorSeriesRef.current = [];
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      predRef.current = null;
      actualRef.current = null;
      drawingManagerRef.current = null;
    };
  }, [height]);

  // Set candle data
  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;
    series.setData(
      candles.map(
        (c): CandlestickData => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }),
      ),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Clear drawings on round change
  useEffect(() => {
    drawingManagerRef.current?.clear();
  }, [roundKey]);

  // Handle active tool changes
  useEffect(() => {
    const dm = drawingManagerRef.current;
    if (!dm) return;
    if (activeTool === "crosshair") {
      dm.setTool(null);
    } else if (activeTool === "trendline") {
      dm.setTool(TrendLine);
    }
    // Other tools will be wired as we add them
  }, [activeTool]);

  // Render indicators
  useEffect(() => {
    const chart = chartRef.current;
    const series = candleRef.current;
    if (!chart || !series) return;

    // Remove old indicator series
    indicatorSeriesRef.current.forEach((s) => {
      try { chart.removeSeries(s); } catch {}
    });
    indicatorSeriesRef.current = [];

    const indicators = getIndicators();

    // Overlay indicators on main chart
    if (indicators.sma20) {
      const data = calcSMA(candles, 20);
      const s = chart.addSeries(LineSeries, { color: "#3b82f6", lineWidth: 1, title: "SMA 20", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.sma50) {
      const data = calcSMA(candles, 50);
      const s = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1, title: "SMA 50", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.sma200) {
      const data = calcSMA(candles, 200);
      const s = chart.addSeries(LineSeries, { color: "#ef4444", lineWidth: 1, title: "SMA 200", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.ema12) {
      const data = calcEMA(candles, 12);
      const s = chart.addSeries(LineSeries, { color: "#06b6d4", lineWidth: 1, title: "EMA 12", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.ema26) {
      const data = calcEMA(candles, 26);
      const s = chart.addSeries(LineSeries, { color: "#8b5cf6", lineWidth: 1, title: "EMA 26", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.bb) {
      const bb = calcBollingerBands(candles);
      const upper = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.4)", lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false });
      const mid = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.7)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      const lower = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.4)", lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false });
      upper.setData(bb.upper as LineData[]);
      mid.setData(bb.middle as LineData[]);
      lower.setData(bb.lower as LineData[]);
      indicatorSeriesRef.current.push(upper, mid, lower);
    }
    if (indicators.volume) {
      const data = calcVolume(candles);
      const s = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false });
      s.setData(data as HistogramData[]);
      indicatorSeriesRef.current.push(s);
    }
  }, [candles, indicatorVersion]);

  // Prediction line
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (predRef.current) {
      chart.removeSeries(predRef.current);
      predRef.current = null;
    }
    if (prediction != null && candles.length > 0) {
      const lastTime = candles[candles.length - 1]!.time;
      const line = chart.addSeries(LineSeries, {
        color: ACCENT, lineWidth: 2, lineStyle: LineStyle.Dashed, title: "Your Prediction",
      });
      const data: LineData[] = [
        { time: lastTime as any, value: prediction },
        { time: (lastTime + 86400) as any, value: prediction },
      ];
      if (actual != null) {
        data.push({ time: (lastTime + 86400 * 2) as any, value: prediction });
      }
      line.setData(data);
      predRef.current = line;
    }
  }, [prediction, candles, actual]);

  // Actual close line
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (actualRef.current) {
      chart.removeSeries(actualRef.current);
      actualRef.current = null;
    }
    if (actual != null && candles.length > 0) {
      const lastTime = candles[candles.length - 1]!.time;
      const line = chart.addSeries(LineSeries, {
        color: "#fafafa", lineWidth: 2, title: "Actual Close",
      });
      line.setData([
        { time: lastTime as any, value: actual },
        { time: (lastTime + 86400 * 5) as any, value: actual },
      ]);
      actualRef.current = line;
    }
  }, [actual, candles]);

  return <div ref={containerRef} className="chart-container" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PuzzleChart.tsx
git commit -m "feat: integrate drawing plugin and indicators into PuzzleChart"
```

---

### Task 7: Wire Toolbar to GameClient

**Files:**
- Modify: `src/components/GameClient.tsx`

**Interfaces:**
- Consumes: `ChartToolbar`, `DrawingTool` from `@/components/ChartToolbar`
- Produces: passes `roundKey`, `activeTool`, `indicatorVersion` to `PuzzleChart`

- [ ] **Step 1: Update GameClient to include toolbar and state**

Add imports and state to `GameClient.tsx`:

```tsx
// Add to imports at top of GameClient.tsx
import { useState as useStateCompat } from "react";
import ChartToolbar, { type DrawingTool } from "./ChartToolbar";
```

Add state variables inside the `GameClient` component (after existing state declarations):

```tsx
const [activeTool, setActiveTool] = useState<DrawingTool>("crosshair");
const [indicatorVersion, setIndicatorVersion] = useState(0);
```

Replace the chart section in the JSX (the `glass-card` div containing `PuzzleChart`):

```tsx
      <div className="flex gap-2">
        <ChartToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onDelete={() => {}}
          onIndicatorChange={() => setIndicatorVersion((v) => v + 1)}
        />
        <div className="glass-card p-1 sm:p-1.5 flex-1">
          <PuzzleChart
            candles={puzzle.visibleCandles}
            prediction={state === "revealing" ? currentResult?.breakdown.pPred : undefined}
            actual={state === "revealing" ? currentResult?.actualClose : undefined}
            roundKey={roundIndex}
            activeTool={activeTool}
            indicatorVersion={indicatorVersion}
          />
        </div>
      </div>
```

Reset tool to crosshair on round change. Add to `handleNext`:

```tsx
  const handleNext = useCallback(() => {
    const nextRound = roundIndex + 1;
    if (!dailySet || nextRound >= dailySet.puzzles.length) {
      setState("done");
      return;
    }
    setRoundIndex(nextRound);
    setPuzzle(dailySet.puzzles[nextRound]!);
    setPrediction(null);
    setActiveTool("crosshair");  // <-- add this line
    setState("predicting");
  }, [roundIndex, dailySet]);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GameClient.tsx
git commit -m "feat: wire chart toolbar to GameClient with round reset"
```

---

### Task 8: Add Delete Key Support

**Files:**
- Modify: `src/components/PuzzleChart.tsx`

**Interfaces:**
- Consumes: keyboard events
- Produces: delete selected drawing on Delete/Backspace key press

- [ ] **Step 1: Add keyboard listener for delete**

Add inside the first `useEffect` (the chart creation one), after the resize listener:

```typescript
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        drawingManagerRef.current?.deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
```

Update the cleanup function to also remove the keydown listener:

```typescript
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      // ... rest of cleanup
    };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PuzzleChart.tsx
git commit -m "feat: add Delete key support for removing selected drawings"
```

---

### Task 9: Verify and Test

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: all previous tasks
- Produces: verified working feature

- [ ] **Step 1: Run build to check for type errors**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server and test manually**

Run: `npm run dev`
Test checklist:
- [ ] Toolbar appears on left side of chart
- [ ] Crosshair tool is selected by default
- [ ] Clicking trendline tool activates it
- [ ] Can draw a trendline on the chart
- [ ] Press Delete removes selected drawing
- [ ] Indicators button opens panel
- [ ] Toggling SMA 20 shows/hides the line
- [ ] Moving to next round clears drawings
- [ ] Indicators remain enabled after round change
- [ ] Refreshing page preserves indicator state

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: chart tools and indicators integration"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install dependencies | package.json |
| 2 | Indicator localStorage store | indicatorStore.ts |
| 3 | Indicator calculations | indicators.ts |
| 4 | Indicator toggle panel | IndicatorPanel.tsx |
| 5 | Chart toolbar | ChartToolbar.tsx |
| 6 | Integrate into PuzzleChart | PuzzleChart.tsx |
| 7 | Wire to GameClient | GameClient.tsx |
| 8 | Delete key support | PuzzleChart.tsx |
| 9 | Verify and test | — |
