import { describe, it, expect } from "vitest";
import { scoreRound, formatScore } from "./scoring";

describe("scoreRound", () => {
  it("awards full credit for a perfect call", () => {
    const r = scoreRound(100, 105, 105, 0.02);
    expect(r.dirOk).toBe(true);
    expect(r.normErr).toBeLessThan(0.01);
    expect(r.roundScore).toBeGreaterThan(0);
  });

  it("penalizes wrong direction", () => {
    const correct = scoreRound(100, 105, 105, 0.02);
    const wrong = scoreRound(100, 95, 105, 0.02);
    expect(wrong.roundScore).toBeLessThan(correct.roundScore);
    expect(wrong.dirOk).toBe(false);
  });

  it("rewards calling big moves correctly", () => {
    const bigMove = scoreRound(100, 115, 115, 0.02);
    const smallMove = scoreRound(100, 102, 102, 0.02);
    expect(bigMove.roundScore).toBeGreaterThan(smallMove.roundScore);
  });

  it("handles zero ATR gracefully", () => {
    const r = scoreRound(100, 105, 105, 0);
    expect(r.vol).toBe(0.005);
    expect(Number.isFinite(r.roundScore)).toBe(true);
  });

  it("scales accuracy with prediction error", () => {
    const close = scoreRound(100, 105, 105, 0.02);
    const far = scoreRound(100, 110, 105, 0.02);
    expect(close.accuracy).toBeGreaterThan(far.accuracy);
  });
});

describe("formatScore", () => {
  it("formats as integer with locale separators", () => {
    expect(formatScore(1234.56)).toBe("1,235");
  });
});
