import { supabase } from "./supabase";

export type LeaderboardEntry = {
  score: number;
  date: string;
};

export async function getDailyLeaderboard(date: string): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from("scores")
    .select("score, date")
    .eq("date", date)
    .order("score", { ascending: false })
    .limit(100);

  return (data as LeaderboardEntry[]) ?? [];
}

export async function addDailyScore(date: string, entry: LeaderboardEntry): Promise<void> {
  await supabase.from("scores").insert({ score: entry.score, date });
}

export async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from("scores")
    .select("score, date")
    .order("score", { ascending: false })
    .limit(100);

  return (data as LeaderboardEntry[]) ?? [];
}

export async function addAllTimeScore(entry: LeaderboardEntry): Promise<void> {
  await addDailyScore(entry.date, entry);
}
