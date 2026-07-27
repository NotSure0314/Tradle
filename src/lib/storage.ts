export type LeaderboardEntry = {
  score: number;
  date: string;
  timestamp: number;
};

const DAILY_PREFIX = "tradle:daily:";
const ALL_TIME_KEY = "tradle:alltime";

export function getDailyLeaderboard(date: string): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${DAILY_PREFIX}${date}`);
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function addDailyScore(date: string, entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const board = getDailyLeaderboard(date);
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(`${DAILY_PREFIX}${date}`, JSON.stringify(board.slice(0, 100)));
}

export function getAllTimeLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ALL_TIME_KEY);
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function addAllTimeScore(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const board = getAllTimeLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(ALL_TIME_KEY, JSON.stringify(board.slice(0, 100)));
}
