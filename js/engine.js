/* Touchline Manager — game engine (no DOM access; also runs under Node for tests). */
(function (root) {
  'use strict';

  const SAVE_VERSION = 3;
  let G = null; // current game state

  // ---------- random ----------
  function rand() {
    // mulberry32, seeded from the saved state so games are reproducible
    let t = (G.seed = (G.seed + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += rand(); return (u - 2) / 0.577; };
  function weighted(items, wf) {
    const ws = items.map(wf);
    let tot = ws.reduce((a, b) => a + b, 0);
    let r = rand() * tot;
    for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  // ---------- static data ----------
  const CLUBS = [
    { name: 'Brackenford Rovers', short: 'BRF', color: '#c62828', rep: 84 },
    { name: 'Kestrel Bay', short: 'KES', color: '#1565c0', rep: 82 },
    { name: 'Marrowgate City', short: 'MAR', color: '#6a1b9a', rep: 79 },
    { name: 'Oakhaven Athletic', short: 'OAK', color: '#2e7d32', rep: 77 },
    { name: 'Coldharbour United', short: 'COL', color: '#37474f', rep: 75 },
    { name: 'Greystone Wanderers', short: 'GRE', color: '#757575', rep: 73 },
    { name: 'Fennmouth Town', short: 'FEN', color: '#f9a825', rep: 71 },
    { name: 'Elmridge Albion', short: 'ELM', color: '#00838f', rep: 69 },
    { name: 'Duncastle Harriers', short: 'DUN', color: '#ad1457', rep: 67 },
    { name: 'Highmoor Forge', short: 'HIG', color: '#ef6c00', rep: 65 },
    { name: 'Lowfield Saints', short: 'LOW', color: '#283593', rep: 63 },
    { name: 'Saltmarsh Vale', short: 'SAL', color: '#4e342e', rep: 61 },
    // Division 2
    { name: 'Ashcombe Rangers', short: 'ASH', color: '#00695c', rep: 60, div: 2 },
    { name: 'Brindle Port', short: 'BRI', color: '#5d4037', rep: 59, div: 2 },
    { name: 'Corrin Heath', short: 'COR', color: '#8e24aa', rep: 58, div: 2 },
    { name: 'Dovermere', short: 'DOV', color: '#0277bd', rep: 57, div: 2 },
    { name: 'Eastwick Rail', short: 'EAS', color: '#b71c1c', rep: 56, div: 2 },
    { name: 'Foxley Dynamos', short: 'FOX', color: '#e65100', rep: 55, div: 2 },
    { name: 'Gullhaven', short: 'GUL', color: '#546e7a', rep: 54, div: 2 },
    { name: 'Hartwell Colliery', short: 'HAR', color: '#212121', rep: 53, div: 2 },
    { name: 'Ivel Wolves', short: 'IVE', color: '#9e9d24', rep: 52, div: 2 },
    { name: 'Juniper Park', short: 'JUN', color: '#2e7d32', rep: 51, div: 2 },
    { name: 'Kilnworth', short: 'KIL', color: '#c2185b', rep: 50, div: 2 },
    { name: 'Larkspur Borough', short: 'LAR', color: '#3949ab', rep: 49, div: 2 },
  ].map((c) => ({ div: 1, ...c }));

  const FIRST = ['Aled', 'Bram', 'Caio', 'Dario', 'Emeka', 'Finn', 'Goran', 'Hugo', 'Ivo', 'Jonas', 'Kofi', 'Luca',
    'Mateo', 'Nils', 'Omar', 'Pavel', 'Quinn', 'Rafa', 'Sami', 'Teo', 'Udo', 'Viktor', 'Wes', 'Yuri', 'Zane',
    'Arlo', 'Bastian', 'Cormac', 'Dmitri', 'Elio', 'Felix', 'Gael', 'Hamza', 'Idris', 'Joel', 'Kai', 'Leon',
    'Milo', 'Noah', 'Oskar', 'Pim', 'Rui', 'Sven', 'Tariq', 'Ugo', 'Vito', 'Yann', 'Aziz', 'Bruno', 'Ciaran',
    'Dante', 'Eitan', 'Fabio', 'Gus', 'Hiro', 'Ilya', 'Jari', 'Kenji', 'Lars', 'Malik', 'Nico', 'Otto', 'Remy'];
  const LAST_A = ['Hal', 'Brom', 'Cas', 'Dor', 'Ell', 'Fen', 'Gar', 'Hol', 'Ker', 'Lan', 'Mor', 'Nor', 'Ost', 'Pen',
    'Ral', 'Sel', 'Tor', 'Vel', 'Wyn', 'Ard', 'Bel', 'Cor', 'Dav', 'Eld', 'Fal', 'Gil', 'Har', 'Lor', 'Mal', 'Ren',
    'Sto', 'Tam', 'Val', 'Wes', 'Zel', 'Ama', 'Bor', 'Cal', 'Duv', 'Ere'];
  const LAST_B = ['wick', 'ford', 'stein', 'ani', 'ero', 'ley', 'ton', 'sson', 'ovic', 'ard', 'ez', 'man', 'ski',
    'mont', 'aro', 'by', 'den', 'ini', 'ova', 'ach', 'ens', 'ier', 'ham', 'well', 'ado', 'enko', 'berg', 'oux'];

  const FORMATIONS = {
    '4-4-2': { DF: 4, MF: 4, FW: 2 },
    '4-3-3': { DF: 4, MF: 3, FW: 3 },
    '4-5-1': { DF: 4, MF: 5, FW: 1 },
    '3-5-2': { DF: 3, MF: 5, FW: 2 },
    '3-4-3': { DF: 3, MF: 4, FW: 3 },
    '5-3-2': { DF: 5, MF: 3, FW: 2 },
  };
  const MENTALITY = {
    defensive: { att: 0.92, def: 1.07 },
    balanced: { att: 1, def: 1 },
    attacking: { att: 1.07, def: 0.94 },
  };
  const INTENSITY = {
    light: { recover: 24, growth: 0.7, injury: 0.5 },
    normal: { recover: 18, growth: 1, injury: 1 },
    hard: { recover: 12, growth: 1.4, injury: 1.7 },
  };
  const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };
  const SQUAD_TEMPLATE = { GK: 2, DF: 7, MF: 8, FW: 5 };
  const MIN_SQUAD = 16, MAX_SQUAD = 30;
  const PRIZES = [9e6, 7e6, 5.5e6, 4.5e6, 3.8e6, 3.2e6, 2.7e6, 2.3e6, 2e6, 1.7e6, 1.4e6, 1.2e6];
  const DIV2_PRIZE_SHARE = 0.3;
  const PROMOTED = 2; // clubs swapping divisions each season
  const CUP_NAME = 'Shield Cup';
  const CUP_ROUNDS = ['First round', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
  const CUP_AFTER = [3, 8, 13, 17, 22]; // each cup round is played after this many league matchdays
  const CUP_PRIZE = [150000, 300000, 600000, 1200000, 3000000]; // for winning a tie in that round
  const CUP_BYES = 8; // strongest top-flight clubs skip the first round
  const MAX_CONTRACT = 5; // seasons
  const RENEW_WINDOW = 2; // players discuss new terms in the last N seasons of their deal
  const ACADEMY_MAX = 5;
  const ACADEMY_GRAD_AGE = 19; // prospects this old must be promoted or they leave

  // ---------- players ----------
  function makeName() {
    return pick(FIRST) + ' ' + pick(LAST_A) + pick(LAST_B);
  }
  function playerValue(p) {
    let v = Math.pow(1.17, p.ovr - 50) * 60000;
    if (p.age <= 23) v *= 1 + (p.pot - p.ovr) / 35;
    if (p.age >= 30) v *= Math.max(0.25, 1 - (p.age - 29) * 0.14);
    return Math.max(25000, Math.round(v / 5000) * 5000);
  }
  function wageFor(p) {
    return Math.max(1000, Math.round((Math.pow(1.12, p.ovr - 50) * 1500) / 100) * 100);
  }
  function genPlayer(pos, base, minAge, maxAge) {
    const age = ri(minAge, maxAge);
    let ovr = base + gauss() * 4.5;
    if (age < 22) ovr -= (22 - age) * 2.2;
    if (age > 31) ovr -= (age - 31) * 1.2;
    ovr = clamp(Math.round(ovr), 35, 93);
    const growth = age < 24 ? (24 - age) * 2 + rand() * 10 : rand() * 3;
    const pot = clamp(Math.round(ovr + growth), ovr, 96);
    const p = {
      id: G.nextPid++, name: makeName(), pos, age, ovr, pot,
      fitness: 100, morale: 70, injury: 0,
      apps: 0, goals: 0, assists: 0, yellow: 0,
      club: null, wage: 0, contract: 0,
    };
    p.wage = wageFor(p);
    return p;
  }
  function defaultContract(p) {
    // seasons remaining, counting the current one
    return p.age >= 32 ? ri(1, 2) : p.age >= 29 ? ri(1, 3) : ri(1, 5);
  }
  function addPlayer(p, clubId) {
    G.players[p.id] = p;
    p.club = clubId;
    p.contract = clubId === null ? 0 : defaultContract(p);
    if (clubId !== null) club(clubId).squad.push(p.id);
    else G.freeAgents.push(p.id);
    return p;
  }

  // ---------- accessors ----------
  const club = (id) => G.clubs[id];
  const player = (id) => G.players[id];
  const squadOf = (cid) => club(cid).squad.map(player);
  const userClub = () => club(G.userClub);

  // ---------- new game ----------
  function newGame(clubIndex, managerName, seed) {
    G = {
      version: SAVE_VERSION,
      seed: (seed === undefined ? Math.floor(Math.random() * 2 ** 31) : seed) >>> 0,
      manager: managerName || 'Manager',
      season: 1, week: 0, userClub: clubIndex,
      clubs: [], players: {}, freeAgents: [], nextPid: 1,
      fixtures: [], calendar: [], cup: null, news: [], history: [], training: 'normal',
      boardWarning: false, gameOver: false, seasonOver: false,
    };
    CLUBS.forEach((c, i) => {
      G.clubs.push({
        id: i, name: c.name, short: c.short, color: c.color, rep: c.rep, div: c.div,
        budget: Math.max(1.5e6, Math.round((c.rep - 50) * 450000 / 100000) * 100000),
        formation: pick(Object.keys(FORMATIONS)), mentality: 'balanced',
        squad: [], lineup: [], table: blankTable(),
      });
    });
    G.clubs.forEach((c) => {
      for (const pos of Object.keys(SQUAD_TEMPLATE)) {
        for (let k = 0; k < SQUAD_TEMPLATE[pos]; k++) {
          // first-choice players are better than squad fillers
          const base = c.rep - 4 - (k >= starterCount(pos) ? 5 : 0);
          addPlayer(genPlayer(pos, base, 17, 34), c.id);
        }
      }
      c.lineup = autoLineup(c.id);
    });
    for (let i = 0; i < 24; i++) {
      addPlayer(genPlayer(pick(['GK', 'DF', 'DF', 'MF', 'MF', 'FW']), ri(55, 70), 19, 33), null);
    }
    G.academy = { level: clamp(Math.round((userClub().rep - 45) / 10), 1, 4), prospects: [] };
    for (let i = 0; i < 3; i++) newProspect(ri(15, 17));
    scheduleSeason();
    pushNews(`Welcome, ${G.manager}! The board of ${userClub().name} expects a finish around ${ordinal(expectedPosition())} in Division ${userClub().div}.`);
    return G;
  }
  function starterCount(pos) { return { GK: 1, DF: 4, MF: 4, FW: 2 }[pos]; }
  function blankTable() { return { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function makeCalendar(leagueWeeks) {
    const cal = [];
    let md = 0, cr = 0;
    while (md < leagueWeeks || cr < CUP_ROUNDS.length) {
      if (cr < CUP_ROUNDS.length && md >= CUP_AFTER[cr]) cal.push({ type: 'cup', round: cr++ });
      else cal.push({ type: 'league', md: md++ });
    }
    return cal;
  }
  function scheduleSeason() {
    const n = G.clubs.filter((c) => c.div === 1).length;
    G.calendar = makeCalendar((n - 1) * 2);
    const weekOfMd = {};
    G.calendar.forEach((c, i) => { if (c.type === 'league') weekOfMd[c.md] = i; });
    G.fixtures = [];
    [1, 2].forEach((div) => {
      const ids = shuffle(G.clubs.filter((c) => c.div === div).map((c) => c.id));
      makeFixtures(ids).forEach((f) => { f.comp = 'L'; f.div = div; f.week = weekOfMd[f.md]; G.fixtures.push(f); });
    });
    const seeds = G.clubs.filter((c) => c.div === 1).sort((a, b) => b.rep - a.rep).slice(0, CUP_BYES);
    G.cup = { alive: G.clubs.map((c) => c.id), byes: seeds.map((c) => c.id), winner: null };
  }
  function cupDraw(week) {
    const cal = G.calendar[week];
    if (!cal || cal.type !== 'cup' || fixturesForWeek(week).length) return;
    const r = cal.round;
    const pool = shuffle(G.cup.alive.filter((id) => r > 0 || !G.cup.byes.includes(id)));
    for (let i = 0; i + 1 < pool.length; i += 2) {
      G.fixtures.push({ comp: 'CUP', round: r, week, home: pool[i], away: pool[i + 1], played: false, hg: 0, ag: 0 });
    }
    const uf = userFixture(week);
    if (uf) pushNews(`🏆 ${CUP_NAME} ${CUP_ROUNDS[r].toLowerCase()} draw: ${club(uf.home).name} v ${club(uf.away).name}.`);
    else if (r === 0 && G.cup.byes.includes(G.userClub)) pushNews(`🏆 As a seeded club you have a bye through the ${CUP_NAME} first round.`);
  }
  function cupResult(cid) {
    if (G.cup.winner === cid) return 'Winners';
    const lost = G.fixtures.find((f) => f.comp === 'CUP' && f.played && (f.home === cid || f.away === cid) && f.winner !== cid);
    if (lost) return lost.round === CUP_ROUNDS.length - 1 ? 'Runners-up' : `Out in ${CUP_ROUNDS[lost.round].toLowerCase()}`;
    return G.cup.alive.includes(cid) ? 'Still in' : '-';
  }
  function weekLabel(w) {
    const c = G.calendar[w];
    if (!c) return '';
    return c.type === 'cup' ? `${CUP_NAME} · ${CUP_ROUNDS[c.round]}` : `Matchday ${c.md + 1}`;
  }

  function makeFixtures(idList) {
    // circle method; second half of the season mirrors the first with venues swapped
    const n = idList.length;
    const ids = [...idList];
    const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const games = [];
      for (let i = 0; i < n / 2; i++) {
        const a = ids[i], b = ids[n - 1 - i];
        games.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
      rounds.push(games);
      ids.splice(1, 0, ids.pop());
    }
    const fx = [];
    rounds.forEach((g, r) => g.forEach(([h, a]) => fx.push({ md: r, home: h, away: a, played: false, hg: 0, ag: 0 })));
    rounds.forEach((g, r) => g.forEach(([h, a]) => fx.push({ md: r + n - 1, home: a, away: h, played: false, hg: 0, ag: 0 })));
    return fx;
  }
  const totalWeeks = () => G.calendar.length;
  const fixturesForWeek = (w) => G.fixtures.filter((f) => f.week === w);
  const userFixture = (w = G.week) => fixturesForWeek(w).find((f) => f.home === G.userClub || f.away === G.userClub);

  // ---------- lineups & strength ----------
  function fitFactor(fit) { return 0.62 + 0.38 * fit / 100; }
  function posFactor(pos, slot) {
    if (pos === slot) return 1;
    if (pos === 'GK' || slot === 'GK') return 0.35;
    if ((pos === 'DF' && slot === 'FW') || (pos === 'FW' && slot === 'DF')) return 0.7;
    return 0.85;
  }
  function slotRating(p, slot, fit = p.fitness) {
    return p.ovr * posFactor(p.pos, slot) * fitFactor(fit) * (0.96 + 0.08 * p.morale / 100);
  }
  function slotsFor(formation) {
    const f = FORMATIONS[formation];
    return ['GK', ...Array(f.DF).fill('DF'), ...Array(f.MF).fill('MF'), ...Array(f.FW).fill('FW')];
  }
  function autoLineup(cid) {
    const c = club(cid);
    const avail = squadOf(cid).filter((p) => p.injury === 0);
    const used = new Set();
    const lineup = [];
    const slots = slotsFor(c.formation);
    // fill natural positions first, then the gaps with the best remaining fit
    slots.forEach((slot, i) => {
      const best = avail.filter((p) => !used.has(p.id) && p.pos === slot)
        .sort((a, b) => slotRating(b, slot) - slotRating(a, slot))[0];
      if (best) { used.add(best.id); lineup[i] = { pid: best.id, slot }; }
    });
    slots.forEach((slot, i) => {
      if (lineup[i]) return;
      const best = avail.filter((p) => !used.has(p.id))
        .sort((a, b) => slotRating(b, slot) - slotRating(a, slot))[0];
      if (best) { used.add(best.id); lineup[i] = { pid: best.id, slot }; }
    });
    return lineup.filter(Boolean);
  }
  function validateLineup(cid) {
    // drop injured/departed players and refill so a lineup is always playable
    const c = club(cid);
    const ok = c.lineup.length === 11 && c.lineup.every((l) => {
      const p = player(l.pid);
      return p && p.club === cid && p.injury === 0;
    }) && slotsFor(c.formation).join() === c.lineup.map((l) => l.slot).join();
    if (!ok) {
      if (cid === G.userClub && c.lineup.length) {
        // keep the user's picks where possible
        const slots = slotsFor(c.formation);
        const keep = c.lineup.filter((l) => { const p = player(l.pid); return p && p.club === cid && p.injury === 0; });
        const used = new Set();
        const lineup = [];
        slots.forEach((slot, i) => {
          const k = keep.find((l) => l.slot === slot && !used.has(l.pid));
          if (k) { used.add(k.pid); lineup[i] = { pid: k.pid, slot }; }
        });
        const avail = squadOf(cid).filter((p) => p.injury === 0);
        slots.forEach((slot, i) => {
          if (lineup[i]) return;
          const best = avail.filter((p) => !used.has(p.id)).sort((a, b) => slotRating(b, slot) - slotRating(a, slot))[0];
          if (best) { used.add(best.id); lineup[i] = { pid: best.id, slot }; }
        });
        c.lineup = lineup.filter(Boolean);
      } else {
        c.lineup = autoLineup(cid);
      }
    }
    return c.lineup;
  }
  function strength(lineup, mentality, fitMap, home) {
    const by = { GK: [], DF: [], MF: [], FW: [] };
    lineup.forEach((l) => {
      const p = player(l.pid);
      by[l.slot].push(slotRating(p, l.slot, fitMap ? fitMap[l.pid] : p.fitness));
    });
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 20);
    const n = { DF: by.DF.length, MF: by.MF.length, FW: by.FW.length };
    const m = MENTALITY[mentality];
    const gk = by.GK.length ? by.GK[0] : 25;
    let att = (0.6 * avg(by.FW) + 0.4 * avg(by.MF)) * (1 + 0.035 * (n.FW - 2) + 0.01 * (n.MF - 4)) * m.att;
    let mid = (0.8 * avg(by.MF) + 0.1 * avg(by.DF) + 0.1 * avg(by.FW)) * (1 + 0.03 * (n.MF - 4));
    let def = (0.6 * avg(by.DF) + 0.4 * gk) * (1 + 0.035 * (n.DF - 4) + 0.01 * (n.MF - 4)) * m.def;
    const short = 1 - 0.07 * Math.max(0, 11 - lineup.length); // red cards
    const h = home ? 1.03 : 1;
    return { att: att * short * h, mid: mid * short * h, def: def * short * h };
  }
  function clubStrength(cid) {
    const c = club(cid);
    const s = strength(validateLineup(cid), c.mentality);
    return Math.round((s.att + s.mid + s.def) / 3);
  }

  // ---------- match simulation ----------
  function createMatch(fx) {
    const sides = [fx.home, fx.away];
    const m = {
      fx, sides, min: 0, score: [0, 0], events: [], done: false,
      lineups: sides.map((cid) => validateLineup(cid).map((l) => ({ ...l }))),
      fit: {}, subs: [0, 0], usedSubs: [[], []], yellows: {}, injuries: [],
      ments: sides.map((cid) => club(cid).mentality),
      shots: [0, 0], onTarget: [0, 0], possTicks: [0, 0], scorers: [], assists: [], appeared: new Set(),
    };
    sides.forEach((cid) => squadOf(cid).forEach((p) => { m.fit[p.id] = p.fitness; }));
    m.lineups.forEach((lu) => lu.forEach((l) => m.appeared.add(l.pid)));
    return m;
  }
  function ev(m, side, type, text) { m.events.push({ min: m.min, side, type, text }); }
  const pname = (pid) => player(pid).name;

  function benchOf(m, s) {
    const on = new Set(m.lineups[s].map((l) => l.pid));
    return squadOf(m.sides[s]).filter((p) => !on.has(p.id) && p.injury === 0 && !m.usedSubs[s].includes(p.id)
      && !m.injuries.includes(p.id) && !(m.yellows[p.id] >= 2));
  }
  function makeSub(m, s, outPid, inPid, reason) {
    if (m.subs[s] >= 5) return false;
    const idx = m.lineups[s].findIndex((l) => l.pid === outPid);
    if (idx < 0) return false;
    if (!benchOf(m, s).some((p) => p.id === inPid)) return false;
    const slot = m.lineups[s][idx].slot;
    m.lineups[s][idx] = { pid: inPid, slot };
    m.subs[s]++;
    m.usedSubs[s].push(outPid, inPid);
    m.appeared.add(inPid);
    ev(m, s, 'sub', `🔁 ${club(m.sides[s]).short}: ${pname(inPid)} replaces ${pname(outPid)}${reason ? ' (' + reason + ')' : ''}`);
    return true;
  }
  function bestBench(m, s, slot) {
    return benchOf(m, s).sort((a, b) => slotRating(b, slot, m.fit[b.id]) - slotRating(a, slot, m.fit[a.id]))[0];
  }
  function aiSubs(m, s) {
    if (![58, 68, 78].includes(m.min)) return;
    const tired = m.lineups[s].filter((l) => l.slot !== 'GK')
      .sort((a, b) => m.fit[a.pid] - m.fit[b.pid])[0];
    if (!tired || m.fit[tired.pid] > 72) return;
    const inP = bestBench(m, s, tired.slot);
    if (inP && slotRating(inP, tired.slot, m.fit[inP.id]) > slotRating(player(tired.pid), tired.slot, m.fit[tired.pid]))
      makeSub(m, s, tired.pid, inP.id, 'tired');
  }

  function stepMatch(m, opts = {}) {
    if (m.done) return m;
    m.min++;
    const st = m.lineups.map((lu, s) => strength(lu, m.ments[s], m.fit, s === 0));
    // possession
    const pm = Math.pow(st[0].mid, 4) / (Math.pow(st[0].mid, 4) + Math.pow(st[1].mid, 4));
    m.possTicks[rand() < pm ? 0 : 1]++;
    // chances
    if (rand() < 0.145) {
      const w0 = pm * st[0].att / st[1].def, w1 = (1 - pm) * st[1].att / st[0].def;
      const s = rand() < w0 / (w0 + w1) ? 0 : 1, o = 1 - s;
      const ratio = st[s].att / st[o].def;
      m.shots[s]++;
      const goalP = clamp(0.175 * Math.pow(ratio, 2.4), 0.04, 0.5);
      const outfield = m.lineups[s].filter((l) => l.slot !== 'GK');
      const shooter = weighted(outfield, (l) => ({ FW: 5, MF: 2.3, DF: 0.6 }[l.slot]) * Math.pow(player(l.pid).ovr / 60, 3));
      const r = rand();
      if (r < goalP) {
        m.onTarget[s]++;
        m.score[s]++;
        const others = outfield.filter((l) => l.pid !== shooter.pid);
        const assist = rand() < 0.75 ? weighted(others, (l) => ({ FW: 2.5, MF: 4, DF: 1 }[l.slot])) : null;
        m.scorers.push({ side: s, pid: shooter.pid, min: m.min });
        if (assist) m.assists.push(assist.pid);
        ev(m, s, 'goal', `⚽ GOAL! ${club(m.sides[s]).short} — ${pname(shooter.pid)}${assist ? ' (assist ' + pname(assist.pid) + ')' : ''}. ${m.score[0]}-${m.score[1]}`);
      } else if (r < goalP + 0.3) {
        m.onTarget[s]++;
        const gk = m.lineups[o].find((l) => l.slot === 'GK');
        if (rand() < 0.5) ev(m, s, 'chance', `🧤 ${pname(shooter.pid)} forces a save${gk ? ' from ' + pname(gk.pid) : ''}.`);
      } else if (rand() < 0.35) {
        ev(m, s, 'chance', pick([`${pname(shooter.pid)} fires wide.`, `${pname(shooter.pid)} heads over the bar.`,
          `${pname(shooter.pid)} hits the post!`, `Blocked! ${pname(shooter.pid)}'s shot is charged down.`]));
      }
    }
    // cards
    if (rand() < 0.011) {
      const s = rand() < 0.5 ? 0 : 1;
      const l = pick(m.lineups[s].filter((x) => x.slot !== 'GK'));
      m.yellows[l.pid] = (m.yellows[l.pid] || 0) + 1;
      if (m.yellows[l.pid] >= 2) {
        m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
        ev(m, s, 'red', `🟥 Second yellow! ${pname(l.pid)} (${club(m.sides[s]).short}) is sent off.`);
      } else ev(m, s, 'card', `🟨 ${pname(l.pid)} (${club(m.sides[s]).short}) is booked.`);
    } else if (rand() < 0.0007) {
      const s = rand() < 0.5 ? 0 : 1;
      const l = pick(m.lineups[s].filter((x) => x.slot !== 'GK'));
      m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
      m.yellows[l.pid] = 2;
      ev(m, s, 'red', `🟥 Straight red! ${pname(l.pid)} (${club(m.sides[s]).short}) is off.`);
    }
    // injuries
    const injMul = INTENSITY[G.training].injury;
    if (rand() < 0.0028 * (0.6 + 0.4 * injMul)) {
      const s = rand() < 0.5 ? 0 : 1;
      const l = pick(m.lineups[s]);
      m.injuries.push(l.pid);
      ev(m, s, 'injury', `🚑 ${pname(l.pid)} (${club(m.sides[s]).short}) is injured.`);
      const inP = bestBench(m, s, l.slot);
      if (!(inP && makeSub(m, s, l.pid, inP.id, 'injury'))) m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
    }
    // fatigue
    m.lineups.forEach((lu) => lu.forEach((l) => { m.fit[l.pid] = Math.max(20, m.fit[l.pid] - (l.slot === 'GK' ? 0.06 : 0.2)); }));
    // AI substitutions (the user's side too when they choose to sim)
    [0, 1].forEach((s) => { if (m.sides[s] !== G.userClub || opts.autoUser) aiSubs(m, s); });
    if (m.min === 45) ev(m, -1, 'info', `⏸ Half-time: ${m.score[0]}-${m.score[1]}`);
    if (m.min >= 90) {
      if (m.fx.comp === 'CUP' && m.score[0] === m.score[1]) shootout(m);
      m.done = true;
      ev(m, -1, 'info', `🏁 Full-time: ${club(m.sides[0]).name} ${m.score[0]}-${m.score[1]} ${club(m.sides[1]).name}${m.pens ? ` (${m.pens[0]}-${m.pens[1]} on penalties)` : ''}`);
    }
    return m;
  }
  function shootout(m) {
    const pens = [0, 0];
    const takers = m.lineups.map((lu) => [...lu].sort((a, b) => (a.slot === 'GK') - (b.slot === 'GK') || player(b.pid).ovr - player(a.pid).ovr));
    ev(m, -1, 'info', '🎯 Level after 90 minutes — penalties!');
    for (let k = 0; k < 40; k++) {
      for (const s of [0, 1]) {
        const t = takers[s][k % takers[s].length];
        const gk = m.lineups[1 - s].find((l) => l.slot === 'GK');
        const pScore = clamp(0.76 + (player(t.pid).ovr - (gk ? player(gk.pid).ovr : 45)) * 0.004, 0.55, 0.9);
        const scored = rand() < pScore;
        if (scored) pens[s]++;
        ev(m, s, 'pen', `${scored ? '✅' : '❌'} ${pname(t.pid)} ${scored ? 'scores' : 'misses'}. (${pens[0]}-${pens[1]})`);
        if (k < 5) {
          // stop once one side can no longer catch up
          const leftA = 5 - (k + 1), leftB = 5 - (k + (s === 1 ? 1 : 0));
          if (pens[0] > pens[1] + leftB || pens[1] > pens[0] + leftA) { m.pens = pens; return; }
        }
      }
      if (k >= 4 && pens[0] !== pens[1]) break;
    }
    m.pens = pens;
  }
  function simMatch(fx, opts = {}) {
    const m = createMatch(fx);
    while (!m.done) stepMatch(m, { autoUser: true, ...opts });
    return m;
  }
  function possession(m) {
    const t = m.possTicks[0] + m.possTicks[1] || 1;
    return Math.round(100 * m.possTicks[0] / t);
  }

  function applyResult(m) {
    const { fx } = m;
    fx.played = true; fx.hg = m.score[0]; fx.ag = m.score[1];
    fx.scorers = m.scorers.map((s) => ({ side: s.side, name: pname(s.pid), min: s.min }));
    let res = fx.hg > fx.ag ? ['W', 'L'] : fx.hg < fx.ag ? ['L', 'W'] : ['D', 'D'];
    if (fx.comp === 'CUP') {
      fx.pens = m.pens || null;
      const ws = fx.hg !== fx.ag ? (fx.hg > fx.ag ? 0 : 1) : (m.pens[0] > m.pens[1] ? 0 : 1);
      res = ws === 0 ? ['W', 'L'] : ['L', 'W'];
      fx.winner = m.sides[ws];
      const loser = m.sides[1 - ws];
      G.cup.alive = G.cup.alive.filter((id) => id !== loser);
      club(fx.winner).budget += CUP_PRIZE[fx.round];
      if (fx.round === CUP_ROUNDS.length - 1) {
        G.cup.winner = fx.winner;
        pushNews(`🏆 ${club(fx.winner).name} win the ${CUP_NAME}, beating ${club(loser).name}!`);
      } else if (fx.winner === G.userClub) {
        pushNews(`🏆 Through to the ${CUP_NAME} ${CUP_ROUNDS[fx.round + 1].toLowerCase()} (+${money(CUP_PRIZE[fx.round])}).`);
      } else if (loser === G.userClub) pushNews(`💔 Knocked out of the ${CUP_NAME} in the ${CUP_ROUNDS[fx.round].toLowerCase()}.`);
    } else {
      const [h, a] = [club(fx.home).table, club(fx.away).table];
      h.p++; a.p++; h.gf += fx.hg; h.ga += fx.ag; a.gf += fx.ag; a.ga += fx.hg;
      [h, a].forEach((t, i) => {
        const r = res[i];
        if (r === 'W') { t.w++; t.pts += 3; } else if (r === 'D') { t.d++; t.pts += 1; } else t.l++;
        t.form = [...t.form, r].slice(-5);
      });
    }
    m.sides.forEach((cid, s) => {
      const r = res[s];
      squadOf(cid).forEach((p) => {
        if (m.appeared.has(p.id)) { p.apps++; p.fitness = Math.round(m.fit[p.id]); }
        const dm = r === 'W' ? 6 : r === 'D' ? 0 : -6;
        p.morale = clamp(p.morale + dm + (m.appeared.has(p.id) ? 2 : -2), 10, 100);
      });
    });
    m.scorers.forEach((s) => { player(s.pid).goals++; });
    m.assists.forEach((pid) => { player(pid).assists++; });
    Object.entries(m.yellows).forEach(([pid, n]) => { player(pid).yellow += n >= 2 ? 0 : 1; });
    m.injuries.forEach((pid) => { player(pid).injury = ri(1, 6); });
    if (m.sides.includes(G.userClub)) {
      // home gate receipts
      if (fx.home === G.userClub) {
        userClub().budget += Math.round(gateIncome(userClub()) * (0.85 + rand() * 0.3));
      }
      m.injuries.filter((pid) => player(pid).club === G.userClub)
        .forEach((pid) => pushNews(`🚑 ${pname(pid)} will be out for ${player(pid).injury} week(s).`));
    }
    // AI gate money (simplified)
    if (fx.home !== G.userClub) club(fx.home).budget += gateIncome(club(fx.home));
  }

  const gateIncome = (c) => Math.round(20000 * Math.pow(1.11, c.rep - 50));
  const weeklyIncome = (c) => Math.round(15000 * Math.pow(1.11, c.rep - 50));
  const wageBill = (cid) => squadOf(cid).reduce((a, p) => a + p.wage, 0);

  // ---------- weekly flow ----------
  /** Play every match of the current week except the one passed in (the user's live match, already applied). */
  function playOtherMatches(exclude) {
    const out = [];
    fixturesForWeek(G.week).forEach((fx) => {
      if (fx.played || fx === exclude) return;
      const m = simMatch(fx);
      applyResult(m);
      out.push(fx);
    });
    return out;
  }

  function endWeek() {
    const intensity = INTENSITY[G.training];
    Object.values(G.players).forEach((p) => {
      if (p.club === null) return;
      if (p.academy) {
        // academy coaching: quality of facilities drives development
        if (p.ovr < p.pot && rand() < 0.035 * (1 + 0.2 * G.academy.level) * (p.pot - p.ovr) / 10) p.ovr++;
        return;
      }
      if (p.injury > 0) { p.injury--; if (p.injury === 0 && p.club === G.userClub) pushNews(`✅ ${p.name} is back from injury.`); }
      p.fitness = clamp(p.fitness + intensity.recover, 0, 100);
      // development during the season
      if (p.age <= 27 && p.ovr < p.pot && p.injury === 0) {
        const chance = 0.05 * intensity.growth * (p.pot - p.ovr) / 10 * (p.age <= 21 ? 1.5 : 1) * (p.apps > 0 ? 1.2 : 1);
        if (rand() < chance) {
          p.ovr++;
          if (p.club === G.userClub && rand() < 0.35) pushNews(`📈 ${p.name} is improving in training (now ${p.ovr}).`);
        }
      }
      // training-ground knocks
      if (p.club === G.userClub && p.injury === 0 && rand() < 0.004 * intensity.injury) {
        p.injury = ri(1, 3);
        pushNews(`🤕 ${p.name} picked up a knock in training (${p.injury} wk).`);
      }
    });
    // wages & TV money
    G.clubs.forEach((c) => {
      const wages = squadOf(c.id).reduce((a, p) => a + p.wage, 0);
      c.budget += weeklyIncome(c) - wages;
      c.lastWages = wages;
    });
    userClub().budget -= academyUpkeep();
    // reminders about expiring deals and academy graduates
    if (G.week === 9 || G.week === 19) {
      const exp = expiringPlayers();
      if (exp.length) pushNews(`📝 ${exp.length} player(s) are in the final year of their contract: ${exp.slice(0, 4).map((p) => p.name).join(', ')}${exp.length > 4 ? '…' : ''}. They leave for free at season end.`);
      const grads = prospects().filter((p) => p.age >= ACADEMY_GRAD_AGE - 1);
      if (grads.length) pushNews(`🎓 Decide on ${grads.map((p) => p.name).join(', ')}: academy players turning ${ACADEMY_GRAD_AGE} leave unless promoted.`);
    }
    aiTransferActivity();
    G.clubs.forEach((c) => { if (c.id !== G.userClub) { c.lineup = autoLineup(c.id); aiMentality(c); } });
    validateLineup(G.userClub);
    G.week++;
    if (G.week >= totalWeeks()) G.seasonOver = true;
    else cupDraw(G.week);
    checkBoard();
  }
  function aiMentality(c) {
    const fx = userFixtureFor(c.id, G.week);
    if (!fx) return;
    const opp = fx.home === c.id ? fx.away : fx.home;
    const diff = clubStrengthCached(c.id) - clubStrengthCached(opp);
    c.mentality = diff > 3 ? 'attacking' : diff < -3 ? 'defensive' : 'balanced';
  }
  function clubStrengthCached(cid) { return clubStrength(cid); }
  function userFixtureFor(cid, w) { return fixturesForWeek(w).find((f) => f.home === cid || f.away === cid); }

  function checkBoard() {
    const c = userClub();
    if (c.budget < -5e6 && !G.gameOver) {
      G.gameOver = true;
      G.gameOverReason = 'The club is more than £5M in debt. The board has relieved you of your duties.';
    } else if (c.budget < 0 && !G.boardWarning) {
      G.boardWarning = true;
      pushNews('⚠️ The board is alarmed: the club is in the red. Sell players or cut wages.');
    } else if (c.budget >= 0) G.boardWarning = false;
  }

  // ---------- table ----------
  function standings(div = userClub().div) {
    return G.clubs.filter((c) => c.div === div).sort((a, b) => b.table.pts - a.table.pts
      || (b.table.gf - b.table.ga) - (a.table.gf - a.table.ga)
      || b.table.gf - a.table.gf || a.name.localeCompare(b.name));
  }
  function position(cid) { return standings(club(cid).div).findIndex((c) => c.id === cid) + 1; }
  function expectedPosition(cid = G.userClub) {
    const div = club(cid).div;
    return G.clubs.filter((c) => c.div === div).sort((a, b) => b.rep - a.rep).findIndex((c) => c.id === cid) + 1;
  }

  // ---------- youth academy ----------
  const academyUpgradeCost = () => (G.academy.level >= ACADEMY_MAX ? null : 1.5e6 * G.academy.level);
  const academyUpkeep = () => 6000 + G.academy.level * 9000; // per week, covers youth coaches & wages
  const academyIntake = () => 2 + Math.ceil(G.academy.level / 2);
  const scoutError = () => ACADEMY_MAX - G.academy.level; // +/- on the potential estimate
  const prospects = () => G.academy.prospects.map(player);
  function newProspect(age = ri(15, 16)) {
    const lvl = G.academy.level;
    const p = genPlayer(pick(['GK', 'DF', 'DF', 'MF', 'MF', 'FW', 'FW']), userClub().rep - 12 + lvl * 1.5, age, age);
    p.pot = clamp(p.ovr + ri(8, 22) + lvl * 2, p.ovr, 96);
    p.potNoise = ri(-4, 4); // what the scouts get wrong; shrinks as the academy improves
    p.academy = true;
    p.club = G.userClub;
    p.wage = 0;
    G.players[p.id] = p;
    G.academy.prospects.push(p.id);
    return p;
  }
  function potentialRange(p) {
    if (!p.academy) return [p.pot, p.pot];
    const err = scoutError();
    const est = clamp(Math.round(p.pot + p.potNoise * err / 4), p.ovr, 99);
    return [Math.max(p.ovr, est - err), Math.min(99, est + err)];
  }
  function upgradeAcademy() {
    const cost = academyUpgradeCost();
    if (cost === null) return { ok: false, why: 'The academy is already world class.' };
    if (userClub().budget < cost) return { ok: false, why: `Upgrading costs ${money(cost)}.` };
    userClub().budget -= cost;
    G.academy.level++;
    pushNews(`🏗️ Youth academy upgraded to level ${G.academy.level}.`);
    return { ok: true };
  }
  function promoteProspect(pid) {
    const p = player(pid);
    if (!p || !p.academy) return { ok: false, why: 'Not an academy player.' };
    if (userClub().squad.length >= MAX_SQUAD) return { ok: false, why: `Squad is full (${MAX_SQUAD}).` };
    p.academy = false;
    delete p.potNoise;
    G.academy.prospects = G.academy.prospects.filter((id) => id !== pid);
    userClub().squad.push(pid);
    p.contract = 3;
    p.wage = Math.max(1000, Math.round(wageFor(p) * 0.7 / 100) * 100);
    p.morale = 85;
    pushNews(`🎓 ${p.name} promoted from the academy on a 3-season deal.`);
    return { ok: true };
  }
  function releaseProspect(pid) {
    const p = player(pid);
    if (!p || !p.academy) return { ok: false, why: 'Not an academy player.' };
    G.academy.prospects = G.academy.prospects.filter((id) => id !== pid);
    delete G.players[pid];
    return { ok: true };
  }

  // ---------- contracts ----------
  const contractEnds = (p) => G.season + p.contract - 1; // last season of the deal
  function renewalOptions(p) {
    // extension lengths, in extra seasons
    const max = p.age >= 33 ? 1 : p.age >= 30 ? 2 : MAX_CONTRACT - 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }
  function contractDemand(p) {
    let w = Math.max(p.wage, wageFor(p)) * 1.08;
    if (p.ovr > userClub().rep) w *= 1 + (p.ovr - userClub().rep) * 0.03; // stars know their worth
    if (p.morale < 40) w *= 1.15;
    if (p.age <= 23 && p.pot - p.ovr >= 8) w *= 1.1;
    return Math.round(w / 100) * 100;
  }
  function canNegotiate(p) {
    if (!p || p.club !== G.userClub || p.academy) return { ok: false, why: 'Not your player.' };
    if (p.contract > RENEW_WINDOW) return { ok: false, why: `${p.name} is happy with his current deal (runs until season ${contractEnds(p)}).` };
    if (p.negBlock && p.negBlock.season === G.season && p.negBlock.week > G.week) {
      return { ok: false, why: `${p.name} won't reopen talks until week ${p.negBlock.week + 1}.` };
    }
    return { ok: true, demand: contractDemand(p), options: renewalOptions(p) };
  }
  function offerContract(pid, years, wage) {
    const p = player(pid);
    const chk = canNegotiate(p);
    if (!chk.ok) return chk;
    if (!chk.options.includes(years)) return { ok: false, why: 'He won\'t sign for that length.' };
    const ratio = wage / chk.demand;
    const chance = ratio >= 1 ? 1 : ratio >= 0.9 ? clamp(0.35 + (p.morale - 50) / 150, 0.1, 0.75) : 0.05;
    if (rand() < chance) {
      p.contract += years;
      p.wage = wage;
      p.morale = clamp(p.morale + (ratio > 1.05 ? 12 : 5), 0, 100);
      pushNews(`📝 ${p.name} signs a new deal until season ${contractEnds(p)} (${money(wage)}/wk).`);
      return { ok: true };
    }
    p.negBlock = { season: G.season, week: G.week + 3 };
    p.morale = clamp(p.morale - 6, 0, 100);
    return { ok: false, rejected: true, why: `${p.name} rejected the offer. He won't talk again for 3 weeks.` };
  }
  function expiringPlayers() { return squadOf(G.userClub).filter((p) => p.contract <= 1); }

  // ---------- transfers ----------
  function askingPrice(p) {
    if (p.club === null) return 0;
    const c = club(p.club);
    const starter = c.lineup.some((l) => l.pid === p.id);
    const expiring = p.contract <= 1 ? 0.55 : 1; // sell now or lose him for nothing
    return Math.round(playerValue(p) * (starter ? 1.35 : 1.1) * expiring / 10000) * 10000;
  }
  function signingWage(p) {
    return Math.round(Math.max(p.wage, wageFor(p)) * (p.club === null ? 1.15 : 1.05) / 100) * 100;
  }
  function canBuy(pid) {
    const p = player(pid), u = userClub();
    if (!p || p.club === G.userClub) return { ok: false, why: 'Already at your club.' };
    if (u.squad.length >= MAX_SQUAD) return { ok: false, why: `Squad is full (${MAX_SQUAD}).` };
    if (p.club !== null && club(p.club).squad.length <= MIN_SQUAD) return { ok: false, why: `${club(p.club).name} won't sell: their squad is too thin.` };
    if (p.ovr > u.rep + 12) return { ok: false, why: `${p.name} isn't interested in joining a club of your stature.` };
    const fee = askingPrice(p);
    if (fee > u.budget) return { ok: false, why: 'Not enough budget for the fee.' };
    return { ok: true, fee, wage: signingWage(p), contract: signingLength(p) };
  }
  const signingLength = (p) => (p.age >= 32 ? 1 : p.age >= 29 ? 2 : 4);
  function buy(pid) {
    const chk = canBuy(pid);
    if (!chk.ok) return chk;
    const p = player(pid), u = userClub();
    const from = p.club;
    moveTo(p, G.userClub);
    p.wage = chk.wage;
    p.contract = chk.contract;
    delete p.negBlock;
    u.budget -= chk.fee;
    if (from !== null) club(from).budget += chk.fee;
    p.morale = 80;
    pushNews(`✍️ Signed ${p.name} (${p.pos}, ${p.ovr}) ${from !== null ? 'from ' + club(from).name + ' for ' + money(chk.fee) : 'on a free transfer'}, contract until season ${contractEnds(p)}.`);
    return { ok: true };
  }
  function moveTo(p, cid) {
    if (p.club !== null) {
      const c = club(p.club);
      c.squad = c.squad.filter((id) => id !== p.id);
      c.lineup = c.lineup.filter((l) => l.pid !== p.id);
    } else G.freeAgents = G.freeAgents.filter((id) => id !== p.id);
    p.club = cid;
    if (cid !== null) club(cid).squad.push(p.id); else G.freeAgents.push(p.id);
    if (cid === null) p.contract = 0;
    else if (cid !== G.userClub) p.contract = Math.max(p.contract, ri(2, 4));
  }
  function getOffer(pid) {
    const p = player(pid);
    if (userClub().squad.length <= MIN_SQUAD) return { ok: false, why: `You need at least ${MIN_SQUAD} players.` };
    const val = playerValue(p);
    const buyers = G.clubs.filter((c) => c.id !== G.userClub && c.squad.length < 28 && c.budget > val * 0.8
      && p.ovr >= avgOvr(c.id) - 6);
    if (!buyers.length) return { ok: false, why: 'No club is interested right now.' };
    const b = pick(buyers);
    const amount = Math.min(b.budget, Math.round(val * (0.8 + rand() * 0.3) / 10000) * 10000);
    return { ok: true, club: b.id, amount };
  }
  function sell(pid, offer) {
    const p = player(pid);
    moveTo(p, offer.club);
    userClub().budget += offer.amount;
    club(offer.club).budget -= offer.amount;
    pushNews(`💰 Sold ${p.name} to ${club(offer.club).name} for ${money(offer.amount)}.`);
    validateLineup(G.userClub);
  }
  function releaseCost(pid) {
    // pay off half of what is left on the contract
    const p = player(pid);
    const remaining = Math.max(1, totalWeeks() - G.week) + Math.max(0, p.contract - 1) * totalWeeks();
    return Math.round(p.wage * remaining * 0.5);
  }
  function release(pid) {
    if (userClub().squad.length <= MIN_SQUAD) return { ok: false, why: `You need at least ${MIN_SQUAD} players.` };
    const p = player(pid);
    const cost = releaseCost(pid);
    userClub().budget -= cost;
    moveTo(p, null);
    pushNews(`📤 Released ${p.name} (settlement ${money(cost)}).`);
    validateLineup(G.userClub);
    return { ok: true };
  }
  function avgOvr(cid) {
    const s = squadOf(cid).map((p) => p.ovr).sort((a, b) => b - a).slice(0, 16);
    return s.reduce((a, b) => a + b, 0) / s.length;
  }
  function aiTransferActivity() {
    if (rand() > 0.35) return;
    const buyer = pick(G.clubs.filter((c) => c.id !== G.userClub && c.squad.length < 26));
    if (!buyer) return;
    const needPos = Object.keys(SQUAD_TEMPLATE).sort((a, b) =>
      squadOf(buyer.id).filter((p) => p.pos === a).length / SQUAD_TEMPLATE[a]
      - squadOf(buyer.id).filter((p) => p.pos === b).length / SQUAD_TEMPLATE[b])[0];
    const target = avgOvr(buyer.id);
    const pool = Object.values(G.players).filter((p) => p.pos === needPos && p.club !== buyer.id && p.club !== G.userClub
      && p.ovr >= target - 3 && p.ovr <= buyer.rep + 8
      && (p.club === null || club(p.club).squad.length > 18) && askingPrice(p) <= buyer.budget * 0.6);
    if (!pool.length) return;
    const p = pick(pool);
    const fee = askingPrice(p), from = p.club;
    moveTo(p, buyer.id);
    buyer.budget -= fee;
    if (from !== null) club(from).budget += fee;
    p.wage = signingWage(p);
    p.contract = signingLength(p);
    pushNews(`🔄 ${buyer.name} sign ${p.name} (${p.pos}, ${p.ovr})${from !== null ? ' from ' + club(from).name + ' for ' + money(fee) : ' on a free'}.`);
  }

  // ---------- season end ----------
  function endSeason() {
    const u = userClub();
    const div = u.div;
    const pos = position(G.userClub);
    const exp = expectedPosition();
    const t1 = standings(1), t2 = standings(2);
    const relegated = t1.slice(-PROMOTED), promoted = t2.slice(0, PROMOTED);
    const prizeFor = (d, i) => (d === 1 ? PRIZES[i] : Math.round(PRIZES[i] * DIV2_PRIZE_SHARE));
    const topScorer = Object.values(G.players).filter((p) => p.club !== null && club(p.club).div === div)
      .sort((a, b) => b.goals - a.goals)[0];
    const summary = {
      season: G.season, division: div, champion: t1[0].name, d2Champion: t2[0].name,
      position: pos, expected: exp, points: u.table.pts, prize: prizeFor(div, pos - 1),
      promoted: promoted.map((c) => c.name), relegated: relegated.map((c) => c.name),
      cupWinner: G.cup.winner !== null ? club(G.cup.winner).name : '-', cup: cupResult(G.userClub),
      topScorer: topScorer ? `${topScorer.name} (${club(topScorer.club).short}) — ${topScorer.goals}` : '-',
      retired: [], youth: [], departed: [], graduatesLeft: [], verdict: '', move: null,
    };
    [[1, t1], [2, t2]].forEach(([d, table]) => {
      const byRep = [...table].sort((a, b) => b.rep - a.rep);
      table.forEach((c, i) => {
        c.budget += prizeFor(d, i);
        c.rep = clamp(Math.round(c.rep + (byRep.indexOf(c) - i) * 0.6), 40, 92); // reputation drift
      });
    });
    // promotion & relegation
    relegated.forEach((c) => { c.div = 2; c.rep = Math.max(40, c.rep - 3); });
    promoted.forEach((c) => { c.div = 1; c.rep = Math.min(92, c.rep + 3); });
    const wentUp = promoted.includes(u), wentDown = relegated.includes(u);
    if (wentUp) summary.move = 'up';
    if (wentDown) summary.move = 'down';

    let sacked = false;
    if (wentUp) summary.verdict = pos === 1 ? 'Champions and promoted! The board is ecstatic.' : 'Promoted! The board is thrilled.';
    else if (pos <= exp - 2) summary.verdict = 'The board is delighted — you smashed expectations!';
    else if (pos <= exp && !wentDown) summary.verdict = 'The board is pleased with the season.';
    else if (wentDown && exp <= t1.length - PROMOTED - 3) sacked = true;
    else if (wentDown) summary.verdict = 'Relegated. The board expected a struggle and keeps faith in you to bounce back.';
    else if (pos <= exp + 3) summary.verdict = 'The board expected more, but your job is safe.';
    else sacked = true;
    if (sacked && G.cup.winner === G.userClub) {
      summary.verdict = `A poor league season, but winning the ${CUP_NAME} has saved your job.`;
      sacked = false;
    }
    if (sacked) {
      summary.verdict = 'The board is deeply disappointed. You have been sacked.';
      G.gameOver = true;
      G.gameOverReason = wentDown
        ? `Relegated from Division 1 when the board expected ${ordinal(exp)}.`
        : `Finished ${ordinal(pos)} in Division ${div} when the board expected ${ordinal(exp)}.`;
    }
    G.history.push({ season: G.season, division: div, position: pos, points: summary.points,
      champion: div === 1 ? t1[0].name : t2[0].name, cup: summary.cup, move: summary.move });

    // ageing, development, retirement
    Object.values(G.players).forEach((p) => {
      p.age++;
      if (p.age <= 23) p.ovr = Math.min(p.pot, p.ovr + ri(0, 3));
      else if (p.age >= 30) p.ovr = Math.max(35, p.ovr - ri(0, p.age >= 33 ? 4 : 2));
      if (p.age >= 30) p.pot = p.ovr;
      p.apps = 0; p.goals = 0; p.assists = 0; p.yellow = 0; p.fitness = 100; p.injury = 0; p.morale = 70;
    });
    Object.values(G.players).forEach((p) => {
      const retireP = p.age >= 37 ? 1 : p.age >= 34 ? 0.35 : 0;
      if (rand() < retireP) {
        if (p.club === G.userClub) summary.retired.push(`${p.name} (${p.age})`);
        if (p.club !== null) {
          const c = club(p.club);
          c.squad = c.squad.filter((id) => id !== p.id);
        } else G.freeAgents = G.freeAgents.filter((id) => id !== p.id);
        delete G.players[p.id];
      }
    });
    // contracts: AI clubs keep most of their players; everyone else whose deal is up walks away
    Object.values(G.players).forEach((p) => {
      if (p.club === null || p.academy) return;
      if (p.contract <= 1 && p.club !== G.userClub) {
        const keep = p.age <= 29 ? 0.8 : p.age <= 32 ? 0.55 : 0.3;
        if (rand() < keep) { p.contract = defaultContract(p) + 1; p.wage = Math.max(p.wage, wageFor(p)); }
      }
      p.contract--;
      if (p.contract <= 0) {
        if (p.club === G.userClub) summary.departed.push(`${p.name} (${p.pos}, ${p.ovr})`);
        moveTo(p, null);
      }
    });
    // academy: graduates who weren't promoted leave, then the new intake arrives
    prospects().filter((p) => p.age >= ACADEMY_GRAD_AGE).forEach((p) => {
      summary.graduatesLeft.push(`${p.name} (${p.pos}, ${p.ovr})`);
      releaseProspect(p.id);
    });
    for (let i = 0; i < academyIntake(); i++) {
      const y = newProspect();
      const [lo, hi] = potentialRange(y);
      summary.youth.push(`${y.name} (${y.pos}, ${y.ovr}, pot ${lo === hi ? lo : lo + '–' + hi})`);
    }
    // AI youth intake & squad top-ups
    G.clubs.forEach((c) => {
      if (c.id !== G.userClub) {
        for (let i = 0; i < 3; i++) {
          const y = addPlayer(genPlayer(pick(['GK', 'DF', 'MF', 'MF', 'FW', 'DF']), c.rep - 2 + ri(-3, 6), 16, 17), c.id);
          y.pot = clamp(y.pot + ri(0, 8), y.ovr, 96);
          y.contract = 3;
        }
        for (const pos of Object.keys(SQUAD_TEMPLATE)) {
          while (squadOf(c.id).filter((p) => p.pos === pos).length < SQUAD_TEMPLATE[pos]) {
            addPlayer(genPlayer(pos, c.rep - 5, 20, 30), c.id);
          }
        }
        // trim oversized AI squads by releasing their weakest veterans
        while (c.squad.length > 27) {
          const w = squadOf(c.id).sort((a, b) => a.ovr - b.ovr)[0];
          moveTo(w, null);
        }
      }
      c.table = blankTable();
    });
    while (userClub().squad.length < MIN_SQUAD) {
      const pos = Object.keys(SQUAD_TEMPLATE).sort((a, b) => squadOf(G.userClub).filter((p) => p.pos === a).length / SQUAD_TEMPLATE[a]
        - squadOf(G.userClub).filter((p) => p.pos === b).length / SQUAD_TEMPLATE[b])[0];
      const p = addPlayer(genPlayer(pos, userClub().rep - 10, 20, 30), G.userClub);
      p.contract = 1;
      pushNews(`🆘 The board signed ${p.name} (${p.pos}, ${p.ovr}) on a 1-season deal to fill the squad.`);
    }
    // refresh free agent pool
    while (G.freeAgents.length < 20) addPlayer(genPlayer(pick(['GK', 'DF', 'MF', 'FW']), ri(55, 72), 19, 32), null);
    if (G.freeAgents.length > 40) G.freeAgents.splice(0, G.freeAgents.length - 40).forEach((id) => delete G.players[id]);

    G.clubs.forEach((c) => { c.lineup = autoLineup(c.id); });
    G.lastSummary = summary;
    if (!G.gameOver) {
      G.season++;
      G.week = 0;
      G.seasonOver = false;
      scheduleSeason();
      G.news = [];
      pushNews(`📅 Season ${G.season} begins in Division ${userClub().div}. The board expects a finish around ${ordinal(expectedPosition())}.`);
    }
    return summary;
  }

  // ---------- helpers ----------
  function pushNews(text) {
    G.news.unshift({ season: G.season, week: G.week, text });
    if (G.news.length > 60) G.news.length = 60;
  }
  function money(v) {
    const s = v < 0 ? '-' : '';
    v = Math.abs(v);
    if (v >= 1e6) return `${s}£${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2)}M`;
    if (v >= 1e3) return `${s}£${Math.round(v / 1e3)}K`;
    return `${s}£${v}`;
  }
  function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // ---------- persistence ----------
  function serialize() { return JSON.stringify(G); }
  function load(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!data || (data.version !== SAVE_VERSION && data.version !== 2)) throw new Error('Incompatible save');
    G = data;
    if (G.version === 2) {
      // v2 saves had no contracts or academy
      Object.values(G.players).forEach((p) => { p.contract = p.club === null ? 0 : defaultContract(p); });
      G.academy = { level: clamp(Math.round((userClub().rep - 45) / 10), 1, 4), prospects: [] };
      for (let i = 0; i < 3; i++) newProspect(ri(15, 17));
      G.version = SAVE_VERSION;
    }
    return G;
  }

  root.Engine = {
    CLUBS, FORMATIONS, MENTALITY, INTENSITY, POS_ORDER, MIN_SQUAD, MAX_SQUAD,
    get state() { return G; },
    newGame, load, serialize,
    club, player, squadOf, userClub, totalWeeks, fixturesForWeek, userFixture,
    slotsFor, autoLineup, validateLineup, slotRating, posFactor, clubStrength, avgOvr,
    createMatch, stepMatch, simMatch, applyResult, playOtherMatches, possession, makeSub, benchOf,
    endWeek, endSeason, standings, position, expectedPosition,
    playerValue, askingPrice, signingWage, canBuy, buy, getOffer, sell, release, releaseCost,
    money, ordinal, pushNews, gateIncome, weeklyIncome, wageBill,
    CUP_NAME, CUP_ROUNDS, CUP_PRIZE, PROMOTED, cupResult, weekLabel,
    ACADEMY_MAX, ACADEMY_GRAD_AGE, RENEW_WINDOW, academyUpgradeCost, academyUpkeep, academyIntake, prospects,
    potentialRange, upgradeAcademy, promoteProspect, releaseProspect,
    contractEnds, canNegotiate, offerContract, expiringPlayers, signingLength,
  };
})(typeof window !== 'undefined' ? window : globalThis);
