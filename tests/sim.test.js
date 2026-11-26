// Headless smoke test: plays several full seasons and checks invariants.
// Run with: node tests/sim.test.js
const assert = require('assert');
['england', 'spain', 'italy', 'france', 'germany', 'netherlands', 'portugal', 'others', 'world', 'europe', 'nations', 'legends'].forEach((f) => require(`../data/${f}.js`));
require('../js/engine.js');
const E = globalThis.Engine;

E.newGame(+(process.argv[2]||5), 'Tester', +(process.argv[3]||12345), process.argv[4] || 'fictional', process.argv[5] ? { nation: process.argv[5] } : {});
const national = E.state.mode === 'national';
const wkLog = [];
const ccLog = [];
const wkCount = () => Object.values(E.state.players).filter((p) => p.club !== null && E.isWonderkid(p)).length;
assert(wkCount() >= 5, 'wonderkids present');
let goals = 0, games = 0, homeWins = 0;
for (let season = 0; season < 5; season++) {
  while (!E.state.seasonOver) {
    const fx = E.userFixture();
    if (fx) E.applyResult(E.simMatch(fx));
    E.playOtherMatches(fx);
    E.fixturesForWeek(E.state.week).forEach((f) => { goals += f.hg + f.ag; games++; if (f.hg > f.ag) homeWins++; });
    // respond to bids: reject them all (tests the morale path)
    while ((E.state.offers || []).length) assert(E.respondOffer(0, false).ok);
    E.endWeek();
    E.state.gameOver = false; // keep simulating regardless of the board
  }
  const table = E.standings();
  const divs = E.leagueDivs();
  const expectedGames = divs.reduce((a, d) => { const n = E.standings(d).length; return a + n * (n - 1) * (E.state.meta.leagues[d - 1].cycles || 2); }, 0);
  assert.strictEqual(E.state.clubs.reduce((a, c) => a + c.table.p, 0), expectedGames);
  E.state.cups.forEach((cup, ci) => {
    const ties = E.state.fixtures.filter((f) => f.comp === 'CUP' && f.cup === ci);
    assert.strictEqual(ties.length, cup.clubs.length - 1, `${cup.name}: a knockout has n-1 ties`);
    assert(cup.winner !== null && ties.every((f) => f.played && f.winner !== undefined));
  });
  if (E.state.cl) {
    const lp = E.state.fixtures.filter((f) => f.comp === 'CL' && f.stage === 'lp');
    assert.strictEqual(lp.length, E.state.cl.clubs.length * 4, 'league phase: 8 games per club');
    E.state.cl.clubs.forEach((id) => assert.strictEqual(E.state.cl.table[id].p, 8));
    const opp = {}; lp.forEach((f) => { (opp[f.home] = opp[f.home] || new Set()).add(f.away); (opp[f.away] = opp[f.away] || new Set()).add(f.home); });
    Object.values(opp).forEach((set) => assert.strictEqual(set.size, 8, '8 different opponents'));
    assert.strictEqual(E.state.fixtures.filter((f) => f.comp === 'CL' && f.stage === 'ko').length, 8 + 8 + 4 + 2 + 1);
    assert(E.state.cl.winner !== null);
  }
  if (E.state.intl && E.state.intl.kind) {
    const I = E.state.intl, nl = I.format === 'nl';
    assert.strictEqual(I.qualified.length, nl ? 4 : 24, 'finalists / qualifiers');
    assert(I.winner !== null, 'tournament has a winner');
    assert.strictEqual(E.state.fixtures.filter((f) => f.comp === 'INT' && f.stage === 'TK').length, nl ? 3 : 15);
    I.groups.forEach((g) => g.forEach((id) => assert.strictEqual(I.qTable[id].p, 6)));
    if (nl) wkLog.push(`NL ${['A', 'B', 'C'].map((L) => L + ':' + Object.values(E.state.nlLeagues).filter((x) => x === L).length).join(' ')}`);
  }
  E.state.nations.forEach((n) => n.squad.forEach((id) => assert(E.player(id) && E.player(id).nat === n.code)));
  (E.state.ccs || []).forEach((cc, ci) => {
    const fx = E.state.fixtures.filter((f) => f.comp === 'CC' && f.cc === ci);
    assert.strictEqual(fx.filter((f) => f.stage === 'G').length, 48, cc.name + ' group games');
    assert.strictEqual(fx.filter((f) => f.stage === 'K').length, 7, cc.name + ' knockout ties');
    assert(cc.winner !== null && fx.every((f) => f.played), cc.name + ' finished');
    ccLog.push(`${cc.name}: ${E.club(cc.winner).name}`);
  });
  // every club plays at most once per week
  for (let w = 0; w < E.totalWeeks(); w++) {
    const seen = new Set();
    E.fixturesForWeek(w).forEach((f) => { assert(!seen.has(f.home) && !seen.has(f.away), `double booking in week ${w}`); seen.add(f.home); seen.add(f.away); });
  }
  const before = Object.fromEntries(divs.map((d) => [d, E.standings(d).map((c) => c.id)]));
  const clWinner = E.state.cl ? E.club(E.state.cl.winner).name : '-';
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
  E.state.meta.promotions.forEach((p) => {
    before[p.up].slice(-p.count).forEach((id) => assert.strictEqual(E.club(id).div, p.down));
    before[p.down].slice(0, p.count).forEach((id) => assert.strictEqual(E.club(id).div, p.up));
  });
  divs.forEach((d) => assert.strictEqual(E.state.clubs.filter((c) => c.div === d).length, before[d].length));
  if (E.state.cl && !E.state.gameOver) assert.strictEqual(E.state.cl.clubs.length, 36);
  leaving.forEach((id) => assert(!E.player(id) || E.player(id).club !== E.state.userClub, 'expired contract left'));
  if (renewed && E.player(renewed)) assert.strictEqual(E.player(renewed).club, E.state.userClub);
  if (!national) assert(E.prospects().length >= E.academyIntake(), 'academy intake arrived');
  E.prospects().forEach((p) => assert(p.academy && p.age < E.ACADEMY_GRAD_AGE && !E.userClub().squad.includes(p.id)));
  Object.values(E.state.players).forEach((p) => {
    if (p.club !== null && !p.academy) assert(p.contract >= 1, `${p.name} contract ${p.contract}`);
  });
  wkLog.push(`gb ${s.goldenBoy}`);
  console.log(`   academy L${E.state.academy.level}: ${E.prospects().map((p) => p.ovr + '/' + p.pot).join(' ')}; left on free: ${s.departed.length}; squad ${E.userClub().squad.length}`);
  if (E.state.gameOver) { E.state.gameOver = false; E.startNextSeason(); } // the test bot ignores sackings
  if (wkLog.length && wkLog[wkLog.length - 1].startsWith('NL')) console.log('   ' + wkLog[wkLog.length - 1]);
  if (ccLog.length) { console.log('   ' + ccLog.join(' | ')); ccLog.length = 0; }
  if (s.intl) console.log(`   ${s.intl.name}: ${s.intl.winner} beat ${s.intl.runnerUp}${s.intl.mine ? ' | you: ' + s.intl.mine + ' — ' + s.verdict : ''}`);
  else if (national) console.log('   ' + s.verdict);
  console.log(`S${s.season}: ${s.champions.map((c) => c.league + ' ' + c.club).join(', ')}; CL ${clWinner}; cup ${s.cupWinner}; user D${s.division} ${s.position} (exp ${s.expected}) cup ${s.cup} CL ${s.cl}, budget ${E.money(E.userClub().budget)}, top ${s.topScorer}`);
  E.state.clubs.forEach((c) => {
    assert(c.squad.length >= 16, `${c.name} squad ${c.squad.length}`);
    c.squad.forEach((id) => assert(E.player(id) && E.player(id).club === c.id));
  });
}
console.log('wonderkids now', wkCount(), wkLog.join(' | '));
const gems = Object.values(E.state.players).filter((p) => p.trait && p.age >= 22 && p.age <= 25 && p.pot >= 86);
console.log('ex-wonderkids aged 22-25 (ovr/pot trait):', gems.map((p) => `${p.ovr}/${p.pot} ${p.trait[0]}`).join(', '));
console.log('goals/game', (goals / games).toFixed(2), 'home win %', (100 * homeWins / games).toFixed(1));
console.log('budgets', E.state.clubs.map((c) => c.short + c.div + ' ' + c.rep + ' ' + E.money(c.budget)).join(', '));
// save round-trip
const json = E.serialize();
E.load(json);
assert.strictEqual(E.serialize(), json);
console.log('OK');
