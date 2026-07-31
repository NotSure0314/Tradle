import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import UserMenu from "@/components/UserMenu";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tradle — Daily Trading Puzzle",
  description:
    "Sharpen your market instincts. Predict price movements on real charts and climb the leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="page-shell">
          <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
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
            <UserMenu />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
