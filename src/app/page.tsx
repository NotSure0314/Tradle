import Link from "next/link";

const features = [
  {
    title: "Real Markets",
    description: "Historical candle data from live tickers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "5 Rounds",
    description: "Predict targets across diverse assets",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "Leaderboard",
    description: "Daily and all-time rankings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    title: "Daily Puzzle",
    description: "Same charts for everyone, every day",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Tradle
          </span>
        </div>
        <span className="badge hidden sm:inline-flex">Daily Challenge</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="max-w-2xl w-full text-center space-y-10 animate-fade-up">
          <div className="space-y-5">
            <span className="badge">Trading Intelligence Game</span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="gradient-text">Read the chart.</span>
              <br />
              <span className="text-white">Call the move.</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
              A daily trading puzzle powered by real market data. Analyze charts,
              predict price targets, and compete for the top spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-5 flex items-start gap-4 group"
              >
                <div className="feature-icon shrink-0 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">
                    {feature.title}
                  </div>
                  <div className="text-zinc-500 text-xs leading-relaxed">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/play" className="btn-primary px-10 py-3.5 text-base w-full sm:w-auto">
              Start Today&apos;s Puzzle
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center pb-8 text-xs text-zinc-600">
        Same puzzle for everyone · Resets daily at midnight ET
      </footer>
    </div>
  );
}
