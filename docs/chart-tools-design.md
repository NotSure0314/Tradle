# Chart Tools & Indicators Design

## Overview

Add TradingView-style drawing tools and technical indicators to the chart. Drawing tools are round-specific (reset each round). Indicators persist across rounds via localStorage.

## Libraries

- `lightweight-charts-drawing` — 68 drawing tools (trend lines, fibonacci, channels, etc.)
- `lightweight-charts-indicators` — 446 indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.)

Both are MIT licensed and compatible with lightweight-charts v5.

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/components/ChartToolbar.tsx` | Vertical toolbar with tool selection, indicator toggles, delete |
| `src/lib/indicators.ts` | Indicator calculation functions and localStorage persistence |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/PuzzleChart.tsx` | Integrate drawing plugins, indicators, expose chart API to toolbar |
| `src/components/GameClient.tsx` | Pass roundKey and indicator state to PuzzleChart |

## Toolbar Design

Vertical toolbar positioned on the left side of the chart. Sections separated by dividers:

### Drawing Tools (reset each round)

| Section | Tools | Anchors |
|---------|-------|---------|
| Cursor | Crosshair (default) | — |
| Lines | Trend Line, Ray, Horizontal Line, Horizontal Ray | 1-2 |
| Channels | Parallel Channel, Pitchfork | 3 |
| Fibonacci | Fib Retracement | 2 |
| Shapes | Rectangle | 2 |
| Annotation | Text, Brush (freehand) | 1-2+ |
| Measurement | Price Range | 2 |
| Actions | Magnet (snap to OHLC), Delete selected | — |

### Indicators (persist across rounds)

| Indicator | Type | Display |
|-----------|------|---------|
| SMA (20, 50, 200) | Overlay | Line on main chart |
| EMA (12, 26) | Overlay | Line on main chart |
| Bollinger Bands | Overlay | Band on main chart |
| Volume | Separate | Histogram below main chart |
| RSI | Separate | Pane below main chart |
| MACD | Separate | Pane below main chart |

## State Management

### Drawings (per-round, ephemeral)

- Stored in React component state within `PuzzleChart`
- When `roundKey` prop changes (new round), all drawing primitives are removed
- No persistence — drawings are analysis tools for the current chart only

### Indicators (persistent)

- Stored in `localStorage` under key `tradle-indicators`
- Format: `{ sma20: true, sma50: false, ema12: true, rsi: false, ... }`
- On chart mount, read localStorage and enable saved indicators
- When user toggles an indicator, update both chart and localStorage

## Round Transition Behavior

When "Next Round" is clicked:
1. All drawing primitives are removed from the chart
2. Indicator overlays remain enabled (read from localStorage)
3. Chart re-renders with new round's candles + persisted indicators
4. Toolbar resets to default tool (crosshair)

## Component Interaction

```
GameClient
  ├── roundKey (incremented each round)
  ├── indicators (from localStorage)
  │
  └── PuzzleChart
        ├── creates chart with lightweight-charts
        ├── attaches drawing plugin to series
        ├── attaches indicator series based on enabled state
        ├── clears drawings when roundKey changes
        │
        └── ChartToolbar
              ├── tool selection → PuzzleChart activates drawing mode
              ├── indicator toggles → update localStorage + PuzzleChart
              ├── magnet toggle → snap mode
              └── delete → remove selected drawing
```

## UI/UX Details

### Toolbar Styling
- Dark theme matching chart (`#1a1a2e` background)
- Icons only (no text labels) to save space
- Active tool highlighted with accent color (violet)
- Hover tooltip showing tool name
- 40px wide, positioned left of chart

### Indicator Panel
- Clicking "Indicators" button opens a dropdown/modal
- Toggle switches for each indicator
- Color-coded: green for enabled, gray for disabled
- Shows current parameters (e.g., "SMA 20")

### Drawing Interactions
- Click to place first anchor point
- Move mouse to preview (ghost line follows cursor)
- Click to place second anchor point (completes the drawing)
- Click existing drawing to select (shows handles)
- Drag handles to adjust
- Press Delete or click trash icon to remove selected

## Testing

1. Drawing tools appear and function on chart
2. Drawings clear when moving to next round
3. Indicators persist across rounds
4. Indicators survive page refresh
5. Toolbar styling matches dark theme
6. Mobile responsiveness (toolbar collapses or hides on small screens)
