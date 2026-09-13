const assert = require('node:assert');
const { PIECES, KING, METHODS, PALETTE, normalize, largestRemainder, divisorMethod, allocate, runScenario } = require('./electoral.js');

let ok_count = 0;
function ok(desc) { console.log(`ok - ${desc}`); ok_count++; }

// 1. D'Hondt hand-check: seats=10, shares=[0.41, 0.31, 0.21, 0.07]
const dhondt_result = divisorMethod(10, [0.41, 0.31, 0.21, 0.07], false);
assert.deepStrictEqual(dhondt_result, [5, 3, 2, 0], 'D\'Hondt gives [5,3,2,0]');
ok('divisorMethod D\'Hondt hand-check [5,3,2,0]');

// 2. Sainte-Laguë hand-check: same shares, sainte=true
const sainte_result = divisorMethod(10, [0.41, 0.31, 0.21, 0.07], true);
assert.deepStrictEqual(sainte_result, [4, 3, 2, 1], 'Sainte-Laguë gives [4,3,2,1]');
assert.notDeepStrictEqual(sainte_result, dhondt_result, 'Sainte-Laguë differs from D\'Hondt');
ok('divisorMethod Sainte-Laguë hand-check [4,3,2,1] and differs from D\'Hondt');

// 3. largestRemainder Hare quota: seats=10, shares=[0.41, 0.31, 0.21, 0.07]
const hare_result = largestRemainder(10, [0.41, 0.31, 0.21, 0.07], false);
assert.strictEqual(hare_result.reduce((a, b) => a + b, 0), 10, 'Hare sums to 10');
assert.deepStrictEqual(hare_result, [4, 3, 2, 1], 'Hare allocation [4,3,2,1]');
ok('largestRemainder Hare quota sums to 10 and gives [4,3,2,1]');

// 4. Every method except 'actual' allocates exactly chamber size (197 prime, shares sum to 1)
const shares_197 = [0.37, 0.24, 0.19, 0.12, 0.08];
for (const method of Object.keys(METHODS)) {
  if (method === 'actual') continue;
  const result = allocate(method, 197, shares_197);
  assert.strictEqual(result.reduce((a, b) => a + b, 0), 197, `${method} sums to 197`);
}
ok('all non-actual methods allocate exactly 197 seats (prime number test)');

// 5. Droop never over-allocates and no negatives
for (let s = 1; s <= 60; s++) {
  const result = largestRemainder(s, [0.5, 0.3, 0.2], true);
  assert.strictEqual(result.reduce((a, b) => a + b, 0), s, `Droop s=${s} sums to ${s}`);
  assert(result.every(x => x >= 0), `Droop s=${s} has no negatives`);
}
ok('Droop never over-allocates (1–60 seats, [0.5,0.3,0.2])');

// 6. Zero votes never wins a seat
const zero_hare = allocate('hare', 5, [0.6, 0.4, 0]);
assert.strictEqual(zero_hare[2], 0, 'hare: zero-vote party gets 0 seats');
const zero_dhondt = allocate('dhondt', 5, [0.6, 0.4, 0]);
assert.strictEqual(zero_dhondt[2], 0, 'dhondt: zero-vote party gets 0 seats');
ok('allocate never gives seats to zero-vote parties (hare, dhondt)');

// 7. normalize: [2,3,5] → shares summing to 1; [0,0] → all zeros without NaN
const norm1 = normalize([2, 3, 5]);
assert.strictEqual(norm1.reduce((a, b) => a + b, 0), 1, 'normalize sums to 1');
const norm2 = normalize([0, 0]);
assert.deepStrictEqual(norm2, [0, 0], 'normalize [0,0] returns [0,0]');
assert(!norm2.some(x => !Number.isFinite(x)), 'no NaN in normalized zeros');
ok('normalize produces shares summing to 1 and handles zeros without NaN');

// 8. Threshold exclusion via runScenario: 4 above threshold, 1 below
const rules_threshold = {
  country: 'Test', chamber: 'Test', year: 2024, system: 'test', note: '',
  total_seats: 100, threshold: 0.05, method: 'hare',
  parties: [
    { name: 'A', vote_share: 0.50, seats: 0, color: '#000000' },
    { name: 'B', vote_share: 0.30, seats: 0, color: '#111111' },
    { name: 'C', vote_share: 0.15, seats: 0, color: '#222222' },
    { name: 'D', vote_share: 0.05, seats: 0, color: '#333333' },
    { name: 'E', vote_share: 0.00, seats: 0, color: '#444444' } // Will be boosted to 0.04
  ]
};
// Adjust E to make sum exactly 1.0
rules_threshold.parties[4].vote_share = 1.0 - 0.50 - 0.30 - 0.15 - 0.05;
const res_threshold = runScenario(rules_threshold);
const p_below = res_threshold.parties.find(p => p.name === 'E');
assert.strictEqual(p_below.seats, 0, 'sub-threshold party E gets 0 seats');
assert.strictEqual(p_below.cut, true, 'sub-threshold party E has cut=true');
assert.strictEqual(res_threshold.total, 100, 'threshold scenario totals 100');
assert(res_threshold.parties.slice(0, 4).every(p => p.seats > 0), 'above-threshold parties get seats');
ok('runScenario threshold: sub-threshold party cut, above-threshold parties seated, total=100');

// 9. Reproducibility: same inputs → same outputs
const rules_repro = {
  country: 'Repro', chamber: 'Test', year: 2024, system: 'test', note: '',
  total_seats: 50, threshold: 0.03, method: 'dhondt',
  parties: [
    { name: 'P1', vote_share: 0.6, seats: 0, color: '#aaaaaa' },
    { name: 'P2', vote_share: 0.3, seats: 0, color: '#bbbbbb' },
    { name: 'P3', vote_share: 0.1, seats: 0, color: '#cccccc' }
  ]
};
const res1 = runScenario(rules_repro);
const res2 = runScenario(rules_repro);
assert.deepStrictEqual(res1.parties, res2.parties, 'parties reproducible');
assert.deepStrictEqual(res1.cells, res2.cells, 'cells reproducible');
ok('runScenario: identical inputs produce deep-equal parties and cells');

// 10. Board geometry: 100 seats → 10x10 grid
const rules_board = {
  country: 'Board', chamber: 'Test', year: 2024, system: 'test', note: '',
  total_seats: 100, threshold: 0, method: 'hare',
  parties: [
    { name: 'P1', vote_share: 1.0, seats: 0, color: '#dddddd' }
  ]
};
const res_board = runScenario(rules_board);
assert.strictEqual(res_board.cells.length, 100, 'cells.length === 100');
assert.strictEqual(res_board.cols, 10, 'cols === 10');
assert(res_board.cells.every(c => c.r >= 0 && c.r < res_board.rows), 'all r in range');
assert(res_board.cells.every(c => c.c >= 0 && c.c < res_board.cols), 'all c in range');
const pivots = res_board.cells.filter(c => c.pivot);
assert.strictEqual(pivots.length, 1, 'exactly one pivot cell');
assert.strictEqual(pivots[0].piece, KING, 'pivot piece is KING');
ok('board geometry: 100 seats → 10×10, one KING pivot');

// 11. Metrics sanity: proportional → low Gallagher; lopsided → high
const rules_prop = {
  country: 'Prop', chamber: 'Test', year: 2024, system: 'test', note: '',
  total_seats: 100, threshold: 0, method: 'hare',
  parties: [
    { name: 'A', vote_share: 0.5, seats: 0, color: '#eeeeee' },
    { name: 'B', vote_share: 0.5, seats: 0, color: '#ffffff' }
  ]
};
const res_prop = runScenario(rules_prop);
assert(res_prop.metrics.gallagher < 2, 'proportional allocation has gallagher < 2');
const enp_50_50 = res_prop.metrics.enp;
assert(Math.abs(enp_50_50 - 2.0) < 0.01, 'ENP for 50/50 chamber ≈ 2.0');
ok('metrics sanity: proportional Gallagher < 2 and ENP ≈ 2.0 for 50/50');

// Data section: countries.js
let countries = {};
try { countries = require('./countries.js'); } catch (e) { console.log('skipped: countries.js not present'); }

if (Object.keys(countries).length > 0) {
  for (const [name, data] of Object.entries(countries)) {
    const votes_sum = data.parties.reduce((s, p) => s + p.vote_share, 0);
    assert(Math.abs(votes_sum - 1.0) < 0.005, `${name}: vote_share sums to ~1`);
    data.parties.forEach(p => {
      assert(Number.isInteger(p.seats) && p.seats >= 0, `${name}: seats are non-negative integers`);
      assert(/^#[0-9a-fA-F]{6}$/.test(p.color), `${name} ${p.name}: color matches hex`);
      assert(p.name.length > 0, `${name}: party name non-empty`);
    });
    assert.strictEqual(data.parties.reduce((s, p) => s + p.seats, 0), data.total_seats, `${name}: seats sum to total_seats`);
    assert(data.threshold >= 0 && data.threshold <= 0.15, `${name}: threshold in [0,0.15]`);
    assert(Number.isInteger(data.total_seats) && data.total_seats > 0, `${name}: total_seats is positive integer`);
    assert(data.method in METHODS, `${name}: method in METHODS`);
    const res = runScenario(data);
    assert.strictEqual(res.total, data.total_seats, `${name}: runScenario total === total_seats`);
  }
  ok(`data: all ${Object.keys(countries).length} countries pass validation`);
}

console.log(`\n${ok_count} checks passed`);
