/* Touchline Manager — game engine (no DOM access; also runs under Node for tests). */
(function (root) {
  'use strict';

  const SAVE_VERSION = 5;
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
  const DIV2_PRIZE_SHARE = 0.3;
  const BASE_WEEKS = 27; // per-week rates (growth, transfer activity) are tuned for a season this long

  // ---------- datasets ----------
  const FICTIONAL = {
    id: 'fictional', name: 'Fictional league', short: 'Fictional',
    note: 'Invented clubs and randomly generated players.',
    divNames: ['Division 1', 'Division 2'], promoted: 2, cupName: 'Shield Cup', startYear: null,
    autoEconomy: false, prizeScale: 1, clubs: CLUBS,
  };
  function datasets() {
    const extra = (typeof window !== 'undefined' ? window : globalThis).TM_DATASETS || {};
    return [FICTIONAL, ...Object.values(extra)];
  }
  const getDataset = (id) => datasets().find((d) => d.id === id) || FICTIONAL;
  const meta = () => G.meta;
  const promotedCount = () => G.meta.promoted;
  const cupName = () => G.meta.cupName;
  const divName = (d) => G.meta.divNames[d - 1] || `Division ${d}`;
  const seasonName = (n = G.season) => (G.meta.startYear
    ? `${G.meta.startYear + n - 1}/${String(G.meta.startYear + n).slice(2)}` : `Season ${n}`);
  function prizeFor(d, i, n) {
    const top = 9e6 * (G.meta.prizeScale || 1) * (d === 1 ? 1 : DIV2_PRIZE_SHARE);
    const bottom = top * 0.133;
    return Math.round((bottom + (top - bottom) * Math.pow((n - 1 - i) / Math.max(1, n - 1), 1.4)) / 10000) * 10000;
  }
  const MAX_CONTRACT = 5; // seasons
  const RENEW_WINDOW = 2; // players discuss new terms in the last N seasons of their deal
  const ACADEMY_MAX = 5;
  const ACADEMY_GRAD_AGE = 19; // prospects this old must be promoted or they leave
  // wonderkids: young players with exceptional potential
  const WK_POT = 84, WK_AGE = 21;
  const TRAITS = {
    Professional: { grow: 1.3, w: 12, desc: 'Lives for the game. Develops fastest.' },
    Determined: { grow: 1.2, w: 15, desc: 'Works hard and handles pressure.' },
    Balanced: { grow: 1, w: 48, desc: 'Develops at a normal pace.' },
    Temperamental: { grow: 0.9, w: 15, desc: 'Moody: potential can swing either way.' },
    Lazy: { grow: 0.7, w: 10, desc: 'Coasts in training. May never reach his potential.' },
  };

  // ---------- players ----------
  function makeName() {
    return pick(FIRST) + ' ' + pick(LAST_A) + pick(LAST_B);
  }
  function playerValue(p) {
    let v = Math.pow(1.17, p.ovr - 50) * 60000;
    if (p.age <= 23) v *= 1 + (p.pot - p.ovr) / 35;
    if (p.age >= 30) v *= Math.max(0.25, 1 - (p.age - 29) * 0.14);
    if (isWonderkid(p)) v *= 1 + (p.pot - 80) / 12; // hype premium
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
    let pot = clamp(Math.round(ovr + growth), ovr, 96);
    if (age <= WK_AGE) pot = Math.min(pot, Math.max(WK_POT - 1, ovr)); // only true gems get wonderkid potential
    const p = {
      id: G.nextPid++, name: makeName(), pos, age, ovr, pot,
      fitness: 100, morale: 70, injury: 0,
      apps: 0, goals: 0, assists: 0, yellow: 0,
      club: null, wage: 0, contract: 0,
      trait: rollTrait(false), seasonStart: ovr, playTime: 0,
    };
    p.wage = wageFor(p);
    return p;
  }
  const isWonderkid = (p) => p.age <= WK_AGE && p.pot >= WK_POT;
  function realPlayer(str) {
    const [name, pos, age, ovr, pot] = str.split('|');
    const a = +age, o = clamp(+ovr, 30, 99);
    if (!['GK', 'DF', 'MF', 'FW'].includes(pos)) throw new Error(`Bad position for ${name}`);
    const p = {
      id: G.nextPid++, name, pos, age: a, ovr: o,
      pot: pot ? Math.max(o, +pot) : (a < 24 ? Math.min(96, o + Math.round((24 - a) * 1.2)) : o),
      fitness: 100, morale: 70, injury: 0, apps: 0, goals: 0, assists: 0, yellow: 0,
      club: null, wage: 0, contract: 0, seasonStart: o, playTime: 0, real: true,
    };
    p.trait = rollTrait(isWonderkid(p));
    p.wage = wageFor(p);
    return p;
  }
  function rollTrait(wonderkid) {
    // the very best young players are more often driven professionals
    return weighted(Object.keys(TRAITS), (k) => TRAITS[k].w * (wonderkid && (k === 'Professional' || k === 'Determined') ? 2.5 : 1));
  }
  function makeWonderkid(p) {
    p.pot = ri(86, 96);
    p.ovr = clamp(Math.round(p.pot - ri(16, 24) - Math.max(0, 19 - p.age) * 2.5), 45, p.pot - 6);
    p.seasonStart = p.ovr;
    p.trait = rollTrait(true);
    p.wage = wageFor(p);
    return p;
  }
  // growth multiplier from personality and recent playing time (0.8 benched … ~1.25 every week)
  const traitGrowth = (p) => (TRAITS[p.trait] || TRAITS.Balanced).grow;
  const growthMult = (p) => traitGrowth(p) * (0.8 + 0.08 * Math.min(p.playTime || 0, 8));
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
  function newGame(clubIndex, managerName, seed, datasetId = 'fictional') {
    const ds = getDataset(datasetId);
    G = {
      version: SAVE_VERSION,
      seed: (seed === undefined ? Math.floor(Math.random() * 2 ** 31) : seed) >>> 0,
      manager: managerName || 'Manager',
      season: 1, week: 0, userClub: clubIndex,
      clubs: [], players: {}, freeAgents: [], nextPid: 1,
      fixtures: [], calendar: [], cup: null, news: [], history: [], training: 'normal',
      boardWarning: false, gameOver: false, seasonOver: false,
      meta: { dataset: ds.id, divNames: ds.divNames, promoted: ds.promoted, cupName: ds.cupName,
        startYear: ds.startYear || null, prizeScale: ds.prizeScale || (ds.autoEconomy ? 2.5 : 1) },
    };
    ds.clubs.forEach((c, i) => {
      G.clubs.push({
        id: i, name: c.name, short: c.short, color: c.color, rep: c.rep, div: c.div,
        budget: ds.autoEconomy ? Math.max(5e6, Math.round((c.rep - 50) * 1.2e6 / 100000) * 100000)
          : Math.max(1.5e6, Math.round((c.rep - 50) * 450000 / 100000) * 100000),
        formation: pick(Object.keys(FORMATIONS)), mentality: 'balanced',
        squad: [], lineup: [], table: blankTable(),
      });
    });
    G.clubs.forEach((c) => {
      const src = ds.clubs[c.id];
      if (src.players) {
        src.players.forEach((str) => addPlayer(realPlayer(str), c.id));
        // fill gaps in partially known squads with generated players
        for (const pos of Object.keys(SQUAD_TEMPLATE)) {
          while (squadOf(c.id).filter((p) => p.pos === pos).length < SQUAD_TEMPLATE[pos]) {
            addPlayer(genPlayer(pos, c.rep - 12, 21, 31), c.id); // squad filler, clearly below the real first team
          }
        }
      } else {
        for (const pos of Object.keys(SQUAD_TEMPLATE)) {
          for (let k = 0; k < SQUAD_TEMPLATE[pos]; k++) {
            // first-choice players are better than squad fillers
            const base = c.rep - 4 - (k >= starterCount(pos) ? 5 : 0);
            addPlayer(genPlayer(pos, base, 17, 34), c.id);
          }
        }
      }
      c.lineup = autoLineup(c.id);
    });
    for (let i = 0; i < 24; i++) {
      addPlayer(genPlayer(pick(['GK', 'DF', 'DF', 'MF', 'MF', 'FW']), ri(55, 70), 19, 33), null);
    }
    if (ds.id === 'fictional') {
      // real datasets bring their own young stars
      shuffle(G.clubs.map((c) => c.id)).slice(0, 9).forEach((cid) => {
        addPlayer(makeWonderkid(genPlayer(pick(['DF', 'MF', 'MF', 'FW', 'FW']), club(cid).rep, 16, 20)), cid);
      });
      addPlayer(makeWonderkid(genPlayer(pick(['MF', 'FW']), 60, 17, 17)), null);
    }
    G.offers = []; G.awards = [];
    G.academy = { level: clamp(Math.round((userClub().rep - 45) / 10), 1, 4), prospects: [] };
    for (let i = 0; i < 3; i++) newProspect(ri(15, 17));
    scheduleSeason();
    if (ds.autoEconomy) {
      // real wage bills vary wildly; scale each club's income so it starts roughly break-even
      const weeks = totalWeeks();
      G.clubs.forEach((c) => {
        const homeShare = G.fixtures.filter((f) => f.home === c.id).length / weeks;
        const raw = rawIncome(c) + rawGate(c) * homeShare;
        c.econ = clamp((wageBill(c.id) * 0.97) / raw, 0.5, 8);
      });
    }
    pushNews(`Welcome, ${G.manager}! The board of ${userClub().name} expects a finish around ${ordinal(expectedPosition())} in the ${divName(userClub().div)}.`);
    return G;
  }
  function starterCount(pos) { return { GK: 1, DF: 4, MF: 4, FW: 2 }[pos]; }
  function blankTable() { return { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function makeCalendar(leagueSlots, cupAfter) {
    const cal = [];
    let md = 0, cr = 0;
    while (md < leagueSlots || cr < cupAfter.length) {
      if (cr < cupAfter.length && md >= cupAfter[cr]) cal.push({ type: 'cup', round: cr++ });
      else cal.push({ type: 'league', md: md++ });
    }
    return cal;
  }
  function cupFormat(n) {
    // knockout for any number of clubs: a first round trims the field to a power of two
    const target = Math.pow(2, Math.floor(Math.log2(n)));
    const firstTies = n - target;
    const rounds = firstTies ? ['First round'] : [];
    for (let k = target; k >= 2; k /= 2) rounds.push(k === 2 ? 'Final' : k === 4 ? 'Semi-final' : k === 8 ? 'Quarter-final' : `Round of ${k}`);
    const top = 3e6 * (G.meta.prizeScale || 1);
    const prizes = rounds.map((_, i) => Math.round(top * Math.pow(0.5, rounds.length - 1 - i) / 10000) * 10000);
    return { rounds, prizes, byes: firstTies ? n - 2 * firstTies : 0 };
  }
  function scheduleSeason() {
    const divs = [1, 2];
    const sizes = divs.map((d) => G.clubs.filter((c) => c.div === d).length);
    const leagueRounds = sizes.map((n) => (n - 1) * 2);
    const slots = Math.max(...leagueRounds);
    const fmt = cupFormat(G.clubs.length);
    const R = fmt.rounds.length;
    const cupAfter = fmt.rounds.map((_, i) => (i === R - 1 ? slots : Math.round(slots * (i + 1) / R)));
    G.calendar = makeCalendar(slots, cupAfter);
    const weekOfSlot = {};
    G.calendar.forEach((c, i) => { if (c.type === 'league') weekOfSlot[c.md] = i; });
    G.fixtures = [];
    divs.forEach((div, k) => {
      const ids = shuffle(G.clubs.filter((c) => c.div === div).map((c) => c.id));
      // a smaller division spreads its rounds over the season, leaving some rest weeks
      makeFixtures(ids).forEach((f) => {
        f.comp = 'L'; f.div = div;
        f.week = weekOfSlot[Math.floor(f.md * slots / leagueRounds[k])];
        G.fixtures.push(f);
      });
    });
    const seeds = [...G.clubs].sort((a, b) => a.div - b.div || b.rep - a.rep).slice(0, fmt.byes);
    G.cup = { alive: G.clubs.map((c) => c.id), byes: seeds.map((c) => c.id), winner: null, rounds: fmt.rounds, prizes: fmt.prizes };
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
    if (uf) pushNews(`🏆 ${cupName()} ${G.cup.rounds[r].toLowerCase()} draw: ${club(uf.home).name} v ${club(uf.away).name}.`);
    else if (r === 0 && G.cup.byes.includes(G.userClub)) pushNews(`🏆 As a seeded club you have a bye through the ${cupName()} first round.`);
  }
  function cupResult(cid) {
    if (G.cup.winner === cid) return 'Winners';
    const lost = G.fixtures.find((f) => f.comp === 'CUP' && f.played && (f.home === cid || f.away === cid) && f.winner !== cid);
    if (lost) return lost.round === G.cup.rounds.length - 1 ? 'Runners-up' : `Out in ${G.cup.rounds[lost.round].toLowerCase()}`;
    return G.cup.alive.includes(cid) ? 'Still in' : '-';
  }
  function weekLabel(w, div = userClub().div) {
    const c = G.calendar[w];
    if (!c) return '';
    if (c.type === 'cup') return `${cupName()} · ${G.cup.rounds[c.round]}`;
    const f = fixturesForWeek(w).find((x) => x.comp === 'L' && x.div === div);
    return f ? `Matchday ${f.md + 1}` : 'Rest week';
  }
  const weekScale = () => BASE_WEEKS / totalWeeks();

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
      club(fx.winner).budget += G.cup.prizes[fx.round];
      if (fx.round === G.cup.rounds.length - 1) {
        G.cup.winner = fx.winner;
        pushNews(`🏆 ${club(fx.winner).name} win the ${cupName()}, beating ${club(loser).name}!`);
      } else if (fx.winner === G.userClub) {
        pushNews(`🏆 Through to the ${cupName()} ${G.cup.rounds[fx.round + 1].toLowerCase()} (+${money(G.cup.prizes[fx.round])}).`);
      } else if (loser === G.userClub) pushNews(`💔 Knocked out of the ${cupName()} in the ${G.cup.rounds[fx.round].toLowerCase()}.`);
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
        if (m.appeared.has(p.id)) { p.apps++; p.fitness = Math.round(m.fit[p.id]); p.playTime = (p.playTime || 0) + 1; }
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

  const rawGate = (c) => 20000 * Math.pow(1.11, c.rep - 50);
  const rawIncome = (c) => 15000 * Math.pow(1.11, c.rep - 50);
  const gateIncome = (c) => Math.round(rawGate(c) * (c.econ || 1));
  const weeklyIncome = (c) => Math.round(rawIncome(c) * (c.econ || 1));
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
        if (p.ovr < p.pot && rand() < 0.035 * weekScale() * (1 + 0.2 * G.academy.level) * traitGrowth(p) * (p.pot - p.ovr) / 10) p.ovr++;
        return;
      }
      if (p.injury > 0) { p.injury--; if (p.injury === 0 && p.club === G.userClub) pushNews(`✅ ${p.name} is back from injury.`); }
      p.fitness = clamp(p.fitness + intensity.recover, 0, 100);
      // development during the season
      if (p.age <= 27 && p.ovr < p.pot && p.injury === 0) {
        const chance = 0.05 * weekScale() * intensity.growth * (p.pot - p.ovr) / 10 * (p.age <= 21 ? 1.5 : 1) * growthMult(p);
        if (rand() < chance) {
          p.ovr++;
          if (isWonderkid(p) && p.ovr >= 65 && p.ovr % 5 === 0) {
            if (p.club === G.userClub) pushNews(`🌟 Wonderkid ${p.name} keeps getting better. He's now rated ${p.ovr}!`);
            else if (rand() < 0.3) pushNews(`🌟 ${p.name} (${club(p.club).short}, ${p.age}) is the talk of the league, now rated ${p.ovr}.`);
          } else if (p.club === G.userClub && rand() < 0.35) pushNews(`📈 ${p.name} is improving in training (now ${p.ovr}).`);
        }
      }
      // a benched wonderkid gets restless
      if (p.club === G.userClub && isWonderkid(p) && p.ovr >= 58 && G.week >= 6 && (p.playTime || 0) < 1 && !p.injury) {
        p.morale = clamp(p.morale - 3, 10, 100);
        if (p.morale < 40 && p.complained !== G.season) {
          p.complained = G.season;
          pushNews(`😤 ${p.name} is frustrated by his lack of game time and wants first-team football.`);
        }
      }
      p.playTime = (p.playTime || 0) * 0.85;
      // training-ground knocks
      if (p.club === G.userClub && p.injury === 0 && rand() < 0.004 * weekScale() * intensity.injury) {
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
    if (G.week === Math.round(totalWeeks() / 3) || G.week === Math.round(totalWeeks() * 0.7)) {
      const exp = expiringPlayers();
      if (exp.length) pushNews(`📝 ${exp.length} player(s) are in the final year of their contract: ${exp.slice(0, 4).map((p) => p.name).join(', ')}${exp.length > 4 ? '…' : ''}. They leave for free at season end.`);
      const grads = prospects().filter((p) => p.age >= ACADEMY_GRAD_AGE - 1);
      if (grads.length) pushNews(`🎓 Decide on ${grads.map((p) => p.name).join(', ')}: academy players turning ${ACADEMY_GRAD_AGE} leave unless promoted.`);
    }
    aiTransferActivity();
    aiWonderkidRaid();
    wonderkidBids();
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
    p.pot = clamp(p.ovr + ri(8, 22) + lvl * 2, p.ovr, Math.max(WK_POT - 1, p.ovr));
    if (rand() < 0.03 + 0.03 * lvl) { // a gem: better academies unearth more of them
      p.pot = ri(86, 96);
      p.ovr = clamp(p.pot - ri(27, 35), 40, p.pot - 10);
      p.seasonStart = p.ovr;
      p.trait = rollTrait(true);
    }
    p.potNoise = ri(-4, 4); // what the scouts get wrong; shrinks as the academy improves
    p.academy = true;
    p.club = G.userClub;
    p.wage = 0;
    G.players[p.id] = p;
    G.academy.prospects.push(p.id);
    return p;
  }
  const noiseOf = (p) => (p.potNoise !== undefined ? p.potNoise : ((p.id * 7919) % 9) - 4);
  const knowsPotential = (p) => p.academy ? false : (p.scouted || p.club === G.userClub || p.age > 23);
  const traitKnown = (p) => p.club === G.userClub || !!p.scouted;
  const scoutCost = (p) => (isWonderkid(p) ? 60000 : 25000);
  function scoutPlayer(pid) {
    const p = player(pid);
    if (!p || knowsPotential(p) && traitKnown(p)) return { ok: false, why: 'You already know all about him.' };
    const cost = scoutCost(p);
    if (userClub().budget < cost) return { ok: false, why: `A scout report costs ${money(cost)}.` };
    userClub().budget -= cost;
    p.scouted = true;
    pushNews(`🔍 Scout report on ${p.name} (${p.age}): potential ${p.pot}, ${p.trait.toLowerCase()}.${isWonderkid(p) ? ' A genuine wonderkid!' : ''}`);
    return { ok: true };
  }
  function potentialRange(p) {
    if (!p.academy) {
      if (knowsPotential(p)) return [p.pot, p.pot];
      const err = 5; // rival clubs' youngsters: only rumours until scouted
      const est = clamp(Math.round(p.pot + noiseOf(p) * err / 4), p.ovr, 99);
      return [Math.max(p.ovr, est - err), Math.min(99, est + err)];
    }
    const err = scoutError();
    const est = clamp(Math.round(p.pot + noiseOf(p) * err / 4), p.ovr, 99);
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

  // ---------- wonderkid bids ----------
  function wonderkidBids() {
    G.offers = (G.offers || []).filter((o) => o.expires > G.week + 1 && player(o.pid) && player(o.pid).club === G.userClub);
    squadOf(G.userClub).filter((p) => isWonderkid(p) && p.ovr >= 60).forEach((p) => {
      if (G.offers.some((o) => o.pid === p.id) || rand() > 0.07 * weekScale()) return;
      const val = playerValue(p);
      const bidders = G.clubs.filter((c) => c.id !== G.userClub && c.budget > val * 1.3 && c.squad.length < 28 && c.rep >= userClub().rep - 3);
      if (!bidders.length) return;
      const b = weighted(bidders, (c) => Math.pow(c.rep - 40, 2));
      const amount = Math.round(val * (1.2 + rand() * 0.6) / 10000) * 10000;
      G.offers.push({ pid: p.id, club: b.id, amount, expires: G.week + 3 });
      pushNews(`📨 ${b.name} have bid ${money(amount)} for ${p.name}. Respond on the Home screen.`);
    });
  }
  function aiWonderkidRaid() {
    // big clubs hoover up the best young talent from smaller sides
    if (rand() > 0.08 * weekScale()) return;
    const targets = Object.values(G.players).filter((p) => p.club !== null && p.club !== G.userClub && !p.academy
      && isWonderkid(p) && p.ovr >= 66);
    if (!targets.length) return;
    const p = pick(targets);
    const from = club(p.club);
    const fee = askingPrice(p);
    const buyers = G.clubs.filter((c) => c.id !== G.userClub && c.id !== from.id && c.rep >= from.rep + 5
      && c.budget > fee * 1.4 && c.squad.length < 27);
    if (!buyers.length || from.squad.length <= 18) return;
    const b = weighted(buyers, (c) => Math.pow(c.rep - 40, 2));
    moveTo(p, b.id);
    b.budget -= fee; from.budget += fee;
    p.wage = signingWage(p); p.contract = 5;
    pushNews(`💸 ${b.name} snap up wonderkid ${p.name} (${p.age}) from ${from.name} for ${money(fee)}.`);
  }
  function respondOffer(idx, accept) {
    const o = (G.offers || [])[idx];
    if (!o) return { ok: false, why: 'That offer has expired.' };
    const p = player(o.pid), b = club(o.club);
    if (accept) {
      if (userClub().squad.length <= MIN_SQUAD) return { ok: false, why: `You need at least ${MIN_SQUAD} players.` };
      if (b.budget < o.amount) { G.offers.splice(idx, 1); return { ok: false, why: `${b.name} can no longer afford the fee.` }; }
      G.offers.splice(idx, 1);
      sell(o.pid, { club: o.club, amount: o.amount });
      return { ok: true };
    }
    G.offers.splice(idx, 1);
    if (b.rep > userClub().rep + 3) {
      p.morale = clamp(p.morale - 12, 10, 100);
      pushNews(`😟 ${p.name} is unsettled after you turned down ${b.name}.`);
    } else pushNews(`🚫 Rejected ${b.name}'s bid for ${p.name}.`);
    return { ok: true };
  }
  function goldenBoy() {
    const score = (p) => p.ovr + p.goals * 0.6 + p.assists * 0.4 + p.apps * 0.15 + (p.ovr - (p.seasonStart || p.ovr)) * 0.5;
    return Object.values(G.players).filter((p) => p.club !== null && !p.academy && p.age <= WK_AGE)
      .sort((a, b) => score(b) - score(a)).slice(0, 5);
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
    const prized = isWonderkid(p) ? 1.25 : 1; // clubs hate losing their gems
    return Math.round(playerValue(p) * (starter ? 1.35 : 1.1) * expiring * prized / 10000) * 10000;
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
    if (rand() > 0.35 * weekScale()) return;
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
    const k = promotedCount();
    const relegated = t1.slice(-k), promoted = t2.slice(0, k);
    const topScorer = Object.values(G.players).filter((p) => p.club !== null && club(p.club).div === div)
      .sort((a, b) => b.goals - a.goals)[0];
    const summary = {
      season: G.season, division: div, champion: t1[0].name, d2Champion: t2[0].name,
      position: pos, expected: exp, points: u.table.pts, prize: prizeFor(div, pos - 1, standings(div).length),
      promoted: promoted.map((c) => c.name), relegated: relegated.map((c) => c.name),
      cupWinner: G.cup.winner !== null ? club(G.cup.winner).name : '-', cup: cupResult(G.userClub),
      topScorer: topScorer ? `${topScorer.name} (${club(topScorer.club).short}) — ${topScorer.goals}` : '-',
      retired: [], youth: [], departed: [], graduatesLeft: [], verdict: '', move: null,
      goldenBoy: null, goldenBoyMine: false, nominees: [],
    };
    const gb = goldenBoy();
    if (gb.length) {
      const w = gb[0];
      summary.goldenBoy = `${w.name} (${club(w.club).short}, ${w.age}, rated ${w.ovr})`;
      summary.nominees = gb.slice(1).map((p) => `${p.name} (${club(p.club).short})`);
      summary.goldenBoyMine = w.club === G.userClub;
      G.awards = G.awards || [];
      G.awards.push({ season: G.season, name: w.name, club: club(w.club).name, ovr: w.ovr, mine: summary.goldenBoyMine });
      if (summary.goldenBoyMine) { u.rep = Math.min(92, u.rep + 1); w.morale = 100; }
      w.pot = Math.min(96, w.pot + 1);
    }
    [[1, t1], [2, t2]].forEach(([d, table]) => {
      const byRep = [...table].sort((a, b) => b.rep - a.rep);
      table.forEach((c, i) => {
        c.budget += prizeFor(d, i, table.length);
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
    else if (wentDown && exp <= t1.length - k - 3) sacked = true;
    else if (wentDown) summary.verdict = 'Relegated. The board expected a struggle and keeps faith in you to bounce back.';
    else if (pos <= exp + 3) summary.verdict = 'The board expected more, but your job is safe.';
    else sacked = true;
    if (sacked && G.cup.winner === G.userClub) {
      summary.verdict = `A poor league season, but winning the ${cupName()} has saved your job.`;
      sacked = false;
    }
    if (sacked) {
      summary.verdict = 'The board is deeply disappointed. You have been sacked.';
      G.gameOver = true;
      G.gameOverReason = wentDown
        ? `Relegated from the ${divName(1)} when the board expected ${ordinal(exp)}.`
        : `Finished ${ordinal(pos)} in the ${divName(div)} when the board expected ${ordinal(exp)}.`;
    }
    G.history.push({ season: G.season, division: div, position: pos, points: summary.points,
      champion: div === 1 ? t1[0].name : t2[0].name, cup: summary.cup, move: summary.move });

    // ageing, development, retirement
    Object.values(G.players).forEach((p) => {
      p.age++;
      if (p.age <= 23) p.ovr = Math.min(p.pot, p.ovr + Math.round(ri(0, 3) * traitGrowth(p)));
      if (p.age <= 23 && p.trait === 'Lazy' && rand() < 0.35) p.pot = Math.max(p.ovr, p.pot - ri(1, 3));
      if (p.age <= 23 && p.trait === 'Temperamental' && rand() < 0.3) p.pot = clamp(p.pot + ri(-3, 3), p.ovr, 96);
      else if (p.age >= 30) p.ovr = Math.max(35, p.ovr - ri(0, p.age >= 33 ? 4 : 2));
      if (p.age >= 30) p.pot = p.ovr;
      p.apps = 0; p.goals = 0; p.assists = 0; p.yellow = 0; p.fitness = 100; p.injury = 0; p.morale = 70;
      p.seasonStart = p.ovr; p.playTime = 0;
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
          y.pot = clamp(y.pot + ri(0, 8), y.ovr, Math.max(WK_POT - 1, y.ovr));
          if (rand() < 0.035) makeWonderkid(y);
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
    if (!G.gameOver) startNextSeason();
    return summary;
  }
  function startNextSeason() {
    G.season++;
    G.week = 0;
    G.seasonOver = false;
    scheduleSeason();
    G.news = [];
    G.offers = [];
    pushNews(`📅 ${seasonName()} begins in the ${divName(userClub().div)}. The board expects a finish around ${ordinal(expectedPosition())}.`);
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
    if (!data || ![2, 3, 4, SAVE_VERSION].includes(data.version)) throw new Error('Incompatible save');
    G = data;
    if (G.version === 2) {
      // v2 saves had no contracts or academy
      Object.values(G.players).forEach((p) => { p.contract = p.club === null ? 0 : defaultContract(p); });
      G.academy = { level: clamp(Math.round((userClub().rep - 45) / 10), 1, 4), prospects: [] };
      for (let i = 0; i < 3; i++) newProspect(ri(15, 17));
      G.version = 3;
    }
    if (G.version === 3) {
      // v3 saves had no traits or wonderkid state
      Object.values(G.players).forEach((p) => {
        p.trait = rollTrait(isWonderkid(p)); p.seasonStart = p.ovr; p.playTime = p.apps ? 3 : 0;
      });
      G.offers = []; G.awards = [];
      G.version = 4;
    }
    if (G.version === 4) {
      // v4 saves were always the fictional league with a fixed 24-club cup
      G.meta = { dataset: 'fictional', divNames: FICTIONAL.divNames, promoted: 2, cupName: 'Shield Cup', startYear: null, prizeScale: 1 };
      G.cup.rounds = ['First round', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
      G.cup.prizes = [150000, 300000, 600000, 1200000, 3000000];
      G.version = SAVE_VERSION;
    }
    return G;
  }

  root.Engine = {
    CLUBS, datasets, getDataset, FORMATIONS, MENTALITY, INTENSITY, POS_ORDER, MIN_SQUAD, MAX_SQUAD,
    get state() { return G; },
    newGame, load, serialize,
    club, player, squadOf, userClub, totalWeeks, fixturesForWeek, userFixture,
    slotsFor, autoLineup, validateLineup, slotRating, posFactor, clubStrength, avgOvr,
    createMatch, stepMatch, simMatch, applyResult, playOtherMatches, possession, makeSub, benchOf,
    endWeek, endSeason, startNextSeason, standings, position, expectedPosition,
    playerValue, askingPrice, signingWage, canBuy, buy, getOffer, sell, release, releaseCost,
    money, ordinal, pushNews, gateIncome, weeklyIncome, wageBill,
    meta, cupName, divName, seasonName, promotedCount, cupResult, weekLabel,
    ACADEMY_MAX, ACADEMY_GRAD_AGE, RENEW_WINDOW, academyUpgradeCost, academyUpkeep, academyIntake, prospects,
    potentialRange, upgradeAcademy, promoteProspect, releaseProspect,
    contractEnds, canNegotiate, offerContract, expiringPlayers, signingLength,
    WK_POT, WK_AGE, TRAITS, isWonderkid, knowsPotential, traitKnown, scoutCost, scoutPlayer, respondOffer, goldenBoy,
  };
})(typeof window !== 'undefined' ? window : globalThis);
