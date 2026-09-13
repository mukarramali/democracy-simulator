/* Electoral data, one entry per lower/only chamber.
   Figures are the published result of the stated election, rounded; treat them
   as approximate. `vote_share` is a fraction of valid votes; `seats` is the
   real elected count (what method 'actual' shows).
   Add entries with /add-country — it writes here and runs test.cjs. */

const COUNTRIES = {

  Germany: {
    country: 'Germany', chamber: 'Bundestag', year: 2025,
    system: 'Mixed-member proportional', total_seats: 630,
    threshold: 0.05, method: 'sainte_lague',
    note: '5% threshold, waived for parties winning three constituencies and for recognised national-minority parties — the SSW sits below 1% and still holds a seat.',
    parties: [
      { name: 'CDU/CSU',   vote_share: 0.285,  seats: 208, color: '#1b1b1b' },
      { name: 'AfD',       vote_share: 0.208,  seats: 152, color: '#009ee0' },
      { name: 'SPD',       vote_share: 0.164,  seats: 120, color: '#e3000f' },
      { name: 'Grüne',     vote_share: 0.116,  seats: 85,  color: '#1aa037' },
      { name: 'Die Linke', vote_share: 0.088,  seats: 64,  color: '#be3075' },
      { name: 'BSW',       vote_share: 0.0497, seats: 0,   color: '#7d254f' },
      { name: 'FDP',       vote_share: 0.043,  seats: 0,   color: '#ffcc00' },
      { name: 'SSW',       vote_share: 0.002,  seats: 1,   color: '#003c8f', exempt: true },
      { name: 'Others',    vote_share: 0.0443, seats: 0,   color: '#8a8f98' },
    ],
  },

  India: {
    country: 'India', chamber: 'Lok Sabha', year: 2024,
    system: 'First past the post, single-member constituencies', total_seats: 543,
    threshold: 0, method: 'actual',
    note: 'Seats are won constituency by constituency, so a national vote share cannot produce them. Switch the method to see what a proportional India would look like.',
    parties: [
      { name: 'BJP',              vote_share: 0.366, seats: 240, color: '#ff9933' },
      { name: 'INC',              vote_share: 0.212, seats: 99,  color: '#19aaed' },
      { name: 'Samajwadi Party',  vote_share: 0.046, seats: 37,  color: '#ee1c25' },
      { name: 'AITC',             vote_share: 0.044, seats: 29,  color: '#20603d' },
      { name: 'DMK',              vote_share: 0.018, seats: 22,  color: '#9c0000' },
      { name: 'TDP',              vote_share: 0.010, seats: 16,  color: '#ffd700' },
      { name: 'Shiv Sena (UBT)',  vote_share: 0.013, seats: 9,   color: '#b34700' },
      { name: 'JD(U)',            vote_share: 0.009, seats: 12,  color: '#4caf50' },
      { name: 'NCP (SP)',         vote_share: 0.006, seats: 8,   color: '#0f52ba' },
      { name: 'Others',           vote_share: 0.276, seats: 71,  color: '#8a8f98' },
    ],
  },

  Israel: {
    country: 'Israel', chamber: 'Knesset', year: 2022,
    system: 'Nationwide closed-list proportional', total_seats: 120,
    threshold: 0.0325, method: 'dhondt',
    note: 'A single nationwide district with a 3.25% threshold. Meretz (3.2%) and Balad (2.9%) each fell just short and won nothing — about 6% of the electorate went unrepresented, which decided the majority. Most Israeli parties campaign in similar blues, so these hues are spread for legibility rather than taken from brand colours.',
    parties: [
      { name: 'Likud',              vote_share: 0.234, seats: 32, color: '#3987e5' },
      { name: 'Yesh Atid',          vote_share: 0.178, seats: 24, color: '#d95926' },
      { name: 'Religious Zionism',  vote_share: 0.108, seats: 14, color: '#199e70' },
      { name: 'National Unity',     vote_share: 0.091, seats: 12, color: '#c98500' },
      { name: 'Shas',               vote_share: 0.082, seats: 11, color: '#d55181' },
      { name: 'United Torah Judaism', vote_share: 0.059, seats: 7, color: '#008300' },
      { name: 'Yisrael Beiteinu',   vote_share: 0.045, seats: 6,  color: '#9085e9' },
      { name: 'Ra’am',              vote_share: 0.041, seats: 5,  color: '#e66767' },
      { name: 'Hadash–Ta’al',       vote_share: 0.038, seats: 5,  color: '#00a19a' },
      { name: 'Labor',              vote_share: 0.037, seats: 4,  color: '#a01f5b' },
      { name: 'Meretz',             vote_share: 0.032, seats: 0,  color: '#6ea100' },
      { name: 'Balad',              vote_share: 0.029, seats: 0,  color: '#5c4033' },
      { name: 'Others',             vote_share: 0.026, seats: 0,  color: '#8a8f98' },
    ],
  },

  Netherlands: {
    country: 'Netherlands', chamber: 'Tweede Kamer', year: 2023,
    system: 'Nationwide open-list proportional', total_seats: 150,
    threshold: 0, method: 'dhondt',
    note: 'No legal threshold at all — a party needs one seat’s worth of votes, about 0.67%. Fifteen parties made it in. Compare the wasted-vote figure here with Israel’s.',
    parties: [
      { name: 'PVV',       vote_share: 0.235, seats: 37, color: '#012758' },
      { name: 'GL–PvdA',   vote_share: 0.158, seats: 25, color: '#c31b23' },
      { name: 'VVD',       vote_share: 0.152, seats: 24, color: '#ff9b00' },
      { name: 'NSC',       vote_share: 0.128, seats: 20, color: '#00a0de' },
      { name: 'D66',       vote_share: 0.063, seats: 9,  color: '#00b13c' },
      { name: 'BBB',       vote_share: 0.047, seats: 7,  color: '#8cc63f' },
      { name: 'CDA',       vote_share: 0.033, seats: 5,  color: '#007b5f' },
      { name: 'SP',        vote_share: 0.031, seats: 5,  color: '#ff4d4d' },
      { name: 'DENK',      vote_share: 0.024, seats: 3,  color: '#00b2b2' },
      { name: 'PvdD',      vote_share: 0.023, seats: 3,  color: '#4b8f29' },
      { name: 'FvD',       vote_share: 0.022, seats: 3,  color: '#841818' },
      { name: 'SGP',       vote_share: 0.021, seats: 3,  color: '#e05b00' },
      { name: 'CU',        vote_share: 0.021, seats: 3,  color: '#00a6eb' },
      { name: 'Volt',      vote_share: 0.017, seats: 2,  color: '#502379' },
      { name: 'JA21',      vote_share: 0.007, seats: 1,  color: '#164995' },
      { name: 'Others',    vote_share: 0.018, seats: 0,  color: '#8a8f98' },
    ],
  },

  'New Zealand': {
    country: 'New Zealand', chamber: 'House of Representatives', year: 2023,
    system: 'Mixed-member proportional', total_seats: 123,
    threshold: 0.05, method: 'sainte_lague',
    note: 'Nominally 120 seats; constituency wins beyond a party’s proportional entitlement create overhang, and this parliament sits at 123. Te Pāti Māori is in on electorate seats, not on its 3.1% party vote.',
    parties: [
      { name: 'National',       vote_share: 0.381, seats: 49, color: '#00529f' },
      { name: 'Labour',         vote_share: 0.269, seats: 34, color: '#d82a20' },
      { name: 'Green',          vote_share: 0.116, seats: 15, color: '#098137' },
      { name: 'ACT',            vote_share: 0.086, seats: 11, color: '#e8b800' },
      { name: 'NZ First',       vote_share: 0.061, seats: 8,  color: '#1b1b1b' },
      { name: 'Te Pāti Māori',  vote_share: 0.031, seats: 6,  color: '#7a1620', exempt: true },
      { name: 'TOP',            vote_share: 0.022, seats: 0,  color: '#00b0b9' },
      { name: 'Others',         vote_share: 0.034, seats: 0,  color: '#8a8f98' },
    ],
  },

  'South Africa': {
    country: 'South Africa', chamber: 'National Assembly', year: 2024,
    system: 'Nationwide closed-list proportional', total_seats: 400,
    threshold: 0, method: 'droop',
    note: 'Pure list PR with no threshold. The ANC lost its majority for the first time since 1994 — watch where the pivot seat falls.',
    parties: [
      { name: 'ANC',       vote_share: 0.402, seats: 159, color: '#007a4d' },
      { name: 'DA',        vote_share: 0.218, seats: 87,  color: '#00a2e1' },
      { name: 'MK',        vote_share: 0.146, seats: 58,  color: '#1b1b1b' },
      { name: 'EFF',       vote_share: 0.095, seats: 39,  color: '#b31f24' },
      { name: 'IFP',       vote_share: 0.039, seats: 17,  color: '#e07b00' },
      { name: 'PA',        vote_share: 0.021, seats: 9,   color: '#6a1b9a' },
      { name: 'VF Plus',   vote_share: 0.014, seats: 6,   color: '#1a3e8c' },
      { name: 'ActionSA',  vote_share: 0.012, seats: 6,   color: '#f2a900' },
      { name: 'Others',    vote_share: 0.053, seats: 19,  color: '#8a8f98' },
    ],
  },

  Sweden: {
    country: 'Sweden', chamber: 'Riksdag', year: 2022,
    system: 'Party-list proportional', total_seats: 349,
    threshold: 0.04, method: 'sainte_lague',
    note: 'Modified Sainte-Laguë with a 4% national threshold; the app uses plain Sainte-Laguë, which is close but not identical to Swedish law.',
    parties: [
      { name: 'Socialdemokraterna', vote_share: 0.303, seats: 107, color: '#e8112d' },
      { name: 'Sverigedemokraterna', vote_share: 0.205, seats: 73, color: '#ddc400' },
      { name: 'Moderaterna',        vote_share: 0.191, seats: 68,  color: '#52bdec' },
      { name: 'Vänsterpartiet',     vote_share: 0.068, seats: 24,  color: '#af0000' },
      { name: 'Centerpartiet',      vote_share: 0.067, seats: 24,  color: '#009933' },
      { name: 'Kristdemokraterna',  vote_share: 0.053, seats: 19,  color: '#231977' },
      { name: 'Miljöpartiet',       vote_share: 0.051, seats: 18,  color: '#83cf39' },
      { name: 'Liberalerna',        vote_share: 0.046, seats: 16,  color: '#006ab3' },
      { name: 'Others',             vote_share: 0.016, seats: 0,   color: '#8a8f98' },
    ],
  },

  'United Kingdom': {
    country: 'United Kingdom', chamber: 'House of Commons', year: 2024,
    system: 'First past the post, single-member constituencies', total_seats: 650,
    threshold: 0, method: 'actual',
    note: 'The clearest case on the board: Labour turned 33.7% of the vote into 63% of the seats, while Reform’s 14.3% returned five MPs. Switch to Sainte-Laguë to see the same votes under proportional rules.',
    parties: [
      { name: 'Labour',            vote_share: 0.337, seats: 411, color: '#e4003b' },
      { name: 'Conservative',      vote_share: 0.237, seats: 121, color: '#0087dc' },
      { name: 'Reform UK',         vote_share: 0.143, seats: 5,   color: '#12b6cf' },
      { name: 'Liberal Democrats', vote_share: 0.122, seats: 72,  color: '#faa61a' },
      { name: 'Green',             vote_share: 0.067, seats: 4,   color: '#6ab023' },
      { name: 'SNP',               vote_share: 0.025, seats: 9,   color: '#d9bb00' },
      { name: 'Sinn Féin',         vote_share: 0.007, seats: 7,   color: '#326760' },
      { name: 'Plaid Cymru',       vote_share: 0.007, seats: 4,   color: '#005b54' },
      { name: 'DUP',               vote_share: 0.006, seats: 5,   color: '#d46a4c' },
      { name: 'Others',            vote_share: 0.049, seats: 12,  color: '#8a8f98' },
    ],
  },

  'United States': {
    country: 'United States', chamber: 'House of Representatives', year: 2024,
    system: 'First past the post, single-member districts', total_seats: 435,
    threshold: 0, method: 'actual',
    note: 'Two parties take essentially every seat. The effective-parties figure here is the floor for a democratic chamber; compare it with the Netherlands.',
    parties: [
      { name: 'Republican', vote_share: 0.504, seats: 220, color: '#e81b23' },
      { name: 'Democratic', vote_share: 0.476, seats: 215, color: '#00aef3' },
      { name: 'Others',     vote_share: 0.020, seats: 0,   color: '#8a8f98' },
    ],
  },

};

if (typeof module !== 'undefined') module.exports = COUNTRIES;
