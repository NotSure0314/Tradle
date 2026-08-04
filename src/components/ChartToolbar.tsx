"use client";

import { useState } from "react";
import IndicatorPanel from "./IndicatorPanel";

export type DrawingTool =
  | "crosshair" | "trendline" | "ray" | "horizontalLine" | "horizontalRay"
  | "parallelChannel" | "pitchfork" | "fibRetracement" | "rectangle"
  | "text" | "brush" | "priceRange" | "magnet";

type Props = {
  activeTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  onIndicatorChange: () => void;
};

const Divider = () => <div className="h-px bg-white/[0.08] my-1" />;

function ToolButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
        active ? "bg-violet-500/20 text-violet-400" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {icon}
    </button>
  );
}

const CrosshairIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
  </svg>
);

const TrendlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 20L20 4" /><circle cx="4" cy="20" r="2" /><circle cx="20" cy="4" r="2" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6" /><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </svg>
);

const IndicatorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 4-8" />
  </svg>
);

export default function ChartToolbar({ activeTool, onSelectTool, onDelete, onIndicatorChange }: Props) {
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="relative flex flex-col items-center gap-0.5 p-1 rounded-lg bg-[#1a1a2e] border border-white/[0.06]">
      <ToolButton icon={<CrosshairIcon />} label="Crosshair" active={activeTool === "crosshair"} onClick={() => onSelectTool("crosshair")} />
      <Divider />
      <ToolButton icon={<TrendlineIcon />} label="Trend Line" active={activeTool === "trendline"} onClick={() => onSelectTool("trendline")} />
      <Divider />
      <ToolButton icon={<DeleteIcon />} label="Delete" active={false} onClick={onDelete} />
      <Divider />
      <div className="relative">
        <ToolButton icon={<IndicatorIcon />} label="Indicators" active={showIndicators} onClick={() => setShowIndicators((p) => !p)} />
        {showIndicators && <IndicatorPanel onClose={() => setShowIndicators(false)} onChange={onIndicatorChange} />}
      </div>
    </div>
  );
}
