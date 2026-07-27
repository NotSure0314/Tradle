import Link from "next/link";
import GameClient from "@/components/GameClient";

export default function PlayPage() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center shadow-md shadow-violet-500/15 group-hover:shadow-violet-500/25 transition-shadow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Tradle <span className="text-violet-300">Cursor</span>
          </span>
        </Link>
      </header>

      <div className="px-4 sm:px-6 pb-10">
        <GameClient />
      </div>
    </div>
  );
}
