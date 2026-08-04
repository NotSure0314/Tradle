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
