// Headless smoke test: plays several full seasons and checks invariants.
// Run with: node tests/sim.test.js
const assert = require('assert');
require('../js/engine.js');
const E = globalThis.Engine;

E.newGame(+(process.argv[2]||5), 'Tester', +(process.argv[3]||12345));
let goals = 0, games = 0, homeWins = 0;
for (let season = 0; season < 5; season++) {
  while (!E.state.seasonOver) {
    const fx = E.userFixture();
    if (fx) E.applyResult(E.simMatch(fx));
    E.playOtherMatches(fx);
    E.fixturesForWeek(E.state.week).forEach((f) => { goals += f.hg + f.ag; games++; if (f.hg > f.ag) homeWins++; });
    E.endWeek();
    E.state.gameOver = false; // keep simulating regardless of the board
  }
  const table = E.standings();
  assert.strictEqual(E.state.clubs.reduce((a, c) => a + c.table.p, 0), 22 * 24);
  assert(E.state.cup.winner !== null, 'cup has a winner');
  assert.strictEqual(E.state.fixtures.filter((f) => f.comp === 'CUP').length, 8 + 8 + 4 + 2 + 1);
  E.state.fixtures.filter((f) => f.comp === 'CUP').forEach((f) => assert(f.played && f.winner !== undefined));
  const before = [1, 2].map((d) => E.standings(d).map((c) => c.id));
  const fxBefore = E.state.fixtures.filter((f) => f.comp === 'CUP' && f.round === 4)[0];
  const s = E.endSeason();
  // promotion/relegation swapped the right clubs
  before[0].slice(-2).forEach((id) => assert.strictEqual(E.club(id).div, 2));
  before[1].slice(0, 2).forEach((id) => assert.strictEqual(E.club(id).div, 1));
  assert.strictEqual(E.state.clubs.filter((c) => c.div === 1).length, 12);
  E.state.gameOver = false;
  if (E.state.season === season + 1) { E.state.season++; E.state.week = 0; E.state.seasonOver = false; }
  console.log(`S${s.season}: champ ${s.champion}/${s.d2Champion}, up ${s.promoted}, down ${s.relegated}, cup ${s.cupWinner}; user D${s.division} ${s.position} (exp ${s.expected}) cup ${s.cup}, budget ${E.money(E.userClub().budget)}, top ${s.topScorer}`);
  E.state.clubs.forEach((c) => {
    assert(c.squad.length >= 16, `${c.name} squad ${c.squad.length}`);
    c.squad.forEach((id) => assert(E.player(id) && E.player(id).club === c.id));
  });
}
console.log('goals/game', (goals / games).toFixed(2), 'home win %', (100 * homeWins / games).toFixed(1));
console.log('budgets', E.state.clubs.map((c) => c.short + c.div + ' ' + c.rep + ' ' + E.money(c.budget)).join(', '));
// save round-trip
const json = E.serialize();
E.load(json);
assert.strictEqual(E.serialize(), json);
console.log('OK');
