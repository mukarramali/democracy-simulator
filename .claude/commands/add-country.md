---
description: Add a country's electoral data to countries.js
argument-hint: Country name [year]
---

# Add a country to the simulator

Add electoral data for a country so it can be simulated. You will need:

1. The country's legislative chamber name (e.g., "Bundestag", "House of Representatives").
2. The year of the most recent national election.
3. The total number of seats in that chamber.
4. The electoral threshold as a fraction of votes (0 if none, e.g., 0.05 for 5%).
5. The allocation method: `actual` (real result), `hare` (Hare quota), `droop` (Droop quota), `dhondt` (D'Hondt divisor), `sainte_lague` (Sainte-Laguë divisor), or `cube` (FPTP approximation).
   - Proportional systems use their real method name.
   - FPTP and two-round systems **must** use `actual`, because national vote shares cannot be turned into constituency results.
   - `cube` is only a toy model and must never be a country's default.
6. Each party's national vote share (as a fraction, e.g., 0.28) and elected seat count.
7. For each party, a real brand colour as a 6-digit hex code. If two parties are indistinguishable, nudge one colour slightly. If the country's parties have no usable distinct colours, use a diverse palette instead and note it.
8. Mark any party `exempt: true` if it is legally exempt from the threshold (e.g., national-minority parties in Germany, or parties that qualified via direct constituency wins).

## Process

1. Read `countries.js` to see the exact entry shape.
2. Gather real electoral data for `$ARGUMENTS` (country name, and optional year).
3. **Vote shares must sum to 1.0.** If they don't, add an "Others" party to absorb the remainder.
4. **Seats must sum exactly to `total_seats`.** Verify before inserting.
5. Choose the method as described above. State your reasoning in a comment.
6. Choose colours from the parties' real branding. Use hex codes.
7. Insert the entry into `countries.js` in alphabetical order by country key.
8. Match the existing file formatting exactly (spacing, quotes, indentation).
9. Run `node test.cjs` and report the output. If data assertions fail, fix the data—never the test.
10. State plainly in your reply which figures are approximate or uncertain. Do not invent precision.

The entry shape (adapt to actual keys in `countries.js`):
```js
CountryKey: {
  country: "Country Name",
  chamber: "Chamber Name",
  year: 2024,
  system: "electoral system type",
  method: "actual|hare|droop|dhondt|sainte_lague|cube",
  threshold: 0.05,
  total_seats: 630,
  parties: [
    { name: "Party Name", color: "#RRGGBB", vote_share: 0.28, seats: 176, exempt: false }
  ],
  note: "Any data notes or caveats"
}
```
