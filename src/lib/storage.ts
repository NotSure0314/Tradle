import { supabase } from "./supabase";
import { getUser } from "./auth";

export type LeaderboardEntry = {
  score: number;
  date: string;
  username?: string;
};

export async function getDailyLeaderboard(date: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date, profiles(username)")
    .eq("date", date)
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getDailyLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function addDailyScore(date: string, entry: LeaderboardEntry): Promise<void> {
  const user = await getUser();
  const { error } = await supabase.from("scores").insert({
    score: entry.score,
    date,
    user_id: user?.id ?? null,
  });
  if (error) console.error("addDailyScore error:", error);
}

export async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date, profiles(username)")
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getAllTimeLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function addAllTimeScore(entry: LeaderboardEntry): Promise<void> {
  await addDailyScore(entry.date, entry);
}

export function saveGuestScore(score: number, date: string): void {
  const raw = localStorage.getItem("guest-scores");
  let scores: { score: number; date: string }[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) scores = parsed;
    } catch {
      scores = [];
    }
  }
  scores.push({ score, date });
  localStorage.setItem("guest-scores", JSON.stringify(scores));

  // Also save to Supabase so it shows on leaderboard
  supabase.from("scores").insert({
    score,
    date,
    user_id: null,
  }).then(({ error }) => {
    if (error) console.error("saveGuestScore to Supabase error:", error);
  });
}
