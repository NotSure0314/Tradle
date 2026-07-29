"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signIn } from "@/lib/auth";

type Props = {
  mode: "login" | "signup";
};

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignup && !USERNAME_RE.test(username)) {
      setError("Username must be 3-20 characters: letters, numbers, or underscores.");
      return;
    }

    setLoading(true);
    const result = isSignup
      ? await signUp(email, password, username)
      : await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="max-w-sm w-full mx-auto space-y-6 animate-fade-up">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isSignup ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-zinc-500 text-sm">
          {isSignup
            ? "Sign up to save your scores and join the leaderboard."
            : "Sign in to continue your streak."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
            autoComplete="username"
          />
        )}
        <input
          type={isSignup ? "email" : "text"}
          placeholder={isSignup ? "Email" : "Email or username"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
          autoComplete={isSignup ? "email" : "username"}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
