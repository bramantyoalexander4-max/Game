/* Touchline Manager — game engine (no DOM access; also runs under Node for tests). */
(function (root) {
  'use strict';

  const SAVE_VERSION = 10;
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
  // team instructions: pressing and tempo (applied to the match strength, chance rate and fatigue)
  const PRESSING = {
    low: { mid: 0.97, def: 1.03, oppAtt: 1, fatigue: 0.8, label: 'Low block' },
    normal: { mid: 1, def: 1, oppAtt: 1, fatigue: 1, label: 'Normal' },
    high: { mid: 1.04, def: 0.98, oppAtt: 0.97, fatigue: 1.35, label: 'High press' },
  };
  const TEMPO = {
    slow: { att: 0.98, def: 1.02, chances: 0.88, label: 'Patient' },
    normal: { att: 1, def: 1, chances: 1, label: 'Normal' },
    fast: { att: 1.03, def: 0.98, chances: 1.12, label: 'Direct' },
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

  // ---------- game worlds ----------
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const CL_KO_ROUNDS = ['Knockout play-off', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
  const FICTIONAL = {
    id: 'fictional', name: 'Fictional league', short: 'Fictional',
    note: 'Invented clubs and randomly generated players.',
    startYear: null, autoEconomy: false, prizeScale: 1,
    leagues: [{ key: 'D1', name: 'Division 1', country: 'Fictional', tier: 1 }, { key: 'D2', name: 'Division 2', country: 'Fictional', tier: 2 }],
    promotions: [{ up: 'D1', down: 'D2', count: 2 }],
    cups: [{ name: 'Shield Cup', country: 'Fictional' }],
    continental: null,
    clubs: CLUBS.map((c) => ({ ...c, league: c.div === 1 ? 'D1' : 'D2' })),
  };
  function buildWorld(id, name, short, note, packs, continental, extraCups) {
    const w = { id, name, short, note, startYear: 2025, autoEconomy: true, prizeScale: 2.5,
      leagues: [], promotions: [], cups: [], clubs: [], continental: null, ccs: [] };
    const countries = new Set(packs.map((pk) => pk.country));
    (extraCups || []).forEach((cc) => { if (Object.keys(cc.slots).every((c) => countries.has(c))) w.ccs.push(cc); });
    packs.forEach((pk) => {
      pk.leagues.forEach((l) => w.leagues.push({ ...l, country: pk.country }));
      w.promotions.push(...(pk.promotions || []));
      w.cups.push({ name: pk.cup, country: pk.country });
      pk.clubs.forEach((c) => w.clubs.push({ ...c, country: pk.country }));
    });
    if (continental) {
      const slots = Object.assign({}, ...packs.map((pk) => pk.clSlots || {}));
      continental.guests.forEach((g) => w.clubs.push({ ...g, league: null }));
      w.continental = { name: continental.name, slots, initial: continental.initial };
      w.nations = !!ROOT.TM_NATIONS; // national teams need every country's players in one world
    }
    return w;
  }
  function datasets() {
    const C = ROOT.TM_COUNTRIES || {};
    const worlds = [FICTIONAL];
    const keys = ['england', 'spain', 'italy', 'france', 'germany', 'netherlands', 'portugal', 'turkey', 'belgium',
      'greece', 'czechia', 'denmark', 'norway', 'azerbaijan', 'cyprus', 'kazakhstan'].filter((k) => C[k]);
    // the World adds Scotland, Austria and Switzerland (ahead of the smaller leagues, for Champions League places)
    // and the big leagues of the Americas and Asia
    const worldKeys = ['england', 'spain', 'italy', 'france', 'germany', 'netherlands', 'portugal', 'scotland', 'austria',
      'switzerland', 'turkey', 'belgium', 'greece', 'czechia', 'denmark', 'norway', 'azerbaijan', 'cyprus', 'kazakhstan',
      'brazil', 'argentina', 'usa', 'mexico', 'saudi', 'japan', 'korea', 'indonesia'].filter((k) => C[k]);
    if (worldKeys.length > keys.length && ROOT.TM_CONTINENTAL) {
      worlds.push(buildWorld('world', 'Real football — World 2025/26', 'World 2025/26',
        `Every league in the Europe world plus Scotland, Austria, Switzerland, Brazil, Argentina, the USA (MLS), Mexico, Saudi Arabia, Japan and South Korea: ${worldKeys.length} countries. The biggest world — slower on older phones. Real clubs and players as of the start of the 2025/26 season; squads outside the big leagues are mostly generated.`,
        worldKeys.map((k) => C[k]), ROOT.TM_CONTINENTAL, ROOT.TM_CONTINENTAL_EXTRA));
    }
    if (keys.length >= 2 && ROOT.TM_CONTINENTAL) {
      worlds.push(buildWorld('europe', 'Real football — Europe 2025/26', 'Europe 2025/26',
        `${keys.map((k) => C[k].leagues.map((l) => l.name).join(' & ')).join(', ')} and the Champions League. Real clubs and players as of the start of the 2025/26 season; squads may be out of date and ratings are estimates.`,
        keys.map((k) => C[k]), ROOT.TM_CONTINENTAL));
    }
    if (C.england) {
      worlds.push(buildWorld('england', 'Real football — England 2025/26', 'England only',
        'Premier League and Championship only, as of the start of the 2025/26 season. Squads may be out of date and ratings are estimates.',
        [C.england], null));
    }
    return worlds;
  }
  const getDataset = (id) => datasets().find((d) => d.id === id) || FICTIONAL;
  const meta = () => G.meta;
  const leagueDivs = () => G.meta.leagues.map((_, i) => i + 1);
  const divName = (d) => (d === 0 ? 'Rest of Europe' : (G.meta.leagues[d - 1] || {}).name || `Division ${d}`);
  const divCountry = (d) => (d === 0 ? 'Europe' : G.meta.leagues[d - 1].country);
  const divTier = (d) => (d === 0 ? 9 : G.meta.leagues[d - 1].tier);
  function zoneInfo(d) {
    const up = G.meta.promotions.find((p) => p.down === d), down = G.meta.promotions.find((p) => p.up === d);
    return { promote: up ? up.count : 0, promoteTo: up ? up.up : null, relegate: down ? down.count : 0,
      relegateTo: down ? down.down : null, cl: G.meta.cl ? (G.meta.cl.slots[d] || 0) : 0 };
  }
  const promotedCount = (d = userClub().div) => { const z = zoneInfo(d); return z.relegate || z.promote; };
  const cupOfCountry = (country) => G.cups.findIndex((c) => c.country === country);
  const userCupIdx = () => cupOfCountry(userClub().country);
  const cupName = (ci = userCupIdx()) => (G.cups[ci] ? G.cups[ci].name : 'Cup');
  const clName = () => (G.meta.cl ? G.meta.cl.name : null);
  const seasonName = (n = G.season) => (G.meta.startYear
    ? `${G.meta.startYear + n - 1}/${String(G.meta.startYear + n).slice(2)}` : `Season ${n}`);
  function prizeFor(d, i, n) {
    const top = 9e6 * (G.meta.prizeScale || 1) * (divTier(d) === 1 ? 1 : DIV2_PRIZE_SHARE);
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
  // nationality: real players from the data pack (club country by default), generated ones mostly local
  const FOREIGN_POOL = ['BRA', 'ARG', 'FRA', 'ESP', 'POR', 'NED', 'BEL', 'SRB', 'CRO', 'NGA', 'GHA', 'SEN', 'CIV', 'MAR', 'COL',
    'URU', 'USA', 'JPN', 'SWE', 'DEN', 'NOR', 'POL', 'AUT', 'SUI', 'CZE', 'SVK', 'ALB', 'BIH', 'SCO', 'IRL', 'WAL', 'ECU', 'MEX',
    'CAN', 'CMR', 'ALG', 'TUN', 'EGY', 'KOR', 'AUS', 'IRN', 'UKR', 'GEO', 'HUN', 'ROU', 'GRE', 'TUR', 'ENG', 'GER', 'ITA'];
  const countryCode = (country) => ((ROOT.TM_NATIONS || {}).countryCodes || {})[country];
  let natIndex = null;
  function natOfReal(name, clubShort, country, inline) {
    const N = ROOT.TM_NATIONS;
    if (!N) return undefined;
    if (!natIndex) {
      natIndex = {};
      Object.entries(N.players).forEach(([code, str]) => str.split('|').filter(Boolean).forEach((n) => { natIndex[n] = code; }));
    }
    return N.overrides[`${name}@${clubShort}`] || inline || natIndex[name] || countryCode(country);
  }
  function genNat(country) {
    const home = country ? countryCode(country) : null;
    return home && rand() < 0.75 ? home : pick(FOREIGN_POOL);
  }
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
    if (G.meta && G.meta.nations && !p.nat) p.nat = genNat(clubId !== null ? club(clubId).country : null);
    G.players[p.id] = p;
    p.club = clubId;
    p.contract = clubId === null ? 0 : defaultContract(p);
    if (clubId !== null) club(clubId).squad.push(p.id);
    else G.freeAgents.push(p.id);
    return p;
  }

  // ---------- accessors ----------
  const NATION_BASE = 100000; // national teams share the club id space so the match engine can use them
  const club = (id) => (id >= NATION_BASE ? G.nations[id - NATION_BASE] : G.clubs[id]);
  const player = (id) => G.players[id];
  const squadOf = (cid) => club(cid).squad.map(player);
  const userClub = () => club(G.userClub);

  // ---------- new game ----------
  function newGame(clubIndex, managerName, seed, datasetId = 'fictional', opts = {}) {
    const ds = getDataset(datasetId);
    const national = !!(opts.nation && ds.nations);
    G = {
      version: SAVE_VERSION,
      seed: (seed === undefined ? Math.floor(Math.random() * 2 ** 31) : seed) >>> 0,
      manager: managerName || 'Manager',
      season: 1, week: 0, userClub: national ? 0 : clubIndex, mode: national ? 'national' : 'club',
      nations: [], intl: null, ccs: [], ccNext: {}, legendsSigned: {}, legendPoints: 0,
      clubs: [], players: {}, freeAgents: [], nextPid: 1,
      fixtures: [], calendar: [], cups: [], cl: null, clNext: null, news: [], history: [], training: 'normal',
      boardWarning: false, gameOver: false, seasonOver: false,
      meta: {
        dataset: ds.id,
        leagues: ds.leagues.map((l) => ({ name: l.name, country: l.country, tier: l.tier, cycles: l.cycles || 2 })),
        nations: !!ds.nations,
        ccs: (ds.ccs || []).map((cc) => ({ key: cc.key, name: cc.name, icon: cc.icon,
          slots: Object.fromEntries(Object.entries(cc.slots).map(([country, n]) => [ds.leagues.findIndex((l) => l.country === country && l.tier === 1) + 1, n])) })),
        promotions: ds.promotions.map((p) => ({ up: leagueIndex(ds, p.up), down: leagueIndex(ds, p.down), count: p.count })),
        cupsDef: ds.cups,
        cl: ds.continental ? { name: ds.continental.name, slots: Object.fromEntries(Object.entries(ds.continental.slots).map(([k, v]) => [leagueIndex(ds, k), v])) } : null,
        startYear: ds.startYear || null, prizeScale: ds.prizeScale || (ds.autoEconomy ? 2.5 : 1),
      },
    };
    ds.clubs.forEach((c, i) => {
      const div = c.league ? leagueIndex(ds, c.league) : 0;
      G.clubs.push({
        id: i, name: c.name, short: c.short, color: c.color, rep: c.rep, div,
        country: div ? ds.leagues[div - 1].country : (c.country || 'Europe'),
        budget: ds.autoEconomy ? Math.max(5e6, Math.round((c.rep - 50) * 1.2e6 / 100000) * 100000)
          : Math.max(1.5e6, Math.round((c.rep - 50) * 450000 / 100000) * 100000),
        formation: pick(Object.keys(FORMATIONS)), mentality: 'balanced',
        squad: [], lineup: [], table: blankTable(),
      });
    });
    G.clubs.forEach((c) => {
      const src = ds.clubs[c.id];
      if (src.players) {
        src.players.forEach((str) => {
          const rp = realPlayer(str);
          if (ds.nations) rp.nat = natOfReal(rp.name, c.short, c.country, str.split('|')[5]);
          addPlayer(rp, c.id);
        });
        // fill gaps in partially known squads with generated players: clearly below a known first team,
        // but at a normal level where we know too few players to field one
        const fillBase = src.players.length >= 11 ? c.rep - 12 : c.rep - 5;
        for (const pos of Object.keys(SQUAD_TEMPLATE)) {
          while (squadOf(c.id).filter((p) => p.pos === pos).length < SQUAD_TEMPLATE[pos]) {
            addPlayer(genPlayer(pos, fillBase, 21, 31), c.id);
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
    if (national) G.academy = { level: 1, prospects: [] };
    else {
      G.academy = { level: clamp(Math.round((userClub().rep - 45) / 10), 1, 4), prospects: [] };
      for (let i = 0; i < 3; i++) newProspect(ri(15, 17));
    }
    if (ds.nations) createNations(national ? opts.nation : null);
    if (national) {
      const n = G.nations.find((x) => x.code === opts.nation);
      if (!n) throw new Error('Unknown nation');
      G.userClub = n.id;
    }
    if (ds.continental) {
      G.clNext = ds.continental.initial.map((n) => G.clubs.findIndex((c) => c.name === n)).filter((id) => id >= 0);
    }
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
    if (national) pushNews(`Welcome, ${G.manager}! You are the new manager of ${userClub().name}. ${intlOutlook()}`);
    else pushNews(`Welcome, ${G.manager}! The board of ${userClub().name} expects a finish around ${ordinal(expectedPosition())} in the ${divName(userClub().div)}.`);
    return G;
  }
  const leagueIndex = (ds, key) => ds.leagues.findIndex((l) => l.key === key) + 1;
  function starterCount(pos) { return { GK: 1, DF: 4, MF: 4, FW: 2 }[pos]; }
  function blankTable() { return { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
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
  // Champions League money (scaled like everything else in the world)
  const clMoney = () => {
    const ps = G.meta.prizeScale || 1;
    return { entry: 6e6 * ps, win: 0.84e6 * ps, draw: 0.28e6 * ps, ko: [1e6, 4e6, 5e6, 6.5e6, 10e6].map((v) => v * ps) };
  };
  function scheduleSeason() {
    const divs = leagueDivs();
    const cyclesOf = (d) => G.meta.leagues[d - 1].cycles || 2;
    const leagueRounds = divs.map((d) => (G.clubs.filter((c) => c.div === d).length - 1) * cyclesOf(d));
    const slots = Math.max(...leagueRounds);
    // a domestic cup per country, for that country's league clubs
    G.cups = G.meta.cupsDef.map((def) => {
      const ids = G.clubs.filter((c) => c.country === def.country && c.div > 0).map((c) => c.id);
      const fmt = cupFormat(ids.length);
      const seeds = ids.map(club).sort((a, b) => divTier(a.div) - divTier(b.div) || b.rep - a.rep).slice(0, fmt.byes);
      return { name: def.name, country: def.country, clubs: ids, alive: [...ids], byes: seeds.map((c) => c.id),
        winner: null, rounds: fmt.rounds, prizes: fmt.prizes, offset: 0 };
    });
    const cupSlots = Math.max(0, ...G.cups.map((c) => c.rounds.length));
    G.cups.forEach((c) => { c.offset = cupSlots - c.rounds.length; }); // finals line up at the end of the season
    // continental competition
    const clIds = G.meta.cl ? (G.clNext || []) : [];
    G.cl = clIds.length >= 24 ? { clubs: clIds, table: {}, seeds: [], out: [], winner: null } : null;
    if (G.cl) {
      clIds.forEach((id) => { G.cl.table[id] = blankTable(); club(id).budget += clMoney().entry; });
    }
    // calendar: league matchdays with cup and European weeks slotted in
    const specials = [];
    for (let k = 0; k < cupSlots; k++) specials.push({ f: cupSlots > 1 ? 0.08 + 0.89 * k / (cupSlots - 1) : 0.97, slot: { type: 'cup', k } });
    if (G.cl) {
      for (let i = 0; i < 8; i++) specials.push({ f: 0.07 + 0.55 * i / 7, slot: { type: 'cl', lp: i } });
      CL_KO_ROUNDS.forEach((_, j) => specials.push({ f: 0.68 + 0.31 * j / (CL_KO_ROUNDS.length - 1), slot: { type: 'cl', ko: j } }));
    }
    specials.sort((a, b) => a.f - b.f);
    G.calendar = [];
    let si = 0;
    for (let md = 0; md < slots; md++) {
      while (si < specials.length && specials[si].f * slots <= md) G.calendar.push(specials[si++].slot);
      G.calendar.push({ type: 'league', md });
    }
    while (si < specials.length) G.calendar.push(specials[si++].slot);
    const weekOfSlot = {};
    G.calendar.forEach((c, i) => { if (c.type === 'league') weekOfSlot[c.md] = i; });
    G.fixtures = [];
    divs.forEach((div, k) => {
      const ids = shuffle(G.clubs.filter((c) => c.div === div).map((c) => c.id));
      // a smaller division spreads its rounds over the season, leaving some rest weeks
      makeFixtures(ids, cyclesOf(div)).forEach((f) => {
        f.comp = 'L'; f.div = div;
        f.week = weekOfSlot[Math.floor(f.md * slots / leagueRounds[k])];
        G.fixtures.push(f);
      });
    });
    if (G.cl) {
      const lpWeek = {};
      G.calendar.forEach((c, i) => { if (c.type === 'cl' && c.lp !== undefined) lpWeek[c.lp] = i; });
      clLeaguePhase(clIds).forEach(([h, a, md]) => G.fixtures.push({ comp: 'CL', stage: 'lp', md, week: lpWeek[md], home: h, away: a, played: false, hg: 0, ag: 0 }));
    }
    scheduleContinentalCups();
    if (G.meta.nations && G.nations && G.nations.length) scheduleIntl();
  }
  // ---------- continental cups outside Europe (Copa Libertadores, AFC Champions League) ----------
  const CC_KO = ['Quarter-final', 'Semi-final', 'Final'];
  const ccMoney = () => { const m = clMoney(); return { entry: m.entry * 0.3, win: m.win * 0.4, draw: m.draw * 0.4, ko: [m.ko[2], m.ko[3], m.ko[4]].map((v) => v * 0.4) }; };
  function scheduleContinentalCups() {
    G.ccs = [];
    if (!G.meta.ccs || !G.meta.ccs.length || !G.calendar.some((c) => c.type === 'cl')) return;
    const lpWeek = {};
    G.calendar.forEach((c, i) => { if (c.type === 'cl' && c.lp !== undefined) lpWeek[c.lp] = i; });
    const RR = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
    G.meta.ccs.forEach((def) => {
      // last season's qualifiers, or (first season) the strongest clubs of each league
      let ids = (G.ccNext && G.ccNext[def.key]) || [];
      if (!ids.length) {
        Object.entries(def.slots).forEach(([div, n]) => {
          ids.push(...G.clubs.filter((c) => c.div === +div).sort((a, b) => b.rep - a.rep).slice(0, n).map((c) => c.id));
        });
      }
      ids = ids.filter((id) => club(id)).slice(0, 16);
      if (ids.length < 16) return;
      const seeded = [...ids].sort((a, b) => club(b).rep - club(a).rep);
      const pots = [0, 1, 2, 3].map((k) => shuffle(seeded.slice(k * 4, k * 4 + 4)));
      const cc = { key: def.key, name: def.name, icon: def.icon, clubs: ids, groups: [0, 1, 2, 3].map((g) => pots.map((pot) => pot[g])),
        table: {}, winner: null, runnerUp: null };
      const ci = G.ccs.push(cc) - 1;
      ids.forEach((id) => { cc.table[id] = blankTable(); club(id).budget += ccMoney().entry; });
      cc.groups.forEach((grp, g) => {
        for (let r = 0; r < 6; r++) RR[r % 3].forEach(([x, y]) => G.fixtures.push({ comp: 'CC', cc: ci, stage: 'G', group: g, md: r, week: lpWeek[r],
          home: r < 3 ? grp[x] : grp[y], away: r < 3 ? grp[y] : grp[x], played: false, hg: 0, ag: 0 }));
      });
    });
  }
  function ccDraw(week, j) {
    const r = j - 2; // the cups' quarter-finals, semi-finals and final share the Champions League's last three rounds
    if (r < 0) return;
    G.ccs.forEach((cc, ci) => {
      if (G.fixtures.some((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'K' && f.round === r)) return;
      let pairs;
      if (r === 0) {
        const st = cc.groups.map((grp) => groupStandings(grp, cc.table));
        pairs = [[st[0][0], st[1][1]], [st[1][0], st[0][1]], [st[2][0], st[3][1]], [st[3][0], st[2][1]]];
      } else {
        const w = G.fixtures.filter((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'K' && f.round === r - 1).sort((a, b) => a.tie - b.tie).map((f) => f.winner);
        pairs = Array.from({ length: w.length / 2 }, (_, t) => [w[2 * t], w[2 * t + 1]]);
      }
      pairs.forEach(([h, a], tie) => G.fixtures.push({ comp: 'CC', cc: ci, stage: 'K', round: r, tie, ko: true, week, home: h, away: a, played: false, hg: 0, ag: 0 }));
      const uf = pairs.find((pr) => pr.includes(G.userClub));
      if (uf) pushNews(`${cc.icon} ${cc.name} ${CC_KO[r].toLowerCase()}: ${club(uf[0]).name} v ${club(uf[1]).name}.`);
    });
  }
  const ccOf = (cid) => G.ccs ? G.ccs.findIndex((cc) => cc.clubs.includes(cid)) : -1;
  function ccResult(cid) {
    const ci = ccOf(cid);
    if (ci < 0) return null;
    const cc = G.ccs[ci];
    if (cc.winner === cid) return 'Winners';
    const lost = G.fixtures.find((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'K' && f.played && (f.home === cid || f.away === cid) && f.winner !== cid);
    if (lost) return lost.round === CC_KO.length - 1 ? 'Runners-up' : `Out in ${CC_KO[lost.round].toLowerCase()}`;
    const groupDone = G.fixtures.filter((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'G').every((f) => f.played);
    const inKo = G.fixtures.some((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'K' && (f.home === cid || f.away === cid));
    return groupDone && !inKo ? 'Out in group stage' : 'Still in';
  }
  function clLeaguePhase(ids) {
    // 8 different opponents each: link every club to those 1, 2, 3 and 5 places along a shuffled
    // circle; each of those rings splits into two rounds where everyone plays exactly once
    const order = shuffle(ids), n = order.length, out = [];
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const offsets = [];
    for (let k = 1; offsets.length < 4 && k < n / 2; k++) if ((n / gcd(n, k)) % 2 === 0) offsets.push(k);
    offsets.forEach((k, oi) => {
      const g = gcd(n, k), L = n / g;
      for (let st = 0; st < g; st++) {
        const seq = Array.from({ length: L }, (_, j) => order[(st + j * k) % n]);
        for (let j = 0; j < L; j++) {
          const a = seq[j], b = seq[(j + 1) % L];
          out.push(rand() < 0.5 ? [a, b, oi * 2 + (j % 2)] : [b, a, oi * 2 + (j % 2)]);
        }
      }
    });
    return out;
  }
  function clStandings() {
    if (!G.cl) return [];
    const t = G.cl.table;
    return [...G.cl.clubs].sort((a, b) => t[b].pts - t[a].pts || (t[b].gf - t[b].ga) - (t[a].gf - t[a].ga)
      || t[b].gf - t[a].gf || club(b).rep - club(a).rep);
  }
  function clDraw(week, j) {
    if (!G.cl || fixturesForWeek(week).some((f) => f.comp === 'CL')) return;
    const add = (pairs) => pairs.forEach(([h, a], tie) => G.fixtures.push({ comp: 'CL', stage: 'ko', round: j, tie, ko: true, week, home: h, away: a, played: false, hg: 0, ag: 0 }));
    const winnersOf = (r) => G.fixtures.filter((f) => f.comp === 'CL' && f.stage === 'ko' && f.round === r).sort((a, b) => a.tie - b.tie).map((f) => f.winner);
    if (j === 0) {
      const st = clStandings();
      G.cl.seeds = st.slice(0, 8);
      const po = st.slice(8, 24);
      G.cl.out = st.slice(24);
      add(Array.from({ length: 8 }, (_, t) => [po[t], po[15 - t]]));
      if (G.cl.out.includes(G.userClub)) pushNews(`⭐ Out of the ${clName()}: you finished ${ordinal(st.indexOf(G.userClub) + 1)} in the league phase.`);
      else if (G.cl.seeds.includes(G.userClub)) pushNews(`⭐ Top 8 in the ${clName()} league phase: straight into the round of 16!`);
    } else if (j === 1) {
      const w = winnersOf(0);
      add(G.cl.seeds.map((sd, i) => [sd, w[7 - i]]));
    } else {
      const w = winnersOf(j - 1);
      add(Array.from({ length: w.length / 2 }, (_, t) => [w[2 * t], w[2 * t + 1]]));
    }
    const uf = userFixture(week);
    if (uf) pushNews(`⭐ ${clName()} ${CL_KO_ROUNDS[j].toLowerCase()}: ${club(uf.home).name} v ${club(uf.away).name}.`);
  }
  function cupDraw(week) {
    const cal = G.calendar[week];
    if (!cal) { if (G.intl) intlDraw(week); return; }
    if (cal.type === 'cl' && cal.ko !== undefined) { clDraw(week, cal.ko); ccDraw(week, cal.ko); return; }
    if (cal.type !== 'cup') return;
    G.cups.forEach((cup, ci) => {
      const r = cal.k - cup.offset;
      if (r < 0 || G.fixtures.some((f) => f.comp === 'CUP' && f.cup === ci && f.round === r)) return;
      const pool = shuffle(cup.alive.filter((id) => r > 0 || !cup.byes.includes(id)));
      for (let i = 0; i + 1 < pool.length; i += 2) {
        G.fixtures.push({ comp: 'CUP', cup: ci, round: r, ko: true, week, home: pool[i], away: pool[i + 1], played: false, hg: 0, ag: 0 });
      }
      if (ci !== userCupIdx()) return;
      const uf = userFixture(week);
      if (uf) pushNews(`🏆 ${cup.name} ${cup.rounds[r].toLowerCase()} draw: ${club(uf.home).name} v ${club(uf.away).name}.`);
      else if (r === 0 && cup.byes.includes(G.userClub)) pushNews(`🏆 As a seeded club you have a bye through the ${cup.name} first round.`);
    });
  }
  function cupResult(cid) {
    const ci = cupOfCountry(club(cid).country);
    const cup = G.cups[ci];
    if (!cup || !cup.clubs.includes(cid)) return '-';
    if (cup.winner === cid) return 'Winners';
    const lost = G.fixtures.find((f) => f.comp === 'CUP' && f.cup === ci && f.played && (f.home === cid || f.away === cid) && f.winner !== cid);
    if (lost) return lost.round === cup.rounds.length - 1 ? 'Runners-up' : `Out in ${cup.rounds[lost.round].toLowerCase()}`;
    return cup.alive.includes(cid) ? 'Still in' : '-';
  }
  function clResult(cid) {
    if (!G.cl || !G.cl.clubs.includes(cid)) return null;
    if (G.cl.winner === cid) return 'Winners';
    const lost = G.fixtures.find((f) => f.comp === 'CL' && f.stage === 'ko' && f.played && (f.home === cid || f.away === cid) && f.winner !== cid);
    if (lost) return lost.round === CL_KO_ROUNDS.length - 1 ? 'Runners-up' : `Out in ${CL_KO_ROUNDS[lost.round].toLowerCase()}`;
    if (G.cl.out.includes(cid)) return 'Out in league phase';
    return 'Still in';
  }
  function tiePrize(fx) {
    if (fx.comp === 'CUP') return G.cups[fx.cup].prizes[fx.round];
    if (fx.comp === 'CL' && fx.stage === 'ko') return clMoney().ko[fx.round];
    if (fx.comp === 'CC' && fx.stage === 'K') return ccMoney().ko[fx.round];
    return 0;
  }
  function weekLabel(w, div = userClub().div) {
    const c = G.calendar[w];
    if (!c) return G.intl && G.intl.kind && w < totalWeeks() ? `${intlName()} · ${tournamentRoundName(w - G.intl.tStart)}` : '';
    if (G.mode === 'national' || div < 0) {
      const f = fixturesForWeek(w).find((x) => x.comp === 'INT');
      if (f) return f.stage === 'F' ? 'International friendly'
        : G.intl.format === 'nl' ? `Nations League ${G.intl.groupLeague[f.group]} · group game` : `${intlName()} qualifier`;
      return c.type === 'league' ? 'Club football' : c.type === 'cl' ? 'Champions League week' : 'Cup week';
    }
    if (c.type === 'cup') {
      const cup = G.cups[cupOfCountry(divCountry(div))];
      const r = cup ? c.k - cup.offset : -1;
      return r >= 0 ? `${cup.name} · ${cup.rounds[r]}` : 'Cup week';
    }
    if (c.type === 'cl') {
      const cf = fixturesForWeek(w).find((x) => x.comp === 'CC' && (x.home === G.userClub || x.away === G.userClub));
      if (cf) return `${G.ccs[cf.cc].name} · ${cf.stage === 'G' ? `Group matchday ${cf.md + 1}` : CC_KO[cf.round]}`;
      if (!G.cl) return 'Continental week';
      return c.lp !== undefined ? `${clName()} · League phase ${c.lp + 1}` : `${clName()} · ${CL_KO_ROUNDS[c.ko]}`;
    }
    const f = fixturesForWeek(w).find((x) => x.comp === 'L' && x.div === div);
    return f ? `Matchday ${f.md + 1}` : 'Rest week';
  }
  const weekScale = () => BASE_WEEKS / totalWeeks();

  function makeFixtures(idList, cycles = 2) {
    // circle method; each further cycle repeats the round-robin with venues swapped
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
    for (let c = 0; c < cycles; c++) {
      rounds.forEach((g, r) => g.forEach(([h, a]) => fx.push({ md: c * (n - 1) + r, home: c % 2 ? a : h, away: c % 2 ? h : a, played: false, hg: 0, ag: 0 })));
    }
    return fx;
  }
  const totalWeeks = () => G.calendar.length + (G.intl ? G.intl.tWeeks : 0);
  // fixtures indexed by week; rebuilt whenever the fixture list is replaced or grows
  let fxIndex = { ref: null, len: -1, byWeek: null };
  function fixturesForWeek(w) {
    if (fxIndex.ref !== G.fixtures || fxIndex.len !== G.fixtures.length) {
      const byWeek = {};
      G.fixtures.forEach((f) => { (byWeek[f.week] = byWeek[f.week] || []).push(f); });
      fxIndex = { ref: G.fixtures, len: G.fixtures.length, byWeek };
    }
    return fxIndex.byWeek[w] ? [...fxIndex.byWeek[w]] : [];
  }
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
    const inSquad = new Set(c.squad);
    const ok = c.lineup.length === 11 && c.lineup.every((l) => {
      const p = player(l.pid);
      return p && inSquad.has(l.pid) && p.injury === 0;
    }) && slotsFor(c.formation).join() === c.lineup.map((l) => l.slot).join();
    if (!ok) {
      if (cid === G.userClub && c.lineup.length) {
        // keep the user's picks where possible
        const slots = slotsFor(c.formation);
        const keep = c.lineup.filter((l) => { const p = player(l.pid); return p && inSquad.has(l.pid) && p.injury === 0; });
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
  function strength(lineup, mentality, fitMap, home, instr) {
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
    const pr = PRESSING[(instr && instr.pressing) || 'normal'], tp = TEMPO[(instr && instr.tempo) || 'normal'];
    att *= tp.att; mid *= pr.mid; def *= pr.def * tp.def;
    return { att: att * short * h, mid: mid * short * h, def: def * short * h };
  }
  function clubStrength(cid) {
    const c = club(cid);
    const s = strength(validateLineup(cid), c.mentality, null, false, { pressing: c.pressing, tempo: c.tempo });
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
      instr: sides.map((cid) => ({ pressing: club(cid).pressing || 'normal', tempo: club(cid).tempo || 'normal' })),
      formations: sides.map((cid) => club(cid).formation),
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
    m.dirty = true;
    m.usedSubs[s].push(outPid, inPid);
    m.appeared.add(inPid);
    ev(m, s, 'sub', `🔁 ${club(m.sides[s]).short}: ${pname(inPid)} replaces ${pname(outPid)}${reason ? ' (' + reason + ')' : ''}`);
    return true;
  }
  function bestBench(m, s, slot) {
    return benchOf(m, s).sort((a, b) => slotRating(b, slot, m.fit[b.id]) - slotRating(a, slot, m.fit[a.id]))[0];
  }
  // the AI changes approach late on: chase a deficit, protect a lead
  function aiInMatchTactics(m, s) {
    if (m.min !== 60 && m.min !== 75) return;
    const diff = m.score[s] - m.score[1 - s];
    if (diff < 0) { m.ments[s] = 'attacking'; m.instr[s] = { pressing: 'high', tempo: 'fast' }; }
    else if (diff >= 2 || (diff === 1 && m.min === 75)) { m.ments[s] = 'defensive'; m.instr[s] = { pressing: 'low', tempo: 'slow' }; }
  }
  // move the players on the pitch into a new formation, each to the slot that suits him best
  function setMatchFormation(m, s, formation) {
    if (!FORMATIONS[formation]) return false;
    const onPitch = m.lineups[s].map((l) => player(l.pid));
    const slots = slotsFor(formation).slice(0, onPitch.length);
    const gk = onPitch.find((p) => m.lineups[s].find((l) => l.pid === p.id).slot === 'GK');
    const lineup = [];
    const used = new Set();
    if (gk && slots[0] === 'GK') { lineup.push({ pid: gk.id, slot: 'GK' }); used.add(gk.id); }
    slots.slice(lineup.length).forEach((slot) => {
      const best = onPitch.filter((p) => !used.has(p.id)).sort((a, b) => slotRating(b, slot, m.fit[b.id]) - slotRating(a, slot, m.fit[a.id]))[0];
      if (best) { used.add(best.id); lineup.push({ pid: best.id, slot }); }
    });
    m.lineups[s] = lineup;
    m.formations[s] = formation;
    m.dirty = true;
    ev(m, s, 'info', `📋 ${club(m.sides[s]).short} switch to ${formation}.`);
    return true;
  }
  // swap two players' positions on the pitch (e.g. move a winger to striker and vice versa)
  function swapMatchPositions(m, s, i, j) {
    const lu = m.lineups[s];
    if (i === j || !lu[i] || !lu[j]) return false;
    const a = lu[i].pid, b = lu[j].pid;
    lu[i] = { pid: b, slot: lu[i].slot };
    lu[j] = { pid: a, slot: lu[j].slot };
    m.dirty = true;
    ev(m, s, 'info', `🔀 ${pname(a)} moves to ${lu[j].slot}, ${pname(b)} to ${lu[i].slot}.`);
    return true;
  }
  function setMatchInstruction(m, s, key, value) {
    if (key === 'mentality' && MENTALITY[value]) m.ments[s] = value;
    else if (key === 'pressing' && PRESSING[value]) m.instr[s].pressing = value;
    else if (key === 'tempo' && TEMPO[value]) m.instr[s].tempo = value;
    else return false;
    m.dirty = true;
    return true;
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
    // team strength changes slowly (fatigue) or on events (subs, cards, injuries): recompute every 10 minutes or when dirty
    const key = m.ments.join() + JSON.stringify(m.instr || []);
    if (!m.st || m.dirty || m.min % 10 === 1 || m.stMents !== key) {
      m.st = m.lineups.map((lu, s) => strength(lu, m.ments[s], m.fit, s === 0, m.instr && m.instr[s]));
      // a high press also blunts the other side's attack
      if (m.instr) [0, 1].forEach((s) => { m.st[1 - s].att *= PRESSING[m.instr[s].pressing].oppAtt; });
      m.stMents = key; m.dirty = false;
    }
    const st = m.st;
    // possession
    const pm = Math.pow(st[0].mid, 4) / (Math.pow(st[0].mid, 4) + Math.pow(st[1].mid, 4));
    m.possTicks[rand() < pm ? 0 : 1]++;
    // chances
    const tempoRate = m.instr ? (TEMPO[m.instr[0].tempo].chances + TEMPO[m.instr[1].tempo].chances) / 2 : 1;
    if (rand() < 0.145 * tempoRate) {
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
        m.dirty = true;
        m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
        ev(m, s, 'red', `🟥 Second yellow! ${pname(l.pid)} (${club(m.sides[s]).short}) is sent off.`);
      } else ev(m, s, 'card', `🟨 ${pname(l.pid)} (${club(m.sides[s]).short}) is booked.`);
    } else if (rand() < 0.0007) {
      const s = rand() < 0.5 ? 0 : 1;
      const l = pick(m.lineups[s].filter((x) => x.slot !== 'GK'));
      m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
      m.dirty = true;
      m.yellows[l.pid] = 2;
      ev(m, s, 'red', `🟥 Straight red! ${pname(l.pid)} (${club(m.sides[s]).short}) is off.`);
    }
    // injuries
    const injMul = INTENSITY[G.training].injury;
    if (rand() < 0.0028 * (0.6 + 0.4 * injMul)) {
      const s = rand() < 0.5 ? 0 : 1;
      const l = pick(m.lineups[s]);
      m.injuries.push(l.pid);
      m.dirty = true;
      ev(m, s, 'injury', `🚑 ${pname(l.pid)} (${club(m.sides[s]).short}) is injured.`);
      const inP = bestBench(m, s, l.slot);
      if (!(inP && makeSub(m, s, l.pid, inP.id, 'injury'))) m.lineups[s] = m.lineups[s].filter((x) => x.pid !== l.pid);
    }
    // fatigue, applied in five-minute steps
    if (m.min % 5 === 0) {
      m.lineups.forEach((lu, s) => {
        const f = m.instr ? PRESSING[m.instr[s].pressing].fatigue : 1;
        for (const l of lu) m.fit[l.pid] = Math.max(20, m.fit[l.pid] - (l.slot === 'GK' ? 0.3 : 1) * f);
      });
    }
    // AI substitutions (the user's side too when they choose to sim)
    [0, 1].forEach((s) => { if (m.sides[s] !== G.userClub || opts.autoUser) { aiSubs(m, s); aiInMatchTactics(m, s); } });
    if (m.min === 45) ev(m, -1, 'info', `⏸ Half-time: ${m.score[0]}-${m.score[1]}`);
    if (m.min >= 90) {
      if (m.fx.ko && m.score[0] === m.score[1]) shootout(m);
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
    if (fx.comp === 'INT') { applyIntlResult(m); return; }
    fx.played = true; fx.hg = m.score[0]; fx.ag = m.score[1];
    // keep scorer names only for the user's own matches; storing them for every game bloats the save
    if (m.sides.includes(G.userClub)) fx.scorers = m.scorers.map((s) => ({ side: s.side, name: pname(s.pid), min: s.min }));
    let res = fx.hg > fx.ag ? ['W', 'L'] : fx.hg < fx.ag ? ['L', 'W'] : ['D', 'D'];
    if (fx.ko) {
      fx.pens = m.pens || null;
      const ws = fx.hg !== fx.ag ? (fx.hg > fx.ag ? 0 : 1) : (m.pens[0] > m.pens[1] ? 0 : 1);
      res = ws === 0 ? ['W', 'L'] : ['L', 'W'];
      fx.winner = m.sides[ws];
      const loser = m.sides[1 - ws];
      const prize = tiePrize(fx);
      club(fx.winner).budget += prize;
      const isCup = fx.comp === 'CUP', isCC = fx.comp === 'CC';
      const comp = isCup ? G.cups[fx.cup] : isCC ? G.ccs[fx.cc] : null;
      const name = isCup || isCC ? comp.name : clName();
      const rounds = isCup ? comp.rounds : isCC ? CC_KO : CL_KO_ROUNDS;
      const icon = isCup ? '🏆' : isCC ? comp.icon : '⭐';
      if (isCup) comp.alive = comp.alive.filter((id) => id !== loser);
      if (fx.round === rounds.length - 1) {
        if (comp) comp.winner = fx.winner; else G.cl.winner = fx.winner;
        if (isCC) comp.runnerUp = loser;
        if (isCup ? (fx.cup === userCupIdx() || m.sides.includes(G.userClub)) : !isCC || m.sides.includes(G.userClub) || ccOf(G.userClub) === fx.cc) {
          pushNews(`${icon} ${club(fx.winner).name} win the ${name}, beating ${club(loser).name}!`);
        }
      } else if (fx.winner === G.userClub) {
        pushNews(`${icon} Through to the ${name} ${rounds[fx.round + 1].toLowerCase()} (+${money(prize)}).`);
      } else if (loser === G.userClub) pushNews(`💔 Knocked out of the ${name} in the ${rounds[fx.round].toLowerCase()}.`);
    } else {
      const cl = fx.comp === 'CL' || fx.comp === 'CC';
      const tbl = fx.comp === 'CL' ? G.cl.table : fx.comp === 'CC' ? G.ccs[fx.cc].table : null;
      const [h, a] = tbl ? [tbl[fx.home], tbl[fx.away]] : [club(fx.home).table, club(fx.away).table];
      const money_ = fx.comp === 'CC' ? ccMoney() : clMoney();
      h.p++; a.p++; h.gf += fx.hg; h.ga += fx.ag; a.gf += fx.ag; a.ga += fx.hg;
      [h, a].forEach((t, i) => {
        const r = res[i];
        if (r === 'W') { t.w++; t.pts += 3; } else if (r === 'D') { t.d++; t.pts += 1; } else t.l++;
        t.form = [...t.form, r].slice(-5);
        if (cl) club(m.sides[i]).budget += r === 'W' ? money_.win : r === 'D' ? money_.draw : 0;
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
    const mySide = m.sides.indexOf(G.userClub);
    if (mySide >= 0) awardPoints(res[mySide] === 'W' ? POINTS.win : res[mySide] === 'D' ? POINTS.draw : 0);
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
        .forEach((pid) => pushNews(`🚑 ${pname(pid)} will be out for ${player(pid).injury} week(s).`, pid));
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
        // academy coaching: quality of facilities drives development (club careers only)
        if (p.ovr < p.pot && rand() < 0.035 * weekScale() * (1 + 0.2 * G.academy.level) * traitGrowth(p) * (p.pot - p.ovr) / 10) p.ovr++;
        return;
      }
      if (p.injury > 0) { p.injury--; if (p.injury === 0 && p.club === G.userClub) pushNews(`✅ ${p.name} is back from injury.`, p.id); }
      p.fitness = clamp(p.fitness + intensity.recover, 0, 100);
      // development during the season
      if (p.age <= 27 && p.ovr < p.pot && p.injury === 0) {
        const chance = 0.05 * weekScale() * intensity.growth * (p.pot - p.ovr) / 10 * (p.age <= 21 ? 1.5 : 1) * growthMult(p);
        if (rand() < chance) {
          p.ovr++;
          if (isWonderkid(p) && p.ovr >= 65 && p.ovr % 5 === 0) {
            if (p.club === G.userClub) pushNews(`🌟 Wonderkid ${p.name} keeps getting better. He's now rated ${p.ovr}!`, p.id);
            else if (rand() < 0.3) pushNews(`🌟 ${p.name} (${club(p.club).short}, ${p.age}) is the talk of the league, now rated ${p.ovr}.`, p.id);
          } else if (p.club === G.userClub && rand() < 0.35) pushNews(`📈 ${p.name} is improving in training (now ${p.ovr}).`, p.id);
        }
      }
      // a benched wonderkid gets restless
      if (p.club === G.userClub && isWonderkid(p) && p.ovr >= 58 && G.week >= 6 && (p.playTime || 0) < 1 && !p.injury) {
        p.morale = clamp(p.morale - 3, 10, 100);
        if (p.morale < 40 && p.complained !== G.season) {
          p.complained = G.season;
          pushNews(`😤 ${p.name} is frustrated by his lack of game time and wants first-team football.`, p.id);
        }
      }
      p.playTime = (p.playTime || 0) * 0.85;
      // training-ground knocks
      if (p.club === G.userClub && p.injury === 0 && rand() < 0.004 * weekScale() * intensity.injury) {
        p.injury = ri(1, 3);
        pushNews(`🤕 ${p.name} picked up a knock in training (${p.injury} wk).`, p.id);
      }
    });
    // wages & TV money
    G.clubs.forEach((c) => {
      const wages = squadOf(c.id).reduce((a, p) => a + p.wage, 0);
      c.budget += weeklyIncome(c) - wages;
      c.lastWages = wages;
    });
    if (G.mode !== 'national') userClub().budget -= academyUpkeep();
    // reminders about expiring deals and academy graduates
    if (G.mode !== 'national' && (G.week === Math.round(totalWeeks() / 3) || G.week === Math.round(totalWeeks() * 0.7))) {
      const exp = expiringPlayers();
      if (exp.length) pushNews(`📝 ${exp.length} player(s) are in the final year of their contract: ${exp.slice(0, 4).map((p) => p.name).join(', ')}${exp.length > 4 ? '…' : ''}. They leave for free at season end.`, exp.slice(0, 4).map((p) => p.id));
      const grads = prospects().filter((p) => p.age >= ACADEMY_GRAD_AGE - 1);
      if (grads.length) pushNews(`🎓 Decide on ${grads.map((p) => p.name).join(', ')}: academy players turning ${ACADEMY_GRAD_AGE} leave unless promoted.`, grads.map((p) => p.id));
    }
    aiTransferActivity();
    aiWonderkidRaid();
    if (G.mode !== 'national') wonderkidBids();
    G.clubs.forEach((c) => { if (c.id !== G.userClub) { c.lineup = autoLineup(c.id); aiMentality(c); } });
    validateLineup(G.userClub);
    G.week++;
    if (G.intl) intlWeek();
    if (G.week >= totalWeeks()) G.seasonOver = true;
    else cupDraw(G.week);
    if (G.mode !== 'national') checkBoard();
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

  // ---------- national teams & international football ----------
  const NATION_QUOTA = { GK: 3, DF: 8, MF: 7, FW: 5 };
  const INTL_SQUAD = 23;
  const T_GROUPS = 6, T_TEAMS = 24, T_KO = ['Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
  const nationMeta = () => {
    const m = {};
    ((ROOT.TM_NATIONS || {}).meta || []).forEach((row) => { const [code, name, color, conf] = row.split('|'); m[code] = { code, name, color, conf }; });
    return m;
  };
  let natGroups = null; // nationality -> players, built once per call-up round
  const eligible = (code) => (natGroups ? (natGroups[code] || []) : Object.values(G.players).filter((p) => p.nat === code && !p.academy && !p.legend));
  function withNatGroups(fn) {
    natGroups = {};
    Object.values(G.players).forEach((p) => { if (p.nat && !p.academy && !p.legend) (natGroups[p.nat] = natGroups[p.nat] || []).push(p); });
    try { return fn(); } finally { natGroups = null; }
  }
  function createNations(mustInclude) {
    const meta = nationMeta();
    const counts = {};
    Object.values(G.players).forEach((p) => { if (p.nat && !p.academy) counts[p.nat] = (counts[p.nat] || 0) + 1; });
    G.nations = Object.keys(meta).filter((code) => (counts[code] || 0) >= 18 || code === mustInclude).map((code, i) => ({
      id: NATION_BASE + i, code, name: meta[code].name, short: code, color: meta[code].color, conf: meta[code].conf,
      country: meta[code].name, isNation: true, div: -1, rep: 50, budget: 0,
      formation: '4-3-3', mentality: 'balanced', squad: [], lineup: [], table: blankTable(),
    }));
    withNatGroups(() => G.nations.forEach((n) => callUp(n)));
  }
  // the national teams a user can pick before a game exists: nations with enough real players in the data
  function previewNations(datasetId) {
    const ds = getDataset(datasetId);
    if (!ds.nations) return [];
    const meta = nationMeta();
    const pools = {};
    ds.clubs.forEach((c) => (c.players || []).forEach((str) => {
      const [name, , , ovr, , inline] = str.split('|');
      const code = natOfReal(name, c.short, c.country, inline);
      (pools[code] = pools[code] || []).push(+ovr);
    }));
    return Object.entries(pools).filter(([code, a]) => meta[code] && a.length >= 12).map(([code, a]) => {
      const top = a.sort((x, y) => y - x).slice(0, 16);
      return { ...meta[code], players: a.length, rep: Math.round(top.reduce((x, y) => x + y, 0) / top.length) };
    }).sort((x, y) => y.rep - x.rep);
  }
  function nationStrength(n) {
    const top = eligible(n.code).map((p) => p.ovr).sort((a, b) => b - a).slice(0, 16);
    return top.length ? Math.round(top.reduce((a, b) => a + b, 0) / top.length) : 40;
  }
  function callUp(n) {
    const pool = eligible(n.code).filter((p) => p.injury === 0).sort((a, b) => b.ovr - a.ovr);
    const picked = new Set();
    Object.entries(NATION_QUOTA).forEach(([pos, k]) => pool.filter((p) => p.pos === pos).slice(0, k).forEach((p) => picked.add(p.id)));
    for (const p of pool) { if (picked.size >= INTL_SQUAD) break; picked.add(p.id); }
    n.squad = [...picked];
    n.rep = nationStrength(n);
    n.lineup = autoLineup(n.id);
  }
  function refreshCallUps() {
    withNatGroups(() => G.nations.forEach((n) => {
      n.rep = nationStrength(n);
      if (n.id === G.userClub && G.mode === 'national') {
        n.squad = n.squad.filter((id) => G.players[id] && G.players[id].nat === n.code);
        validateLineup(n.id);
      } else callUp(n);
      n.squad = n.squad.filter((id) => G.players[id] && !G.players[id].legend);
    }));
  }
  // national-team squad management for the user
  function canCallUp(pid) {
    const n = userClub(), p = player(pid);
    if (!p || p.nat !== n.code) return { ok: false, why: 'Not eligible for your country.' };
    if (p.legend) return { ok: false, why: 'Legends have retired from international football.' };
    if (n.squad.includes(pid)) return { ok: false, why: 'Already in the squad.' };
    if (n.squad.length >= INTL_SQUAD) return { ok: false, why: `The squad is full (${INTL_SQUAD}). Drop someone first.` };
    return { ok: true };
  }
  function callUpPlayer(pid) {
    const chk = canCallUp(pid);
    if (!chk.ok) return chk;
    userClub().squad.push(pid);
    return { ok: true };
  }
  function dropPlayer(pid) {
    const n = userClub();
    n.squad = n.squad.filter((id) => id !== pid);
    n.lineup = n.lineup.filter((l) => l.pid !== pid);
    validateLineup(n.id);
    return { ok: true };
  }
  function autoSquad() { callUp(userClub()); }
  const intlName = () => (G.intl && G.intl.kind ? `${G.intl.kind} ${G.intl.year}` : 'Internationals');
  const tournamentRoundName = (k) => {
    const I = G.intl, gw = I && I.groupWeeks !== undefined ? I.groupWeeks : 3;
    return k < gw ? `Group stage ${k + 1}` : T_KO[((I && I.koStart) || 0) + k - gw];
  };
  const nationRanking = () => [...G.nations].sort((a, b) => b.rep - a.rep);
  function intlPool(kind) { return nationRanking().filter((n) => kind !== 'Euro' || n.conf === 'UEFA'); }
  function scheduleIntl() {
    const prev = G.intl;
    const year = G.meta.startYear + G.season; // the summer that ends this season
    let kind = year % 4 === 2 ? 'World Cup' : year % 4 === 0 ? 'Euro' : null;
    const uefa = nationRanking().filter((n) => n.conf === 'UEFA');
    if (!kind && uefa.length >= 16) kind = 'Nations League';
    const nl = kind === 'Nations League';
    const leagueWeeks = G.calendar.map((c, i) => (c.type === 'league' ? i : -1)).filter((i) => i >= 0);
    const windows = [0.08, 0.2, 0.33, 0.46, 0.6, 0.74].map((f) => leagueWeeks[Math.floor(f * leagueWeeks.length)]);
    G.intl = { kind, year, windows, groups: [], qTable: {}, qualified: null, tGroups: [], tTable: {}, winner: null, runnerUp: null,
      tStart: G.calendar.length, tWeeks: !kind ? 0 : nl ? 2 : 3 + T_KO.length,
      format: nl ? 'nl' : kind ? 'tournament' : 'friendlies', koStart: nl ? 2 : 0, groupWeeks: nl ? 0 : 3, groupLeague: [], nlMoves: {},
      history: prev ? prev.history : [], strikes: prev ? prev.strikes : 0 };
    refreshCallUps();
    const add = (h, a, week, extra) => G.fixtures.push({ comp: 'INT', week, home: h, away: a, played: false, hg: 0, ag: 0, ...extra });
    const RR = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
    const makeGroups = (pool, label) => {
      // groups of four seeded from pots, a double round-robin over the six windows
      const n4 = Math.floor(pool.length / 4) * 4;
      const seeded = pool.slice(0, n4), groupsN = n4 / 4;
      const pots = [0, 1, 2, 3].map((k) => shuffle(seeded.slice(k * groupsN, (k + 1) * groupsN)));
      for (let g = 0; g < groupsN; g++) {
        const grp = pots.map((pot) => pot[g].id);
        const gi = G.intl.groups.push(grp) - 1;
        G.intl.groupLeague[gi] = label;
        grp.forEach((id) => { G.intl.qTable[id] = blankTable(); });
        for (let r = 0; r < 6; r++) RR[r % 3].forEach(([x, y]) => add(r < 3 ? grp[x] : grp[y], r < 3 ? grp[y] : grp[x], windows[r], { stage: 'Q', group: gi }));
      }
    };
    if (nl) {
      // Nations League: European sides keep their league (A, B, C) between editions, with promotion and relegation
      if (!G.nlLeagues) {
        G.nlLeagues = {};
        uefa.forEach((n, i) => { G.nlLeagues[n.id] = i < 16 ? 'A' : i < 32 ? 'B' : 'C'; });
      }
      uefa.forEach((n) => { if (!G.nlLeagues[n.id]) G.nlLeagues[n.id] = 'C'; });
      ['A', 'B', 'C'].forEach((L) => makeGroups(uefa.filter((n) => G.nlLeagues[n.id] === L), L));
    } else if (kind) makeGroups(intlPool(kind), null);
    // everyone without a group plays friendlies against sides of similar strength
    const busy = new Set(G.intl.groups.flat());
    windows.forEach((w) => {
      const order = nationRanking().filter((n) => !busy.has(n.id));
      for (let i = 0; i + 1 < order.length; i += 2) {
        const j = i + 2 < order.length && rand() < 0.5 ? i + 2 : i + 1;
        [order[i + 1], order[j]] = [order[j], order[i + 1]];
        add(order[i].id, order[i + 1].id, w, { stage: 'F' });
      }
    });
  }
  function intlWeek() {
    const I = G.intl;
    // AI nations pick fresh squads before each international window
    if (I.windows.includes(G.week) || G.week === I.tStart) refreshCallUps();
    if (I.kind && !I.qualified && G.week > Math.max(...I.windows)) intlQualify();
  }
  function groupStandings(ids, table) {
    return [...ids].sort((a, b) => table[b].pts - table[a].pts || (table[b].gf - table[b].ga) - (table[a].gf - table[a].ga)
      || table[b].gf - table[a].gf || club(b).rep - club(a).rep);
  }
  function intlQualify() {
    const I = G.intl;
    if (I.format === 'nl') { nlFinish(); return; }
    // rank every side by group finish, then points: the best 24 go to the tournament
    const ranked = [];
    I.groups.forEach((grp) => groupStandings(grp, I.qTable).forEach((id, pos) => ranked.push({ id, pos, t: I.qTable[id] })));
    ranked.sort((a, b) => a.pos - b.pos || b.t.pts - a.t.pts || (b.t.gf - b.t.ga) - (a.t.gf - a.t.ga) || b.t.gf - a.t.gf);
    I.qualified = ranked.slice(0, T_TEAMS).map((r) => r.id);
    const seeded = [...I.qualified].sort((a, b) => club(b).rep - club(a).rep);
    const pots = [0, 1, 2, 3].map((k) => shuffle(seeded.slice(k * T_GROUPS, (k + 1) * T_GROUPS)));
    I.tGroups = Array.from({ length: T_GROUPS }, (_, g) => pots.map((pot) => pot[g]));
    const RR = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
    I.tGroups.forEach((grp, g) => {
      grp.forEach((id) => { I.tTable[id] = blankTable(); });
      RR.forEach((pairs, r) => pairs.forEach(([x, y]) => G.fixtures.push({ comp: 'INT', stage: 'TG', group: g, round: r,
        week: I.tStart + r, home: grp[x], away: grp[y], played: false, hg: 0, ag: 0 })));
    });
    if (G.mode === 'national') {
      pushNews(I.qualified.includes(G.userClub) ? `🌍 Qualified for the ${intlName()}!` : `💔 ${userClub().name} have failed to qualify for the ${intlName()}.`);
    } else pushNews(`🌍 The ${intlName()} line-up is set: ${seeded.slice(0, 6).map((id) => club(id).name).join(', ')} are among the favourites.`);
  }
  function nlFinish() {
    // group winners of League A reach the Finals; promotion and relegation between leagues
    const I = G.intl;
    const winnersA = [], tops = { A: [], B: [], C: [] }, bottoms = { A: [], B: [], C: [] };
    I.groups.forEach((grp, g) => {
      const st = groupStandings(grp, I.qTable);
      const L = I.groupLeague[g];
      if (L === 'A') winnersA.push(st[0]);
      tops[L].push(st[0]); bottoms[L].push(st[3]);
    });
    // swap equal numbers across each boundary so the leagues keep their size
    const t = (id) => I.qTable[id];
    const best = (a, b) => t(b).pts - t(a).pts || (t(b).gf - t(b).ga) - (t(a).gf - t(a).ga) || t(b).gf - t(a).gf;
    [['A', 'B'], ['B', 'C']].forEach(([hi, lo]) => {
      const up = [...tops[lo]].sort(best), down = [...bottoms[hi]].sort(best).reverse();
      const k = Math.min(up.length, down.length);
      up.slice(0, k).forEach((id) => { I.nlMoves[id] = 'up'; G.nlLeagues[id] = hi; });
      down.slice(0, k).forEach((id) => { I.nlMoves[id] = 'down'; G.nlLeagues[id] = lo; });
    });
    I.qualified = winnersA.sort((a, b) => club(b).rep - club(a).rep).slice(0, 4);
    if (I.qualified.length === 4) {
      [[0, 3], [1, 2]].forEach(([x, y], tie) => G.fixtures.push({ comp: 'INT', stage: 'TK', round: 2, tie, ko: true, week: I.tStart,
        home: I.qualified[x], away: I.qualified[y], played: false, hg: 0, ag: 0 }));
    }
    const me = G.userClub;
    if (G.mode === 'national' && G.nlLeagues[me]) {
      const mv = I.nlMoves[me];
      pushNews(I.qualified.includes(me) ? `🌍 Group winners! ${userClub().name} are in the ${intlName()} Finals.`
        : mv === 'up' ? `⬆️ Promoted to Nations League ${G.nlLeagues[me]}!` : mv === 'down' ? `⬇️ Relegated to Nations League ${G.nlLeagues[me]}.`
          : `The Nations League group stage is over: ${userClub().name} stay in League ${G.nlLeagues[me]}.`);
    } else pushNews(`🌍 ${I.qualified.map((id) => club(id).name).join(', ')} reach the ${intlName()} Finals.`);
  }
  function intlDraw(week) {
    const I = G.intl;
    const j = (I.koStart || 0) + week - I.tStart - (I.groupWeeks === undefined ? 3 : I.groupWeeks);
    if (!I.kind || !I.qualified || j < (I.koStart || 0) || j >= T_KO.length) return;
    if (G.fixtures.some((f) => f.comp === 'INT' && f.stage === 'TK' && f.round === j)) return;
    const add = (pairs) => pairs.forEach(([h, a], tie) => G.fixtures.push({ comp: 'INT', stage: 'TK', round: j, tie, ko: true, week, home: h, away: a, played: false, hg: 0, ag: 0 }));
    if (j === 0) {
      // group winners, runners-up and the four best third-placed sides
      const finish = [];
      I.tGroups.forEach((grp) => groupStandings(grp, I.tTable).forEach((id, pos) => finish.push({ id, pos, t: I.tTable[id] })));
      const order = (a, b) => a.pos - b.pos || b.t.pts - a.t.pts || (b.t.gf - b.t.ga) - (a.t.gf - a.t.ga) || b.t.gf - a.t.gf;
      const thirds = finish.filter((x) => x.pos === 2).sort(order).slice(0, 4);
      const q = [...finish.filter((x) => x.pos < 2), ...thirds].sort(order).map((x) => x.id);
      add(Array.from({ length: 8 }, (_, i) => [q[i], q[15 - i]]));
      if (G.mode === 'national' && I.qualified.includes(G.userClub)) {
        pushNews(q.includes(G.userClub) ? '🌍 Through to the round of 16!' : `💔 Out of the ${intlName()} at the group stage.`);
      }
    } else {
      const w = G.fixtures.filter((f) => f.comp === 'INT' && f.stage === 'TK' && f.round === j - 1).sort((a, b) => a.tie - b.tie).map((f) => f.winner);
      add(Array.from({ length: w.length / 2 }, (_, t) => [w[2 * t], w[2 * t + 1]]));
    }
  }
  function applyIntlResult(m) {
    const { fx } = m;
    const I = G.intl;
    fx.played = true; fx.hg = m.score[0]; fx.ag = m.score[1];
    if (m.sides.includes(G.userClub)) fx.scorers = m.scorers.map((s) => ({ side: s.side, name: pname(s.pid), min: s.min }));
    if (fx.ko) {
      fx.pens = m.pens || null;
      const ws = fx.hg !== fx.ag ? (fx.hg > fx.ag ? 0 : 1) : (m.pens[0] > m.pens[1] ? 0 : 1);
      fx.winner = m.sides[ws];
      const loser = m.sides[1 - ws];
      if (fx.round === T_KO.length - 1) {
        I.winner = fx.winner; I.runnerUp = loser;
        pushNews(`🌍 ${club(fx.winner).name} win the ${intlName()}, beating ${club(loser).name} in the final!`);
      } else if (fx.winner === G.userClub) pushNews(`🌍 Through to the ${intlName()} ${T_KO[fx.round + 1].toLowerCase()}!`);
      else if (loser === G.userClub) pushNews(`💔 Knocked out of the ${intlName()} in the ${T_KO[fx.round].toLowerCase()}.`);
    } else if (fx.stage === 'Q' || fx.stage === 'TG') {
      const table = fx.stage === 'Q' ? I.qTable : I.tTable;
      const res = fx.hg > fx.ag ? ['W', 'L'] : fx.hg < fx.ag ? ['L', 'W'] : ['D', 'D'];
      [table[fx.home], table[fx.away]].forEach((t, i) => {
        t.p++; t.gf += i ? fx.ag : fx.hg; t.ga += i ? fx.hg : fx.ag;
        if (res[i] === 'W') { t.w++; t.pts += 3; } else if (res[i] === 'D') { t.d++; t.pts += 1; } else t.l++;
        t.form = [...t.form, res[i]].slice(-5);
      });
    }
    // caps and international goals; players also carry knocks back to their clubs
    m.appeared.forEach((pid) => { const p = player(pid); if (p) p.caps = (p.caps || 0) + 1; });
    m.scorers.forEach((s) => { const p = player(s.pid); if (p) p.intlGoals = (p.intlGoals || 0) + 1; });
    m.injuries.forEach((pid) => { const p = player(pid); if (p) p.injury = ri(1, 4); });
  }
  function intlStage(id) {
    // how far a nation got: 0 not qualified, 1 group stage, 2 R16, 3 QF, 4 SF, 5 final, 6 winner
    const I = G.intl;
    if (!I || !I.kind || !I.qualified || !I.qualified.includes(id)) return 0;
    if (I.winner === id) return 6;
    const ko = G.fixtures.filter((f) => f.comp === 'INT' && f.stage === 'TK' && (f.home === id || f.away === id));
    return ko.length ? 1 + ko.length : 1;
  }
  const STAGE_TEXT = ['Did not qualify', 'Group stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Runners-up', 'Winners'];
  function intlExpectation(id = G.userClub, kind = G.intl && G.intl.kind) {
    if (kind === 'Nations League') return 0;
    const rank = intlPool(kind).findIndex((n) => n.id === id) + 1;
    if (!rank) return 0;
    return rank <= 4 ? 3 : rank <= 12 ? 2 : rank <= T_TEAMS ? 1 : 0;
  }
  const EXPECT_TEXT = ['Do your best', 'Qualify', 'Reach the round of 16', 'Reach the quarter-finals', 'Reach the semi-finals'];
  function intlOutlook() {
    if (!G.intl) return '';
    const rank = nationRanking().findIndex((n) => n.id === G.userClub) + 1;
    if (G.intl.format === 'nl') {
      const L = G.nlLeagues && G.nlLeagues[G.userClub];
      return L ? `Nations League season: you're in League ${L}. Win your group to ${L === 'A' ? 'reach the Finals' : 'go up'}; finish bottom and you go down. (World ranking: ${ordinal(rank)})`
        : `No tournament for your confederation next summer, just friendlies. (World ranking: ${ordinal(rank)})`;
    }
    if (G.intl.kind === 'Euro' && userClub().conf !== 'UEFA') return `Euro ${G.intl.year} is for European sides only: friendlies for you. (World ranking: ${ordinal(rank)})`;
    return G.intl.kind
      ? `The ${intlName()} is next summer. The federation's target: ${EXPECT_TEXT[intlExpectation()].toLowerCase()}. (World ranking: ${ordinal(rank)})`
      : `No tournament next summer, just friendlies. (World ranking: ${ordinal(rank)})`;
  }
  function intlSummary() {
    if (!G.intl || !G.intl.kind) return null;
    return { kind: G.intl.kind, year: G.intl.year, name: intlName(),
      winner: G.intl.winner !== null ? club(G.intl.winner).name : '-', runnerUp: G.intl.runnerUp !== null ? club(G.intl.runnerUp).name : '-',
      mine: G.mode !== 'national' ? null : G.intl.format === 'nl' ? nlResultText(G.userClub)
        : G.intl.kind === 'Euro' && userClub().conf !== 'UEFA' ? 'Friendlies only' : STAGE_TEXT[intlStage(G.userClub)] };
  }
  function nlResultText(id) {
    const I = G.intl;
    if (I.winner === id) return 'Nations League winners';
    if (I.runnerUp === id) return 'Nations League runners-up';
    if (I.qualified && I.qualified.includes(id)) return 'Nations League semi-finals';
    if (!G.nlLeagues || !G.nlLeagues[id]) return 'Friendlies only';
    const mv = I.nlMoves[id];
    return mv === 'up' ? `Promoted to League ${G.nlLeagues[id]}` : mv === 'down' ? `Relegated to League ${G.nlLeagues[id]}` : `Stayed in League ${G.nlLeagues[id]}`;
  }
  function nationalVerdict(summary) {
    const I = G.intl;
    const me = userClub();
    if (I && I.format === 'nl' && G.nlLeagues && G.nlLeagues[me.id]) {
      const res = nlResultText(me.id);
      if (I.winner === me.id) { I.strikes = 0; summary.verdict = 'Nations League winners! The federation is delighted.'; }
      else if (I.nlMoves[me.id] === 'down') summary.verdict = 'Relegation in the Nations League. The federation is disappointed, but the tournaments are what count.';
      else summary.verdict = I.nlMoves[me.id] === 'up' ? 'Promotion! The federation is pleased.' : 'A steady Nations League campaign. The federation is satisfied.';
      G.history.push({ season: G.season, national: true, result: `${intlName()}: ${res}` });
      return;
    }
    if (I && I.kind === 'Euro' && me.conf !== 'UEFA') {
      summary.verdict = 'No tournament for your confederation this summer: a year of friendlies.';
      G.history.push({ season: G.season, national: true, result: 'Friendlies only' });
      return;
    }
    if (!I || !I.kind || I.format === 'nl') {
      summary.verdict = 'A year of friendlies. The federation looks ahead to the next tournament.';
      G.history.push({ season: G.season, national: true, result: 'Friendlies only' });
      return;
    }
    const got = intlStage(G.userClub), want = intlExpectation();
    summary.expectedText = EXPECT_TEXT[want];
    if (got >= want) { I.strikes = 0; summary.verdict = got > want ? 'The federation is thrilled: you beat expectations!' : 'The federation is satisfied with the tournament.'; }
    else if (got === want - 1 && I.strikes < 1) { I.strikes++; summary.verdict = 'The federation is disappointed. Another failure will cost you your job.'; }
    else {
      summary.verdict = 'The federation has seen enough. You have been sacked.';
      G.gameOver = true;
      G.gameOverReason = `${STAGE_TEXT[got]} at the ${intlName()} when the federation expected you to ${EXPECT_TEXT[want].toLowerCase()}.`;
    }
    G.history.push({ season: G.season, national: true, result: `${intlName()}: ${STAGE_TEXT[got]}` });
  }

  // ---------- exclusive legends ----------
  function legendDefs() {
    return ((ROOT.TM_LEGENDS) || []).map((str) => { const [name, pos, ovr, nat] = str.split('|'); return { name, pos, ovr: +ovr, nat }; });
  }
  function legendPlayer(def) {
    const p = { id: G.nextPid++, name: def.name, pos: def.pos, age: 27, ovr: def.ovr, pot: def.ovr, fitness: 100, morale: 90, injury: 0,
      apps: 0, goals: 0, assists: 0, yellow: 0, club: null, wage: 0, contract: 3, trait: 'Professional', seasonStart: def.ovr,
      playTime: 0, legend: true, nat: G.meta.nations ? def.nat : undefined };
    p.wage = Math.round(wageFor(p) * 1.2 / 100) * 100;
    return p;
  }
  // legends cost Legend Points, earned by winning (never money)
  const legendCost = (def) => 40 + Math.pow(Math.max(0, def.ovr - 80), 2);
  const legendPoints = () => G.legendPoints || 0;
  function awardPoints(n, why) {
    if (G.mode === 'national' || !n) return;
    G.legendPoints = legendPoints() + n;
    if (why) pushNews(`⭐ +${n} Legend Points: ${why}.`);
  }
  const POINTS = { win: 3, draw: 1, title: 60, promotion: 40, cup: 30, cl: 80, cc: 60, qualifyCL: 15, beatTarget: 25, goldenBoy: 15 };
  function legendsMarket() {
    G.legendsSigned = G.legendsSigned || {};
    return legendDefs().map((d) => ({ ...d, cost: legendCost(d), signed: G.legendsSigned[d.name] || null }))
      .sort((a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name));
  }
  function signLegend(name) {
    if (G.mode === 'national') return { ok: false, why: 'Legends sign for clubs only.' };
    const def = legendDefs().find((d) => d.name === name);
    if (!def) return { ok: false, why: 'Unknown legend.' };
    G.legendsSigned = G.legendsSigned || {};
    if (G.legendsSigned[name]) return { ok: false, why: `${name} has already been signed (${G.legendsSigned[name].club}, ${G.legendsSigned[name].season}).` };
    const u = userClub(), cost = legendCost(def);
    if (u.squad.length >= MAX_SQUAD) return { ok: false, why: `Your squad is full (${MAX_SQUAD}).` };
    if (legendPoints() < cost) return { ok: false, why: `You need ${cost} Legend Points to sign ${name} (you have ${legendPoints()}).` };
    const p = legendPlayer(def);
    G.legendPoints = legendPoints() - cost;
    addPlayer(p, u.id);
    p.contract = 3;
    G.legendsSigned[name] = { club: u.name, season: seasonName() };
    pushNews(`👑 LEGEND SIGNED: ${name} (${def.pos}, ${def.ovr}) joins ${u.name} for ${cost} Legend Points!`, p.id);
    return { ok: true, pid: p.id };
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
    pushNews(`🔍 Scout report on ${p.name} (${p.age}): potential ${p.pot}, ${p.trait.toLowerCase()}.${isWonderkid(p) ? ' A genuine wonderkid!' : ''}`, p.id);
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
    pushNews(`🎓 ${p.name} promoted from the academy on a 3-season deal.`, p.id);
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
      pushNews(`📨 ${b.name} have bid ${money(amount)} for ${p.name}. Respond on the Home screen.`, p.id);
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
    pushNews(`💸 ${b.name} snap up wonderkid ${p.name} (${p.age}) from ${from.name} for ${money(fee)}.`, p.id);
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
      pushNews(`😟 ${p.name} is unsettled after you turned down ${b.name}.`, p.id);
    } else pushNews(`🚫 Rejected ${b.name}'s bid for ${p.name}.`, p.id);
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
      pushNews(`📝 ${p.name} signs a new deal until season ${contractEnds(p)} (${money(wage)}/wk).`, p.id);
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
    pushNews(`✍️ Signed ${p.name} (${p.pos}, ${p.ovr}) ${from !== null ? 'from ' + club(from).name + ' for ' + money(chk.fee) : 'on a free transfer'}, contract until season ${contractEnds(p)}.`, p.id);
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
    pushNews(`💰 Sold ${p.name} to ${club(offer.club).name} for ${money(offer.amount)}.`, p.id);
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
    pushNews(`📤 Released ${p.name} (settlement ${money(cost)}).`, p.id);
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
    pushNews(`🔄 ${buyer.name} sign ${p.name} (${p.pos}, ${p.ovr})${from !== null ? ' from ' + club(from).name + ' for ' + money(fee) : ' on a free'}.`, p.id);
  }

  // ---------- season end ----------
  function endSeason() {
    const national = G.mode === 'national';
    const u = userClub();
    const divs = leagueDivs();
    const div = national ? divs[0] : u.div;
    const pos = national ? 0 : position(G.userClub);
    const exp = national ? 0 : expectedPosition();
    const tables = {};
    divs.forEach((d) => { tables[d] = standings(d); });
    const moves = G.meta.promotions.map((p) => ({ p, down: tables[p.up].slice(-p.count), up: tables[p.down].slice(0, p.count) }));
    const myMove = moves.find((mv) => mv.p.up === div || mv.p.down === div);
    const topScorer = Object.values(G.players).filter((p) => p.club !== null && club(p.club).div === div)
      .sort((a, b) => b.goals - a.goals)[0];
    const uci = userCupIdx();
    const summary = {
      season: G.season, division: div, champion: tables[div][0].name,
      champions: divs.map((d) => ({ league: divName(d), club: tables[d][0].name })),
      position: pos, expected: exp, points: national ? 0 : u.table.pts, prize: national ? 0 : prizeFor(div, pos - 1, tables[div].length),
      national, intl: intlSummary(),
      promoted: myMove ? myMove.up.map((c) => c.name) : [], relegated: myMove ? myMove.down.map((c) => c.name) : [],
      cupName: cupName(), cupWinner: uci >= 0 && G.cups[uci].winner !== null ? club(G.cups[uci].winner).name : '-', cup: cupResult(G.userClub),
      clName: clName(), clWinner: G.cl && G.cl.winner !== null ? club(G.cl.winner).name : null, cl: clResult(G.userClub),
      ccs: (G.ccs || []).map((cc) => ({ name: cc.name, icon: cc.icon, winner: cc.winner !== null ? club(cc.winner).name : '-' })),
      cc: ccResult(G.userClub), ccName: ccOf(G.userClub) >= 0 ? G.ccs[ccOf(G.userClub)].name : null,
      topScorer: topScorer ? `${topScorer.name} (${club(topScorer.club).short}) — ${topScorer.goals}` : '-',
      retired: [], youth: [], departed: [], graduatesLeft: [], verdict: '', move: null,
      goldenBoy: null, goldenBoyMine: false, nominees: [], qualified: false,
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
    // next season's continental field: the top clubs of each league plus the rest-of-Europe sides
    if (G.meta.cl) {
      G.clNext = [];
      divs.forEach((d) => { G.clNext.push(...tables[d].slice(0, G.meta.cl.slots[d] || 0).map((c) => c.id)); });
      G.clNext.push(...G.clubs.filter((c) => c.div === 0).map((c) => c.id));
      G.clNext = G.clNext.slice(0, 36); // the league phase needs 36 (later leagues' places drop off first)
      summary.qualified = G.clNext.includes(G.userClub);
    }
    if (G.meta.ccs && G.meta.ccs.length) {
      G.ccNext = {};
      G.meta.ccs.forEach((def) => {
        G.ccNext[def.key] = [];
        Object.entries(def.slots).forEach(([d, n]) => G.ccNext[def.key].push(...(tables[d] || []).slice(0, n).map((c) => c.id)));
        if (G.ccNext[def.key].includes(G.userClub)) summary.qualifiedCC = def.name;
      });
    }
    divs.forEach((d) => {
      const table = tables[d];
      const byRep = [...table].sort((a, b) => b.rep - a.rep);
      table.forEach((c, i) => {
        c.budget += prizeFor(d, i, table.length);
        c.rep = clamp(Math.round(c.rep + (byRep.indexOf(c) - i) * 0.6), 40, 92); // reputation drift
      });
    });
    // promotion & relegation
    moves.forEach((mv) => {
      mv.down.forEach((c) => { c.div = mv.p.down; c.rep = Math.max(40, c.rep - 3); });
      mv.up.forEach((c) => { c.div = mv.p.up; c.rep = Math.min(92, c.rep + 3); });
    });
    const wentUp = !!myMove && myMove.up.includes(u), wentDown = !!myMove && myMove.down.includes(u);
    if (wentUp) summary.move = 'up';
    if (wentDown) summary.move = 'down';

    if (national) nationalVerdict(summary);
    if (!national) {
    let sacked = false;
    const k = zoneInfo(div).relegate;
    if (wentUp) summary.verdict = pos === 1 ? 'Champions and promoted! The board is ecstatic.' : 'Promoted! The board is thrilled.';
    else if (pos <= exp - 2) summary.verdict = 'The board is delighted — you smashed expectations!';
    else if (pos <= exp && !wentDown) summary.verdict = 'The board is pleased with the season.';
    else if (wentDown && exp <= tables[div].length - k - 3) sacked = true;
    else if (wentDown) summary.verdict = 'Relegated. The board expected a struggle and keeps faith in you to bounce back.';
    else if (pos <= exp + 3) summary.verdict = 'The board expected more, but your job is safe.';
    else sacked = true;
    const myCC = ccOf(G.userClub);
    const trophy = (uci >= 0 && G.cups[uci].winner === G.userClub) ? cupName() : (G.cl && G.cl.winner === G.userClub ? clName()
      : myCC >= 0 && G.ccs[myCC].winner === G.userClub ? G.ccs[myCC].name : null);
    if (sacked && trophy) {
      summary.verdict = `A poor league season, but winning the ${trophy} has saved your job.`;
      sacked = false;
    }
    if (sacked) {
      summary.verdict = 'The board is deeply disappointed. You have been sacked.';
      G.gameOver = true;
      G.gameOverReason = wentDown
        ? `Relegated from the ${divName(div)} when the board expected ${ordinal(exp)}.`
        : `Finished ${ordinal(pos)} in the ${divName(div)} when the board expected ${ordinal(exp)}.`;
    }
    // Legend Points for the season's achievements
    const earned = [];
    const earn = (n, why) => { earned.push(`+${n} ${why}`); G.legendPoints = legendPoints() + n; };
    if (pos === 1) earn(POINTS.title, `${divName(div)} title`);
    if (wentUp) earn(POINTS.promotion, 'promotion');
    if (uci >= 0 && G.cups[uci].winner === G.userClub) earn(POINTS.cup, cupName());
    if (G.cl && G.cl.winner === G.userClub) earn(POINTS.cl, clName());
    if (myCC >= 0 && G.ccs[myCC].winner === G.userClub) earn(POINTS.cc, G.ccs[myCC].name);
    if (summary.qualified) earn(POINTS.qualifyCL, `${clName()} qualification`);
    if (pos <= exp - 2) earn(POINTS.beatTarget, "beating the board's target");
    if (summary.goldenBoyMine) earn(POINTS.goldenBoy, 'Golden Boy winner');
    summary.legendEarned = earned;
    summary.legendPoints = legendPoints();
    G.history.push({ season: G.season, division: div, position: pos, points: summary.points,
      champion: summary.champion, cup: summary.cup, cl: summary.cl || summary.cc, move: summary.move });
    }
    if (G.intl && G.intl.kind) {
      G.intl.history.push({ season: G.season, kind: G.intl.kind, year: G.intl.year,
        winner: G.intl.winner !== null ? club(G.intl.winner).name : '-', runnerUp: G.intl.runnerUp !== null ? club(G.intl.runnerUp).name : '-' });
    }

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
      // veterans retire gradually; the best of them play on into their late thirties
      const retireP = p.age >= 41 ? 1 : p.age >= 37 ? (p.ovr >= 75 ? 0.4 : 0.8) : p.age >= 34 ? (p.ovr >= 78 ? 0.15 : 0.35) : 0;
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
        const keep = p.age <= 29 ? 0.8 : p.age <= 32 ? 0.55 : p.ovr >= 75 ? 0.6 : 0.3;
        if (rand() < keep) { p.contract = defaultContract(p) + 1; p.wage = Math.max(p.wage, wageFor(p)); }
      }
      p.contract--;
      if (p.contract <= 0) {
        if (p.club === G.userClub) summary.departed.push(`${p.name} (${p.pos}, ${p.ovr})`);
        moveTo(p, null);
      }
    });
    // academy: graduates who weren't promoted leave, then the new intake arrives
    if (!national) prospects().filter((p) => p.age >= ACADEMY_GRAD_AGE).forEach((p) => {
      summary.graduatesLeft.push(`${p.name} (${p.pos}, ${p.ovr})`);
      releaseProspect(p.id);
    });
    for (let i = 0; i < (national ? 0 : academyIntake()); i++) {
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
          if (rand() < Math.min(0.035, 4 / (G.clubs.length * 3))) makeWonderkid(y); // about 4 new gems a season league-wide
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
    while (!national && userClub().squad.length < MIN_SQUAD) {
      const pos = Object.keys(SQUAD_TEMPLATE).sort((a, b) => squadOf(G.userClub).filter((p) => p.pos === a).length / SQUAD_TEMPLATE[a]
        - squadOf(G.userClub).filter((p) => p.pos === b).length / SQUAD_TEMPLATE[b])[0];
      const p = addPlayer(genPlayer(pos, userClub().rep - 10, 20, 30), G.userClub);
      p.contract = 1;
      pushNews(`🆘 The board signed ${p.name} (${p.pos}, ${p.ovr}) on a 1-season deal to fill the squad.`, p.id);
    }
    // refresh free agent pool
    while (G.freeAgents.length < 20) addPlayer(genPlayer(pick(['GK', 'DF', 'MF', 'FW']), ri(55, 72), 19, 32), null);
    // cap the pool by letting the weakest free agents drift out of the game (never the stars)
    const faCap = Math.max(40, Math.round(G.clubs.length * 0.5));
    if (G.freeAgents.length > faCap) {
      G.freeAgents.sort((a, b) => G.players[b].ovr - G.players[a].ovr);
      G.freeAgents.splice(faCap).forEach((id) => { if (!(G.nations || []).some((n) => n.squad.includes(id))) delete G.players[id]; });
    }

    G.clubs.forEach((c) => { c.lineup = autoLineup(c.id); });
    (G.nations || []).forEach((n) => { n.squad = n.squad.filter((id) => G.players[id]); });
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
    if (G.mode === 'national') { pushNews(`📅 ${seasonName()} begins. ${intlOutlook()}`); return; }
    pushNews(`📅 ${seasonName()} begins in the ${divName(userClub().div)}. The board expects a finish around ${ordinal(expectedPosition())}.`);
    if (G.cl && G.cl.clubs.includes(G.userClub)) pushNews(`⭐ You're in the ${clName()} this season (+${money(clMoney().entry)} entry money).`);
    const myCC = ccOf(G.userClub);
    if (myCC >= 0) pushNews(`${G.ccs[myCC].icon} You're in the ${G.ccs[myCC].name} this season (+${money(ccMoney().entry)} entry money).`);
  }

  // ---------- helpers ----------
  // pids: the players a message is about, so the inbox can link their names
  function pushNews(text, pids) {
    const x = { season: G.season, week: G.week, text };
    const ids = (pids === undefined ? [] : [].concat(pids)).filter((id) => id !== undefined && id !== null);
    if (ids.length) x.pids = ids;
    G.news.unshift(x);
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
    if (!data || ![2, 3, 4, 5, 6, 7, 8, SAVE_VERSION].includes(data.version)) throw new Error('Incompatible save');
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
      G.meta = { dataset: 'fictional', divNames: ['Division 1', 'Division 2'], promoted: 2, cupName: 'Shield Cup', startYear: null, prizeScale: 1 };
      G.cup.rounds = ['First round', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
      G.cup.prizes = [150000, 300000, 600000, 1200000, 3000000];
      G.version = 5;
    }
    if (G.version === 5) {
      // v5 saves had exactly two divisions and one cup, and no continental competition
      const country = G.meta.dataset === 'england' ? 'England' : 'Fictional';
      const old = G.meta;
      G.meta = { dataset: old.dataset, leagues: old.divNames.map((n, i) => ({ name: n, country, tier: i + 1 })),
        promotions: [{ up: 1, down: 2, count: old.promoted }], cupsDef: [{ name: old.cupName, country }], cl: null,
        startYear: old.startYear, prizeScale: old.prizeScale };
      G.clubs.forEach((c) => { c.country = country; });
      const cup = G.cup;
      G.cups = [{ name: old.cupName, country, clubs: G.clubs.map((c) => c.id), alive: cup.alive, byes: cup.byes,
        winner: cup.winner, rounds: cup.rounds, prizes: cup.prizes, offset: 0 }];
      delete G.cup;
      G.calendar.forEach((c) => { if (c.type === 'cup') { c.k = c.round; delete c.round; } });
      G.fixtures.forEach((f) => { if (f.comp === 'CUP') { f.cup = 0; f.ko = true; } });
      G.cl = null; G.clNext = null;
      G.version = 6;
    }
    if (G.version === 6) {
      // v6 saves had no national teams
      G.mode = 'club'; G.nations = []; G.intl = null;
      G.version = 7;
    }
    if (G.version === 7) {
      // v7 had no Nations League; the international setup carries on as scheduled
      if (G.intl) Object.assign(G.intl, { format: G.intl.kind ? 'tournament' : 'friendlies', koStart: 0, groupWeeks: 3, groupLeague: [], nlMoves: {} });
      G.version = 8;
    }
    if (G.version === 8) {
      // v8 had no continental cups outside Europe and no legends market
      G.meta.ccs = G.meta.ccs || []; G.ccs = []; G.ccNext = {}; G.legendsSigned = {};
      if (G.meta.dataset === 'world') {
        // older World careers pick up the continental cups their leagues can fill (from next season)
        const divOf = (country) => G.meta.leagues.findIndex((l) => l.country === country && l.tier === 1) + 1;
        G.meta.ccs = (ROOT.TM_CONTINENTAL_EXTRA || []).filter((cc) => Object.keys(cc.slots).every((c) => divOf(c) > 0))
          .map((cc) => ({ key: cc.key, name: cc.name, icon: cc.icon, slots: Object.fromEntries(Object.entries(cc.slots).map(([c, n]) => [divOf(c), n])) }));
      }
      G.version = 9;
    }
    if (G.version === 9) {
      // v9 sold legends for money and let them play internationally
      G.legendPoints = 0;
      Object.values(G.players).forEach((p) => { if (p.legend) (G.nations || []).forEach((n) => { n.squad = n.squad.filter((id) => id !== p.id); }); });
      G.version = SAVE_VERSION;
    }
    return G;
  }

  root.Engine = {
    CLUBS, datasets, getDataset, FORMATIONS, MENTALITY, PRESSING, TEMPO, setMatchFormation, setMatchInstruction, swapMatchPositions, INTENSITY, POS_ORDER, MIN_SQUAD, MAX_SQUAD,
    get state() { return G; },
    newGame, load, serialize,
    club, player, squadOf, userClub, totalWeeks, fixturesForWeek, userFixture,
    slotsFor, autoLineup, validateLineup, slotRating, posFactor, clubStrength, avgOvr,
    createMatch, stepMatch, simMatch, applyResult, playOtherMatches, possession, makeSub, benchOf,
    endWeek, endSeason, startNextSeason, standings, position, expectedPosition,
    playerValue, askingPrice, signingWage, canBuy, buy, getOffer, sell, release, releaseCost,
    money, ordinal, pushNews, gateIncome, weeklyIncome, wageBill,
    meta, cupName, divName, divCountry, leagueDivs, zoneInfo, seasonName, promotedCount, cupResult, weekLabel,
    clName, clResult, clStandings, tiePrize, userCupIdx, cupOfCountry, CL_KO_ROUNDS,
    NATION_BASE, INTL_SQUAD, T_KO, STAGE_TEXT, EXPECT_TEXT, nationMeta, nationRanking, eligible, canCallUp, callUpPlayer, dropPlayer,
    autoSquad, previewNations, nlResultText, intlName,
    CC_KO, ccOf, ccResult, legendsMarket, signLegend, legendPoints, POINTS, intlStage, intlExpectation, intlOutlook, groupStandings, tournamentRoundName,
    ACADEMY_MAX, ACADEMY_GRAD_AGE, RENEW_WINDOW, academyUpgradeCost, academyUpkeep, academyIntake, prospects,
    potentialRange, upgradeAcademy, promoteProspect, releaseProspect,
    contractEnds, canNegotiate, offerContract, expiringPlayers, signingLength,
    WK_POT, WK_AGE, TRAITS, isWonderkid, knowsPotential, traitKnown, scoutCost, scoutPlayer, respondOffer, goldenBoy,
  };
})(typeof window !== 'undefined' ? window : globalThis);
