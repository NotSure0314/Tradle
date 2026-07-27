"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
} from "lightweight-charts";
import type { Candle } from "@/lib/types";

type Props = {
  candles: Candle[];
  prediction?: number;
  actual?: number;
  height?: number;
};

export default function PuzzleChart({ candles, prediction, actual, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const predRef = useRef<ISeriesApi<"Line"> | null>(null);
  const actualRef = useRef<ISeriesApi<"Line"> | null>(null);

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

    chartRef.current = chart;
    candleRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      predRef.current = null;
      actualRef.current = null;
    };
  }, [height]);

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
        color: "#a78bfa",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: "Your Prediction",
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
        color: "#fafafa",
        lineWidth: 2,
        title: "Actual Close",
      });
      line.setData([
        { time: lastTime as any, value: actual },
        { time: (lastTime + 86400 * 5) as any, value: actual },
      ]);
      actualRef.current = line;
    }
  }, [actual, candles]);

  return <div ref={containerRef} className="chart-container" />;
}
