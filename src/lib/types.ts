export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ScoreBreakdown = {
  p0: number;
  pPred: number;
  pActual: number;
  actualRet: number;
  predRet: number;
  err: number;
  vol: number;
  normErr: number;
  dirOk: boolean;
  accuracy: number;
  mag: number;
  roundScore: number;
};

export type VisiblePuzzle = {
  roundIndex: number;
  ticker: string;
  horizonDays: number;
  visibleCandles: Candle[];
  lastClose: number;
  atrPct: number;
};

export type FullPuzzle = VisiblePuzzle & {
  futureCandles: Candle[];
  actualClose: number;
};

export type DailySetPublic = {
  date: string;
  puzzles: VisiblePuzzle[];
};

export type DailySetFull = {
  date: string;
  puzzles: FullPuzzle[];
};

export type RoundResult = {
  roundIndex: number;
  prediction: number;
  actualClose: number;
  score: number;
  breakdown: ScoreBreakdown;
  futureCandles: Candle[];
};
