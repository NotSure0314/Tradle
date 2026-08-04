"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VisiblePuzzle, RoundResult as RoundResultType, DailySetPublic } from "@/lib/types";
import { scoreRound } from "@/lib/scoring";
import PuzzleChart from "./PuzzleChart";
import type { PuzzleChartHandle } from "./PuzzleChart";
import ChartToolbar from "./ChartToolbar";
import PredictionInput from "./PredictionInput";
import RoundResult from "./RoundResult";
import GameOver from "./GameOver";
import type { DrawingTool } from "./ChartToolbar";

type State = "loading" | "predicting" | "submitting" | "revealing" | "done";

export default function GameClient() {
  const [state, setState] = useState<State>("loading");
  const [dailySet, setDailySet] = useState<DailySetPublic | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [puzzle, setPuzzle] = useState<VisiblePuzzle | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResultType[]>([]);
  const [error, setError] = useState("");
  const [roundKey, setRoundKey] = useState(0);
  const [activeTool, setActiveTool] = useState<DrawingTool>("crosshair");
  const [indicatorVersion, setIndicatorVersion] = useState(0);
  const chartRef = useRef<PuzzleChartHandle>(null);

  const loadDailySet = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/daily");
      if (!res.ok) throw new Error("Failed to load puzzles");
      const data = (await res.json()) as DailySetPublic;
      if (!data.puzzles || data.puzzles.length === 0) {
        throw new Error("No puzzles available");
      }
      setDailySet(data);
      setRoundIndex(0);
      setPuzzle(data.puzzles[0]!);
      setPrediction(null);
      setResults([]);
      setState("predicting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setState("loading");
    }
  }, []);

  useEffect(() => {
    loadDailySet();
  }, [loadDailySet]);

  const handlePrediction = useCallback(
    async (price: number) => {
      if (!puzzle || !dailySet) return;
      setPrediction(price);
      setState("submitting");

      try {
        const res = await fetch(`/api/resolve?round=${roundIndex}`);
        if (!res.ok) throw new Error("Failed to resolve");
        const data = await res.json() as { actualClose: number; atrPct: number };

        const breakdown = scoreRound(
          puzzle.lastClose,
          price,
          data.actualClose,
          puzzle.atrPct,
        );

        const result: RoundResultType = {
          roundIndex,
          prediction: price,
          actualClose: data.actualClose,
          score: breakdown.roundScore,
          breakdown,
          futureCandles: [],
        };

        setResults((prev) => [...prev, result]);
        setState("revealing");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resolve");
        setState("predicting");
      }
    },
    [puzzle, dailySet, roundIndex],
  );

  const handleNext = useCallback(() => {
    const nextRound = roundIndex + 1;
    if (!dailySet || nextRound >= dailySet.puzzles.length) {
      setState("done");
      return;
    }
    setRoundIndex(nextRound);
    setPuzzle(dailySet.puzzles[nextRound]!);
    setPrediction(null);
    setRoundKey((k) => k + 1);
    setActiveTool("crosshair");
    setState("predicting");
  }, [roundIndex, dailySet]);

  const currentResult =
    results.length > 0 ? results[results.length - 1]! : null;

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 animate-fade-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <svg className="animate-pulse-glow" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <div className="text-lg text-white font-semibold mb-1">
              Loading today&apos;s puzzles
            </div>
            <div className="text-sm text-zinc-500">Fetching market data...</div>
          </div>
          <div className="w-48 mx-auto loading-bar" />
          {error && (
            <div className="space-y-3">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={loadDailySet} className="btn-ghost">
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "done") {
    return <GameOver results={results} onPlayAgain={loadDailySet} />;
  }

  if (!puzzle || !dailySet) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {dailySet.puzzles.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${
                i < roundIndex ? "done" : i === roundIndex ? "active" : "pending"
              }`}
            />
          ))}
        </div>
        <div className="text-xs font-medium text-zinc-500 tracking-wide uppercase">
          Round {roundIndex + 1} / {dailySet.puzzles.length}
        </div>
      </div>

      <div className="chart-wrapper">
        <ChartToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onDelete={() => chartRef.current?.deleteSelected()}
          onIndicatorChange={() => setIndicatorVersion((v) => v + 1)}
        />
        <div className="flex-1">
          <div className="flex justify-end mb-2">
            <span className="px-3 py-1 text-sm font-medium rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/30">
              1D
            </span>
          </div>
          <div className="glass-card p-1 sm:p-1.5">
            <PuzzleChart
              ref={chartRef}
              candles={puzzle.visibleCandles}
              prediction={state === "revealing" ? currentResult?.breakdown.pPred : undefined}
              actual={state === "revealing" ? currentResult?.actualClose : undefined}
              roundKey={roundKey}
              activeTool={activeTool}
              indicatorVersion={indicatorVersion}
            />
          </div>
        </div>
      </div>

      {state === "predicting" && (
        <PredictionInput
          lastClose={puzzle.lastClose}
          ticker={puzzle.ticker}
          horizonDays={puzzle.horizonDays}
          onSubmit={handlePrediction}
          disabled={false}
        />
      )}

      {state === "submitting" && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <p className="text-zinc-400 text-sm">Scoring your prediction...</p>
        </div>
      )}

      {state === "revealing" && currentResult && (
        <RoundResult
          result={currentResult}
          onNext={handleNext}
          isLast={roundIndex >= dailySet.puzzles.length - 1}
        />
      )}
    </div>
  );
}
