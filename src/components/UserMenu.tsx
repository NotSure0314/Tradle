"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getUser, getProfile, signOut, type Profile } from "@/lib/auth";

export default function UserMenu() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getUser();
      if (cancelled) return;
      if (user) {
        const p = await getProfile(user.id);
        if (!cancelled) setProfile(p);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    window.location.reload();
  }

  if (loading) return null;

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="btn-ghost text-sm">
          Log in
        </Link>
        <Link href="/signup" className="btn-primary text-sm px-4 py-2">
          Sign up
        </Link>
      </div>
    );
  }

  const initial = profile.username.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-white/[0.06]"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="glass-card absolute right-0 top-full mt-2 w-56 p-3 z-50 space-y-3">
          <div className="px-1">
            <p className="text-sm font-semibold text-white truncate">
              {profile.username}
            </p>
            <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
          </div>
          <div className="border-t border-white/[0.06]" />
          <button
            type="button"
            onClick={handleSignOut}
            className="btn-ghost w-full text-sm text-left"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
