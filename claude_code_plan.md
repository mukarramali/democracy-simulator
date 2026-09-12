# Democracy Chess Board — Claude Code Project Plan

## Project overview
Build a static web app that visualizes democratic systems as a chess-like board. The user provides only a country name; the app uses built-in general knowledge to fetch that country's electoral rules (threshold, seat count, allocation method) and renders a board where pieces encode parties and their seat shares.

## High-level architecture
**Front end (static only — no back end):**
- HTML + CSS + vanilla JS (or lightweight framework)
- Renders a grid board (2D canvas or SVG; optional 3D via Three.js)
- Accepts a JSON "board state" and draws pieces accordingly
- Simple controls: switch 2D/3D, rotate view, toggle labels, reset

**Logic layer (client-side module):**
- Accepts a country name (string)
- Looks up that country's democratic rules from a built-in knowledge base (e.g., Germany → 5% threshold, 630 seats, party-list PR; India → FPTP, no threshold, etc.)
- Applies electoral rules to a default or user-provided vote distribution
- Outputs a normalized board-state JSON for the front end to render

**No back end:** Everything runs in the browser. No persistence, auth, or server-side computation.

## Data contracts (JSON schemas)

### Scenario input (minimal; country only)
```json
{
  "country": "Germany"
}
```

Optional extended input (if user wants to customize):
```json
{
  "country": "Germany",
  "year": 2025,
  "custom_parties": [
    {"name": "CDU/CSU", "vote_share": 0.28},
    {"name": "SPD", "vote_share": 0.22}
  ]
}
```

### Internal scenario representation (after country lookup)
```json
{
  "system": "party_list_proportional",
  "country": "Germany",
  "total_seats": 630,
  "threshold": 0.05,
  "parties": [
    {"name": "CDU/CSU", "vote_share": 0.28},
    {"name": "SPD", "vote_share": 0.22},
    {"name": "Greens", "vote_share": 0.15},
    {"name": "FDP", "vote_share": 0.06},
    {"name": "AfD", "vote_share": 0.12},
    {"name": "The Left", "vote_share": 0.04},
    {"name": "Others", "vote_share": 0.13}
  ],
  "method": "largest_remainder_hare",
  "metadata": {
    "year": 2025,
    "notes": "Federal election simulation"
  }
}
```

### Board state output (front end consumes)
```json
{
  "board": {
    "rows": 8,
    "cols": 8,
    "cells": [
      {
        "r": 0,
        "c": 0,
        "piece": {
          "shape": "pawn",
          "color": "#3B82F6",
          "size": 1.0,
          "label": "CDU/CSU",
          "value": 176,
          "category": "party"
        }
      },
      {
        "r": 0,
        "c": 1,
        "piece": {
          "shape": "pawn",
          "color": "#EF4444",
          "size": 0.9,
          "label": "SPD",
          "value": 139,
          "category": "party"
        }
      }
    ]
  },
  "legend": [
    {"label": "CDU/CSU", "color": "#3B82F6", "shape": "pawn", "seats": 176},
    {"label": "SPD", "color": "#EF4444", "shape": "pawn", "seats": 139}
  ],
  "metadata": {
    "system": "party_list_proportional",
    "threshold_applied": true,
    "excluded_parties": ["The Left"],
    "method": "largest_remainder_hare"
  }
}
```

## Core algorithms

### 1) Country knowledge base
A static JSON or JS module mapping country names to electoral rules:
```js
const COUNTRY_RULES = {
  "Germany": {
    "system": "party_list_proportional",
    "total_seats": 630,
    "threshold": 0.05,
    "method": "largest_remainder_hare",
    "default_parties": [ /* typical German party distribution */ ]
  },
  "India": {
    "system": "first_past_the_post",
    "total_seats": 543,
    "threshold": 0,
    "method": "fptp",
    "default_parties": [ /* typical Indian party distribution */ ]
  }
  // ... more countries
};
```

### 2) Apply threshold and normalize votes
- Filter parties with `vote_share < threshold`
- Renormalize remaining parties so shares sum to 1.0
- Track excluded parties for metadata

### 3) Seat allocation (configurable per country)
Support at least two methods:
- **Largest Remainder (Hare quota):**
  - Quota = `total_seats / sum_of_valid_votes` (or 1.0 if using shares)
  - Initial seats = `floor(party_share / quota)`
  - Remainders = `party_share − (initial_seats × quota)`
  - Distribute remaining seats to parties with largest remainders
- **Divisor methods (optional, e.g., d'Hondt or Sainte-Laguë·»**
  - Iteratively assign seats by highest quotient = `votes / (seats_already_assigned + divisor_factor)`

### 4) Map seats to board pieces
- Choose piece shapes by category (parties = pawns; coalitions = knights; special entities = bishops)
- Assign colors from a palette; ensure distinct colors per party
- Size can be uniform or scaled by seat count: `size = 0.8 + 0.4 × (seats / max_seats)`
- Fill the board row-major until all seats are placed; leftover cells remain empty

## Front-end rendering spec
- **Grid:** configurable rows/cols (default 8×·
- **Piece rendering:**
  - 2D: SVG or canvas shapes (circle, triangle, square, custom paths for chess silhouettes)
  - 3D (optional): Three.js primitives or GLTF models for chess pieces; map shape → model, color → material, size → scale
- **Interactions:**
  - Hover: show tooltip with label, value (seats), percentage
  - Click: highlight all pieces of that party; show details panel
- **Controls:** toggle 2D/3D, rotate (if 3D), show/hide labels, reset button, export PNG/SVG
- **Legend:** render from `board_state.legend` with color swatches, shapes, and seat counts

## Step-by-step build plan for Claude Code

### Phase 1 — Scaffold and contracts
1. Initialize a vanilla JS project with:
   - `index.html`, `styles.css`, `main.js`
   - `/lib/scenario.js` (logic), `/lib/board.js` (renderer), `/data/country_rules.json`
2. Implement JSON schema validators (simple runtime checks) for `ScenarioInput` and `BoardState`
3. Add sample country rules: Germany (5% threshold), India (FPTP, no threshold), and a generic "custom" template

### Phase 2 — Logic layer (country → board state)
4. Implement `lookupCountryRules(countryName)` → returns internal scenario representation
5. Implement `applyThreshold(parties, threshold)` → filtered + normalized parties
6. Implement seat allocation:
   - `largestRemainderHare(totalSeats, normalizedParties)`
   - Optional: `dHondt(totalSeats, votesArray)`
7. Implement `mapSeatsToBoard(seatsByParty, rows, cols)` → `BoardState` with `cells[]` and `legend[]`
8. Wire a function `runScenario(countryName, customParties?)` → `BoardState` that composes steps 4–7 and adds metadata

### Phase 3 — Front-end renderer
9. Build a 2D renderer:
   - `drawBoard(boardState)` on a canvas or SVG grid
   - `drawPiece(ctx, cell)` using shape/color/size; render label if enabled
10. Add interactions:
    - Hover tooltips, click-to-highlight, legend click to filter
11. Add controls panel:
    - 2D/3D toggle (stub 3D for now), show labels checkbox, reset button, export image

### Phase 4 — Country input UI
12. Create a simple form:
    - Country name input (text or dropdown from supported countries)
    - Optional: year selector, custom parties override
13. On submit, call `runScenario(country)` and render
14. Show error if country not found in knowledge base

### Phase 5 — Polish and extensibility
15. Add presets dropdown (Germany 2025 sim, India 2024, etc.)
16. Add theming (light/dark), responsive layout, and accessibility (keyboard nav, ARIA labels)
17. Write README with:
    - How to add new countries/rules
    - How to add new electoral methods
    - How to add new piece shapes/colors

## Acceptance criteria
- Given a country name (e.g., "Germany"), the app looks up its electoral rules, applies the threshold, allocates seats proportionally, and renders a board where each party's pieces match allocated seats.
- The board state JSON is stable and reproducible for the same input.
- The UI allows selecting different countries, recomputes seats, and updates the board instantly.
- Tooltips and legend correctly reflect seat counts and percentages.
- Code is modular: country rules, scenario logic, seat math, and rendering are separate modules with clear interfaces.
- **No back end:** Everything runs client-side; no network calls except optional asset loading.

## Notes and references
- Germany uses a mixed-member proportional system with a 5% threshold (or 3 direct seats) for Bundestag representation; seat allocation has evolved (e.g., overhang/leveling seats). Your simulator can start with a simplified proportional model and later add MMM/overhang logic.
- Largest remainder and divisor methods are standard for PR seat allocation; implement at least Hare quota to start.
- India uses first-past-the-post in single-member constituencies; for visualization, you can approximate with a national-level party seat split based on historical results.

