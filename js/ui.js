/* Touchline Manager — user interface */
(function () {
  'use strict';
  const E = window.Engine;
  const SAVE_KEY = 'touchline-manager-save';
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const modalBox = document.getElementById('modal-box');

  const ui = {
    tab: 'home',
    squadSort: 'pos', squadView: 'team', neg: null,
    tacticSel: null, // index into lineup, or 'b:<pid>' for a bench player
    marketPos: 'ALL', marketMax: 0, marketQuery: '',
    leagueView: 'table', resultsWeek: null, leagueDiv: null, dataset: null, mname: 'Manager', startCountry: null, marketLeague: 'ALL', startMode: 'club', poolPos: 'ALL', poolQuery: '',
    match: null, matchTimer: null, matchSpeed: 1, matchSel: null, matchPaused: false,
  };

  // ---------- utils ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const M = (v) => E.money(v);
  const G = () => E.state;
  const crest = (c, cls = '') => `<div class="crest ${cls}" style="background:${c.color}">${esc(c.short)}</div>`;
  const posTag = (p) => `<span class="pos ${p}">${p}</span>`;
  const bar = (v, color) => `<div class="bar"><i style="width:${Math.max(0, Math.min(100, v))}%;background:${color || (v > 75 ? 'var(--accent)' : v > 50 ? 'var(--warn)' : 'var(--bad)')}"></i></div>`;
  const stars = (rep) => '★'.repeat(Math.max(1, Math.round((rep - 45) / 8)));
  const wk = (p) => (E.isWonderkid(p) ? ' <span class="wk" title="Wonderkid">🌟</span>' : '');
  function potText(p) {
    const [lo, hi] = E.potentialRange(p);
    return lo === hi ? `${lo}` : `${lo}–${hi}`;
  }
  const growth = (p) => p.ovr - (p.seasonStart || p.ovr);
  const formHtml = (f) => `<span class="form">${f.map((r) => `<i class="${r}">${r}</i>`).join('')}</span>`;

  // saves are gzip-compressed where the browser supports it: a big real-football world is ~1 MB of JSON
  async function pack(json) {
    if (!window.CompressionStream) return json;
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return 'gz:' + btoa(bin);
  }
  async function unpack(str) {
    if (!str || !str.startsWith('gz:')) return str;
    const bin = atob(str.slice(3));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }
  let saveSeq = 0;
  function save() {
    const json = E.serialize(), seq = ++saveSeq;
    pack(json).then((data) => {
      if (seq !== saveSeq) return; // a newer save superseded this one
      try { localStorage.setItem(SAVE_KEY, data); } catch (e) { toast('Could not save: browser storage is full or blocked.'); }
    }).catch(() => { try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* ignore */ } });
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.add('hidden'), 2600);
  }
  // ---------- device preferences (kept apart from the career save) ----------
  const PREF_KEY = 'touchline-prefs';
  const prefs = (() => { try { return { vibrate: true, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch (e) { return { vibrate: true }; } })();
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };
  // vibrate: the Android app exposes a native bridge; browsers fall back to the Vibration API
  function buzz(pattern) {
    if (!prefs.vibrate) return;
    try {
      if (window.TouchlineNative && window.TouchlineNative.vibrate) window.TouchlineNative.vibrate(JSON.stringify(pattern));
      else if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* vibration unavailable */ }
  }
  // colour-code every rating badge: elite, very good, good, squad
  function tierRatings(root) {
    root.querySelectorAll('.ovr').forEach((el) => {
      const v = parseInt(el.textContent, 10);
      if (!isNaN(v)) el.dataset.t = v >= 85 ? 's' : v >= 78 ? 'a' : v >= 70 ? 'b' : 'c';
    });
  }
  function openModal(html) { modalBox.innerHTML = html; modal.classList.remove('hidden'); tierRatings(modalBox); }
  // in-page confirm dialog (window.confirm is blocked in sandboxed viewers)
  let pendingConfirm = null;
  function ask(text, yesLabel, onYes, noLabel = 'Cancel', onNo = null) {
    pendingConfirm = { onYes, onNo };
    openModal(`<p style="margin-top:0">${esc(text)}</p>
      <div class="btns"><button class="btn" data-a="ask-no">${esc(noLabel)}</button>
      <button class="btn primary" data-a="ask-yes">${esc(yesLabel)}</button></div>`);
  }
  function closeModal() { modal.classList.add('hidden'); modalBox.innerHTML = ''; }
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // ---------- start screen ----------
  function renderStart(showClubs) {
    if (!showClubs && hasSave()) {
      app.innerHTML = `<div class="start">
        <div class="logo"><h1>⚽ Touchline <span>Manager</span></h1><p class="muted">Build a dynasty from the dugout.</p></div>
        <button class="btn primary block" data-a="continue">Continue career</button><br>
        <button class="btn block" data-a="new-career">New career</button>
      </div>`;
      return;
    }
    const sets = E.datasets();
    if (!ui.dataset) ui.dataset = (sets.find((d) => d.id === 'europe') || sets.find((d) => d.id !== 'fictional') || sets[0]).id;
    const ds = E.getDataset(ui.dataset);
    const clubs = ds.clubs;
    const countries = [...new Set(ds.leagues.map((l) => l.country))];
    if (!countries.includes(ui.startCountry)) ui.startCountry = countries[0];
    const label = (c) => {
      const same = clubs.filter((x) => x.league === c.league).sort((a, b) => b.rep - a.rep);
      const rank = same.indexOf(c) + 1, n = same.length;
      const tier = ds.leagues.find((l) => l.key === c.league).tier;
      if (tier === 1) return rank <= 3 ? 'Title contender' : rank <= n - 5 ? 'Mid-table' : 'Relegation fight';
      return rank <= Math.ceil(n / 3) ? 'Promotion hopeful' : 'Long-term project';
    };
    const shownLeagues = ds.leagues.filter((l) => l.country === ui.startCountry);
    const nationsOk = !!ds.nations;
    if (!nationsOk) ui.startMode = 'club';
    const modeChips = nationsOk ? `<h2>What do you want to manage?</h2><div class="btns" style="margin-bottom:6px">
        <button class="btn ${ui.startMode === 'club' ? 'on' : ''}" data-a="start-mode" data-m="club">🏟️ A club</button>
        <button class="btn ${ui.startMode === 'national' ? 'on' : ''}" data-a="start-mode" data-m="national">🌍 A national team</button></div>` : '';
    const nationList = nationsOk && ui.startMode === 'national' ? E.previewNations(ds.id) : [];
    app.innerHTML = `<div class="start">
      <div class="logo"><h1>⚽ Touchline <span>Manager</span></h1><p class="muted">Pick a club and lead them to glory.</p></div>
      <div class="card"><label class="muted small">Manager name</label><br>
        <input id="mname" maxlength="24" placeholder="Your name" style="width:100%;margin-top:6px" value="${esc(ui.mname)}"></div>
      <h2>Game world</h2>
      <div class="btns" style="margin-bottom:6px">${sets.map((d) => `<button class="btn ${d.id === ds.id ? 'on' : ''}" data-a="dataset" data-id="${esc(d.id)}">${esc(d.short || d.name)}</button>`).join('')}</div>
      <p class="small muted">${esc(ds.note || '')}</p>
      ${modeChips}
      ${ui.startMode === 'national' ? `<p class="small muted">Pick your squad from every player of that nationality in the world, play qualifiers in the international breaks and lead your country at the World Cup and the Euros. The club seasons play out around you.</p>
        <div class="list">${nationList.map((n, i) => `<div class="item tap" data-a="pick-nation" data-code="${esc(n.code)}">
          <div class="crest" style="background:${esc(n.color)}">${esc(n.code)}</div>
          <div class="grow"><div class="name">${esc(n.name)}</div><div class="stars">${stars(n.rep)}</div></div>
          <div class="muted small">${i < 8 ? 'Contender' : i < 20 ? 'Dark horse' : 'Underdog'} · ${esc(n.conf)}</div></div>`).join('')}</div></div>` : ''}
      ${ui.startMode === 'national' ? '' : countries.length > 1 ? `<div class="chips">${countries.map((c) => `<button class="btn ${c === ui.startCountry ? 'on' : ''}" data-a="start-country" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
      ${ui.startMode === 'national' ? '' : shownLeagues.map((lg) => `<h2>${esc(lg.name)}</h2><div class="list">${clubs.map((c, i) => (c.league !== lg.key ? '' : `
        <div class="item tap" data-a="pick-club" data-i="${i}">
          <div class="crest" style="background:${esc(c.color)}">${esc(c.short)}</div>
          <div class="grow"><div class="name">${esc(c.name)}</div><div class="stars">${stars(c.rep)}</div></div>
          <div class="muted small">${label(c)}</div>
        </div>`)).join('')}</div>`).join('')}
      </div>`;
  }

  // ---------- main shell ----------
  const TABS = [['home', '🏠', 'Home'], ['squad', '👥', 'Squad'], ['tactics', '📋', 'Tactics'],
    ['league', '🏆', 'League'], ['transfers', '💱', 'Transfers'], ['club', '🏟️', 'Club']];

  const NTABS = [['home', '🏠', 'Home'], ['squad', '👥', 'Squad'], ['tactics', '📋', 'Tactics'],
    ['intl', '🌍', 'Internat.'], ['pool', '🔎', 'Players'], ['fed', '🏛️', 'Federation']];
  const isNational = () => G() && G().mode === 'national';
  function render() {
    if (!G()) return renderStart();
    if (isNational()) return renderNational();
    const c = E.userClub();
    document.documentElement.style.setProperty('--club', c.color);
    const body = { home: viewHome, squad: viewSquad, tactics: viewTactics, league: viewLeague, transfers: viewTransfers, club: viewClub }[ui.tab]();
    app.innerHTML = `
      <div class="top">${crest(c)}
        <div class="title"><b>${esc(c.name)}</b><small>${E.seasonName()} · Week ${Math.min(G().week + 1, E.totalWeeks())}/${E.totalWeeks()} · ${esc(E.divName(c.div))} · ${E.ordinal(E.position(c.id))}</small></div>
        <div class="money">${M(c.budget)}<small>budget · ⭐ ${E.legendPoints()}</small></div>
      </div>
      <main>${body}</main>
      <nav class="tabs"><div class="inner">${TABS.map(([k, i, l]) => `<button data-a="tab" data-t="${k}" class="${ui.tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div></nav>`;
    afterRender();
    // keep the selected chip of each scrolling row in view
    app.querySelectorAll('.chips').forEach((row) => {
      const on = row.querySelector('.btn.on');
      if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
    });
  }

  function afterRender() {
    tierRatings(app);
    const main = app.querySelector('main');
    if (main && ui.lastTab !== ui.tab) { main.classList.add('enter'); ui.lastTab = ui.tab; }
  }
  const vibrateToggle = () => `<button class="btn" data-a="toggle-vibrate">📳 Vibrate on goals: ${prefs.vibrate ? 'On' : 'Off'}</button>`;

  // ---------- national team career ----------
  function renderNational() {
    const n = E.userClub();
    document.documentElement.style.setProperty('--club', n.color);
    if (!['home', 'squad', 'tactics', 'intl', 'pool', 'fed'].includes(ui.tab)) ui.tab = 'home';
    const body = { home: viewNationalHome, squad: viewNationalSquad, tactics: viewTactics, intl: viewInternational, pool: viewPool, fed: viewFederation }[ui.tab]();
    const rank = E.nationRanking().findIndex((x) => x.id === n.id) + 1;
    app.innerHTML = `
      <div class="top">${crest(n)}
        <div class="title"><b>${esc(n.name)}</b><small>${E.seasonName()} · Week ${Math.min(G().week + 1, E.totalWeeks())}/${E.totalWeeks()} · Ranked ${E.ordinal(rank)}</small></div>
        <div class="money">${n.rep}<small>strength</small></div>
      </div>
      <main>${body}</main>
      <nav class="tabs"><div class="inner">${NTABS.map(([k, i, l]) => `<button data-a="tab" data-t="${k}" class="${ui.tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div></nav>`;
    afterRender();
    app.querySelectorAll('.chips').forEach((row) => {
      const on = row.querySelector('.btn.on');
      if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
    });
  }
  function nextUserMatchWeek() {
    const g = G();
    for (let w = g.week; w < E.totalWeeks(); w++) if (E.userFixture(w)) return w;
    return null;
  }
  function viewNationalHome() {
    const g = G(), n = E.userClub();
    let top = '';
    if (g.gameOver) {
      top = `<div class="card"><h2>📰 You've been sacked</h2><p>${esc(g.gameOverReason || '')}</p>
        <button class="btn primary block" data-a="new-career">Start a new career</button></div>`;
    } else if (g.seasonOver) {
      top = `<div class="card"><h2>🏁 ${E.seasonName()} complete</h2><p>${esc(g.intl && g.intl.kind ? `${E.intlName()}: ${g.intl.format === 'nl' ? E.nlResultText(n.id) : E.STAGE_TEXT[E.intlStage(n.id)]}.` : 'A season of friendlies is over.')}</p>
        <button class="btn primary block" data-a="end-season">See season review</button></div>`;
    } else if (E.userFixture()) {
      const fx = E.userFixture();
      const h = E.club(fx.home), a = E.club(fx.away);
      const rank = (x) => E.ordinal(E.nationRanking().findIndex((y) => y.id === x.id) + 1);
      top = `<div class="card">
        <div class="row between small muted"><span>🌍 ${esc(E.weekLabel(g.week))}</span><span>${fx.home === n.id ? 'Home' : 'Away'}</span></div>
        <div class="fixture" style="margin:12px 0">
          <div class="side">${crest(h)}<b>${esc(h.name)}</b><span class="strength">Str ${h.rep} · ranked ${rank(h)}</span></div>
          <div class="vs">vs</div>
          <div class="side">${crest(a)}<b>${esc(a.name)}</b><span class="strength">Str ${a.rep} · ranked ${rank(a)}</span></div>
        </div>
        ${fx.ko ? '<p class="small" style="text-align:center;color:var(--accent2)">Knockout: a draw goes to penalties.</p>' : ''}
        <p class="small muted" style="text-align:center">${n.formation} · ${n.mentality} · ${n.squad.length}/${E.INTL_SQUAD} in the squad</p>
        <div class="btns"><button class="btn primary" data-a="play-live">▶ Play match</button><button class="btn" data-a="play-quick">⏩ Quick sim</button></div>
      </div>`;
    } else {
      const nw = nextUserMatchWeek();
      top = `<div class="card"><div class="small muted">${esc(E.weekLabel(g.week))}</div>
        <h2>No international match this week</h2>
        <p class="muted">${nw === null ? 'Nothing left for you this season.' : `Next match: ${esc(E.weekLabel(nw))} in ${nw - g.week} week(s).`} The club season carries on: keep an eye on your players' form.</p>
        <div class="btns"><button class="btn primary" data-a="skip-to-next">⏩ ${nw === null ? 'Skip to the end of the season' : 'Skip to the next match'}</button>
          <button class="btn" data-a="skip-week">One week</button></div></div>`;
    }
    const injured = E.squadOf(n.id).filter((p) => p.injury);
    const news = g.news.slice(0, 15).map((x) => `<div class="news"><small>S${x.season} W${x.week + 1}</small>${esc(x.text)}</div>`).join('');
    return top + (injured.length && !g.gameOver ? `<div class="card small">🚑 Injured in your squad: ${injured.map((p) => esc(p.name)).join(', ')}</div>` : '')
      + `<div class="card small">${esc(E.intlOutlook())}</div>`
      + `<h2>Inbox</h2><div class="list">${news || '<div class="news muted">No news yet.</div>'}</div>`;
  }
  function natRow(p, action) {
    const c = p.club !== null ? E.club(p.club) : null;
    return `<div class="item tap" data-a="${action}" data-id="${p.id}">${posTag(p.pos)}<div class="ovr">${p.ovr}</div>
      <div class="grow"><div class="name">${esc(p.name)}${wk(p)}</div>
        <div class="small muted">${p.age}y · ${c ? esc(c.name) : 'Free agent'} · ${p.caps || 0} caps${p.intlGoals ? ` · ${p.intlGoals} goals` : ''}</div></div>
      ${p.injury ? `<span class="tag inj">INJ ${p.injury}w</span>` : E.userClub().lineup.some((l) => l.pid === p.id) ? '<span class="tag xi">XI</span>' : ''}
      ${bar(p.fitness)}</div>`;
  }
  function viewNationalSquad() {
    const n = E.userClub();
    const sq = E.squadOf(n.id).sort((a, b) => E.POS_ORDER[a.pos] - E.POS_ORDER[b.pos] || b.ovr - a.ovr);
    const counts = ['GK', 'DF', 'MF', 'FW'].map((pos) => `${pos} ${sq.filter((p) => p.pos === pos).length}`).join(' · ');
    return `<div class="row between"><h2>Squad (${sq.length}/${E.INTL_SQUAD})</h2><button class="btn" data-a="auto-squad">Auto-pick squad</button></div>
      <p class="small muted" style="margin:0 4px 8px">${counts}. Call up players from the Players tab; tap a player to drop him.</p>
      <div class="list">${sq.map((p) => natRow(p, 'nat-player')).join('') || '<div class="news muted">No players called up.</div>'}</div>`;
  }
  function viewPool() {
    const n = E.userClub();
    const q = ui.poolQuery.toLowerCase();
    const pool = E.eligible(n.code).filter((p) => !n.squad.includes(p.id) && (ui.poolPos === 'ALL' || p.pos === ui.poolPos)
      && (!q || p.name.toLowerCase().includes(q))).sort((a, b) => b.ovr - a.ovr).slice(0, 80);
    return `<h2>Eligible players</h2>
      <div class="chips">${['ALL', 'GK', 'DF', 'MF', 'FW'].map((x) => `<button class="btn ${ui.poolPos === x ? 'on' : ''}" data-a="pool-pos" data-p="${x}">${x}</button>`).join('')}</div>
      <input id="pq" placeholder="Search name…" value="${esc(ui.poolQuery)}" style="width:100%;margin-bottom:10px">
      <p class="small muted">Every ${esc(n.name)} player in the world who isn't in your squad, best first.</p>
      <div class="list">${pool.map((p) => natRow(p, 'nat-player')).join('') || '<div class="news muted">No players match.</div>'}</div>`;
  }
  function natPlayerModal(pid) {
    const p = E.player(pid), n = E.userClub();
    if (!p) return;
    const inSquad = n.squad.includes(p.id);
    const c = p.club !== null ? E.club(p.club) : null;
    openModal(`<div class="row">${posTag(p.pos)}<div class="ovr" style="font-size:26px;width:auto">${p.ovr}</div>
        <div class="grow"><b style="font-size:18px">${esc(p.name)}${wk(p)}</b><div class="small muted">${c ? esc(c.name) : 'Free agent'}</div></div></div>
      <div class="kv">
        <span>Age</span><span>${p.age}</span><span>Potential</span><span>${potText(p)}</span>
        <span>Caps</span><span>${p.caps || 0} (${p.intlGoals || 0} goals)</span>
        <span>Club season</span><span>${p.apps} apps · ${p.goals} goals · ${p.assists} assists</span>
        <span>Fitness</span><span>${Math.round(p.fitness)}%</span>
        <span>Status</span><span>${p.injury ? `Injured (${p.injury} wk)` : 'Available'}</span>
      </div>
      ${inSquad ? `<button class="btn danger block" data-a="nat-drop" data-id="${p.id}">Drop from the squad</button>`
        : `<button class="btn primary block" data-a="nat-call" data-id="${p.id}">📞 Call up</button>`}
      <button class="btn block" style="margin-top:8px" data-a="close">Close</button>`);
  }
  function viewFederation() {
    const g = G(), n = E.userClub();
    const hist = g.history.filter((h) => h.national);
    return `<h2>Federation</h2><div class="card"><div class="kv" style="margin:0">
        <span>Next tournament</span><span>${g.intl && g.intl.kind ? esc(E.intlName()) : 'None next summer'}</span>
        <span>Target</span><span>${g.intl && g.intl.kind ? esc(E.EXPECT_TEXT[E.intlExpectation()]) : '-'}</span>
        <span>Warnings</span><span>${g.intl && g.intl.strikes ? '⚠️ One more failure and you are out' : 'None'}</span>
      </div><p class="small muted" style="margin:8px 0 0">Missing the target by one stage earns a warning; a second miss, or missing by two stages, gets you sacked.</p></div>
      <h2>Your record</h2>
      <div class="list">${hist.length ? hist.map((h) => `<div class="item"><div class="grow">${E.seasonName(h.season)}</div><b>${esc(h.result)}</b></div>`).join('') : '<div class="news muted">Your first season is under way.</div>'}</div>
      <h2>Game</h2>
      <div class="btns"><button class="btn" data-a="save">💾 Save</button><button class="btn danger" data-a="new-career">New career</button></div>
      <div class="btns" style="margin-top:8px">${vibrateToggle()}</div>`;
  }
  function natTable(ids, table) {
    const g = G();
    return `<div class="list"><table><tr><th>#</th><th class="l">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
      ${E.groupStandings(ids, table).map((id, i) => { const c = E.club(id), t = table[id]; return `<tr class="${id === g.userClub ? 'me' : ''}">
        <td>${i + 1}</td><td class="l"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</td>
        <td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td><td><b>${t.pts}</b></td></tr>`; }).join('')}
      </table></div>`;
  }
  function viewInternational() {
    const g = G(), I = g.intl;
    if (!I) return '<div class="news muted">No international football in this world.</div>';
    const me = g.userClub;
    const nl = I.format === 'nl';
    let html = `<div class="card"><b>${esc(I.kind ? E.intlName() : 'International friendlies')}</b><p class="small muted" style="margin:6px 0 0">${nl
      ? 'European national teams play in Leagues A, B and C: groups of four over the six international breaks. Group winners go up (League A winners reach the Finals next summer), bottom sides go down. Everyone else plays friendlies.'
      : I.kind ? `${I.kind === 'Euro' ? 'European' : 'All'} national teams play six qualifiers in groups of four during the international breaks. The best 24 (group winners first, then runners-up and so on) go to the tournament next summer: six groups of four, then a round of 16.`
      : 'No tournament next summer: national teams play friendlies against sides of similar strength.'}</p></div>`;
    const tk = g.fixtures.filter((f) => f.comp === 'INT' && f.stage === 'TK');
    if (nl) {
      const mine = I.groups.findIndex((grp) => grp.includes(me));
      const order = mine >= 0 ? [mine, ...I.groups.map((_, i) => i).filter((i) => i !== mine)] : I.groups.map((_, i) => i);
      const finals = tk.filter((f) => f.round >= 2);
      if (finals.length) html += `<h2>Finals</h2>` + E.T_KO.map((name, j) => { const fx = finals.filter((f) => f.round === j); return fx.length ? `<b class="small muted">${name}</b><div class="list">${fx.map(fxRow).join('')}</div>` : ''; }).join('');
      html += `<h2>Groups</h2>` + order.map((i) => {
        const n = I.groups.slice(0, i).filter((_, k) => I.groupLeague[k] === I.groupLeague[i]).length + 1;
        return `<b class="small muted">League ${I.groupLeague[i]} · Group ${n}${i === mine ? ' (yours)' : ''}</b>${natTable(I.groups[i], I.qTable)}`;
      }).join('');
    } else if (I.qualified && I.tGroups.length) {
      html += `<h2>${esc(E.intlName())} groups</h2>` + I.tGroups.map((grp, i) => `<b class="small muted">Group ${'ABCDEF'[i]}</b>${natTable(grp, I.tTable)}`).join('');
      E.T_KO.forEach((name, j) => {
        const fx = tk.filter((f) => f.round === j);
        if (fx.length) html += `<h2>${name}</h2><div class="list">${fx.map(fxRow).join('')}</div>`;
      });
    } else if (I.kind) {
      const mine = I.groups.findIndex((grp) => grp.includes(me));
      const order = mine >= 0 ? [mine, ...I.groups.map((_, i) => i).filter((i) => i !== mine)] : I.groups.map((_, i) => i);
      html += `<h2>Qualifying groups</h2>` + order.map((i) => `<b class="small muted">Group ${i + 1}${i === mine ? ' (yours)' : ''}</b>${natTable(I.groups[i], I.qTable)}`).join('');
    } else if (isNational()) {
      const fr = g.fixtures.filter((f) => f.comp === 'INT' && (f.home === me || f.away === me));
      html += `<h2>Your friendlies</h2><div class="list">${fr.map(fxRow).join('')}</div>`;
    }
    html += `<h2>World ranking</h2><div class="list">${E.nationRanking().slice(0, 20).map((n, i) => `<div class="item small ${n.id === me ? 'sel' : ''}">
      <b style="width:24px">${i + 1}</b><span class="dot" style="background:${n.color}"></span><div class="grow">${esc(n.name)}</div><b>${n.rep}</b></div>`).join('')}</div>`;
    if (I.history.length) html += `<h2>Past tournaments</h2><div class="list">${I.history.map((h) => `<div class="item small"><div class="grow">${esc(h.kind)} ${h.year}</div><b>🏆 ${esc(h.winner)}</b><span class="muted">beat ${esc(h.runnerUp)}</span></div>`).join('')}</div>`;
    return html;
  }
  function skipToNext() {
    // simulate club weeks until the user has a match (or the season ends)
    let guard = 0;
    do {
      E.playOtherMatches(null);
      E.endWeek();
    } while (!G().seasonOver && !E.userFixture() && ++guard < 80);
    save(); ui.tab = 'home'; render(); window.scrollTo(0, 0);
  }

  // ---------- home ----------
  function viewHome() {
    const g = G();
    let top = '';
    if (g.gameOver) {
      top = `<div class="card"><h2>📰 You've been sacked</h2><p>${esc(g.gameOverReason || '')}</p>
        <p class="muted">You managed ${g.history.length} season(s).</p>
        <button class="btn primary block" data-a="new-career">Start a new career</button></div>`;
    } else if (g.seasonOver) {
      const champ = E.standings()[0];
      top = `<div class="card"><h2>🏁 ${E.seasonName()} complete</h2>
        <p>${esc(champ.name)} are ${esc(E.divName(E.userClub().div))} champions. You finished <b>${E.ordinal(E.position(g.userClub))}</b> (board expected ${E.ordinal(E.expectedPosition())}).</p>
        <button class="btn primary block" data-a="end-season">See season review</button></div>`;
    } else if (!E.userFixture()) {
      const slot = g.calendar[g.week];
      let cupNote;
      if (!slot) {
        top = `<div class="card"><div class="small muted">${esc(E.weekLabel(g.week))}</div><h2>🌍 The ${esc(E.intlName())} is on</h2>
          <p class="muted">The club season is over. Follow the tournament in League → International.</p>
          <div class="btns"><button class="btn primary" data-a="skip-to-next">⏩ Simulate the tournament</button><button class="btn" data-a="skip-week">One day</button></div></div>`;
      } else if (slot.type === 'league') cupNote = `There's no ${esc(E.divName(E.userClub().div))} game this week.`;
      else if (slot.type === 'cl') {
        const r = E.clResult(g.userClub), ci = E.ccOf(g.userClub);
        if (ci >= 0) {
          const cr = E.ccResult(g.userClub);
          cupNote = cr === 'Still in' ? `It's a continental week, but the ${esc(g.ccs[ci].name)} has no game for you this week.` : `It's a continental week. You're out of the ${esc(g.ccs[ci].name)}: ${esc(cr.toLowerCase())}.`;
        } else cupNote = r === null ? "It's a continental week and you're not in a continental competition this season."
          : `It's a ${esc(E.clName())} week. You're out: ${esc(r.toLowerCase())}.`;
      } else {
        const cup = g.cups[E.userCupIdx()];
        const round = cup ? slot.k - cup.offset : -1;
        cupNote = round < 0 ? `It's a cup week, but the ${esc(E.cupName())} has no round this week.`
          : cup.alive.includes(g.userClub) ? 'You have a bye this round.' : `You're out of the ${esc(E.cupName())}.`;
      }
      if (slot) top = `<div class="card"><div class="small muted">${esc(E.weekLabel(g.week))}</div>
        <h2>No match this week</h2><p class="muted">${cupNote} The squad gets a week to rest.</p>
        <button class="btn primary block" data-a="skip-week">⏩ Continue</button></div>`;
    } else {
      const fx = E.userFixture();
      const h = E.club(fx.home), a = E.club(fx.away);
      const cup = !!fx.ko;
      const icon = fx.comp === 'CL' ? '⭐ ' : fx.comp === 'CC' ? `${g.ccs[fx.cc].icon} ` : fx.comp === 'CUP' ? '🏆 ' : `${esc(E.divName(E.userClub().div))} · `;
      const lineup = E.validateLineup(g.userClub);
      top = `<div class="card">
        <div class="row between small muted"><span>${icon}${esc(E.weekLabel(g.week))}</span><span>${fx.home === g.userClub ? 'Home' : 'Away'}</span></div>
        <div class="fixture" style="margin:12px 0">
          <div class="side">${crest(h)}<b>${esc(h.name)}</b><span class="strength">Str ${E.clubStrength(h.id)} · ${clubPos(h)}</span>${formHtml(h.table.form)}</div>
          <div class="vs">vs</div>
          <div class="side">${crest(a)}<b>${esc(a.name)}</b><span class="strength">Str ${E.clubStrength(a.id)} · ${clubPos(a)}</span>${formHtml(a.table.form)}</div>
        </div>
        ${cup ? `<p class="small" style="text-align:center;color:var(--accent2)">Knockout: a draw goes to penalties. Winning is worth ${M(E.tiePrize(fx))}.</p>` : ''}
        <p class="small muted" style="text-align:center">${E.userClub().formation} · ${E.userClub().mentality} · ${lineup.length}/11 picked</p>
        <div class="btns"><button class="btn primary" data-a="play-live">▶ Play match</button><button class="btn" data-a="play-quick">⏩ Quick sim</button></div>
      </div>`;
    }
    const last = g.week > 0 && !g.gameOver ? relevantFixtures(g.week - 1) : [];
    const lastHtml = last.length ? `<h2>Last week · ${esc(E.weekLabel(g.week - 1))}</h2><div class="list">${last.map(fxRow).join('')}</div>` : '';
    const news = g.news.slice(0, 15).map((n) => `<div class="news"><small>S${n.season} W${n.week + 1}</small>${esc(n.text)}</div>`).join('');
    const offers = (g.offers || []).filter((o) => E.player(o.pid) && E.player(o.pid).club === g.userClub);
    const offersHtml = offers.length && !g.gameOver ? `<h2>📨 Transfer offers</h2>${offers.map((o) => {
      const p = E.player(o.pid), b = E.club(o.club), i = g.offers.indexOf(o);
      return `<div class="card"><div class="row">${crest(b)}<div class="grow"><b>${esc(b.name)}</b> bid <b style="color:var(--accent2)">${M(o.amount)}</b>
        for ${esc(p.name)}${wk(p)}<div class="small muted">Value ${M(E.playerValue(p))} · offer expires after week ${o.expires}${b.rep > E.userClub().rep + 3 ? ' · rejecting a bigger club will unsettle him' : ''}</div></div></div>
        <div class="btns" style="margin-top:10px"><button class="btn" data-a="offer-no" data-i="${i}">Reject</button><button class="btn primary" data-a="offer-yes" data-i="${i}">Accept</button></div></div>`;
    }).join('')}` : '';
    return top + offersHtml + lastHtml + `<h2>Inbox</h2><div class="list">${news || '<div class="news muted">No news yet.</div>'}</div>`;
  }
  const clubPos = (c) => (c.div === 0 ? `${esc(c.country || 'Europe')}` : `${E.ordinal(E.position(c.id))} · ${esc(E.divName(c.div))}`);
  // the fixtures that matter for a league in a week: its games, its country's cup ties, or European ties
  function relevantFixtures(w, div = E.userClub().div) {
    const ci = E.cupOfCountry(E.divCountry(div));
    return E.fixturesForWeek(w).filter((f) => (f.comp === 'L' && f.div === div) || (f.comp === 'CUP' && f.cup === ci) || f.comp === 'CL' || f.comp === 'CC');
  }
  const sameComp = (a, b) => a.comp === b.comp && (a.comp !== 'L' || a.div === b.div) && (a.comp !== 'CUP' || a.cup === b.cup) && (a.comp !== 'CC' || a.cc === b.cc);
  function fxRow(f) {
    const h = E.club(f.home), a = E.club(f.away), me = G().userClub;
    const bold = (c) => (c.id === me ? 'font-weight:800;color:var(--accent)' : '');
    return `<div class="item small">
      <div class="grow" style="text-align:right;${bold(h)}">${esc(h.name)}</div>
      <b style="width:${f.pens ? 84 : 52}px;text-align:center">${f.played ? `${f.hg} - ${f.ag}${f.pens ? ` <span class="small muted">(${f.pens[0]}-${f.pens[1]}p)</span>` : ''}` : 'v'}</b>
      <div class="grow" style="${bold(a)}">${esc(a.name)}</div></div>`;
  }

  // ---------- squad ----------
  function sortedSquad() {
    const s = E.squadOf(G().userClub);
    const by = {
      pos: (a, b) => E.POS_ORDER[a.pos] - E.POS_ORDER[b.pos] || b.ovr - a.ovr,
      ovr: (a, b) => b.ovr - a.ovr,
      age: (a, b) => a.age - b.age,
      value: (a, b) => E.playerValue(b) - E.playerValue(a),
      goals: (a, b) => b.goals - a.goals || b.assists - a.assists,
      growth: (a, b) => growth(b) - growth(a) || a.age - b.age,
    }[ui.squadSort];
    return s.sort(by);
  }
  function playerRow(p, extra = '', action = 'player') {
    const inXI = p.club === G().userClub && E.userClub().lineup.some((l) => l.pid === p.id);
    return `<div class="item tap" data-a="${action}" data-id="${p.id}">
      ${posTag(p.pos)}<div class="ovr">${p.ovr}</div>
      <div class="grow"><div class="name">${p.legend ? '👑 ' : ''}${esc(p.name)}${wk(p)}</div>
        <div class="small muted">${p.age}y · pot ${potText(p)} · ${M(E.playerValue(p))}${extra}</div></div>
      ${p.injury ? `<span class="tag inj">INJ ${p.injury}w</span>` : inXI ? '<span class="tag xi">XI</span>' : ''}
      ${p.club !== null && p.contract <= 1 ? '<span class="tag exp">EXP</span>' : ''}
      ${bar(p.fitness)}</div>`;
  }
  function viewSquad() {
    const views = [['team', 'First team'], ['contracts', 'Contracts'], ['academy', 'Academy']];
    const nav = `<div class="btns" style="margin-bottom:6px">${views.map(([k, l]) => `<button class="btn ${ui.squadView === k ? 'on' : ''}" data-a="squad-view" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (ui.squadView === 'contracts') return nav + viewContracts();
    if (ui.squadView === 'academy') return nav + viewAcademy();
    const s = sortedSquad();
    const sorts = [['pos', 'Position'], ['ovr', 'Rating'], ['age', 'Age'], ['growth', 'Growth'], ['value', 'Value'], ['goals', 'Goals']];
    return nav + `<div class="row between"><h2>Squad (${s.length})</h2><span class="small muted">Wages ${M(E.wageBill(G().userClub))}/wk</span></div>
      <div class="chips">${sorts.map(([k, l]) => `<button class="btn ${ui.squadSort === k ? 'on' : ''}" data-a="squad-sort" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="list">${s.map((p) => playerRow(p, ui.squadSort === 'goals' ? ` · ⚽${p.goals} 🅰${p.assists}`
        : ui.squadSort === 'growth' ? ` · <b style="color:${growth(p) > 0 ? 'var(--accent)' : 'inherit'}">${growth(p) > 0 ? '+' : ''}${growth(p)}</b> this season` : '')).join('')}</div>`;
  }
  function contractText(p) {
    if (p.club === null) return 'None (free agent)';
    const end = E.contractEnds(p);
    return p.contract <= 1 ? `Expires this season (S${end})` : `Until end of season ${end} (${p.contract} seasons)`;
  }
  function viewContracts() {
    const s = E.squadOf(G().userClub).sort((a, b) => a.contract - b.contract || b.wage - a.wage);
    const exp = s.filter((p) => p.contract <= 1).length;
    return `<div class="card"><div class="kv" style="margin:0">
        <span>Wage bill</span><span>${M(E.wageBill(G().userClub))}/wk</span>
        <span>Expiring this season</span><span style="color:${exp ? 'var(--warn)' : 'inherit'}">${exp} player(s)</span></div>
      <p class="small muted" style="margin:8px 0 0">Players discuss new terms in the last ${E.RENEW_WINDOW} seasons of their deal.
        Anyone whose contract runs out leaves for free at the end of the season. Rival clubs sell players in their final year cheaply.</p></div>
      <div class="list">${s.map((p) => `<div class="item tap" data-a="player" data-id="${p.id}">
        ${posTag(p.pos)}<div class="ovr">${p.ovr}</div>
        <div class="grow"><div class="name">${esc(p.name)}${wk(p)}</div><div class="small muted">${p.age}y · ${M(p.wage)}/wk · until S${E.contractEnds(p)}</div></div>
        ${p.contract <= 1 ? '<span class="tag exp">EXPIRING</span>' : p.contract <= E.RENEW_WINDOW ? '<span class="tag">Can renew</span>' : ''}</div>`).join('')}</div>`;
  }
  function viewAcademy() {
    const a = G().academy;
    const cost = E.academyUpgradeCost();
    const ps = E.prospects().sort((x, y) => y.ovr - x.ovr);
    const err = E.ACADEMY_MAX - a.level;
    return `<div class="card">
        <div class="row between"><b>Youth academy</b><span class="stars">${'★'.repeat(a.level)}${'☆'.repeat(E.ACADEMY_MAX - a.level)}</span></div>
        <div class="kv">
          <span>Running costs</span><span>${M(E.academyUpkeep())}/wk</span>
          <span>Intake each summer</span><span>${E.academyIntake()} prospects</span>
          <span>Scouting accuracy</span><span>${err ? `potential ±${err}` : 'exact'}</span></div>
        <p class="small muted" style="margin:0 0 10px">Better facilities bring in more talented prospects, develop them faster and estimate their potential more accurately.
          Prospects don't play; promote them to the first team when they're ready. At ${E.ACADEMY_GRAD_AGE} they leave unless promoted.</p>
        ${cost === null ? '<p class="small" style="color:var(--accent)">The academy is at the maximum level.</p>'
          : `<button class="btn block" data-a="academy-upgrade">🏗️ Upgrade to level ${a.level + 1} · ${M(cost)}</button>`}
      </div>
      <h2>Prospects (${ps.length})</h2>
      <div class="list">${ps.map((p) => { const [lo, hi] = E.potentialRange(p); return `<div class="item tap" data-a="prospect" data-id="${p.id}">
        ${posTag(p.pos)}<div class="ovr">${p.ovr}</div>
        <div class="grow"><div class="name">${esc(p.name)}${lo >= E.WK_POT ? ' <span class="wk">🌟</span>' : ''}</div><div class="small muted">${p.age}y · potential ${lo === hi ? lo : lo + '–' + hi} · ${esc(p.trait)}</div></div>
        ${p.age >= E.ACADEMY_GRAD_AGE - 1 ? '<span class="tag exp">FINAL YEAR</span>' : ''}</div>`; }).join('') || '<div class="news muted">No prospects. A new intake arrives each summer.</div>'}</div>`;
  }
  function prospectModal(pid) {
    const p = E.player(pid);
    if (!p) return;
    const [lo, hi] = E.potentialRange(p);
    openModal(`<div class="row">${posTag(p.pos)}<div class="ovr" style="font-size:26px;width:auto">${p.ovr}</div>
        <div class="grow"><b style="font-size:18px">${esc(p.name)}</b><div class="small muted">Academy prospect</div></div></div>
      <div class="kv"><span>Age</span><span>${p.age}</span>
        <span>Potential (scouted)</span><span>${lo === hi ? lo : lo + '–' + hi}</span>
        <span>If promoted</span><span>3-season deal</span></div>
      ${p.age >= E.ACADEMY_GRAD_AGE - 1 ? `<p class="small" style="color:var(--warn)">Turns ${E.ACADEMY_GRAD_AGE} next summer: promote him or he leaves.</p>` : ''}
      <div class="btns"><button class="btn primary" data-a="promote" data-id="${p.id}">🎓 Promote to first team</button>
        <button class="btn danger" data-a="release-prospect" data-id="${p.id}">Release</button></div>
      <button class="btn block" style="margin-top:8px" data-a="close">Close</button>`);
  }
  function negotiationModal() {
    const n = ui.neg, p = E.player(n.pid);
    const chk = E.canNegotiate(p);
    if (!chk.ok) { closeModal(); toast(chk.why); return; }
    const wages = { low: Math.round(chk.demand * 0.9 / 100) * 100, demand: chk.demand, high: Math.round(chk.demand * 1.1 / 100) * 100 };
    if (!chk.options.includes(n.years)) n.years = chk.options[chk.options.length - 1];
    const labels = { low: 'Lowball (−10%)', demand: 'Meet demand', high: 'Generous (+10%)' };
    const hint = { low: 'He may walk away from talks.', demand: 'He will accept.', high: 'He will accept and his morale gets a boost.' };
    openModal(`<b style="font-size:18px">New contract: ${esc(p.name)}</b>
      <div class="kv"><span>Current deal</span><span>${M(p.wage)}/wk · until S${E.contractEnds(p)}</span>
        <span>His demand</span><span style="color:var(--accent2)">${M(chk.demand)}/wk</span></div>
      <b class="small muted">Extend by</b>
      <div class="chips" style="margin-top:6px">${chk.options.map((y) => `<button class="btn ${n.years === y ? 'on' : ''}" data-a="neg-years" data-y="${y}">+${y} (to S${E.contractEnds(p) + y})</button>`).join('')}</div>
      ${p.age >= 30 ? '<p class="small muted" style="margin:0">Older players are only offered short extensions.</p>' : ''}
      <b class="small muted">Weekly wage</b>
      <div class="list" style="margin-top:6px">${Object.keys(wages).map((k) => `<div class="item tap ${n.wage === k ? 'sel' : ''}" data-a="neg-wage" data-k="${k}">
        <div class="grow"><b>${labels[k]}</b><div class="small muted">${hint[k]}</div></div><b>${M(wages[k])}</b></div>`).join('')}</div>
      <div class="btns"><button class="btn" data-a="close">Cancel</button>
        <button class="btn primary" data-a="neg-offer" data-w="${wages[n.wage]}">Offer contract</button></div>`);
  }
  function playerModal(pid) {
    const p = E.player(pid);
    if (!p) return;
    const mine = p.club === G().userClub;
    const c = p.club !== null ? E.club(p.club) : null;
    let actions = '';
    if (mine) {
      actions = `${p.contract <= E.RENEW_WINDOW ? `<button class="btn primary block" style="margin-bottom:8px" data-a="renew" data-id="${p.id}">📝 Offer new contract</button>` : ''}
        <div class="btns"><button class="btn" data-a="sell" data-id="${p.id}">💰 Find buyer</button>
        <button class="btn danger" data-a="release" data-id="${p.id}">Release (${M(E.releaseCost(p.id))})</button></div>`;
    }
    const scoutable = !mine && !(E.knowsPotential(p) && E.traitKnown(p)) && !G().gameOver;
    const scoutBtn = scoutable ? `<button class="btn block" style="margin-bottom:8px" data-a="scout" data-id="${p.id}">🔍 Scout report · ${M(E.scoutCost(p))}</button>` : '';
    if (!mine && !G().gameOver) {
      const chk = E.canBuy(p.id);
      actions = chk.ok
        ? `<button class="btn primary block" data-a="buy" data-id="${p.id}">${chk.fee ? 'Buy for ' + M(chk.fee) : 'Sign free agent'} · ${M(chk.wage)}/wk · ${chk.contract}-season deal</button>`
        : `<p class="small" style="color:var(--warn)">${esc(chk.why)}</p>`;
    }
    openModal(`<div class="row">${posTag(p.pos)}<div class="ovr" style="font-size:26px;width:auto">${p.ovr}</div>
        <div class="grow"><b style="font-size:18px">${p.legend ? '👑 ' : ''}${esc(p.name)}${wk(p)}</b><div class="small muted">${c ? esc(c.name) : 'Free agent'}</div></div></div>
      ${p.legend ? '<div class="wkcard">👑 <b>Legend.</b> One of the all-time greats. Retired from international football.</div>' : ''}
      ${E.isWonderkid(p) ? `<div class="wkcard">🌟 <b>Wonderkid.</b> One of the most talented young players around${mine ? ': give him minutes and he will fly.' : '.'}</div>` : ''}
      <div class="kv">
        <span>Age</span><span>${p.age}</span>
        <span>Potential</span><span>${potText(p)}${E.knowsPotential(p) ? '' : ' <span class="muted small">(rumoured)</span>'}</span>
        <span>Personality</span><span>${E.traitKnown(p) ? `${esc(p.trait)}` : '<span class="muted">Unknown</span>'}</span>
        ${p.club !== null && p.age <= 23 && (mine || growth(p) !== 0) ? `<span>This season</span><span>${growth(p) > 0 ? '+' : ''}${growth(p)} rating${mine ? ` · ${p.playTime >= 3 ? 'regular starter' : p.playTime >= 1 ? 'some minutes' : 'not playing'}` : ''}</span>` : ''}
        <span>Value</span><span>${M(E.playerValue(p))}</span>
        ${!mine && p.club !== null ? `<span>Asking price</span><span>${M(E.askingPrice(p))}</span>` : ''}
        <span>Wage</span><span>${M(p.wage)}/wk</span>
        <span>Contract</span><span style="${p.club !== null && p.contract <= 1 ? 'color:var(--warn)' : ''}">${contractText(p)}</span>
        ${p.nat && G().intl ? `<span>Nationality</span><span>${esc((E.nationMeta()[p.nat] || { name: p.nat }).name)} · ${p.caps || 0} caps</span>` : ''}
        <span>Fitness</span><span>${Math.round(p.fitness)}%</span>
        <span>Morale</span><span>${p.morale > 75 ? '😀' : p.morale > 50 ? '🙂' : p.morale > 30 ? '😐' : '😠'} ${p.morale}</span>
        <span>Status</span><span>${p.injury ? `Injured (${p.injury} wk)` : 'Available'}</span>
        <span>Season</span><span>${p.apps} apps · ${p.goals} goals · ${p.assists} assists</span>
      </div>${E.traitKnown(p) ? `<p class="small muted" style="margin-top:0">${esc(p.trait)}: ${esc(E.TRAITS[p.trait].desc)}</p>` : ''}
      ${scoutBtn}${actions}
      <button class="btn block" style="margin-top:8px" data-a="close">Close</button>`);
  }

  // ---------- tactics ----------
  const ROW_Y = { GK: 90, DF: 70, MF: 45, FW: 18 };
  function pitchHtml(lineup, selIdx, fitMap, action) {
    const groups = { GK: [], DF: [], MF: [], FW: [] };
    lineup.forEach((l, i) => groups[l.slot].push(i));
    return `<div class="pitch">${lineup.map((l, i) => {
      const g = groups[l.slot], k = g.indexOf(i);
      const x = ((k + 1) / (g.length + 1)) * 100;
      const p = E.player(l.pid);
      const off = p.pos !== l.slot;
      const fit = fitMap ? fitMap[p.id] : p.fitness;
      return `<div class="slot ${selIdx === i ? 'sel' : ''} ${off ? 'off' : ''}" style="left:${x}%;top:${ROW_Y[l.slot]}%" data-a="${action}" data-i="${i}">
        <div class="shirt">${p.ovr}</div><div class="nm">${esc(p.name.split(' ').slice(-1)[0])}${off ? ' (' + p.pos + ')' : ''}</div>
        <div style="margin:2px auto 0;width:40px">${bar(fit)}</div></div>`;
    }).join('')}</div>`;
  }
  const INSTR_HELP = {
    pressing: 'High press wins the ball higher up and blunts their attack, but tires your players faster. A low block is solid and saves legs.',
    tempo: 'Direct play creates more chances for both sides; patient play slows the game down and keeps you compact.',
  };
  function instrRows(pressing, tempo, action) {
    const row = (key, table, cur) => `<div class="btns" style="margin-bottom:4px">${Object.entries(table).map(([k, v]) =>
      `<button class="btn ${cur === k ? 'on' : ''}" data-a="${action}" data-k="${key}" data-v="${k}">${v.label}</button>`).join('')}</div>
      <p class="small muted" style="margin:0 4px 10px">${INSTR_HELP[key]}</p>`;
    return `<h2>Pressing</h2>${row('pressing', E.PRESSING, pressing)}<h2>Tempo</h2>${row('tempo', E.TEMPO, tempo)}`;
  }
  function viewTactics() {
    const c = E.userClub();
    const lineup = E.validateLineup(c.id);
    const inXI = new Set(lineup.map((l) => l.pid));
    const bench = E.squadOf(c.id).filter((p) => !inXI.has(p.id))
      .sort((a, b) => E.POS_ORDER[a.pos] - E.POS_ORDER[b.pos] || b.ovr - a.ovr);
    const s = strengthOf(c);
    const selIdx = typeof ui.tacticSel === 'number' ? ui.tacticSel : null;
    const selBench = typeof ui.tacticSel === 'string' ? +ui.tacticSel.slice(2) : null;
    return `<h2>Formation</h2>
      <div class="chips">${Object.keys(E.FORMATIONS).map((f) => `<button class="btn ${c.formation === f ? 'on' : ''}" data-a="formation" data-f="${f}">${f}</button>`).join('')}</div>
      <h2>Mentality</h2>
      <div class="btns" style="margin-bottom:12px">${Object.keys(E.MENTALITY).map((m) => `<button class="btn ${c.mentality === m ? 'on' : ''}" data-a="mentality" data-m="${m}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div>
      ${instrRows(c.pressing || 'normal', c.tempo || 'normal', 'instr')}
      <div class="card stats3"><div><b>${s.att}</b><span class="small muted">Attack</span></div><div><b>${s.mid}</b><span class="small muted">Midfield</span></div><div><b>${s.def}</b><span class="small muted">Defence</span></div></div>
      <div class="row between"><p class="small muted" style="margin:4px">Tap a player, then tap another (on the pitch or bench) to swap.</p>
        <button class="btn" data-a="auto-pick">Auto pick</button></div>
      ${pitchHtml(lineup, selIdx, null, 'xi')}
      <h2>Bench & reserves</h2>
      <div class="list">${bench.map((p) => `<div class="item tap ${selBench === p.id ? 'sel' : ''}" data-a="bench" data-id="${p.id}">
        ${posTag(p.pos)}<div class="ovr">${p.ovr}</div><div class="grow"><div class="name">${esc(p.name)}${wk(p)}</div>
        <div class="small muted">${p.age}y · morale ${p.morale}</div></div>
        ${p.injury ? `<span class="tag inj">INJ ${p.injury}w</span>` : ''}${bar(p.fitness)}</div>`).join('')}</div>`;
  }
  function strengthOf(c) {
    // mirror the engine's strength calc for display
    const tmp = E.createMatch({ home: c.id, away: c.id === 0 ? 1 : 0 });
    const lu = tmp.lineups[0];
    const avg = (slot) => {
      const r = lu.filter((l) => l.slot === slot).map((l) => E.slotRating(E.player(l.pid), slot));
      return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0;
    };
    const gk = avg('GK'), df = avg('DF'), mf = avg('MF'), fw = avg('FW');
    return { att: Math.round(0.6 * fw + 0.4 * mf), mid: Math.round(0.8 * mf + 0.1 * df + 0.1 * fw), def: Math.round(0.6 * df + 0.4 * gk) };
  }
  function tacticTap(kind, val) {
    const c = E.userClub();
    const lu = c.lineup;
    const sel = ui.tacticSel;
    if (sel === null || sel === undefined) { ui.tacticSel = kind === 'xi' ? val : 'b:' + val; return render(); }
    if (kind === 'xi' && typeof sel === 'number') {
      if (sel !== val) { const a = lu[sel].pid; lu[sel].pid = lu[val].pid; lu[val].pid = a; }
    } else if (kind === 'xi' && typeof sel === 'string') {
      swapIn(lu, val, +sel.slice(2));
    } else if (kind === 'bench' && typeof sel === 'number') {
      swapIn(lu, sel, val);
    } else {
      ui.tacticSel = 'b:' + val; return render();
    }
    ui.tacticSel = null;
    render();
  }
  function swapIn(lu, idx, pid) {
    const p = E.player(pid);
    if (p.injury) { toast(`${p.name} is injured.`); return; }
    lu[idx].pid = pid;
  }

  // ---------- league ----------
  function viewLeague() {
    const g = G();
    const div = ui.leagueDiv || E.userClub().div;
    const views = [['table', 'Table'], ['fixtures', 'Fixtures'], ['cup', 'Cup'], ...(E.clName() ? [['europe', 'Europe']] : []),
      ...(g.ccs || []).map((cc, i) => [`cc${i}`, cc.key === 'LIB' ? 'Libertadores' : cc.key === 'ACL' ? 'Asia' : cc.name]),
      ...(g.intl ? [['intl', 'International']] : []), ['stats', 'Scorers']];
    const toggle = `<div class="chips" style="margin-bottom:4px">${views.map(([k, l]) =>
      `<button class="btn ${ui.leagueView === k ? 'on' : ''}" data-a="league-view" data-v="${k}">${l}</button>`).join('')}</div>`;
    const divChips = `<div class="chips">${E.leagueDivs().map((d) => `<button class="btn ${div === d ? 'on' : ''}" data-a="league-div" data-d="${d}">${esc(E.divName(d))}</button>`).join('')}</div>`;
    if (ui.leagueView === 'fixtures') {
      const w = ui.resultsWeek === null ? Math.min(g.week, E.totalWeeks() - 1) : ui.resultsWeek;
      const fx = relevantFixtures(w, div);
      const cupWeek = g.calendar[w].type !== 'league';
      return toggle + divChips + `<div class="row between" style="margin-bottom:8px">
          <button class="btn" data-a="week" data-d="-1" ${w <= 0 ? 'disabled' : ''}>◀</button>
          <b>${esc(E.weekLabel(w, div))}</b>
          <button class="btn" data-a="week" data-d="1" ${w >= E.totalWeeks() - 1 ? 'disabled' : ''}>▶</button></div>
        <div class="list">${fx.map(fxRow).join('') || `<div class="news muted">${cupWeek ? 'The draw for this round has not been made yet.' : 'No fixtures.'}</div>`}</div>`;
    }
    if (ui.leagueView === 'cup') return toggle + divChips + viewCup(div);
    if (ui.leagueView === 'europe') return toggle + viewEurope();
    if (ui.leagueView === 'intl') return toggle + viewInternational();
    if (/^cc\d+$/.test(ui.leagueView) && g.ccs && g.ccs[+ui.leagueView.slice(2)]) return toggle + viewCC(+ui.leagueView.slice(2));
    if (ui.leagueView === 'stats') {
      const ps = Object.values(g.players).filter((p) => p.club !== null && E.club(p.club).div === div && (p.goals || p.assists))
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 25);
      return toggle + divChips + `<div class="list"><table><tr><th>#</th><th class="l">Player</th><th>Club</th><th>⚽</th><th>🅰</th><th>Apps</th></tr>
        ${ps.map((p, i) => `<tr class="${p.club === g.userClub ? 'me' : ''}"><td>${i + 1}</td><td class="l">${esc(p.name)}</td><td>${E.club(p.club).short}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.apps}</td></tr>`).join('')}
        </table>${ps.length ? '' : '<div class="news muted">No goals yet.</div>'}</div><p class="small muted">Goals include cup matches.</p>`;
    }
    const table = E.standings(div);
    const n = table.length, z = E.zoneInfo(div), k = z.relegate;
    const zone = (i) => (z.relegate && i >= n - z.relegate ? 'zone-down' : z.promote && i < z.promote ? 'zone-up' : z.cl && i < z.cl ? 'zone-cl' : '');
    const mine = E.userClub().div === div;
    const exp = E.expectedPosition();
    const note = !mine ? '' : `<p class="small muted">Board expectation: finish ${E.ordinal(exp)} or better.
      ${z.relegate ? `The bottom ${z.relegate} are relegated to the ${esc(E.divName(z.relegateTo))}.` : ''}
      ${z.promote ? `The top ${z.promote} are promoted to the ${esc(E.divName(z.promoteTo))}.` : ''}
      ${z.cl ? `The top ${z.cl} qualify for the ${esc(E.clName())}.` : ''}
      ${[exp + 5 <= n ? `finishing ${E.ordinal(exp + 5)} or lower` : '', k && exp <= n - k - 3 ? 'being relegated' : '']
        .filter(Boolean).map((x, i, a) => (i ? ' or ' : '') + x).join('').replace(/^./, (c) => c.toUpperCase()).replace(/(.+)/, '$1 gets you sacked.')}
      Winning the ${esc(E.cupName())}${E.clName() ? ` or the ${esc(E.clName())}` : ''} saves your job.</p>`;
    const keys = [z.cl ? `<span class="key cl"></span>${esc(E.clName())}` : '', z.promote ? '<span class="key up"></span>Promotion' : '',
      z.relegate ? '<span class="key down"></span>Relegation' : ''].filter(Boolean).join(' &nbsp; ');
    return toggle + divChips + `<div class="list"><table>
      <tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th>Form</th></tr>
      ${table.map((c, i) => `<tr class="${c.id === g.userClub ? 'me' : ''} ${zone(i)}">
        <td>${i + 1}</td><td class="l"><span class="dot" style="background:${c.color}"></span>${esc(c.short)}</td>
        <td>${c.table.p}</td><td>${c.table.w}</td><td>${c.table.d}</td><td>${c.table.l}</td>
        <td>${c.table.gf - c.table.ga > 0 ? '+' : ''}${c.table.gf - c.table.ga}</td><td><b>${c.table.pts}</b></td><td>${formHtml(c.table.form.slice(-3))}</td></tr>`).join('')}
      </table></div>
      ${keys ? `<p class="small">${keys}</p>` : ''}${note}`;
  }
  function viewCup(div) {
    const g = G();
    const ci = E.cupOfCountry(E.divCountry(div));
    const cup = g.cups[ci];
    if (!cup) return '<div class="news muted">No cup for this league.</div>';
    const name = esc(cup.name);
    const mine = ci === E.userCupIdx();
    const status = cup.winner !== null ? `🏆 ${esc(E.club(cup.winner).name)} won the ${name}.`
      : !mine ? '' : cup.alive.includes(g.userClub) ? `You're still in the ${name}.` : `You're out: ${esc(E.cupResult(g.userClub).toLowerCase())}.`;
    const rounds = g.calendar.map((c, w) => ({ ...c, w })).filter((c) => c.type === 'cup' && c.k - cup.offset >= 0);
    return `<div class="card"><b>${name}</b><p class="small muted" style="margin:6px 0">
        A knockout for ${cup.clubs.length} ${esc(cup.country === 'Fictional' ? '' : cup.country)} clubs.${cup.byes.length ? ` The ${cup.byes.length} top-rated sides skip the first round.` : ''}
        A draw after 90 minutes goes to penalties.</p>${status ? `<p style="margin:0">${status}</p>` : ''}</div>
      ${rounds.map((r) => {
        const round = r.k - cup.offset;
        const fx = E.fixturesForWeek(r.w).filter((f) => f.comp === 'CUP' && f.cup === ci);
        return `<h2>${cup.rounds[round]} <span class="small muted">· week ${r.w + 1} · win ${M(cup.prizes[round])}</span></h2>
          <div class="list">${fx.map(fxRow).join('') || '<div class="news muted">Not drawn yet.</div>'}</div>`;
      }).join('')}`;
  }
  function viewCC(ci) {
    const g = G(), cc = g.ccs[ci], me = g.userClub;
    const res = E.ccResult(me);
    const status = cc.winner !== null ? `${cc.icon} ${esc(E.club(cc.winner).name)} won the ${esc(cc.name)}.`
      : E.ccOf(me) === ci ? (res === 'Still in' ? `You're still in the ${esc(cc.name)}.` : `You're out: ${esc(res.toLowerCase())}.`) : '';
    const tbl = (ids) => `<div class="list"><table><tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
      ${E.groupStandings(ids, cc.table).map((id, i) => { const c = E.club(id), t = cc.table[id]; return `<tr class="${id === me ? 'me' : ''} ${i < 2 ? 'zone-up' : ''}">
        <td>${i + 1}</td><td class="l"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</td>
        <td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td><td><b>${t.pts}</b></td></tr>`; }).join('')}</table></div>`;
    const ko = g.fixtures.filter((f) => f.comp === 'CC' && f.cc === ci && f.stage === 'K');
    return `<div class="card"><b>${cc.icon} ${esc(cc.name)}</b><p class="small muted" style="margin:6px 0">16 clubs qualify through their leagues. Four groups of four (home and away), the top two reach the quarter-finals; single-match knockouts with penalties after a draw.</p>
        ${status ? `<p style="margin:0">${status}</p>` : ''}</div>
      ${E.CC_KO.map((name, r) => { const fx = ko.filter((f) => f.round === r); return fx.length ? `<h2>${name}</h2><div class="list">${fx.map(fxRow).join('')}</div>` : ''; }).join('')}
      ${cc.groups.map((grp, i) => ({ grp, i })).sort((a, b) => b.grp.includes(me) - a.grp.includes(me))
        .map(({ grp, i }) => `<h2>Group ${'ABCD'[i]}${grp.includes(me) ? ' (yours)' : ''}</h2>${tbl(grp)}`).join('')}`;
  }
  function viewEurope() {
    const g = G();
    const name = esc(E.clName());
    if (!g.cl) return `<div class="card"><b>${name}</b><p class="small muted">No ${name} this season.</p></div>`;
    const st = E.clStandings();
    const mineRes = E.clResult(g.userClub);
    const status = g.cl.winner !== null ? `⭐ ${esc(E.club(g.cl.winner).name)} won the ${name}.`
      : mineRes === null ? `You're not in the ${name} this season. Finish high enough in your league to qualify.` : mineRes === 'Still in' ? `You're still in the ${name}.` : `You're out: ${esc(mineRes.toLowerCase())}.`;
    const zone = (i) => (i < 8 ? 'zone-up' : i < 24 ? 'zone-cl' : 'zone-down');
    const koWeeks = g.calendar.map((c, w) => ({ ...c, w })).filter((c) => c.type === 'cl' && c.ko !== undefined);
    return `<div class="card"><b>${name}</b><p class="small muted" style="margin:6px 0">
        ${g.cl.clubs.length} clubs play 8 different opponents in one league phase. The top 8 go straight to the round of 16;
        9th–24th meet in a knockout play-off. Knockout ties are single matches, with penalties after a draw (a simplification).</p>
        <p style="margin:0">${status}</p></div>
      <h2>League phase</h2>
      <div class="list"><table>
        <tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
        ${st.map((id, i) => { const c = E.club(id), t = g.cl.table[id]; return `<tr class="${id === g.userClub ? 'me' : ''} ${zone(i)}">
          <td>${i + 1}</td><td class="l"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</td>
          <td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td><td><b>${t.pts}</b></td></tr>`; }).join('')}
      </table></div>
      <p class="small"><span class="key up"></span>Round of 16 &nbsp; <span class="key cl"></span>Knockout play-off &nbsp; <span class="key down"></span>Eliminated</p>
      ${koWeeks.map((r) => {
        const fx = E.fixturesForWeek(r.w).filter((f) => f.comp === 'CL');
        return `<h2>${E.CL_KO_ROUNDS[r.ko]} <span class="small muted">· week ${r.w + 1}</span></h2>
          <div class="list">${fx.map(fxRow).join('') || '<div class="news muted">Not drawn yet.</div>'}</div>`;
      }).join('')}`;
  }

  // ---------- transfers ----------
  function viewLegends() {
    const u = E.userClub();
    const list = E.legendsMarket();
    return `<h2>Transfer market</h2>
      <div class="chips">${['ALL', 'LEG', 'WK', 'GK', 'DF', 'MF', 'FW'].map((p) => `<button class="btn ${ui.marketPos === p ? 'on' : ''}" data-a="mpos" data-p="${p}">${p === 'WK' ? '🌟 Wonderkids' : p === 'LEG' ? '👑 Legends' : p}</button>`).join('')}</div>
      <div class="wkcard">👑 <b>Exclusive legends.</b> The greatest players of all time, available at their peak (age 27). Money can't buy them: they cost <b>Legend Points</b>, and each can be signed <b>once per career</b>. Legends have retired from international football.
        <div style="margin-top:8px;font-size:18px"><b>⭐ ${E.legendPoints()} Legend Points</b></div>
        <div class="small muted">Earn them by winning: +${E.POINTS.win} a win, +${E.POINTS.draw} a draw, +${E.POINTS.title} a league title, +${E.POINTS.promotion} promotion, +${E.POINTS.cup} a domestic cup, +${E.POINTS.cl} the Champions League, +${E.POINTS.cc} a Libertadores / AFC title, +${E.POINTS.qualifyCL} Champions League qualification, +${E.POINTS.beatTarget} beating the board's target, +${E.POINTS.goldenBoy} a Golden Boy.</div></div>
      <div class="list">${list.map((l) => `<div class="item">
        ${posTag(l.pos)}<div class="ovr" style="color:var(--accent2)">${l.ovr}</div>
        <div class="grow"><div class="name">👑 ${esc(l.name)}</div><div class="small muted">${esc((E.nationMeta()[l.nat] || { name: l.nat }).name)} · ${l.signed ? `signed by ${esc(l.signed.club)} (${esc(l.signed.season)})` : `⭐ ${l.cost} points`}</div></div>
        ${l.signed ? '<span class="tag">SIGNED</span>' : `<button class="btn ${E.legendPoints() >= l.cost ? 'primary' : ''}" data-a="legend" data-n="${esc(l.name)}">Sign</button>`}</div>`).join('')}</div>
      <p class="small muted">Legends are a fun extra: ratings are playful estimates of each player at his best. They age like anyone else from here.</p>`;
  }
  function viewTransfers() {
    const g = G();
    if (ui.marketPos === 'LEG') return viewLegends();
    const q = ui.marketQuery.toLowerCase();
    const wkOnly = ui.marketPos === 'WK';
    const leagueOk = (p) => ui.marketLeague === 'ALL' || (ui.marketLeague === 'FREE' ? p.club === null
      : p.club !== null && String(E.club(p.club).div) === ui.marketLeague);
    const pool = Object.values(g.players).filter((p) => p.club !== g.userClub && !p.academy && leagueOk(p)
      && (wkOnly ? E.isWonderkid(p) : ui.marketPos === 'ALL' || p.pos === ui.marketPos)
      && (!ui.marketMax || E.askingPrice(p) <= ui.marketMax)
      && (!q || p.name.toLowerCase().includes(q)))
      .sort(wkOnly ? (a, b) => E.potentialRange(b)[1] - E.potentialRange(a)[1] || b.ovr - a.ovr : (a, b) => b.ovr - a.ovr).slice(0, 60);
    const maxes = [[0, 'Any price'], [1e6, '≤ £1M'], [3e6, '≤ £3M'], [6e6, '≤ £6M'], [12e6, '≤ £12M']];
    return `<h2>Transfer market</h2>
      <div class="chips">${['ALL', 'LEG', 'WK', 'GK', 'DF', 'MF', 'FW'].map((p) => `<button class="btn ${ui.marketPos === p ? 'on' : ''}" data-a="mpos" data-p="${p}">${p === 'WK' ? '🌟 Wonderkids' : p === 'LEG' ? '👑 Legends' : p}</button>`).join('')}</div>
      ${wkOnly ? `<p class="small muted">Every player aged ${E.WK_AGE} or under with elite potential. Their exact potential and personality are only rumours until you pay for a scout report. Clubs charge a premium for them, and big clubs will try to snatch them first.</p>` : ''}
      <div class="row" style="margin-bottom:10px">
        <input class="grow" id="mq" placeholder="Search name…" value="${esc(ui.marketQuery)}">
        ${E.leagueDivs().length > 2 || g.clubs.some((c) => c.div === 0) ? `<select id="mleague">
          <option value="ALL">All leagues</option>${E.leagueDivs().map((d) => `<option value="${d}" ${ui.marketLeague === String(d) ? 'selected' : ''}>${esc(E.divName(d))}</option>`).join('')}
          ${g.clubs.some((c) => c.div === 0) ? `<option value="0" ${ui.marketLeague === '0' ? 'selected' : ''}>Rest of Europe</option>` : ''}
          <option value="FREE" ${ui.marketLeague === 'FREE' ? 'selected' : ''}>Free agents</option></select>` : ''}
        <select id="mmax">${maxes.map(([v, l]) => `<option value="${v}" ${ui.marketMax === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <p class="small muted">Squad ${E.userClub().squad.length}/${E.MAX_SQUAD} · Budget ${M(E.userClub().budget)}</p>
      <div class="list">${pool.map((p) => playerRow(p, ` · ${p.club === null ? '<b style="color:var(--accent)">Free agent</b>' : esc(E.club(p.club).short) + ' · ask ' + M(E.askingPrice(p))}`)).join('') || '<div class="news muted">No players match.</div>'}</div>`;
  }

  // ---------- club ----------
  function viewClub() {
    const g = G(), c = E.userClub();
    const wages = E.wageBill(c.id);
    const income = E.weeklyIncome(c);
    return `<h2>Finances</h2><div class="card"><div class="kv" style="margin:0">
        <span>Budget</span><span style="color:${c.budget < 0 ? 'var(--bad)' : 'var(--accent2)'}">${M(c.budget)}</span>
        <span>Weekly wages</span><span>-${M(wages)}</span>
        <span>TV & commercial</span><span>+${M(income)}/wk</span>
        <span>Youth academy (level ${g.academy.level})</span><span>-${M(E.academyUpkeep())}/wk</span>
        <span>Home gate (avg)</span><span>+${M(E.gateIncome(c))}/match</span>
        <span>Reputation</span><span class="stars">${stars(c.rep)} (${c.rep})</span>
      </div></div>
      <h2>Training intensity</h2>
      <div class="btns">${Object.keys(E.INTENSITY).map((k) => `<button class="btn ${g.training === k ? 'on' : ''}" data-a="training" data-k="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
      <p class="small muted">Harder training develops young players faster, but players recover less fitness and get injured more.</p>
      <h2>History</h2>
      <div class="list">${g.history.length ? g.history.map((h) => `<div class="item"><div class="grow">${E.seasonName(h.season)}<div class="small muted">Cup: ${esc(h.cup)}${h.cl ? ` · Europe: ${esc(h.cl)}` : ''}</div></div>
        <b>${E.ordinal(h.position)} · ${esc(E.divName(h.division))}${h.move === 'up' ? ' ⬆️' : h.move === 'down' ? ' ⬇️' : ''}</b><span class="muted small">${h.points} pts</span></div>`).join('') : '<div class="news muted">Your first season is under way.</div>'}</div>
      ${(g.awards || []).length ? `<h2>🏅 Golden Boy winners</h2><div class="list">${g.awards.map((a) => `<div class="item ${a.mine ? 'sel' : ''}">
        <div class="grow">${E.seasonName(a.season)}<div class="small muted">${esc(a.club)}</div></div><b>${esc(a.name)}</b><span class="muted small">${a.ovr}</span></div>`).join('')}</div>` : ''}
      <h2>Game</h2>
      <div class="btns"><button class="btn" data-a="save">💾 Save</button><button class="btn danger" data-a="new-career">New career</button></div>
      <div class="btns" style="margin-top:8px">${vibrateToggle()}</div>
      <p class="small muted">Progress also saves automatically after every matchday (in this browser).</p>`;
  }

  // ---------- match ----------
  function startMatch(live) {
    const g = G();
    if (g.gameOver || g.seasonOver) return;
    const c = E.userClub();
    E.validateLineup(c.id);
    if (c.lineup.length < 11) { toast('Not enough fit players!'); }
    const fx = E.userFixture();
    const m = E.createMatch(fx);
    ui.match = m; ui.matchSel = null; ui.matchPaused = false;
    if (!live) {
      while (!m.done) E.stepMatch(m, { autoUser: true });
      return finishMatch();
    }
    renderMatch();
    runClock();
  }
  function runClock() {
    clearInterval(ui.matchTimer);
    if (ui.matchPaused || !ui.match || ui.match.done) return;
    const delay = { 1: 380, 2: 160, 4: 50 }[ui.matchSpeed];
    ui.matchTimer = setInterval(() => {
      const m = ui.match;
      const before = m.events.length;
      E.stepMatch(m);
      const fresh = m.events.slice(before);
      const goals = fresh.filter((e) => e.type === 'goal');
      // pause briefly on goals and red cards so they land
      const big = goals.length || fresh.some((e) => e.type === 'red');
      renderMatch();
      goals.forEach((e) => celebrate(m, e));
      if (m.done) { clearInterval(ui.matchTimer); return; }
      if (big && ui.matchSpeed < 4) { clearInterval(ui.matchTimer); setTimeout(runClock, goals.length ? 1700 : 900); }
    }, delay);
  }
  function celebrate(m, e) {
    const team = E.club(m.sides[e.side]);
    const mine = m.sides[e.side] === G().userClub;
    buzz(mine ? [90, 60, 90, 60, 260] : [170]);
    const host = document.getElementById('match');
    if (!host) return;
    const scorer = (/— ([^(.]+)/.exec(e.text) || [])[1] || '';
    const el = document.createElement('div');
    el.className = `goal-burst ${mine ? 'mine' : 'theirs'}`;
    el.style.setProperty('--team', team.color);
    el.innerHTML = `<div class="gb-inner"><div class="gb-ball">⚽</div><div class="gb-title">${mine ? 'GOAL!' : 'Goal'}</div>
      <div class="gb-team">${esc(team.name)}</div><div class="gb-scorer">${esc(scorer.trim())} ${e.min}'</div>
      <div class="gb-score">${m.score[0]} - ${m.score[1]}</div></div>`;
    host.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1300);
    setTimeout(() => el.remove(), 1700);
  }
  function renderMatch() {
    const m = ui.match;
    const h = E.club(m.sides[0]), a = E.club(m.sides[1]);
    const me = m.sides.indexOf(G().userClub);
    const poss = E.possession(m);
    let el = document.getElementById('match');
    if (!el) { el = document.createElement('div'); el.id = 'match'; el.className = 'match'; document.body.appendChild(el); }
    const feed = [...m.events].reverse().map((e) => `<div class="ev ${e.type}">${e.type === 'info' ? '' : `<span class="m">${e.min}'</span>`}<span>${esc(e.text)}</span></div>`).join('');
    const controls = m.done
      ? `<button class="btn primary block" data-a="match-done">Continue</button>`
      : `<div class="btns">
          <button class="btn ${ui.matchPaused ? 'on' : ''}" data-a="m-pause">${ui.matchPaused ? '▶ Resume' : '⏸ Pause'}</button>
          ${[1, 2, 4].map((s) => `<button class="btn ${ui.matchSpeed === s ? 'on' : ''}" data-a="m-speed" data-s="${s}">${s}x</button>`).join('')}
          <button class="btn" data-a="m-skip">⏭ End</button></div>
        <div class="btns"><button class="btn" data-a="m-tactics">📋 Tactics &amp; subs · ${m.formations[me]} · 🔁 ${5 - m.subs[me]} left</button></div>`;
    el.innerHTML = `<div class="inner">
      <div class="scoreboard">
        <div class="clock">${m.done ? 'FT' : m.min + "'"}</div>
        <div class="fixture"><div class="side">${crest(h)}<b class="small">${esc(h.name)}</b></div>
          <div class="score">${m.score[0]} - ${m.score[1]}</div>
          <div class="side">${crest(a)}<b class="small">${esc(a.name)}</b></div></div>
        <div class="row between small muted" style="margin-top:8px"><span>${poss}%</span><span>Possession</span><span>${100 - poss}%</span></div>
        <div class="mbar"><i style="width:${poss}%;background:${h.color}"></i><i style="flex:1;background:${a.color}"></i></div>
        <div class="row between small muted"><span>${m.shots[0]} (${m.onTarget[0]})</span><span>Shots (on target)</span><span>${m.shots[1]} (${m.onTarget[1]})</span></div>
      </div>
      <div class="feed">${feed}</div>
      <div class="controls">${controls}</div></div>`;
  }
  function matchTacticsModal() {
    const m = ui.match;
    const s = m.sides.indexOf(G().userClub);
    ui.matchPaused = true; clearInterval(ui.matchTimer); renderMatch();
    const score = `${m.score[s]}-${m.score[1 - s]}`;
    const sel = typeof ui.matchSwap === 'number' ? ui.matchSwap : null;
    const selP = sel !== null && m.lineups[s][sel] ? E.player(m.lineups[s][sel].pid) : null;
    const left = 5 - m.subs[s];
    const bench = E.benchOf(m, s).sort((a, b) => E.POS_ORDER[a.pos] - E.POS_ORDER[b.pos] || b.ovr - a.ovr);
    const hint = selP
      ? `<b>${esc(selP.name)}</b> selected: tap another player on the pitch to swap positions${left ? ', or a substitute below to bring him off' : ''}.`
      : 'Tap a player on the pitch, then another player to swap positions, or a substitute to bring him on.';
    openModal(`<div class="row between"><b>Tactics &amp; subs · ${m.min}' · ${score}</b><button class="btn primary" data-a="m-tactics-done">▶ Resume</button></div>
      <p class="small muted" style="margin:6px 0">The match is paused while this panel is open.</p>
      <div class="wkcard small" style="margin:6px 0">${hint}</div>
      ${pitchHtml(m.lineups[s], sel, m.fit, 'm-swap')}
      <div class="row between"><h2 style="margin:6px 4px">Substitutes</h2><span class="small muted">🔁 ${left} of 5 left</span></div>
      <div class="list">${bench.map((p) => `<div class="item tap ${!selP || !left ? '' : ''}" data-a="m-in" data-id="${p.id}">
        ${posTag(p.pos)}<div class="ovr">${p.ovr}</div><div class="grow name">${esc(p.name)}</div>${bar(m.fit[p.id])}
        ${selP && left ? '<span class="tag xi">ON</span>' : ''}</div>`).join('') || '<div class="news muted">No substitutes available.</div>'}</div>
      <h2>Formation</h2>
      <div class="chips">${Object.keys(E.FORMATIONS).map((f) => `<button class="btn ${m.formations[s] === f ? 'on' : ''}" data-a="m-form" data-f="${f}">${f}</button>`).join('')}</div>
      <p class="small muted" style="margin:0 4px 8px">Changing formation moves the players on the pitch into their best slots.</p>
      <h2>Mentality</h2>
      <div class="btns" style="margin-bottom:4px">${Object.keys(E.MENTALITY).map((k) => `<button class="btn ${m.ments[s] === k ? 'on' : ''}" data-a="m-instr" data-k="mentality" data-v="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
      ${instrRows(m.instr[s].pressing, m.instr[s].tempo, 'm-instr')}
      <button class="btn primary block" data-a="m-tactics-done">▶ Resume the match</button>`);
  }
  function finishMatch() {
    clearInterval(ui.matchTimer);
    const m = ui.match;
    E.applyResult(m);
    const others = E.playOtherMatches(m.fx);
    const el = document.getElementById('match');
    if (el) el.remove();
    const g = G();
    const me = m.sides.indexOf(g.userClub);
    const res = m.score[me] > m.score[1 - me] ? 'Victory! 🎉' : m.score[me] < m.score[1 - me] ? 'Defeat 😞' : 'Draw';
    const scorers = m.scorers.map((s) => `${E.player(s.pid).name} ${s.min}'`);
    openModal(`<h2 style="margin-top:0">${res}</h2>
      <div class="fixture"><div class="side">${crest(E.club(m.sides[0]))}</div><div class="score" style="font-size:32px;font-weight:900">${m.score[0]} - ${m.score[1]}</div><div class="side">${crest(E.club(m.sides[1]))}</div></div>
      <p class="small muted" style="text-align:center">${scorers.map(esc).join(' · ') || 'No goals'}</p>
      ${m.pens ? `<p style="text-align:center;margin-top:0"><b>${m.pens[0]} - ${m.pens[1]} on penalties</b></p>` : ''}
      <b class="small muted">Other results</b>
      <div class="list">${others.filter((f) => sameComp(f, m.fx)).map(fxRow).join('')}</div>
      <button class="btn primary block" data-a="next-week">Continue</button>`);
    ui.match = null;
  }
  function skipWeek() {
    const others = E.playOtherMatches(null);
    const ci = E.userCupIdx();
    const shown = others.filter((f) => (f.comp === 'L' && f.div === E.userClub().div) || (f.comp === 'CUP' && f.cup === ci) || f.comp === 'CL' || f.comp === 'CC');
    openModal(`<h2 style="margin-top:0">${esc(E.weekLabel(G().week))}</h2>
      <div class="list">${shown.map(fxRow).join('') || '<div class="news muted">No matches.</div>'}</div>
      <button class="btn primary block" data-a="next-week">Continue</button>`);
  }
  function nextWeek() {
    closeModal();
    E.endWeek();
    save();
    ui.tab = 'home';
    ui.resultsWeek = null;
    render();
    window.scrollTo(0, 0);
  }

  function seasonReview() {
    const s = E.endSeason();
    save();
    const intlLine = s.intl ? `<span>${esc(s.intl.name)}</span><span>🌍 ${esc(s.intl.winner)}</span>` : '';
    if (s.national) {
      openModal(`<h2 style="margin-top:0">${E.seasonName(s.season)} review</h2>
        <div class="kv">${intlLine}
          ${s.intl ? `<span>Your tournament</span><span>${esc(s.intl.mine)}</span><span>Federation target</span><span>${esc(s.expectedText || '-')}</span>` : ''}
          ${s.clName && s.clWinner ? `<span>${esc(s.clName)}</span><span>⭐ ${esc(s.clWinner)}</span>` : ''}
          ${s.champions.slice(0, 8).map((c) => `<span>${esc(c.league)}</span><span>🏆 ${esc(c.club)}</span>`).join('')}
        </div>
        ${s.goldenBoy ? `<div class="wkcard">🏅 <b>Golden Boy:</b> ${esc(s.goldenBoy)}</div>` : ''}
        <p><b>${esc(s.verdict)}</b></p>
        <button class="btn primary block" data-a="close-render">${G().gameOver ? 'OK' : 'Start next season'}</button>`);
      return;
    }
    openModal(`<h2 style="margin-top:0">${E.seasonName(s.season)} review</h2>
      <div class="kv">
        ${s.champions.map((c) => `<span>${esc(c.league)} champions</span><span>🏆 ${esc(c.club)}</span>`).join('')}
        ${s.clName && s.clWinner ? `<span>${esc(s.clName)}</span><span>⭐ ${esc(s.clWinner)}</span>` : ''}
        ${(s.ccs || []).map((c) => `<span>${esc(c.name)}</span><span>${c.icon} ${esc(c.winner)}</span>`).join('')}
        ${intlLine}
        <span>${esc(s.cupName)}</span><span>🏆 ${esc(s.cupWinner)}</span>
        <span>Your finish</span><span>${E.ordinal(s.position)} in the ${esc(E.divName(s.division))} (${s.points} pts)</span>
        <span>Your cup run</span><span>${esc(s.cup)}</span>
        ${s.cl ? `<span>Your ${esc(s.clName)} run</span><span>${esc(s.cl)}</span>` : ''}
        ${s.cc ? `<span>Your ${esc(s.ccName)} run</span><span>${esc(s.cc)}</span>` : ''}
        <span>Board target</span><span>${E.ordinal(s.expected)}</span>
        <span>Prize money</span><span>${M(s.prize)}</span>
        <span>Golden boot</span><span>${esc(s.topScorer)}</span>
      </div>
      ${s.goldenBoy ? `<div class="wkcard">🏅 <b>Golden Boy:</b> ${esc(s.goldenBoy)}${s.goldenBoyMine ? ' <b>(your player!)</b> Your club\'s reputation grows.' : ''}
        ${s.nominees.length ? `<div class="small muted">Also nominated: ${s.nominees.map(esc).join(', ')}</div>` : ''}</div>` : ''}
      ${s.move === 'up' ? `<p style="color:var(--accent);font-weight:800">⬆️ PROMOTED TO THE ${esc(E.divName(E.userClub().div).toUpperCase())}!</p>` : ''}
      ${s.move === 'down' ? `<p style="color:var(--bad);font-weight:800">⬇️ Relegated to the ${esc(E.divName(E.userClub().div))}.</p>` : ''}
      ${s.qualified ? `<p style="color:var(--accent2);font-weight:800">⭐ Qualified for next season's ${esc(s.clName)}!</p>` : ''}
      ${s.qualifiedCC ? `<p style="color:var(--accent2);font-weight:800">🏆 Qualified for next season's ${esc(s.qualifiedCC)}!</p>` : ''}
      <p><b>${esc(s.verdict)}</b></p>
      ${s.legendEarned ? `<p class="small">⭐ <b>Legend Points:</b> ${s.legendEarned.length ? s.legendEarned.map(esc).join(', ') + '. ' : ''}You now have ${s.legendPoints}.</p>` : ''}
      ${s.promoted.length ? `<p class="small muted">⬆️ Up: ${s.promoted.map(esc).join(', ')} · ⬇️ Down: ${s.relegated.map(esc).join(', ')}</p>` : ''}
      ${s.retired.length ? `<p class="small"><b>Retired:</b> ${s.retired.map(esc).join(', ')}</p>` : ''}
      ${s.departed.length ? `<p class="small"><b>Contracts expired (left on a free):</b> ${s.departed.map(esc).join(', ')}</p>` : ''}
      ${s.graduatesLeft.length ? `<p class="small"><b>Left the academy:</b> ${s.graduatesLeft.map(esc).join(', ')}</p>` : ''}
      ${s.youth.length ? `<p class="small"><b>Academy intake:</b> ${s.youth.map(esc).join(', ')}</p>` : ''}
      ${E.userClub().squad.length < 18 ? `<p class="small" style="color:var(--warn)">Your squad is down to ${E.userClub().squad.length}. Check the transfer market and the academy.</p>` : ''}
      <button class="btn primary block" data-a="close-render">${G().gameOver ? 'OK' : 'Start next season'}</button>`);
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const a = t.dataset.a, d = t.dataset;
    switch (a) {
      case 'continue':
        unpack(localStorage.getItem(SAVE_KEY)).then((json) => { E.load(json); ui.leagueDiv = null; render(); })
          .catch(() => { toast('Save could not be loaded.'); renderStart(true); });
        break;
      case 'new-career': {
        const reset = () => { try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ } closeModal(); renderStart(true); };
        if (G() && !G().gameOver) ask('Abandon your current career? Your save will be deleted.', 'Abandon', reset);
        else reset();
        break;
      }
      case 'dataset': ui.dataset = d.id; ui.startCountry = null; renderStart(true); window.scrollTo(0, 0); break;
      case 'start-country': ui.startCountry = d.c; renderStart(true); break;
      case 'ask-yes': { const c = pendingConfirm; pendingConfirm = null; closeModal(); if (c && c.onYes) c.onYes(); break; }
      case 'ask-no': { const c = pendingConfirm; pendingConfirm = null; closeModal(); if (c && c.onNo) c.onNo(); break; }
      case 'start-mode': ui.startMode = d.m; renderStart(true); break;
      case 'pick-nation': {
        const name = (document.getElementById('mname').value || 'Manager').trim().slice(0, 24) || 'Manager';
        toast('Building the world…');
        setTimeout(() => { E.newGame(0, name, undefined, ui.dataset, { nation: d.code }); ui.tab = 'home'; save(); render(); }, 30);
        break;
      }
      case 'pick-club': {
        const name = (document.getElementById('mname').value || 'Manager').trim().slice(0, 24) || 'Manager';
        E.newGame(+d.i, name, undefined, ui.dataset);
        ui.tab = 'home'; ui.leagueDiv = null; save(); render(); break;
      }
      case 'tab': ui.tab = d.t; ui.tacticSel = null; render(); window.scrollTo(0, 0); break;
      case 'play-live': startMatch(true); break;
      case 'play-quick': startMatch(false); break;
      case 'end-season': seasonReview(); break;
      case 'squad-sort': ui.squadSort = d.k; render(); break;
      case 'squad-view': ui.squadView = d.v; render(); break;
      case 'renew': {
        const chk = E.canNegotiate(E.player(+d.id));
        if (!chk.ok) { toast(chk.why); break; }
        ui.neg = { pid: +d.id, years: chk.options[Math.min(1, chk.options.length - 1)], wage: 'demand' };
        negotiationModal(); break;
      }
      case 'neg-years': ui.neg.years = +d.y; negotiationModal(); break;
      case 'neg-wage': ui.neg.wage = d.k; negotiationModal(); break;
      case 'neg-offer': {
        const r = E.offerContract(ui.neg.pid, ui.neg.years, +d.w);
        ui.neg = null; closeModal();
        if (r.ok) { save(); toast('Contract signed! ✍️'); } else toast(r.why);
        render(); break;
      }
      case 'prospect': prospectModal(+d.id); break;
      case 'promote': {
        const r = E.promoteProspect(+d.id);
        closeModal();
        if (r.ok) { save(); toast('Promoted to the first team!'); } else toast(r.why);
        render(); break;
      }
      case 'release-prospect': {
        const p = E.player(+d.id);
        ask(`Release ${p.name} from the academy?`, 'Release', () => { E.releaseProspect(p.id); save(); render(); });
        break;
      }
      case 'academy-upgrade': {
        const cost = E.academyUpgradeCost();
        ask(`Upgrade the academy to level ${G().academy.level + 1} for ${M(cost)}? Running costs rise to ${M(E.academyUpkeep() + 9000)}/wk.`, 'Upgrade', () => {
          const r = E.upgradeAcademy();
          if (r.ok) { save(); toast('Academy upgraded!'); } else toast(r.why);
          render();
        });
        break;
      }
      case 'player': playerModal(+d.id); break;
      case 'close': closeModal(); if (ui.match) { ui.matchSel = null; renderMatch(); } break;
      case 'close-render': closeModal(); ui.tab = 'home'; ui.leagueDiv = null; render(); break;
      case 'formation': {
        const c = E.userClub(); c.formation = d.f; c.lineup = E.autoLineup(c.id); ui.tacticSel = null; render(); break;
      }
      case 'mentality': E.userClub().mentality = d.m; render(); break;
      case 'auto-pick': { const c = E.userClub(); c.lineup = E.autoLineup(c.id); ui.tacticSel = null; render(); break; }
      case 'xi': tacticTap('xi', +d.i); break;
      case 'bench': tacticTap('bench', +d.id); break;
      case 'league-view': ui.leagueView = d.v; render(); break;
      case 'league-div': ui.leagueDiv = +d.d; render(); break;
      case 'skip-week': skipWeek(); break;
      case 'skip-to-next': toast('Simulating…'); setTimeout(skipToNext, 30); break;
      case 'nat-player': natPlayerModal(+d.id); break;
      case 'nat-call': { const r = E.callUpPlayer(+d.id); closeModal(); if (r.ok) { save(); toast('Called up 📞'); } else toast(r.why); render(); break; }
      case 'nat-drop': E.dropPlayer(+d.id); closeModal(); save(); render(); break;
      case 'auto-squad': E.autoSquad(); save(); render(); toast('Squad picked.'); break;
      case 'pool-pos': ui.poolPos = d.p; render(); break;
      case 'week': {
        const cur = ui.resultsWeek === null ? Math.min(G().week, E.totalWeeks() - 1) : ui.resultsWeek;
        ui.resultsWeek = Math.max(0, Math.min(E.totalWeeks() - 1, cur + +d.d)); render(); break;
      }
      case 'mpos': ui.marketPos = d.p; render(); break;
      case 'legend': {
        const nm = d.n;
        const l = E.legendsMarket().find((x) => x.name === nm);
        ask(`Sign ${nm} (${l.pos}, ${l.ovr}) for ${l.cost} Legend Points (you have ${E.legendPoints()})? This is a one-time chance: once signed, no one else can ever have him.`, 'Sign the legend', () => {
          const r = E.signLegend(nm);
          if (r.ok) { save(); toast(`👑 ${nm} has signed!`); } else toast(r.why);
          render();
        });
        break;
      }
      case 'scout': {
        const r = E.scoutPlayer(+d.id);
        if (r.ok) { save(); playerModal(+d.id); render(); toast('Scout report received 🔍'); } else toast(r.why);
        break;
      }
      case 'offer-yes': case 'offer-no': {
        const r = E.respondOffer(+d.i, a === 'offer-yes');
        if (!r.ok) toast(r.why); else { save(); if (a === 'offer-yes') toast('Player sold.'); }
        render(); break;
      }
      case 'buy': {
        const r = E.buy(+d.id);
        closeModal();
        if (r.ok) { save(); toast('Transfer complete!'); } else toast(r.why);
        render(); break;
      }
      case 'sell': {
        const r = E.getOffer(+d.id);
        if (!r.ok) { toast(r.why); break; }
        const p = E.player(+d.id);
        ask(`${E.club(r.club).name} offer ${M(r.amount)} for ${p.name} (value ${M(E.playerValue(p))}). Accept?`, 'Accept',
          () => { E.sell(+d.id, r); save(); render(); toast('Player sold.'); }, 'Reject', () => toast('Offer rejected.'));
        break;
      }
      case 'release': {
        const p = E.player(+d.id);
        ask(`Release ${p.name}? It costs ${M(E.releaseCost(p.id))} to settle the contract.`, 'Release', () => {
          const r = E.release(p.id);
          if (!r.ok) toast(r.why); else { save(); render(); }
        });
        break;
      }
      case 'training': G().training = d.k; render(); break;
      case 'save': save(); toast('Game saved.'); break;
      case 'toggle-vibrate': prefs.vibrate = !prefs.vibrate; savePrefs(); if (prefs.vibrate) buzz([60]); render(); break;
      // match controls
      case 'm-pause': ui.matchPaused = !ui.matchPaused; renderMatch(); runClock(); break;
      case 'm-speed': ui.matchSpeed = +d.s; renderMatch(); runClock(); break;
      case 'm-skip': clearInterval(ui.matchTimer); while (!ui.match.done) E.stepMatch(ui.match); renderMatch(); break;
      case 'm-ment': { const m = ui.match; m.ments[m.sides.indexOf(G().userClub)] = d.m; renderMatch(); break; }
      case 'm-tactics': ui.matchSwap = null; matchTacticsModal(); break;
      case 'm-swap': {
        const m = ui.match, i = +d.i;
        if (typeof ui.matchSwap !== 'number') ui.matchSwap = i;
        else { if (ui.matchSwap !== i) E.swapMatchPositions(m, m.sides.indexOf(G().userClub), ui.matchSwap, i); ui.matchSwap = null; }
        matchTacticsModal(); break;
      }
      case 'm-tactics-done': closeModal(); ui.matchPaused = false; renderMatch(); runClock(); break;
      case 'm-form': { const m = ui.match; ui.matchSwap = null; E.setMatchFormation(m, m.sides.indexOf(G().userClub), d.f); matchTacticsModal(); break; }
      case 'm-instr': { const m = ui.match; E.setMatchInstruction(m, m.sides.indexOf(G().userClub), d.k, d.v); matchTacticsModal(); break; }
      case 'instr': { E.userClub()[d.k] = d.v; save(); render(); break; }
      case 'noop': break;
      case 'm-subs': ui.matchSwap = null; matchTacticsModal(); break;
      case 'm-in': {
        const m = ui.match, s = m.sides.indexOf(G().userClub);
        const out = typeof ui.matchSwap === 'number' && m.lineups[s][ui.matchSwap] ? m.lineups[s][ui.matchSwap].pid : null;
        if (out === null) { toast('First tap the player on the pitch to take off.'); break; }
        if (m.subs[s] >= 5) { toast('No substitutions left.'); break; }
        E.makeSub(m, s, out, +d.id);
        ui.matchSwap = null; matchTacticsModal(); break;
      }
      case 'match-done': finishMatch(); break;
      case 'next-week': nextWeek(); break;
      default: break;
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'mname') ui.mname = e.target.value;
    if (e.target.id === 'pq') {
      ui.poolQuery = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const el = document.getElementById('pq');
      el.focus(); el.setSelectionRange(pos, pos);
    }
    if (e.target.id === 'mq') {
      ui.marketQuery = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const el = document.getElementById('mq');
      el.focus(); el.setSelectionRange(pos, pos);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'mmax') { ui.marketMax = +e.target.value; render(); }
    if (e.target.id === 'mleague') { ui.marketLeague = e.target.value; render(); }
  });

  renderStart();
})();
