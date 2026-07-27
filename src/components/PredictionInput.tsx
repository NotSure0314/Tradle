"use client";

import { useState } from "react";

type Props = {
  lastClose: number;
  ticker: string;
  horizonDays: number;
  onSubmit: (price: number) => void;
  disabled: boolean;
};

export default function PredictionInput({ lastClose, ticker, horizonDays, onSubmit, disabled }: Props) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const val = parseFloat(price);
    if (isNaN(val) || val <= 0) {
      setError("Enter a valid price");
      return;
    }
    setError("");
    onSubmit(val);
  };

  const handlePreset = (mult: number) => {
    setPrice((lastClose * mult).toFixed(2));
  };

  const presets = [
    { mult: 0.98, label: "-2%" },
    { mult: 0.99, label: "-1%" },
    { mult: 1.0, label: "Flat" },
    { mult: 1.01, label: "+1%" },
    { mult: 1.02, label: "+2%" },
  ];

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-white tracking-tight">{ticker}</span>
            <span className="badge">Live Chart</span>
          </div>
          <p className="text-sm text-zinc-500">
            Predict close price in {horizonDays} trading days
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
            Last Close
          </div>
          <div className="score-display text-2xl font-bold text-white">
            ${lastClose.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          {presets.map(({ mult, label }) => (
            <button
              key={mult}
              onClick={() => handlePreset(mult)}
              className="btn-ghost flex-1 py-2 text-xs"
              disabled={disabled}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              step="0.01"
              placeholder="Enter price target..."
              value={price}
              onChange={(e) => { setPrice(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={disabled}
              className="input-field"
            />
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={disabled || !price}
            className="btn-primary shrink-0 px-6"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
