// Headless smoke test: plays several full seasons and checks invariants.
// Run with: node tests/sim.test.js
const assert = require('assert');
require('../js/engine.js');
const E = globalThis.Engine;

E.newGame(5, 'Tester', 12345);
let goals = 0, games = 0, homeWins = 0;
for (let season = 0; season < 5; season++) {
  while (!E.state.seasonOver) {
    const fx = E.userFixture();
    const m = E.simMatch(fx);
    E.applyResult(m);
    E.playOtherMatches(fx);
    E.fixturesForWeek(E.state.week).forEach((f) => { goals += f.hg + f.ag; games++; if (f.hg > f.ag) homeWins++; });
    E.endWeek();
    E.state.gameOver = false; // keep simulating regardless of the board
  }
  const table = E.standings();
  assert.strictEqual(table.reduce((a, c) => a + c.table.p, 0), 22 * 12);
  const s = E.endSeason();
  E.state.gameOver = false;
  if (E.state.season === season + 1) { E.state.season++; E.state.week = 0; E.state.seasonOver = false; }
  console.log(`S${s.season}: champ ${s.champion}, user ${s.position} (exp ${s.expected}), budget ${E.money(E.userClub().budget)}, top ${s.topScorer}`);
  E.state.clubs.forEach((c) => {
    assert(c.squad.length >= 16, `${c.name} squad ${c.squad.length}`);
    c.squad.forEach((id) => assert(E.player(id) && E.player(id).club === c.id));
  });
}
console.log('goals/game', (goals / games).toFixed(2), 'home win %', (100 * homeWins / games).toFixed(1));
console.log('budgets', E.state.clubs.map((c) => c.short + ' ' + E.money(c.budget)).join(', '));
// save round-trip
const json = E.serialize();
E.load(json);
assert.strictEqual(E.serialize(), json);
console.log('OK');
