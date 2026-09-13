# Democracy Simulator

A static web app that renders a national legislature as a chessboard. Open `index.html` in a browser—no server, no build step, no dependencies.

## What it is

One cell = one seat. Piece rank encodes party rank by seat count: ♛ ♜ ♝ ♞ ♟ for 1st, 2nd, 3rd, 4th, 5th-and-below. A gold ♚ marks the pivot seat—the one that crosses the majority line, lifted clear of the board.

The grid auto-sizes: `cols = ceil(sqrt(total_seats))`. A 630-seat Bundestag renders 26 × 25.

The board is drawn in 3D with CSS transforms—no WebGL, no library. Drag to turn
it, scroll to zoom, and use Flatten for a plan view. Pieces stand upright and
face the camera however the board is turned.

Every seat is a DOM element that is reused rather than rebuilt, so changing the
country, method, threshold, or a vote share animates each seat from its old
position and colour to its new ones. A staggered delay makes the chamber
resettle as a sweep. `prefers-reduced-motion` collapses all of it.

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
- `test.cjs` — Data assertions; run with `node test.cjs`. The last check compiles
  `index.html`'s inline script, because nothing else here loads the UI and a
  syntax error in it would otherwise ship with a green suite.

## Controls

Scenario presets, country, method, threshold slider, chamber size, per-party vote
shares, coalition builder, labels toggle, PNG export, and view controls (Flatten,
Orbit, Re-centre).

Clicking a seat adds its party to the coalition; dragging the board does not.
PNG export renders a flat SVG of the same board rather than a screenshot of the
tilted view—a plan is the more useful thing to paste into a document.

## Teaching the change

The board shows states; these three name the *cause*, which is the part a user
cannot infer from watching seats move.

- **Scenarios** — a dropdown of named, pre-verified states with a sentence saying
  what to look at and which control to try next. It adds no new mechanics: each
  preset is only a set of values for controls that already exist. Applying one
  renders twice on purpose — first the chamber as actually elected, then the
  preset's method — so the change line below narrates the difference for free.
- **Change line** — after any control change, the top movers and the shift in the
  Gallagher index, e.g. `Labour −192 · Reform UK +88 · Gallagher 23.8 → 0.1`.
  While the threshold slider is being dragged the baseline is held still, so the
  line reads as the whole drag rather than the last frame.
- **Price column** — vote share per seat, indexed so the cheapest seat in the
  chamber reads `1.0×`. A party at `2.4×` paid 2.4 times as much per seat as the
  cheapest party did. Read the column's *spread*: under proportional rules it
  flattens to 1.0 everywhere, while UK 2024 as elected runs Labour 1.0× against
  Conservative 2.4× and Others 5.0×. It is a per-party Gallagher index. Parties
  with no seats have no meaningful price and show an em dash.

## Metrics shown

- **Gallagher index** — percentage points of disproportionality; higher = chamber matches votes less well
- **Effective number of parties** — Laakso-Taagepera (ENP)
- **Unrepresented votes** — share cast for parties that won no seats at all. Note this is *not* the standard "wasted votes" measure: under FPTP most wasted votes are losing votes inside constituencies, which national vote shares cannot see, so this reads 0.0% for the UK
- Majority line

## Adding a country

Run `/add-country <Country>` in Claude Code, which inserts the entry into `countries.js` and runs tests. For manual entry, read `countries.js` and match its entry shape exactly.

## Adding a method

Add a key to `METHODS` in `electoral.js` and a case in `allocate()`. That's the extension point.

## Known limits

Election data is approximate, a snapshot of the stated year. FPTP and two-round systems cannot be derived from national vote shares—those countries store real seat counts and default to `actual`. The cube rule is a toy model. Germany's overhang/levelling mechanics and mixed-member tiers are not simulated, only the proportional outcome. Ties in divisor methods resolve to list order, not by lot as real law requires. A full re-render of a 630-seat board costs roughly 16ms, so continuous input (the threshold slider) is capped at one render per frame and shortens its transitions while the drag is live.
