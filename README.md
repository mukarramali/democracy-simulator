# Democracy Simulator

A static web app that renders a national legislature as a chessboard. Open `index.html` in a browser—no server, no build step, no dependencies.

## What it is

One cell = one seat. Piece rank encodes party rank by seat count: ♛ ♜ ♝ ♞ ♟ for 1st, 2nd, 3rd, 4th, 5th-and-below. A gold ♚ marks the pivot seat—the one that crosses the majority line.

The grid auto-sizes: `cols = ceil(sqrt(total_seats))`. A 630-seat Bundestag renders 26 × 25.

## Methods

Swap the allocation method and watch the same votes produce a different chamber:
- `actual` — the real elected result
- `hare` — Largest remainder with Hare quota
- `droop` — Largest remainder with Droop quota
- `dhondt` — D'Hondt divisor method (1, 2, 3 …)
- `sainte_lague` — Sainte-Laguë divisor method (1, 3, 5 …)
- `cube` — A toy FPTP approximation (s³ votes)

## Files

- `index.html` — UI and rendering
- `electoral.js` — Seat allocation math (pure functions, no DOM)
- `countries.js` — Electoral data (country, chamber, year, parties, votes, seats)
- `test.cjs` — Data assertions; run with `node test.cjs`

## Controls

Country, method, threshold slider, chamber size, per-party vote shares, coalition builder, labels toggle, PNG export.

## Metrics shown

- **Gallagher index** — percentage points of disproportionality; higher = chamber matches votes less well
- **Effective number of parties** — Laakso-Taagepera (ENP)
- **Wasted votes** — share cast for parties that won nothing
- Majority line

## Adding a country

Run `/add-country <Country>` in Claude Code, which inserts the entry into `countries.js` and runs tests. For manual entry, read `countries.js` and match its entry shape exactly.

## Adding a method

Add a key to `METHODS` in `electoral.js` and a case in `allocate()`. That's the extension point.

## Known limits

Election data is approximate, a snapshot of the stated year. FPTP and two-round systems cannot be derived from national vote shares—those countries store real seat counts and default to `actual`. The cube rule is a toy model. Germany's overhang/levelling mechanics and mixed-member tiers are not simulated, only the proportional outcome. Ties in divisor methods resolve to list order, not by lot as real law requires.
