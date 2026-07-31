"use client";

import type { RoundResult } from "@/lib/types";
import { formatScore } from "@/lib/scoring";
import { useEffect, useState } from "react";
import { addDailyScore, saveGuestScore } from "@/lib/storage";
import { getUser, generateGuestName } from "@/lib/auth";
import { nyDateKey } from "@/lib/date";
import Leaderboard from "./Leaderboard";

type Props = {
  results: RoundResult[];
  onPlayAgain: () => void;
};

export default function GameOver({ results, onPlayAgain }: Props) {
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalFormatted = formatScore(totalScore);
  const correctDirections = results.filter((r) => r.breakdown.dirOk).length;
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    const today = nyDateKey();
    getUser().then((user) => {
      if (user) {
        addDailyScore(today, { score: totalScore, date: today });
      } else {
        saveGuestScore(totalScore, today);
        setGuestName(generateGuestName());
      }
    });
  }, [totalScore, results]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div className="text-center space-y-4 pt-4">
        <span className="badge">Session Complete</span>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Final Score
        </h1>
        <div className="score-display text-7xl font-bold gradient-text leading-none">
          {totalFormatted}
        </div>
        <p className="text-zinc-500 text-sm">
          {correctDirections} of {results.length} directions correct
        </p>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          Round Breakdown
        </h2>
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm p-3.5 rounded-xl bg-black/25 border border-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center text-xs font-bold text-zinc-500">
                {i + 1}
              </span>
              <div>
                <span className="text-white font-medium">Round {i + 1}</span>
                <span className={`ml-2 text-xs ${r.breakdown.dirOk ? "text-emerald-400" : "text-red-400"}`}>
                  {r.breakdown.dirOk ? "Direction ✓" : "Direction ✗"}
                </span>
              </div>
            </div>
            <span className="score-display text-white font-semibold">
              {formatScore(r.score)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-violet-500/20">
          <span className="text-white font-semibold">Total</span>
          <span className="score-display text-white font-bold text-xl">
            {totalFormatted}
          </span>
        </div>
      </div>

      <Leaderboard currentScore={totalScore} guestName={guestName} />

      <button onClick={onPlayAgain} className="btn-primary w-full">
        Play Again
      </button>
    </div>
  );
}
