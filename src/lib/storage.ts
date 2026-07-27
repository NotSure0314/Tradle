import { supabase } from "./supabase";

export type LeaderboardEntry = {
  score: number;
  date: string;
};

export async function getDailyLeaderboard(date: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date")
    .eq("date", date)
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getDailyLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function addDailyScore(date: string, entry: LeaderboardEntry): Promise<void> {
  const { error } = await supabase.from("scores").insert({ score: entry.score, date });
  if (error) console.error("addDailyScore error:", error);
}

export async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date")
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getAllTimeLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function addAllTimeScore(entry: LeaderboardEntry): Promise<void> {
  await addDailyScore(entry.date, entry);
}
