import type { ScoreBreakdown } from "./types";

function signBand(r: number): -1 | 0 | 1 {
  if (Math.abs(r) < 0.001) return 0;
  return r > 0 ? 1 : -1;
}

export function scoreRound(
  p0: number,
  pPred: number,
  pActual: number,
  atrPct: number,
): ScoreBreakdown {
  const actualRet = (pActual - p0) / p0;
  const predRet = (pPred - p0) / p0;
  const err = Math.abs(predRet - actualRet);
  const vol = Math.max(atrPct, 0.005);
  const normErr = err / vol;
  const dirOk = signBand(predRet) === signBand(actualRet);
  const accuracy = 1000 * Math.exp(-normErr);
  const mag = Math.min(3.0, 1 + Math.abs(actualRet) / vol);
  const roundScore = dirOk ? accuracy * mag : accuracy * 0.15;

  return {
    p0,
    pPred,
    pActual,
    actualRet,
    predRet,
    err,
    vol,
    normErr,
    dirOk,
    accuracy,
    mag,
    roundScore,
  };
}

export function formatScore(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
