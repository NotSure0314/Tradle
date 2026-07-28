import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const username = user.user_metadata?.full_name
        ? user.user_metadata.full_name.replace(/\s+/g, "_").toLowerCase()
        : `user_${user.id.slice(0, 8)}`;

      await supabase.from("profiles").insert({
        id: user.id,
        username,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
      });
    }

    transferGuestScores(user.id);
  }

  return NextResponse.redirect(new URL("/", origin));
}

async function transferGuestScores(userId: string): Promise<void> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("guest-scores");
  } catch {
    return;
  }
  if (!raw) return;

  try {
    const scores = JSON.parse(raw) as { score: number; date: string }[];
    if (!Array.isArray(scores) || scores.length === 0) {
      localStorage.removeItem("guest-scores");
      return;
    }

    const rows = scores.map((s) => ({
      score: s.score,
      date: s.date,
      user_id: userId,
    }));

    const { error } = await supabase.from("scores").insert(rows);
    if (error) {
      console.error("transferGuestScores error:", error);
      return;
    }

    localStorage.removeItem("guest-scores");
  } catch {
    try {
      localStorage.removeItem("guest-scores");
    } catch {
      // ignore
    }
  }
}
