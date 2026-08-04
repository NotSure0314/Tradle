## Task 6: Integrate Drawing Plugin into PuzzleChart

**Status:** DONE_WITH_CONCERNS

**What was done:**
- Replaced `src/components/PuzzleChart.tsx` with drawing plugin integration, indicator rendering, and new props (`roundKey`, `activeTool`, `indicatorVersion`)
- Updated `src/components/GameClient.tsx` to pass the new required props (was not in the brief but required for build)

**Key fixes applied to the brief's code:**
- `DrawingManager` constructor takes no arguments — must call `.attach(chart, series, container)` separately
- `setTool()` → `setActiveTool()` (API method name mismatch in brief)
- `clear()` → `clearAll()` (API method name mismatch in brief)
- Removed unused imports (`useCallback`, `calcRSI`, `calcMACD`, `IndicatorName`)

**Test results:** Build passes cleanly with no type errors.

**Commits:**
- `50d128c` feat: integrate drawing plugin and indicators into PuzzleChart

**Concerns:**
1. The task brief contained several API mismatches with the actual `lightweight-charts-drawing` library (constructor args, method names). These were fixed but indicate the brief was written without verifying against the installed package version.
2. `GameClient.tsx` changes were not in the brief — the new required props on `PuzzleChart` would have broken the build without them. A follow-up task should formally update `GameClient.tsx`.
