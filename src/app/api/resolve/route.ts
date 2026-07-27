import { getDailySet } from "@/lib/daily";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundIndex = parseInt(searchParams.get("round") ?? "", 10);

  if (isNaN(roundIndex)) {
    return Response.json({ error: "Missing or invalid 'round' param" }, { status: 400 });
  }

  try {
    const set = await getDailySet();
    const puzzle = set.puzzles[roundIndex];
    if (!puzzle) {
      return Response.json({ error: "Puzzle not found" }, { status: 404 });
    }

    return Response.json({
      roundIndex: puzzle.roundIndex,
      ticker: puzzle.ticker,
      actualClose: puzzle.actualClose,
      lastClose: puzzle.lastClose,
      horizonDays: puzzle.horizonDays,
      atrPct: puzzle.atrPct,
    });
  } catch (err) {
    console.error("Failed to resolve:", err);
    return Response.json({ error: "Failed to resolve" }, { status: 500 });
  }
}
