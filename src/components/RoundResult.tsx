"use client";

import type { RoundResult } from "@/lib/types";
import { formatScore } from "@/lib/scoring";

type Props = {
  result: RoundResult;
  onNext: () => void;
  isLast: boolean;
};

export default function RoundResult({ result, onNext, isLast }: Props) {
  const { breakdown } = result;
  const pctChange = ((result.actualClose - breakdown.p0) / breakdown.p0 * 100).toFixed(2);
  const isUp = result.actualClose >= breakdown.p0;
  const predPct = ((breakdown.pPred - breakdown.p0) / breakdown.p0 * 100).toFixed(2);
  const predIsUp = breakdown.pPred >= breakdown.p0;

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-up">
      <div className="text-center space-y-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Round {result.roundIndex + 1} Score
        </div>
        <div className="score-display text-5xl font-bold gradient-text">
          {formatScore(result.score)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Actual Close
          </div>
          <div className="score-display text-xl font-bold text-white">
            ${result.actualClose.toFixed(2)}
          </div>
          <span className={`stat-pill ${isUp ? "up" : "down"}`}>
            {isUp ? "↑" : "↓"} {pctChange}%
          </span>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Your Prediction
          </div>
          <div className="score-display text-xl font-bold text-white">
            ${breakdown.pPred.toFixed(2)}
          </div>
          <span className={`stat-pill ${predIsUp ? "up" : "down"}`}>
            {predIsUp ? "↑" : "↓"} {predPct}%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 text-sm text-zinc-500 border-t border-white/[0.06] pt-5">
        <span>
          Direction{" "}
          {breakdown.dirOk ? (
            <span className="text-emerald-400 font-medium">Correct</span>
          ) : (
            <span className="text-red-400 font-medium">Wrong</span>
          )}
        </span>
        <span>
          Accuracy{" "}
          <span className="text-white font-medium score-display">
            {formatScore(breakdown.accuracy)}
          </span>
        </span>
        <span>
          Magnitude{" "}
          <span className="text-white font-medium score-display">
            ×{breakdown.mag.toFixed(1)}
          </span>
        </span>
      </div>

      <button onClick={onNext} className="btn-primary w-full">
        {isLast ? "See Final Results" : "Next Round"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
