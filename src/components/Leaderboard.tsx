"use client";

import { useState, useEffect } from "react";
import { getDailyLeaderboard, getAllTimeLeaderboard, type LeaderboardEntry } from "@/lib/storage";
import { nyDateKey } from "@/lib/date";
import { formatScore } from "@/lib/scoring";

type Props = {
  currentScore?: number;
};

function rankLabel(index: number) {
  if (index === 0) return "1st";
  if (index === 1) return "2nd";
  if (index === 2) return "3rd";
  return `${index + 1}th`;
}

export default function Leaderboard({ currentScore }: Props) {
  const [tab, setTab] = useState<"daily" | "alltime">("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const data = tab === "daily"
      ? getDailyLeaderboard(nyDateKey())
      : getAllTimeLeaderboard();
    setEntries(data);
  }, [tab]);

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-3">
        <button
          onClick={() => setTab("daily")}
          className={`tab-btn ${tab === "daily" ? "active" : ""}`}
        >
          Daily
        </button>
        <button
          onClick={() => setTab("alltime")}
          className={`tab-btn ${tab === "alltime" ? "active" : ""}`}
        >
          All-Time
        </button>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {entries.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">
              No scores yet. Be the first!
            </p>
          </div>
        )}
        {entries.map((entry, i) => {
          const isCurrent = currentScore != null && entry.score === currentScore;
          return (
            <div
              key={i}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                isCurrent
                  ? "bg-violet-500/10 border border-violet-500/25"
                  : "hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 text-center text-xs font-bold ${
                    i < 3 ? "text-violet-300" : "text-zinc-600"
                  }`}
                >
                  {rankLabel(i)}
                </span>
                <span className="score-display text-white font-semibold">
                  {formatScore(entry.score)}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-600">{entry.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
