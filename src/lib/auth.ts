import { supabase } from "./supabase";

export type Profile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

export async function signUp(
  email: string,
  password: string,
  username: string,
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return { error: { message: "Username is already taken" } };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error };

  const userId = data.user?.id;
  if (!userId) return { error: { message: "Sign up failed" } };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: userId, username, email });

  if (profileError) return { error: profileError };

  await transferGuestScores(userId);

  return { error: null };
}

export async function signIn(identifier: string, password: string) {
  let email = identifier;

  if (!identifier.includes("@")) {
    const { data, error: lookupError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .maybeSingle();

    if (lookupError) {
      return { error: { message: "Login failed" } };
    }

    if (!data || !data.email || data.email.trim() === "") {
      return { error: { message: "Username not found" } };
    }
    email = data.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error };

  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (userId) await transferGuestScores(userId);

  return { error: null };
}

export async function signInWithOAuth(
  provider: "google" | "github",
) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });

  return { error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data as Profile | null;
}

export function generateGuestId(): string {
  let guestId = localStorage.getItem("guest-id");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest-id", guestId);
  }
  return guestId;
}

export function generateGuestName(): string {
  let guestName = localStorage.getItem("guest-name");
  if (!guestName) {
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    guestName = `Guest${digits}`;
    localStorage.setItem("guest-name", guestName);
  }
  return guestName;
}

export async function transferGuestScores(userId: string): Promise<void> {
  const raw = localStorage.getItem("guest-scores");
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
    localStorage.removeItem("guest-scores");
  }
}
