import { getDailySet, toPublicPuzzle } from "@/lib/daily";

export async function GET() {
  try {
    const set = await getDailySet();
    return Response.json({
      date: set.date,
      puzzles: set.puzzles.map(toPublicPuzzle),
    });
  } catch (err) {
    console.error("Failed to generate daily set:", err);
    return Response.json({ error: "Failed to generate puzzles" }, { status: 500 });
  }
}
