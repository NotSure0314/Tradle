# Project Idea: Trading Chart Prediction Game

## What I'm Building

I want to build a game for traders that's like a mix of Wordle and GeoGuessr, but for reading price charts. It's not for beginners learning to trade, it's a fun daily game aimed at people who already trade or know how to read charts and want a quick, competitive way to test their instincts.

## Core Concept

The player is shown a real historical price chart (stock or crypto) with the future price hidden. They can use whatever strategy or analysis they want (technical indicators, patterns, gut feel, whatever) to predict where the price will land. The closer their prediction is to the actual outcome, the more points they get. The farther off, the fewer points.

## Game Structure

- Each session is 5 rounds.
- Each round shows a new chart, and the player submits one price prediction per round.
- Scoring rewards two things: predicting the correct direction (up/down), and rewarding risk, meaning a player who correctly calls a big/volatile move should score higher than one who plays it safe and calls something closer to flat, if they're both right. I haven't finalized the exact scoring formula yet, this needs to be worked out concretely with real number examples before coding it.
- After 5 rounds, the player gets a total score for that session.

## Leaderboards

- A daily leaderboard: resets each day, shows top scores for that day's specific chart set.
- An all-time leaderboard: cumulative best scores across all days.
- A new set of charts appears each day (same day = same charts for everyone, so scores are comparable, like Wordle).

## Key Design Decision I Still Need to Settle: Timeframe

Originally I considered letting each player pick their own prediction timeframe/strategy freely. The problem: if timeframe is fully open-ended, difficulty isn't consistent between players, and the leaderboard stops being a fair comparison (someone predicting 1 minute ahead vs 6 months ahead can't be ranked against each other meaningfully).

Current leaning: the game itself picks the chart AND the prediction horizon each day (e.g. "here's 3 months of daily candles, guess the closing price 5 trading days from now"). The player still brings their own strategy/approach to analyzing the chart, they just don't get to pick the horizon. This keeps every player on the same daily puzzle, like Wordle.

This is still an open decision and I'm open to alternative structures (e.g. multiple fixed timeframe "modes" with separate leaderboards per mode, similar to how some competing games structure it) if there's a better way to preserve fairness while still giving players some choice.

## Data

- Uses real historical chart data (stocks and/or crypto), not synthetic/generated charts.
- Data needs to come from a real source, likely a free-tier API (crypto exchanges like Coingecko/Binance have accessible free public data; stocks would need something like Alpha Vantage or Polygon).

## Who It's For

Traders and people who already understand charts, who want a fun, low-stakes, replayable game, not a beginner education tool. This is a deliberate differentiation, since most existing "trading game" apps are explicitly built as learning tools for new traders. I want mine to feel more like a genuinely fun daily puzzle/competitive game first.

## My Background / Constraints

- This is a personal passion project, not a funded startup. No monetization plan currently, not a priority.
- I'm coding this myself, and I'm confident in my ability to build it.
- I haven't done deep market research on this space before having this idea, I came up with it independently.

## Known Competitors (already researched)

I've already confirmed this space is more crowded than I initially assumed. Notable existing products:

- **Chartz (chartz.xyz)**: A "Geoguessr-like game for trading." Has multiple modes including one called "Exact Price" which is essentially my idea already built: predict the closing price across five rounds, selectable timeframe (1d/3d/7d/30d), selectable market (stocks/crypto), leaderboard included.
- **tradeguessr.com**: Described as "GeoGuessr-style trading game, place your price target, see how close you get." Currently offline (site down due to unpaid hosting), which is itself a signal about how hard it is to sustain.
- Several adjacent but distinct daily chart-guessing games exist too (guess the stock's *identity* rather than future price): Stockle, Chartdle, Guess the Stock Chart, Stocktangle, ChartZero, Graphs.world. These aren't direct competitors to the "predict the exact price" mechanic but show the broader "Wordle-for-charts" format is a proven, populated category.

Given this, my goal isn't to fill an empty gap, it's to build my own version of a proven concept, with my own take on scoring (direction + risk-reward weighting) and my own design decisions (especially around the timeframe fairness problem above), because I want to build and own this myself rather than because no one has done it.

## What I Need Help With

I'm looking for help designing/building this: working out the exact scoring formula with concrete number examples, deciding the timeframe/fairness structure, picking a data source and pulling real OHLC data, and building the actual game (chart rendering, round flow, leaderboard, daily chart generation logic).
