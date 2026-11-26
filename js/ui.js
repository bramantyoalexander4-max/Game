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
    leagueView: 'table', resultsWeek: null, leagueDiv: null,
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
  const formHtml = (f) => `<span class="form">${f.map((r) => `<i class="${r}">${r}</i>`).join('')}</span>`;

  function save() {
    try { localStorage.setItem(SAVE_KEY, E.serialize()); } catch (e) { /* storage full or blocked */ }
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.add('hidden'), 2600);
  }
  function openModal(html) { modalBox.innerHTML = html; modal.classList.remove('hidden'); }
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
    const clubs = E.CLUBS;
    if (!showClubs && hasSave()) {
      app.innerHTML = `<div class="start">
        <div class="logo"><h1>⚽ Touchline <span>Manager</span></h1><p class="muted">Build a dynasty from the dugout.</p></div>
        <button class="btn primary block" data-a="continue">Continue career</button><br>
        <button class="btn block" data-a="new-career">New career</button>
      </div>`;
      return;
    }
    app.innerHTML = `<div class="start">
      <div class="logo"><h1>⚽ Touchline <span>Manager</span></h1><p class="muted">Pick a club and lead them to glory.</p></div>
      <div class="card"><label class="muted small">Manager name</label><br>
        <input id="mname" maxlength="24" placeholder="Your name" style="width:100%;margin-top:6px" value="Manager"></div>
      <h2>Choose your club</h2>
      ${[1, 2].map((div) => `<h2>Division ${div}</h2><div class="list">${clubs.map((c, i) => (c.div !== div ? '' : `
        <div class="item tap" data-a="pick-club" data-i="${i}">
          <div class="crest" style="background:${c.color}">${c.short}</div>
          <div class="grow"><div class="name">${c.name}</div><div class="stars">${stars(c.rep)}</div></div>
          <div class="muted small">${div === 1 ? (i < 3 ? 'Title contender' : i < 8 ? 'Mid-table' : 'Relegation fight')
            : (i < 15 ? 'Promotion hopeful' : 'Long-term project')}</div>
        </div>`)).join('')}</div>`).join('')}
      </div>`;
  }

  // ---------- main shell ----------
  const TABS = [['home', '🏠', 'Home'], ['squad', '👥', 'Squad'], ['tactics', '📋', 'Tactics'],
    ['league', '🏆', 'League'], ['transfers', '💱', 'Transfers'], ['club', '🏟️', 'Club']];

  function render() {
    if (!G()) return renderStart();
    const c = E.userClub();
    document.documentElement.style.setProperty('--club', c.color);
    const body = { home: viewHome, squad: viewSquad, tactics: viewTactics, league: viewLeague, transfers: viewTransfers, club: viewClub }[ui.tab]();
    app.innerHTML = `
      <div class="top">${crest(c)}
        <div class="title"><b>${esc(c.name)}</b><small>Season ${G().season} · Week ${Math.min(G().week + 1, E.totalWeeks())}/${E.totalWeeks()} · Div ${c.div} · ${E.ordinal(E.position(c.id))}</small></div>
        <div class="money">${M(c.budget)}<small>budget</small></div>
      </div>
      <main>${body}</main>
      <nav class="tabs"><div class="inner">${TABS.map(([k, i, l]) => `<button data-a="tab" data-t="${k}" class="${ui.tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div></nav>`;
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
      top = `<div class="card"><h2>🏁 Season ${g.season} complete</h2>
        <p>${esc(champ.name)} are Division ${E.userClub().div} champions. You finished <b>${E.ordinal(E.position(g.userClub))}</b> (board expected ${E.ordinal(E.expectedPosition())}).</p>
        <button class="btn primary block" data-a="end-season">See season review</button></div>`;
    } else if (!E.userFixture()) {
      const cupNote = g.cup.alive.includes(g.userClub) ? 'You have a bye this round.' : `You're out of the ${E.CUP_NAME}.`;
      top = `<div class="card"><div class="small muted">${esc(E.weekLabel(g.week))}</div>
        <h2>No match this week</h2><p class="muted">${cupNote} The squad gets a week to rest.</p>
        <button class="btn primary block" data-a="skip-week">⏩ Continue</button></div>`;
    } else {
      const fx = E.userFixture();
      const h = E.club(fx.home), a = E.club(fx.away);
      const cup = fx.comp === 'CUP';
      const lineup = E.validateLineup(g.userClub);
      top = `<div class="card">
        <div class="row between small muted"><span>${cup ? '🏆 ' : `Division ${E.userClub().div} · `}${esc(E.weekLabel(g.week))}</span><span>${fx.home === g.userClub ? 'Home' : 'Away'}</span></div>
        <div class="fixture" style="margin:12px 0">
          <div class="side">${crest(h)}<b>${esc(h.name)}</b><span class="strength">Str ${E.clubStrength(h.id)} · ${clubPos(h)}</span>${formHtml(h.table.form)}</div>
          <div class="vs">vs</div>
          <div class="side">${crest(a)}<b>${esc(a.name)}</b><span class="strength">Str ${E.clubStrength(a.id)} · ${clubPos(a)}</span>${formHtml(a.table.form)}</div>
        </div>
        ${cup ? `<p class="small" style="text-align:center;color:var(--accent2)">Knockout: a draw goes to penalties. Winning is worth ${M(E.CUP_PRIZE[fx.round])}.</p>` : ''}
        <p class="small muted" style="text-align:center">${E.userClub().formation} · ${E.userClub().mentality} · ${lineup.length}/11 picked</p>
        <div class="btns"><button class="btn primary" data-a="play-live">▶ Play match</button><button class="btn" data-a="play-quick">⏩ Quick sim</button></div>
      </div>`;
    }
    const last = g.week > 0 && !g.gameOver ? relevantFixtures(g.week - 1) : [];
    const lastHtml = last.length ? `<h2>Last week · ${esc(E.weekLabel(g.week - 1))}</h2><div class="list">${last.map(fxRow).join('')}</div>` : '';
    const news = g.news.slice(0, 15).map((n) => `<div class="news"><small>S${n.season} W${n.week + 1}</small>${esc(n.text)}</div>`).join('');
    return top + lastHtml + `<h2>Inbox</h2><div class="list">${news || '<div class="news muted">No news yet.</div>'}</div>`;
  }
  const clubPos = (c) => `${E.ordinal(E.position(c.id))} in Div ${c.div}`;
  // the fixtures a user cares about in a week: their division's games, or the cup ties
  function relevantFixtures(w, div = E.userClub().div) {
    const fx = E.fixturesForWeek(w);
    return fx.filter((f) => f.comp === 'CUP' || f.div === div);
  }
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
    }[ui.squadSort];
    return s.sort(by);
  }
  function playerRow(p, extra = '', action = 'player') {
    const inXI = p.club === G().userClub && E.userClub().lineup.some((l) => l.pid === p.id);
    return `<div class="item tap" data-a="${action}" data-id="${p.id}">
      ${posTag(p.pos)}<div class="ovr">${p.ovr}</div>
      <div class="grow"><div class="name">${esc(p.name)}</div>
        <div class="small muted">${p.age}y · pot ${p.pot} · ${M(E.playerValue(p))}${extra}</div></div>
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
    const sorts = [['pos', 'Position'], ['ovr', 'Rating'], ['age', 'Age'], ['value', 'Value'], ['goals', 'Goals']];
    return nav + `<div class="row between"><h2>Squad (${s.length})</h2><span class="small muted">Wages ${M(E.wageBill(G().userClub))}/wk</span></div>
      <div class="chips">${sorts.map(([k, l]) => `<button class="btn ${ui.squadSort === k ? 'on' : ''}" data-a="squad-sort" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="list">${s.map((p) => playerRow(p, ui.squadSort === 'goals' ? ` · ⚽${p.goals} 🅰${p.assists}` : '')).join('')}</div>`;
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
        <div class="grow"><div class="name">${esc(p.name)}</div><div class="small muted">${p.age}y · ${M(p.wage)}/wk · until S${E.contractEnds(p)}</div></div>
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
        <div class="grow"><div class="name">${esc(p.name)}</div><div class="small muted">${p.age}y · potential ${lo === hi ? lo : lo + '–' + hi}</div></div>
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
    } else if (!G().gameOver) {
      const chk = E.canBuy(p.id);
      actions = chk.ok
        ? `<button class="btn primary block" data-a="buy" data-id="${p.id}">${chk.fee ? 'Buy for ' + M(chk.fee) : 'Sign free agent'} · ${M(chk.wage)}/wk · ${chk.contract}-season deal</button>`
        : `<p class="small" style="color:var(--warn)">${esc(chk.why)}</p>`;
    }
    openModal(`<div class="row">${posTag(p.pos)}<div class="ovr" style="font-size:26px;width:auto">${p.ovr}</div>
        <div class="grow"><b style="font-size:18px">${esc(p.name)}</b><div class="small muted">${c ? esc(c.name) : 'Free agent'}</div></div></div>
      <div class="kv">
        <span>Age</span><span>${p.age}</span>
        <span>Potential</span><span>${p.pot}</span>
        <span>Value</span><span>${M(E.playerValue(p))}</span>
        ${!mine && p.club !== null ? `<span>Asking price</span><span>${M(E.askingPrice(p))}</span>` : ''}
        <span>Wage</span><span>${M(p.wage)}/wk</span>
        <span>Contract</span><span style="${p.club !== null && p.contract <= 1 ? 'color:var(--warn)' : ''}">${contractText(p)}</span>
        <span>Fitness</span><span>${Math.round(p.fitness)}%</span>
        <span>Morale</span><span>${p.morale > 75 ? '😀' : p.morale > 50 ? '🙂' : p.morale > 30 ? '😐' : '😠'} ${p.morale}</span>
        <span>Status</span><span>${p.injury ? `Injured (${p.injury} wk)` : 'Available'}</span>
        <span>Season</span><span>${p.apps} apps · ${p.goals} goals · ${p.assists} assists</span>
      </div>${actions}
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
      <div class="card stats3"><div><b>${s.att}</b><span class="small muted">Attack</span></div><div><b>${s.mid}</b><span class="small muted">Midfield</span></div><div><b>${s.def}</b><span class="small muted">Defence</span></div></div>
      <div class="row between"><p class="small muted" style="margin:4px">Tap a player, then tap another (on the pitch or bench) to swap.</p>
        <button class="btn" data-a="auto-pick">Auto pick</button></div>
      ${pitchHtml(lineup, selIdx, null, 'xi')}
      <h2>Bench & reserves</h2>
      <div class="list">${bench.map((p) => `<div class="item tap ${selBench === p.id ? 'sel' : ''}" data-a="bench" data-id="${p.id}">
        ${posTag(p.pos)}<div class="ovr">${p.ovr}</div><div class="grow"><div class="name">${esc(p.name)}</div>
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
    const views = [['table', 'Table'], ['fixtures', 'Fixtures'], ['cup', 'Cup'], ['stats', 'Scorers']];
    const toggle = `<div class="btns" style="margin-bottom:10px">${views.map(([k, l]) =>
      `<button class="btn ${ui.leagueView === k ? 'on' : ''}" data-a="league-view" data-v="${k}">${l}</button>`).join('')}</div>`;
    const divChips = `<div class="chips">${[1, 2].map((d) => `<button class="btn ${div === d ? 'on' : ''}" data-a="league-div" data-d="${d}">Division ${d}</button>`).join('')}</div>`;
    if (ui.leagueView === 'fixtures') {
      const w = ui.resultsWeek === null ? Math.min(g.week, E.totalWeeks() - 1) : ui.resultsWeek;
      const fx = relevantFixtures(w, div);
      const cupWeek = g.calendar[w].type === 'cup';
      return toggle + (cupWeek ? '' : divChips) + `<div class="row between" style="margin-bottom:8px">
          <button class="btn" data-a="week" data-d="-1" ${w <= 0 ? 'disabled' : ''}>◀</button>
          <b>${esc(E.weekLabel(w))}</b>
          <button class="btn" data-a="week" data-d="1" ${w >= E.totalWeeks() - 1 ? 'disabled' : ''}>▶</button></div>
        <div class="list">${fx.map(fxRow).join('') || `<div class="news muted">${cupWeek ? 'The draw for this round has not been made yet.' : 'No fixtures.'}</div>`}</div>`;
    }
    if (ui.leagueView === 'cup') return toggle + viewCup();
    if (ui.leagueView === 'stats') {
      const ps = Object.values(g.players).filter((p) => p.club !== null && E.club(p.club).div === div && (p.goals || p.assists))
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 25);
      return toggle + divChips + `<div class="list"><table><tr><th>#</th><th class="l">Player</th><th>Club</th><th>⚽</th><th>🅰</th><th>Apps</th></tr>
        ${ps.map((p, i) => `<tr class="${p.club === g.userClub ? 'me' : ''}"><td>${i + 1}</td><td class="l">${esc(p.name)}</td><td>${E.club(p.club).short}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.apps}</td></tr>`).join('')}
        </table>${ps.length ? '' : '<div class="news muted">No goals yet.</div>'}</div><p class="small muted">Goals include cup matches.</p>`;
    }
    const table = E.standings(div);
    const n = table.length, k = E.PROMOTED;
    const zone = (i) => (div === 1 && i >= n - k ? 'zone-down' : div === 2 && i < k ? 'zone-up' : '');
    const mine = E.userClub().div === div;
    const exp = E.expectedPosition();
    const note = !mine ? '' : `<p class="small muted">Board expectation: finish ${E.ordinal(exp)} or better.
      ${div === 1 ? `The bottom ${k} are relegated to Division 2.` : `The top ${k} are promoted to Division 1.`}
      ${[exp + 5 <= n ? `finishing ${E.ordinal(exp + 5)} or lower` : '', div === 1 && exp <= n - k - 3 ? 'being relegated' : '']
        .filter(Boolean).map((x, i, a) => (i ? ' or ' : '') + x).join('').replace(/^./, (c) => c.toUpperCase()).replace(/(.+)/, '$1 gets you sacked.')}
      Winning the ${E.CUP_NAME} saves your job.</p>`;
    return toggle + divChips + `<div class="list"><table>
      <tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th>Form</th></tr>
      ${table.map((c, i) => `<tr class="${c.id === g.userClub ? 'me' : ''} ${zone(i)}">
        <td>${i + 1}</td><td class="l"><span class="dot" style="background:${c.color}"></span>${esc(c.short)}</td>
        <td>${c.table.p}</td><td>${c.table.w}</td><td>${c.table.d}</td><td>${c.table.l}</td>
        <td>${c.table.gf - c.table.ga > 0 ? '+' : ''}${c.table.gf - c.table.ga}</td><td><b>${c.table.pts}</b></td><td>${formHtml(c.table.form.slice(-3))}</td></tr>`).join('')}
      </table></div>
      <p class="small">${div === 2 ? '<span class="key up"></span>Promotion' : '<span class="key down"></span>Relegation'} zone</p>${note}`;
  }
  function viewCup() {
    const g = G();
    const status = g.cup.winner !== null ? `🏆 ${esc(E.club(g.cup.winner).name)} won the ${E.CUP_NAME}.`
      : g.cup.alive.includes(g.userClub) ? `You're still in the ${E.CUP_NAME}.` : `You're out: ${esc(E.cupResult(g.userClub).toLowerCase())}.`;
    const rounds = g.calendar.map((c, w) => ({ ...c, w })).filter((c) => c.type === 'cup');
    return `<div class="card"><b>${E.CUP_NAME}</b><p class="small muted" style="margin:6px 0">
        A knockout for all ${g.clubs.length} clubs. The ${g.cup.byes.length} top-rated Division 1 sides skip the first round.
        A draw after 90 minutes goes to penalties.</p><p style="margin:0">${status}</p></div>
      ${rounds.map((r) => {
        const fx = E.fixturesForWeek(r.w);
        return `<h2>${E.CUP_ROUNDS[r.round]} <span class="small muted">· week ${r.w + 1} · win ${M(E.CUP_PRIZE[r.round])}</span></h2>
          <div class="list">${fx.map(fxRow).join('') || '<div class="news muted">Not drawn yet.</div>'}</div>`;
      }).join('')}`;
  }

  // ---------- transfers ----------
  function viewTransfers() {
    const g = G();
    const q = ui.marketQuery.toLowerCase();
    const pool = Object.values(g.players).filter((p) => p.club !== g.userClub
      && (ui.marketPos === 'ALL' || p.pos === ui.marketPos)
      && (!ui.marketMax || E.askingPrice(p) <= ui.marketMax)
      && (!q || p.name.toLowerCase().includes(q)))
      .sort((a, b) => b.ovr - a.ovr).slice(0, 60);
    const maxes = [[0, 'Any price'], [1e6, '≤ £1M'], [3e6, '≤ £3M'], [6e6, '≤ £6M'], [12e6, '≤ £12M']];
    return `<h2>Transfer market</h2>
      <div class="chips">${['ALL', 'GK', 'DF', 'MF', 'FW'].map((p) => `<button class="btn ${ui.marketPos === p ? 'on' : ''}" data-a="mpos" data-p="${p}">${p}</button>`).join('')}</div>
      <div class="row" style="margin-bottom:10px">
        <input class="grow" id="mq" placeholder="Search name…" value="${esc(ui.marketQuery)}">
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
      <div class="list">${g.history.length ? g.history.map((h) => `<div class="item"><div class="grow">Season ${h.season}<div class="small muted">Cup: ${esc(h.cup)}</div></div>
        <b>${E.ordinal(h.position)} · Div ${h.division}${h.move === 'up' ? ' ⬆️' : h.move === 'down' ? ' ⬇️' : ''}</b><span class="muted small">${h.points} pts</span></div>`).join('') : '<div class="news muted">Your first season is under way.</div>'}</div>
      <h2>Game</h2>
      <div class="btns"><button class="btn" data-a="save">💾 Save</button><button class="btn danger" data-a="new-career">New career</button></div>
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
      // pause briefly on goals so they land
      const goal = m.events.slice(before).some((e) => e.type === 'goal' || e.type === 'red');
      renderMatch();
      if (m.done) { clearInterval(ui.matchTimer); return; }
      if (goal && ui.matchSpeed < 4) { clearInterval(ui.matchTimer); setTimeout(runClock, 900); }
    }, delay);
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
        <div class="btns">${Object.keys(E.MENTALITY).map((k) => `<button class="btn ${m.ments[me] === k ? 'on' : ''}" data-a="m-ment" data-m="${k}">${k[0].toUpperCase() + k.slice(1, 3)}</button>`).join('')}
          <button class="btn" data-a="m-subs">🔁 Subs (${5 - m.subs[me]})</button></div>`;
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
  function subsModal() {
    const m = ui.match;
    const s = m.sides.indexOf(G().userClub);
    ui.matchPaused = true; clearInterval(ui.matchTimer); renderMatch();
    const lu = m.lineups[s];
    const bench = E.benchOf(m, s).sort((a, b) => E.POS_ORDER[a.pos] - E.POS_ORDER[b.pos] || b.ovr - a.ovr);
    const selOut = ui.matchSel;
    openModal(`<div class="row between"><b>Substitutions (${5 - m.subs[s]} left)</b><button class="btn" data-a="close">Done</button></div>
      <p class="small muted">Tap a player on the pitch, then a substitute.</p>
      <div class="list">${lu.map((l) => { const p = E.player(l.pid); return `<div class="item tap ${selOut === p.id ? 'sel' : ''}" data-a="m-out" data-id="${p.id}">
        <span class="pos ${l.slot}">${l.slot}</span><div class="ovr">${p.ovr}</div><div class="grow name">${esc(p.name)}${p.pos !== l.slot ? ` <span class="muted small">(${p.pos})</span>` : ''}${m.yellows[p.id] ? ' 🟨' : ''}</div>${bar(m.fit[p.id])}</div>`; }).join('')}</div>
      <b class="small muted">Bench</b>
      <div class="list">${bench.map((p) => `<div class="item tap" data-a="m-in" data-id="${p.id}">${posTag(p.pos)}<div class="ovr">${p.ovr}</div><div class="grow name">${esc(p.name)}</div>${bar(m.fit[p.id])}</div>`).join('') || '<div class="news muted">No substitutes available.</div>'}</div>`);
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
      <div class="list">${others.filter((f) => f.comp === m.fx.comp && f.div === m.fx.div).map(fxRow).join('')}</div>
      <button class="btn primary block" data-a="next-week">Continue</button>`);
    ui.match = null;
  }
  function skipWeek() {
    const others = E.playOtherMatches(null);
    const shown = others.filter((f) => f.comp === 'CUP' || f.div === E.userClub().div);
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
    openModal(`<h2 style="margin-top:0">Season ${s.season} review</h2>
      <div class="kv">
        <span>Division 1 champions</span><span>🏆 ${esc(s.champion)}</span>
        <span>Division 2 champions</span><span>${esc(s.d2Champion)}</span>
        <span>${E.CUP_NAME}</span><span>🏆 ${esc(s.cupWinner)}</span>
        <span>Your finish</span><span>${E.ordinal(s.position)} in Div ${s.division} (${s.points} pts)</span>
        <span>Your cup run</span><span>${esc(s.cup)}</span>
        <span>Board target</span><span>${E.ordinal(s.expected)}</span>
        <span>Prize money</span><span>${M(s.prize)}</span>
        <span>Golden boot</span><span>${esc(s.topScorer)}</span>
      </div>
      ${s.move === 'up' ? '<p style="color:var(--accent);font-weight:800">⬆️ PROMOTED TO DIVISION 1!</p>' : ''}
      ${s.move === 'down' ? '<p style="color:var(--bad);font-weight:800">⬇️ Relegated to Division 2.</p>' : ''}
      <p><b>${esc(s.verdict)}</b></p>
      <p class="small muted">⬆️ Up: ${s.promoted.map(esc).join(', ')} · ⬇️ Down: ${s.relegated.map(esc).join(', ')}</p>
      ${s.retired.length ? `<p class="small"><b>Retired:</b> ${s.retired.map(esc).join(', ')}</p>` : ''}
      ${s.departed.length ? `<p class="small"><b>Contracts expired (left on a free):</b> ${s.departed.map(esc).join(', ')}</p>` : ''}
      ${s.graduatesLeft.length ? `<p class="small"><b>Left the academy:</b> ${s.graduatesLeft.map(esc).join(', ')}</p>` : ''}
      ${s.youth.length ? `<p class="small"><b>Academy intake:</b> ${s.youth.map(esc).join(', ')}</p>` : ''}
      ${G().userClub !== null && E.userClub().squad.length < 18 ? `<p class="small" style="color:var(--warn)">Your squad is down to ${E.userClub().squad.length}. Check the transfer market and the academy.</p>` : ''}
      <button class="btn primary block" data-a="close-render">${G().gameOver ? 'OK' : 'Start next season'}</button>`);
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const a = t.dataset.a, d = t.dataset;
    switch (a) {
      case 'continue':
        try { E.load(localStorage.getItem(SAVE_KEY)); ui.leagueDiv = null; render(); } catch (err) { toast('Save could not be loaded.'); renderStart(true); }
        break;
      case 'new-career': {
        const reset = () => { try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ } closeModal(); renderStart(true); };
        if (G() && !G().gameOver) ask('Abandon your current career? Your save will be deleted.', 'Abandon', reset);
        else reset();
        break;
      }
      case 'ask-yes': { const c = pendingConfirm; pendingConfirm = null; closeModal(); if (c && c.onYes) c.onYes(); break; }
      case 'ask-no': { const c = pendingConfirm; pendingConfirm = null; closeModal(); if (c && c.onNo) c.onNo(); break; }
      case 'pick-club': {
        const name = (document.getElementById('mname').value || 'Manager').trim().slice(0, 24) || 'Manager';
        E.newGame(+d.i, name);
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
      case 'week': {
        const cur = ui.resultsWeek === null ? Math.min(G().week, E.totalWeeks() - 1) : ui.resultsWeek;
        ui.resultsWeek = Math.max(0, Math.min(E.totalWeeks() - 1, cur + +d.d)); render(); break;
      }
      case 'mpos': ui.marketPos = d.p; render(); break;
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
      // match controls
      case 'm-pause': ui.matchPaused = !ui.matchPaused; renderMatch(); runClock(); break;
      case 'm-speed': ui.matchSpeed = +d.s; renderMatch(); runClock(); break;
      case 'm-skip': clearInterval(ui.matchTimer); while (!ui.match.done) E.stepMatch(ui.match); renderMatch(); break;
      case 'm-ment': { const m = ui.match; m.ments[m.sides.indexOf(G().userClub)] = d.m; renderMatch(); break; }
      case 'm-subs': ui.matchSel = null; subsModal(); break;
      case 'm-out': ui.matchSel = +d.id; subsModal(); break;
      case 'm-in': {
        const m = ui.match, s = m.sides.indexOf(G().userClub);
        if (ui.matchSel === null) { toast('First tap the player to take off.'); break; }
        if (m.subs[s] >= 5) { toast('No substitutions left.'); break; }
        E.makeSub(m, s, ui.matchSel, +d.id);
        ui.matchSel = null; subsModal(); break;
      }
      case 'match-done': finishMatch(); break;
      case 'next-week': nextWeek(); break;
      default: break;
    }
  });
  document.addEventListener('input', (e) => {
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
  });

  renderStart();
})();
