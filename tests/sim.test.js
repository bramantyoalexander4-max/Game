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
  // contracts: renew one expiring player (at his demand, which is always accepted), let the rest go
  const exp = E.expiringPlayers();
  let renewed = null;
  if (exp.length) {
    const chk = E.canNegotiate(exp[0]);
    if (chk.ok) { assert(E.offerContract(exp[0].id, chk.options[0], chk.demand).ok); renewed = exp[0].id; }
  }
  const leaving = E.expiringPlayers().map((p) => p.id);
  // academy: promote the best prospect, upgrade if affordable
  const best = E.prospects().sort((a, b) => b.ovr - a.ovr)[0];
  if (best && E.userClub().squad.length < E.MAX_SQUAD) assert(E.promoteProspect(best.id).ok);
  if (E.academyUpgradeCost() !== null && E.userClub().budget > E.academyUpgradeCost() * 3) assert(E.upgradeAcademy().ok);
  const s = E.endSeason();
  // promotion/relegation swapped the right clubs
  before[0].slice(-2).forEach((id) => assert.strictEqual(E.club(id).div, 2));
  before[1].slice(0, 2).forEach((id) => assert.strictEqual(E.club(id).div, 1));
  assert.strictEqual(E.state.clubs.filter((c) => c.div === 1).length, 12);
  leaving.forEach((id) => assert(!E.player(id) || E.player(id).club !== E.state.userClub, 'expired contract left'));
  if (renewed && E.player(renewed)) assert.strictEqual(E.player(renewed).club, E.state.userClub);
  assert(E.prospects().length >= E.academyIntake(), 'academy intake arrived');
  E.prospects().forEach((p) => assert(p.academy && p.age < E.ACADEMY_GRAD_AGE && !E.userClub().squad.includes(p.id)));
  Object.values(E.state.players).forEach((p) => {
    if (p.club !== null && !p.academy) assert(p.contract >= 1, `${p.name} contract ${p.contract}`);
  });
  console.log(`   academy L${E.state.academy.level}: ${E.prospects().map((p) => p.ovr + '/' + p.pot).join(' ')}; left on free: ${s.departed.length}; squad ${E.userClub().squad.length}`);
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
