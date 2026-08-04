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

const RayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 20L20 4" /><circle cx="4" cy="20" r="2" />
  </svg>
);

const HorizontalLineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12h20" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const HorizontalRayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12h18" /><circle cx="4" cy="12" r="2" />
  </svg>
);

const ChannelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 8L20 4M4 16l12 4" /><circle cx="4" cy="8" r="1.5" /><circle cx="20" cy="4" r="1.5" /><circle cx="4" cy="16" r="1.5" />
  </svg>
);

const PitchforkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4v16M4 8l8-4 8 4" /><circle cx="4" cy="8" r="1.5" /><circle cx="12" cy="4" r="1.5" /><circle cx="20" cy="8" r="1.5" />
  </svg>
);

const FibIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16M4 20h16" /><path d="M4 10h16" strokeDasharray="2 2" /><path d="M4 14h16" strokeDasharray="2 2" /><circle cx="4" cy="4" r="1.5" /><circle cx="4" cy="20" r="1.5" />
  </svg>
);

const RectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="6" width="16" height="12" rx="1" />
  </svg>
);

const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 4h12M12 4v16" />
  </svg>
);

const BrushIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M14.06 6.19l3.75 3.75" />
  </svg>
);

const PriceRangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 17l4 4 4-4" /><path d="M6 12h12" />
  </svg>
);

const MagnetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2v6a6 6 0 0 0 12 0V2" /><path d="M6 8H2v4a2 2 0 0 0 2 2h2" /><path d="M18 8h4v4a2 2 0 0 1-2 2h-2" />
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
      <ToolButton icon={<RayIcon />} label="Ray" active={activeTool === "ray"} onClick={() => onSelectTool("ray")} />
      <ToolButton icon={<HorizontalLineIcon />} label="Horizontal Line" active={activeTool === "horizontalLine"} onClick={() => onSelectTool("horizontalLine")} />
      <ToolButton icon={<HorizontalRayIcon />} label="Horizontal Ray" active={activeTool === "horizontalRay"} onClick={() => onSelectTool("horizontalRay")} />
      <Divider />
      <ToolButton icon={<ChannelIcon />} label="Parallel Channel" active={activeTool === "parallelChannel"} onClick={() => onSelectTool("parallelChannel")} />
      <ToolButton icon={<PitchforkIcon />} label="Pitchfork" active={activeTool === "pitchfork"} onClick={() => onSelectTool("pitchfork")} />
      <Divider />
      <ToolButton icon={<FibIcon />} label="Fib Retracement" active={activeTool === "fibRetracement"} onClick={() => onSelectTool("fibRetracement")} />
      <ToolButton icon={<RectIcon />} label="Rectangle" active={activeTool === "rectangle"} onClick={() => onSelectTool("rectangle")} />
      <Divider />
      <ToolButton icon={<TextIcon />} label="Text" active={activeTool === "text"} onClick={() => onSelectTool("text")} />
      <ToolButton icon={<BrushIcon />} label="Brush" active={activeTool === "brush"} onClick={() => onSelectTool("brush")} />
      <ToolButton icon={<PriceRangeIcon />} label="Price Range" active={activeTool === "priceRange"} onClick={() => onSelectTool("priceRange")} />
      <Divider />
      <ToolButton icon={<MagnetIcon />} label="Magnet" active={activeTool === "magnet"} onClick={() => onSelectTool("magnet")} />
      <ToolButton icon={<DeleteIcon />} label="Delete" active={false} onClick={onDelete} />
      <Divider />
      <div className="relative">
        <ToolButton icon={<IndicatorIcon />} label="Indicators" active={showIndicators} onClick={() => setShowIndicators((p) => !p)} />
        {showIndicators && <IndicatorPanel onClose={() => setShowIndicators(false)} onChange={onIndicatorChange} />}
      </div>
    </div>
  );
}
