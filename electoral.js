/* Seat math and board mapping. Pure functions, no DOM.
   Loaded as a classic script by index.html (so the app opens from file:// with
   no server) and require()d by test.cjs via the tail at the bottom. */

const PIECES = ['♛', '♜', '♝', '♞', '♟']; // queen, rook, bishop, knight, pawn
const KING = '♚';

const METHODS = {
  actual:       'Actual result (as elected)',
  hare:         'Largest remainder · Hare quota',
  droop:        'Largest remainder · Droop quota',
  dhondt:       'D’Hondt divisors (1, 2, 3 …)',
  sainte_lague: 'Sainte-Laguë divisors (1, 3, 5 …)',
  cube:         'Cube rule (rough FPTP model)',
};

// Fallback hues for parties that arrive without a colour of their own.
// Validated categorical order, dark-surface steps.
const PALETTE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

const sum = a => a.reduce((x, y) => x + y, 0);

const normalize = shares => {
  const t = sum(shares);
  return t > 0 ? shares.map(s => s / t) : shares.map(() => 0);
};

// Largest remainder. droop=false -> Hare quota (1/S); droop=true -> Droop (1/(S+1)).
function largestRemainder(seats, shares, droop) {
  const quota = 1 / (seats + (droop ? 1 : 0));
  const out = shares.map(s => Math.floor(s / quota));
  const order = shares
    .map((s, i) => [s / quota - out[i], i])
    .filter(([, i]) => shares[i] > 0)              // a party with no votes never picks up a remainder seat
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);   // ties break by list order, so a board is reproducible
  if (!order.length) return out;

  let left = seats - sum(out);
  for (let k = 0; left > 0; k++, left--) out[order[k % order.length][1]]++;
  // The Droop quota can hand out one seat more than the chamber has. Take it
  // back from the smallest remainder that actually won something.
  for (let k = order.length - 1; left < 0; k--) {
    const i = order[((k % order.length) + order.length) % order.length][1];
    if (out[i] > 0) { out[i]--; left++; }
  }
  return out;
}

// Divisor methods. sainte=false -> D'Hondt (s+1); sainte=true -> Sainte-Lague (2s+1).
// ponytail: O(seats x parties) scan, ~5k operations for a 630-seat chamber.
// Reach for a heap only if chambers ever reach six figures.
function divisorMethod(seats, shares, sainte) {
  const out = shares.map(() => 0);
  for (let s = 0; s < seats; s++) {
    let best = -1, bestQ = 0;
    for (let i = 0; i < shares.length; i++) {
      const q = shares[i] / (sainte ? 2 * out[i] + 1 : out[i] + 1);
      if (q > bestQ) { bestQ = q; best = i; }      // ties break by list order, so a board is reproducible
    }
    if (best < 0) break;                           // nobody has votes left to divide
    out[best]++;
  }
  return out;
}

function allocate(method, seats, shares) {
  if (!shares.length) return [];
  switch (method) {
    case 'droop':        return largestRemainder(seats, shares, true);
    case 'dhondt':       return divisorMethod(seats, shares, false);
    case 'sainte_lague': return divisorMethod(seats, shares, true);
    // Cube rule: the textbook approximation of a first-past-the-post chamber,
    // where seats track roughly the cube of votes. A toy model standing in for
    // geography, not a simulation of constituencies.
    case 'cube':         return largestRemainder(seats, normalize(shares.map(s => s ** 3)), false);
    default:             return largestRemainder(seats, shares, false); // hare
  }
}

/* rules  - one entry from countries.js
   opts   - { method, seats, threshold, shares: {partyName: 0..1} }, all optional
   returns a board state: parties (sorted, seated, coloured), cells, metrics. */
function runScenario(rules, opts = {}) {
  const method = opts.method || rules.method;
  const seats = opts.seats || rules.total_seats;
  const threshold = opts.threshold == null ? rules.threshold : opts.threshold;

  const src = rules.parties;
  const votes = normalize(src.map(p => (opts.shares && opts.shares[p.name] != null ? opts.shares[p.name] : p.vote_share)));

  let won;
  if (method === 'actual') {
    won = src.map(p => p.seats || 0);
  } else {
    // Zero out the parties that miss the threshold rather than filtering them,
    // so every array below stays index-aligned with `src`.
    const surviving = normalize(votes.map((v, i) => (v >= threshold || src[i].exempt ? v : 0)));
    won = allocate(method, seats, surviving);
  }

  const parties = src
    .map((p, i) => ({
      name: p.name,
      color: p.color || PALETTE[i % PALETTE.length],
      votes: votes[i],
      seats: won[i],
      cut: method !== 'actual' && !p.exempt && votes[i] < threshold,
    }))
    .sort((a, b) => b.seats - a.seats || b.votes - a.votes);
  parties.forEach((p, i) => { p.rank = i + 1; p.piece = PIECES[Math.min(i, PIECES.length - 1)]; });

  const total = sum(parties.map(p => p.seats));
  const majority = Math.floor(total / 2) + 1;

  // Seat price: vote share per seat, indexed so the cheapest seat in the
  // chamber reads 1.0. A party at 2.4 paid 2.4x what the cheapest party paid
  // for the same single seat. Parties with no seats, or seats but no votes,
  // have no meaningful price and get null.
  const prices = parties.map(p => (p.seats > 0 && p.votes > 0 ? p.votes / (p.seats / total) : 0));
  const cheapest = Math.min(...prices.filter(x => x > 0));
  parties.forEach((p, i) => { p.price = prices[i] > 0 ? prices[i] / cheapest : null; });
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const rows = Math.max(1, Math.ceil(total / cols));

  // Fill the board bloc by bloc, largest party first, so the majority line
  // falls inside whichever party holds the deciding seat.
  const cells = [];
  let idx = 0;
  for (const p of parties) {
    p.start = idx;
    for (let s = 0; s < p.seats; s++, idx++) {
      const pivot = idx === majority - 1;
      cells.push({ r: (idx / cols) | 0, c: idx % cols, party: p.name, color: p.color, piece: pivot ? KING : p.piece, pivot });
    }
  }

  return {
    country: rules.country, chamber: rules.chamber, year: rules.year,
    system: rules.system, note: rules.note,
    method, threshold, seats, total, majority, rows, cols, cells, parties,
    metrics: total ? {
      // Gallagher least-squares index of disproportionality, in percentage points.
      gallagher: Math.sqrt(0.5 * sum(parties.map(p => ((p.votes - p.seats / total) * 100) ** 2))),
      // Laakso-Taagepera effective number of parliamentary parties.
      enp: 1 / sum(parties.map(p => (p.seats / total) ** 2)),
      // Share of votes cast for parties that won nothing.
      wasted: sum(parties.filter(p => p.seats === 0).map(p => p.votes)),
    } : { gallagher: 0, enp: 0, wasted: 0 },
  };
}

if (typeof module !== 'undefined') module.exports = { PIECES, KING, METHODS, PALETTE, normalize, largestRemainder, divisorMethod, allocate, runScenario };
