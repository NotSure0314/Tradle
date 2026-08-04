// src/components/PuzzleChart.tsx
"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type HistogramData,
} from "lightweight-charts";
import { DrawingManager } from "lightweight-charts-drawing";
import type { Candle } from "@/lib/types";
import type { DrawingTool } from "@/components/ChartToolbar";
import { getIndicators } from "@/lib/indicatorStore";
import { calcSMA, calcEMA, calcBollingerBands, calcVolume } from "@/lib/indicators";

type Props = {
  candles: Candle[];
  prediction?: number;
  actual?: number;
  height?: number;
  roundKey: number;
  activeTool: DrawingTool;
  indicatorVersion: number;
};

const ACCENT = "#8b5cf6";

export interface PuzzleChartHandle {
  deleteSelected: () => void;
}

const PuzzleChart = forwardRef<PuzzleChartHandle, Props>(function PuzzleChart({
  candles, prediction, actual, height = 500, roundKey, activeTool, indicatorVersion,
}: Props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const predRef = useRef<ISeriesApi<"Line"> | null>(null);
  const actualRef = useRef<ISeriesApi<"Line"> | null>(null);
  const drawingManagerRef = useRef<DrawingManager | null>(null);
  const indicatorSeriesRef = useRef<ISeriesApi<any>[]>([]);

  useImperativeHandle(ref, () => ({
    deleteSelected() {
      const dm = drawingManagerRef.current;
      if (!dm) return;
      const selected = dm.getSelectedDrawing();
      if (selected) {
        dm.removeDrawing(selected.id);
      }
    },
  }));

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#111113" },
        textColor: "#a1a1aa",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      width: containerRef.current.clientWidth,
      height,
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(167, 139, 250, 0.3)", labelBackgroundColor: "#6366f1" },
        horzLine: { color: "rgba(167, 139, 250, 0.3)", labelBackgroundColor: "#6366f1" },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    const drawingManager = new DrawingManager();
    drawingManager.attach(chart, series, containerRef.current);

    chartRef.current = chart;
    candleRef.current = series;
    drawingManagerRef.current = drawingManager;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = drawingManagerRef.current?.getSelectedDrawing();
        if (selected) {
          drawingManagerRef.current?.removeDrawing(selected.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      indicatorSeriesRef.current.forEach((s) => {
        try { chart.removeSeries(s); } catch {}
      });
      indicatorSeriesRef.current = [];
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      predRef.current = null;
      actualRef.current = null;
      drawingManagerRef.current = null;
    };
  }, [height]);

  // Set candle data
  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;
    series.setData(
      candles.map(
        (c): CandlestickData => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }),
      ),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Clear drawings on round change
  useEffect(() => {
    drawingManagerRef.current?.clearAll();
  }, [roundKey]);

  // Handle active tool changes
  useEffect(() => {
    const dm = drawingManagerRef.current;
    if (!dm) return;
    if (activeTool === "crosshair") {
      dm.setActiveTool(null);
    } else if (activeTool === "trendline") {
      dm.setActiveTool("trend-line");
    }
    // Other tools will be wired as we add them
  }, [activeTool]);

  // Render indicators
  useEffect(() => {
    const chart = chartRef.current;
    const series = candleRef.current;
    if (!chart || !series) return;

    // Remove old indicator series
    indicatorSeriesRef.current.forEach((s) => {
      try { chart.removeSeries(s); } catch {}
    });
    indicatorSeriesRef.current = [];

    const indicators = getIndicators();

    // Overlay indicators on main chart
    if (indicators.sma20) {
      const data = calcSMA(candles, 20);
      const s = chart.addSeries(LineSeries, { color: "#3b82f6", lineWidth: 1, title: "SMA 20", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.sma50) {
      const data = calcSMA(candles, 50);
      const s = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1, title: "SMA 50", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.sma200) {
      const data = calcSMA(candles, 200);
      const s = chart.addSeries(LineSeries, { color: "#ef4444", lineWidth: 1, title: "SMA 200", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.ema12) {
      const data = calcEMA(candles, 12);
      const s = chart.addSeries(LineSeries, { color: "#06b6d4", lineWidth: 1, title: "EMA 12", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.ema26) {
      const data = calcEMA(candles, 26);
      const s = chart.addSeries(LineSeries, { color: "#8b5cf6", lineWidth: 1, title: "EMA 26", priceLineVisible: false, lastValueVisible: false });
      s.setData(data as LineData[]);
      indicatorSeriesRef.current.push(s);
    }
    if (indicators.bb) {
      const bb = calcBollingerBands(candles);
      const upper = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.4)", lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false });
      const mid = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.7)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      const lower = chart.addSeries(LineSeries, { color: "rgba(168,85,247,0.4)", lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false });
      upper.setData(bb.upper as LineData[]);
      mid.setData(bb.middle as LineData[]);
      lower.setData(bb.lower as LineData[]);
      indicatorSeriesRef.current.push(upper, mid, lower);
    }
    if (indicators.volume) {
      const data = calcVolume(candles);
      const s = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false });
      s.setData(data as HistogramData[]);
      indicatorSeriesRef.current.push(s);
    }
  }, [candles, indicatorVersion]);

  // Prediction line
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (predRef.current) {
      chart.removeSeries(predRef.current);
      predRef.current = null;
    }
    if (prediction != null && candles.length > 0) {
      const lastTime = candles[candles.length - 1]!.time;
      const line = chart.addSeries(LineSeries, {
        color: ACCENT, lineWidth: 2, lineStyle: LineStyle.Dashed, title: "Your Prediction",
      });
      const data: LineData[] = [
        { time: lastTime as any, value: prediction },
        { time: (lastTime + 86400) as any, value: prediction },
      ];
      if (actual != null) {
        data.push({ time: (lastTime + 86400 * 2) as any, value: prediction });
      }
      line.setData(data);
      predRef.current = line;
    }
  }, [prediction, candles, actual]);

  // Actual close line
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (actualRef.current) {
      chart.removeSeries(actualRef.current);
      actualRef.current = null;
    }
    if (actual != null && candles.length > 0) {
      const lastTime = candles[candles.length - 1]!.time;
      const line = chart.addSeries(LineSeries, {
        color: "#fafafa", lineWidth: 2, title: "Actual Close",
      });
      line.setData([
        { time: lastTime as any, value: actual },
        { time: (lastTime + 86400 * 5) as any, value: actual },
      ]);
      actualRef.current = line;
    }
  }, [actual, candles]);

  return <div ref={containerRef} className="chart-container" />;
});

export default PuzzleChart;
