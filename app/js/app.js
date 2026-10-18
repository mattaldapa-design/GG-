// GG! — the app. Categories → games → players (one tile each) → their scores.
import * as db from './db.js';
import { esc, uid, todayIso, fmtDate, parseScore, fmtScore, initials, safeId, safeText, bestOf, leaderOf } from './util.js';
import { SEED_CATEGORY, SEED_PLAYERS, SEED_GAMES, SEED_STERN, SEED_BOARD } from './seed.js';

const APP_VERSION = 8; // keep in step with VERSION in sw.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const top = $('#top');
// Going where we already are (the live setup saves and shows the board at the same address) repaints instead of waiting for a hash change that never comes.
const go = (h) => { if (location.hash === '#' + h) render(); else location.hash = h; };

// ---------- small helpers ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
let urls = [];
const freeUrls = () => { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; };
const photoUrl = (p) => { const u = URL.createObjectURL(p.blob); urls.push(u); return u; };
const bindGo = () => $$('[data-go]').forEach((el) => {
  el.addEventListener('click', () => go(el.dataset.go));
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(el.dataset.go); } });
});
const tone = (i) => i % 4;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// A bottom sheet of choices. Resolves with the chosen key, or null.
function sheet(title, actions) {
  return new Promise((resolve) => {
    const back = document.createElement('div'); back.className = 'gg-backdrop';
    const box = document.createElement('div'); box.className = 'dr-peek dr-peek--sheet gg-sheet';
    box.innerHTML = `<div class="dr-peek__title">${esc(title)}</div>${actions.map((a) => `<button class="dr-btn ${a.danger ? 'dr-btn--ghost' : 'dr-btn--quiet'}" data-act="${a.k}" ${a.disabled ? 'disabled' : ''}>${esc(a.label)}</button>`).join('')}<button class="dr-btn dr-btn--ghost" data-act="">Never mind</button>`;
    const close = (k) => { back.remove(); box.remove(); resolve(k || null); };
    back.onclick = () => close(null);
    box.onclick = (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) close(b.dataset.act); };
    document.body.append(back, box);
    requestAnimationFrame(() => box.classList.add('is-in'));
  });
}
// A yes/no sheet for anything that removes something.
const confirmSheet = async (title, yes) => (await sheet(title, [{ k: 'yes', label: yes, danger: true }])) === 'yes';

// Inline rename: the title becomes a box; Enter or leaving it saves, Escape puts it back.
function renameInline(h1, current, onSave) {
  const input = document.createElement('input');
  input.className = 'dr-input gg-titleedit'; input.value = current; input.setAttribute('aria-label', 'Name');
  h1.replaceWith(input); input.focus(); input.select();
  let done = false;
  const finish = async (save) => {
    if (done) return; done = true;
    const v = input.value.trim();
    if (save && v && v !== current) await onSave(v); else render();
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); };
  input.onblur = () => finish(true);
}

// ---------- pictures ----------
// Keep pictures phone-sized: the longest side at most 1600px, saved as JPEG.
async function shrink(file) {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return { blob: file, w: 0, h: 0 };
  const max = 1600, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.86));
  return { blob: blob || file, w, h };
}

// ---------- model ----------
async function touch(store, obj) { obj.updatedAt = Date.now(); await db.put(store, obj); }
async function playersOf(gameId) { return (await db.where('players', 'gameId', gameId)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); }
async function gamesOf(categoryId) { return (await db.where('games', 'categoryId', categoryId)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); }
async function deletePlayer(p) {
  const game = await db.get('games', p.gameId);
  for (const s of p.scores || []) if (s.photoId && s.photoId !== game?.photoId) await db.del('photos', s.photoId);
  await db.del('players', p.id);
}
async function deleteGame(g) {
  for (const p of await playersOf(g.id)) await deletePlayer(p);
  for (const n of await db.where('nights', 'gameId', g.id)) await db.del('nights', n.id);
  for (const ph of await db.where('photos', 'gameId', g.id)) await db.del('photos', ph.id);
  await db.del('games', g.id);
}
// A category keeps high scores (one tile per player) or games played (one tile per night): Decision, 2026-10-18.
const kindOf = (cat) => (cat?.kind === 'nights' || cat?.kind === 'both' ? cat.kind : 'scores');
const KIND_LABEL = { scores: 'High scores', nights: 'Games played', both: 'Both' };
async function nightsOf(gameId) { return (await db.where('nights', 'gameId', gameId)).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0)); }
async function deleteNight(n, game) {
  if (n.photoId && n.photoId !== game?.photoId) await db.del('photos', n.photoId);
  await db.del('nights', n.id);
}
// Who won a round: the names marked, else the highest score(s) when scores were kept.
function winnersOf(round) {
  if (round.winners?.length) return round.winners;
  const scored = (round.players || []).filter((p) => p.score != null);
  if (!scored.length) return [];
  const top = Math.max(...scored.map((p) => p.score));
  return scored.filter((p) => p.score === top).map((p) => p.name);
}
const sameName = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
// Matt's totals on a game (I6): rounds he was in, rounds he won, the best score he won with, who he played with.
function totalsFor(me, nights) {
  const t = { played: 0, won: 0, best: null, people: new Set(), nights: nights.length };
  if (!me) return t;
  for (const n of nights) for (const r of n.rounds || []) {
    const mine = (r.players || []).find((p) => sameName(p.name, me));
    if (!mine) continue;
    t.played += 1;
    (r.players || []).forEach((p) => { if (!sameName(p.name, me)) t.people.add(p.name.trim()); });
    if (winnersOf(r).some((w) => sameName(w, me))) { t.won += 1; if (mine.score != null && (t.best == null || mine.score > t.best)) t.best = mine.score; }
  }
  return t;
}
// Every name on any round, most used first, for the chips.
async function knownNamesFromNights() {
  const count = {};
  for (const n of await db.all('nights')) for (const r of n.rounds || []) for (const p of r.players || []) count[p.name] = (count[p.name] || 0) + 1;
  return count;
}
async function deleteCategory(c) {
  for (const g of await gamesOf(c.id)) await deleteGame(g);
  await db.del('categories', c.id);
}
// Every name that has ever been on a game, most used first: the chips on the "Who?" page.
async function knownNames() {
  const count = await knownNamesFromNights();
  for (const p of await db.all('players')) count[p.name] = (count[p.name] || 0) + 1;
  const me = await db.setting('yourName', '');
  if (me) count[me] = (count[me] || 0) + 1000;
  return Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b));
}
// First run: Matt's 23 cabinets, so the app replaces the Notes page from the first open.
async function seedIfEmpty() {
  if (await db.setting('seeded', false)) return;
  if ((await db.all('categories')).length) { await db.setSetting('seeded', true); return; }
  const now = Date.now();
  const cat = { id: uid(), name: SEED_CATEGORY, order: 0, createdAt: now, updatedAt: now };
  const games = [], players = [];
  SEED_GAMES.forEach(([name, scores], i) => {
    const g = { id: uid(), categoryId: cat.id, name, order: i, createdAt: now, updatedAt: now };
    games.push(g);
    let j = 0;
    for (const key of ['M', 'J']) {
      if (scores[key] == null) continue;
      const values = Array.isArray(scores[key]) ? scores[key] : [scores[key]];
      players.push({ id: uid(), gameId: g.id, name: SEED_PLAYERS[key], order: j++, createdAt: now, updatedAt: now,
        scores: values.map((v) => ({ id: uid(), value: v, date: '', where: '', photoId: null, createdAt: now })) });
    }
  });
  SEED_STERN.forEach(([name, values], i) => {
    const g = { id: uid(), categoryId: cat.id, name, order: SEED_GAMES.length + i, createdAt: now, updatedAt: now };
    games.push(g);
    players.push({ id: uid(), gameId: g.id, name: SEED_PLAYERS.M, order: 0, createdAt: now, updatedAt: now,
      scores: values.map((v) => ({ id: uid(), value: v, date: '', where: '', photoId: null, createdAt: now })) });
  });
  const board = { id: uid(), name: SEED_BOARD.category, kind: 'nights', order: 1, createdAt: now, updatedAt: now };
  SEED_BOARD.games.forEach((name, i) => games.push({ id: uid(), categoryId: board.id, name, order: i, createdAt: now, updatedAt: now }));
  await db.batch(['categories', 'games', 'players', 'meta'], (s) => {
    s.categories.put(cat); s.categories.put(board); games.forEach((g) => s.games.put(g)); players.forEach((p) => s.players.put(p));
    s.meta.put({ key: 'seeded', value: true });
    s.meta.put({ key: 'yourName', value: SEED_PLAYERS.M });
  });
}

// ---------- routing ----------
let leaveHook = null; // a form sets this so an unsaved edit lands before the screen changes
let renderSeq = 0;
const stale = (my) => my !== renderSeq;
function paint(my, html) { if (stale(my)) return false; app.innerHTML = html; return true; }
let reloadWhenIdle = false;
let lastCat = null;
window.addEventListener('gg-new-worker', () => { reloadWhenIdle = true; });
async function render() {
  if (reloadWhenIdle) { reloadWhenIdle = false; if (leaveHook) { const h = leaveHook; leaveHook = null; await h(); } location.reload(); return; }
  const my = ++renderSeq;
  if (leaveHook) { const h = leaveHook; leaveHook = null; await h(); }
  if (stale(my)) return;
  freeUrls();
  app.onclick = null;
  window.scrollTo(0, 0);
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  try {
    if (!p.length) return await home();
    if (p[0] === 'new') return newCategory();
    if (p[0] === 'settings') return await settingsPage();
    if (p[0] !== 'c' || p[1] !== lastCat) gameQuery = '';
    lastCat = p[0] === 'c' ? p[1] : null;
    if (p[0] === 'c') {
      const cat = await db.get('categories', p[1]);
      if (!cat) return await home();
      if (p.length === 2) return await categoryPage(cat);
      if (p[2] === 'new') return newGame(cat);
      if (p[2] === 'bulk') return await bulkAddPage(cat);
    }
    if (p[0] === 'g') {
      const game = await db.get('games', p[1]);
      if (!game) return await home();
      const cat = await db.get('categories', game.categoryId);
      if (p.length === 2) return kindOf(cat) === 'scores' ? await gamePage(cat, game) : await nightsGamePage(cat, game);
      if (p[2] === 'add') return await addPlayerPage(cat, game);
      if (p[2] === 'n') {
        if (p[3] === 'new') return newNight(cat, game);
        const night = await db.get('nights', p[3]);
        if (!night || night.gameId !== game.id) return await nightsGamePage(cat, game);
        if (p[4] === 'live') return await livePage(cat, game, night, p[5] || '');
        return await nightPage(cat, game, night, p[4] || '');
      }
      if (p[2] === 'p') {
        const player = await db.get('players', p[3]);
        if (!player || player.gameId !== game.id) return await gamePage(cat, game);
        return await playerPage(cat, game, player, p[4] || '');
      }
    }
    return await home();
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="dr-body">Something went wrong: ${esc(e.message)}</p>`;
  }
}
function trail(items, backHash) {
  top.innerHTML = `${backHash != null ? '<button class="gg-top__back" aria-label="Back">←</button>' : ''}<nav class="gg-trail">${
    items.map((it, i) => (i < items.length - 1 ? `<a href="#${it.h}">${esc(it.t)}</a><i>›</i>` : `<span class="is-here">${esc(it.t)}</span>`)).join('')
  }</nav>`;
  const b = $('.gg-top__back', top);
  if (b) b.onclick = () => go(backHash);
}

// ---------- screens ----------
async function home() {
  const my = renderSeq;
  await seedIfEmpty();
  const cats = (await db.all('categories')).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const games = await db.all('games');
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }], null);
  const tiles = cats.map((c, i) => {
    const n = games.filter((g) => g.categoryId === c.id).length;
    return `<button class="dr-tile" data-go="/c/${c.id}">
      <div class="dr-cover dr-cover--type" data-tone="${tone(i)}"><span>${esc(c.name)}</span><span class="dr-badge gg-cover-badge">${plural(n, 'game')}</span></div>
      <div class="dr-tile__title">${esc(c.name)}</div>
      <div class="dr-tile__meta">${n ? plural(n, 'game') : 'Nothing in here yet'}</div>
    </button>`;
  });
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">Your games</div><h1 class="dr-title-xl">GG!</h1></div>
    ${cats.length ? `<div class="dr-shelf">${tiles.join('')}</div>`
      : '<div class="gg-empty"><p class="dr-body-lg">No games yet. Add a category, like Pinball or Tabletop games, and the games go inside it.</p></div>'}
    <div class="gg-bar">
      <button class="dr-btn" data-go="/new">Add a category</button>
      <label class="dr-btn dr-btn--ghost">Import a backup<input type="file" accept=".json,application/json" hidden id="importFile"></label>
    </div>
    <div class="gg-foot gg-bar gg-bar--between"><span>GG! · version ${APP_VERSION}</span><button class="dr-btn dr-btn--ghost dr-btn--sm" data-go="/settings">⚙ Settings &amp; help</button></div>
  </div>`)) return;
  bindGo();
  $('#importFile').onchange = (e) => importBackup(e.target.files[0]);
}

function newCategory() {
  trail([{ t: 'Home', h: '/' }, { t: 'New category' }], '/');
  app.innerHTML = `<div class="gg-stack">
    <h1 class="dr-title-xl">Add a category</h1>
    <div class="dr-field"><label for="name">What kind of games?</label><input class="dr-input" id="name" placeholder="Pinball, Tabletop games, Pickleball…" autocapitalize="words" autocomplete="off"></div>
    <div class="dr-field"><label>How do you keep score in it?</label>
      <div class="gg-kinds">
        <button class="gg-kind is-on" data-kind="scores"><b>High scores</b><span>One tile per player, their best on top. Pinball, arcade.</span></button>
        <button class="gg-kind" data-kind="nights"><b>Games played</b><span>One tile per night, who played and who won. Tabletop games.</span></button>
        <button class="gg-kind" data-kind="both"><b>Both</b><span>High scores and nights on every game; + asks which.</span></button>
      </div></div>
    <div class="gg-bar"><button class="dr-btn" id="save">Add it</button></div>
  </div>`;
  const input = $('#name'); input.focus();
  let kind = 'scores';
  $$('[data-kind]').forEach((b) => { b.onclick = () => { kind = b.dataset.kind; $$('[data-kind]').forEach((x) => x.classList.toggle('is-on', x === b)); }; });
  const save = async () => {
    const name = input.value.trim(); if (!name) { input.focus(); return; }
    const n = (await db.all('categories')).length;
    const now = Date.now();
    const c = { id: uid(), name, kind, order: n, createdAt: now, updatedAt: now };
    await db.put('categories', c);
    go(`/c/${c.id}`);
  };
  $('#save').onclick = save;
  input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
}

// Which way a category shows its games (I4): tiles by default, list as the other way. Remembered per phone.
let gameView = 'tiles';
try { gameView = localStorage.getItem('gg-view') === 'list' ? 'list' : 'tiles'; } catch { /* default tiles */ }
let gameQuery = '';
async function categoryPage(cat) {
  const my = renderSeq;
  const games = (await gamesOf(cat.id)).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  const players = await db.all('players');
  const photos = await db.all('photos');
  const nights = kindOf(cat) !== 'scores' ? await db.all('nights') : [];
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name }], '/');
  const info = (g) => {
    if (kindOf(cat) === 'nights') {
      const ns = nights.filter((n) => n.gameId === g.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const withPic = ns.find((n) => n.photoId);
      const ph = (g.photoId && photos.find((x) => x.id === g.photoId)) || (withPic ? photos.find((x) => x.id === withPic.photoId) : null);
      const meta = ns.length ? `${plural(ns.length, 'night')}${ns[0].date ? ' · last ' + fmtDate(ns[0].date) : ''}` : 'Not played yet';
      return { ps: [], lead: ns.length ? ns[0] : null, ph, meta, end: '' };
    }
    const ps = players.filter((p) => p.gameId === g.id);
    const lead = leaderOf(ps);
    const ph = (g.photoId && photos.find((x) => x.id === g.photoId)) || (lead?.best.photoId ? photos.find((x) => x.id === lead.best.photoId) : null);
    let meta = lead ? `${esc(lead.player.name)} · ${fmtScore(lead.best.value)}` : (ps.length ? 'No scores yet' : 'Nobody on it yet');
    if (kindOf(cat) === 'both') { const nn = nights.filter((n) => n.gameId === g.id).length; meta = `${lead ? meta : 'No high score'} · ${nn ? plural(nn, 'night') : 'no nights'}`; }
    return { ps, lead, ph, meta, end: ps.length ? plural(ps.length, 'player') : '' };
  };
  const tile = (g, i) => {
    const { ph, meta } = info(g);
    const face = ph ? `<img src="${photoUrl(ph)}" alt="">` : `<div class="dr-cover--type" data-tone="${tone(i)}" style="position:absolute;inset:0"><span>${esc(g.name)}</span></div>`;
    return `<button class="dr-tile" data-go="/g/${g.id}"><div class="dr-cover">${face}</div>
      <div class="dr-tile__title">${esc(g.name)}</div><div class="dr-tile__meta">${meta}</div></button>`;
  };
  const row = (g) => {
    const { lead, ph, meta, end } = info(g);
    const art = ph ? `<div class="dr-row__art dr-row__art--disc"><img src="${photoUrl(ph)}" alt=""></div>` : `<div class="gg-disc">${esc(initials(g.name))}</div>`;
    return `<div class="dr-row ${lead ? '' : 'is-empty'}" data-go="/g/${g.id}" role="button" tabindex="0" aria-label="${esc(g.name)}">${art}
      <div class="dr-row__text"><div class="dr-row__title">${esc(g.name)}</div><div class="dr-row__meta">${meta}</div></div>
      <div class="dr-row__end">${end}</div></div>`;
  };
  const listHtml = () => {
    const q = gameQuery.trim().toLowerCase();
    const shown = q ? games.filter((g) => g.name.toLowerCase().includes(q)) : games;
    if (!games.length) return `<div class="gg-empty"><p class="dr-body-lg">No games in ${esc(cat.name)} yet. Add the first one and the scores go on it.</p></div>`;
    if (!shown.length) return `<div class="gg-empty"><p class="dr-body-lg">Nothing called “${esc(gameQuery.trim())}” in ${esc(cat.name)}.</p></div>`;
    return gameView === 'list' ? `<div class="dr-list">${shown.map(row).join('')}</div>` : `<div class="dr-shelf">${shown.map((g) => tile(g, games.indexOf(g))).join('')}</div>`;
  };
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${games.length ? plural(games.length, 'game') : 'Empty so far'}</div>
      <div class="gg-titlerow"><h1 class="dr-title-xl" id="title">${esc(cat.name)}</h1><button class="gg-pencil" id="rename" aria-label="Rename the category">✎</button></div></div>
    ${games.length ? `<div class="gg-bar gg-bar--between gg-tools">
      <input class="dr-input dr-input--search gg-grow" id="search" type="search" placeholder="Find a game" value="${esc(gameQuery)}" autocomplete="off" aria-label="Find a game">
      <div class="gg-seg" role="group" aria-label="View"><button class="${gameView === 'tiles' ? 'is-on' : ''}" data-view="tiles">Tiles</button><button class="${gameView === 'list' ? 'is-on' : ''}" data-view="list">List</button></div>
    </div>` : ''}
    <div id="games">${listHtml()}</div>
    <div class="gg-bar"><button class="dr-btn" data-go="/c/${cat.id}/new">Add a game</button>${kindOf(cat) !== 'nights' && games.length ? `<button class="dr-btn dr-btn--quiet" data-go="/c/${cat.id}/bulk">Add a person’s scores</button>` : ''}${games.length ? `<button class="dr-btn dr-btn--ghost" id="share">Share the list</button>` : ''}</div>
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="kind">Keeps: ${KIND_LABEL[kindOf(cat)]} · change</button><button class="dr-btn dr-btn--ghost dr-btn--sm" id="delete">Delete ${esc(cat.name)}</button></div>
  </div>`)) return;
  bindGo();
  $('#kind').onclick = async () => {
    const k = await sheet(`What does ${cat.name} keep?`, ['scores', 'nights', 'both'].filter((x) => x !== kindOf(cat)).map((x) => ({ k: x, label: KIND_LABEL[x] })));
    if (!k) return;
    cat.kind = k; await touch('categories', cat); toast(`${cat.name} now keeps ${KIND_LABEL[k].toLowerCase()}.`); render();
  };
  const redraw = () => { freeUrls(); $('#games').innerHTML = listHtml(); bindGo(); };
  const search = $('#search');
  if (search) search.oninput = () => { gameQuery = search.value; redraw(); };
  $$('[data-view]').forEach((b) => { b.onclick = () => { gameView = b.dataset.view; try { localStorage.setItem('gg-view', gameView); } catch { /* fine */ } $$('[data-view]').forEach((x) => x.classList.toggle('is-on', x === b)); redraw(); }; });
  $('#rename').onclick = () => renameInline($('#title'), cat.name, async (v) => { cat.name = v; await touch('categories', cat); render(); });
  const shareBtn = $('#share');
  if (shareBtn) shareBtn.onclick = () => shareList(cat, games, players, nights);
  $('#delete').onclick = async () => {
    const n = games.length;
    if (!(await confirmSheet(`Delete ${cat.name}${n ? ` and its ${plural(n, 'game')}` : ''}?`, `Yes, delete ${cat.name}`))) return;
    await deleteCategory(cat); toast(`${cat.name} deleted.`); go('/');
  };
}

// A readable list of the category's games and scores, for the share sheet (I8).
async function shareList(cat, games, players, nights) {
  const me = await db.setting('yourName', '');
  const lines = [`${cat.name} — GG!`, ''];
  for (const g of games) {
    const parts = [];
    if (kindOf(cat) !== 'nights') {
      const ps = players.filter((p) => p.gameId === g.id).map((p) => ({ p, best: bestOf(p) })).filter((x) => x.best).sort((a, b) => b.best.value - a.best.value);
      parts.push(ps.length ? ps.map((x) => `${x.p.name} ${fmtScore(x.best.value)}`).join(' · ') : 'no scores yet');
    }
    if (kindOf(cat) !== 'scores') {
      const ns = nights.filter((n) => n.gameId === g.id);
      const t = totalsFor(me, ns);
      parts.push(`${plural(ns.length, 'night')}${me && t.played ? `, ${me} won ${t.won} of ${t.played}` : ''}`);
    }
    lines.push(`${g.name}: ${parts.join(' — ')}`);
  }
  lines.push('', `Sent from GG! on ${fmtDate(todayIso())}`);
  const text = lines.join('\n');
  if (navigator.share) {
    try { await navigator.share({ title: `${cat.name} — GG!`, text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); toast('List copied. Paste it anywhere.'); return; } catch { /* fall through */ }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = `${cat.name} — GG!.txt`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('List saved.');
}

// One screen to add a person and their scores across every game in the category (I8).
async function bulkAddPage(cat) {
  const my = renderSeq;
  const games = (await gamesOf(cat.id)).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  const names = await knownNames();
  const players = await db.all('players');
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: 'Add scores' }], `/c/${cat.id}`);
  let who = '';
  const bestLine = (g, name) => { const p = players.find((x) => x.gameId === g.id && sameName(x.name, name)); const b = p && bestOf(p); return b ? `has ${fmtScore(b.value)}` : ''; };
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(cat.name)}</div><h1 class="dr-title-xl">Add a person’s scores</h1>
      <p class="dr-body-sm">Fill in the games they have a score on and leave the rest blank. A game they are already on gets a new score line.</p></div>
    <div class="dr-field"><label>Whose scores?</label>
      ${names.length ? `<div class="gg-chips" id="chips">${names.map((n) => `<button class="gg-chip" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
      <input class="dr-input" id="who" placeholder="${names.length ? 'Or someone new' : 'Their name'}" autocapitalize="words" autocomplete="off"></div>
    <div class="dr-field"><label for="when">When were these set?</label><input class="dr-input" id="when" type="date"><div class="dr-field__hint">Leave it empty if you don’t know.</div></div>
    <div class="dr-list" id="rows">${games.map((g) => `<div class="gg-bulk" data-g="${g.id}"><div class="dr-row__text"><div class="dr-row__title">${esc(g.name)}</div><div class="dr-row__meta" data-has="${g.id}"></div></div><input class="dr-input gg-bulk__score" inputmode="numeric" placeholder="Score" aria-label="${esc(g.name)} score" data-score="${g.id}"></div>`).join('')}</div>
    <div class="gg-bar"><button class="dr-btn" id="save">Add the scores</button><button class="dr-btn dr-btn--ghost" data-go="/c/${cat.id}">Never mind</button></div>
  </div>`)) return;
  bindGo();
  const whoIn = $('#who');
  const setWho = (n) => { who = n.trim(); $$('[data-name]').forEach((b) => b.classList.toggle('is-on', sameName(b.dataset.name, who))); games.forEach((g) => { $(`[data-has="${g.id}"]`).textContent = who ? bestLine(g, who) : ''; }); };
  $$('[data-name]').forEach((b) => { b.onclick = () => { whoIn.value = b.dataset.name; setWho(b.dataset.name); }; });
  whoIn.oninput = () => setWho(whoIn.value);
  $$('[data-score]').forEach((inp) => { inp.oninput = () => { const n = parseScore(inp.value); inp.value = n == null ? '' : fmtScore(n); }; });
  $('#save').onclick = async () => {
    if (!who) { whoIn.focus(); toast('Whose scores are these?'); return; }
    const date = $('#when').value || '';
    const now = Date.now();
    let added = 0;
    for (const g of games) {
      const v = parseScore($(`[data-score="${g.id}"]`).value);
      if (v == null) continue;
      let p = (await playersOf(g.id)).find((x) => sameName(x.name, who));
      if (!p) p = { id: uid(), gameId: g.id, name: who, order: (await playersOf(g.id)).length, createdAt: now, updatedAt: now, scores: [] };
      p.scores.push({ id: uid(), value: v, date, where: '', photoId: null, createdAt: now });
      await touch('players', p);
      added += 1;
    }
    if (!added) { toast('No scores filled in yet.'); return; }
    toast(`Added ${plural(added, 'score')} for ${who}.`);
    go(`/c/${cat.id}`);
  };
}

function newGame(cat) {
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: 'New game' }], `/c/${cat.id}`);
  app.innerHTML = `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(cat.name)}</div><h1 class="dr-title-xl">Add a game</h1></div>
    <div class="dr-field"><label for="name">What is it called?</label><input class="dr-input" id="name" placeholder="${esc(cat.name === 'Pinball' ? 'The cabinet, like Deadpool' : 'The game')}" autocapitalize="words" autocomplete="off"></div>
    <div class="gg-bar"><button class="dr-btn" id="save">Add it</button></div>
  </div>`;
  const input = $('#name'); input.focus();
  const save = async () => {
    const name = input.value.trim(); if (!name) { input.focus(); return; }
    const n = (await gamesOf(cat.id)).length;
    const now = Date.now();
    const g = { id: uid(), categoryId: cat.id, name, order: n, createdAt: now, updatedAt: now };
    await db.put('games', g);
    go(`/g/${g.id}`);
  };
  $('#save').onclick = save;
  input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
}

async function gamePage(cat, game) {
  const my = renderSeq;
  const players = await playersOf(game.id);
  const photos = await db.where('photos', 'gameId', game.id);
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name }], `/c/${cat.id}`);
  const lead = leaderOf(players);
  const pic = (id) => (id ? photos.find((x) => x.id === id) : null);
  const gamePic = pic(game.photoId);
  const when = (s) => [s.date ? fmtDate(s.date) : '', s.where].filter(Boolean).join(' · ');
  const ranked = players.map((p) => ({ p, best: bestOf(p) })).sort((a, b) => (b.best?.value ?? -1) - (a.best?.value ?? -1));
  const tiles = ranked.map(({ p, best }, i) => {
    const ph = best ? pic(best.photoId) : null;
    const face = ph ? `<img src="${photoUrl(ph)}" alt="">` : `<div class="dr-cover--type" data-tone="${tone(players.indexOf(p))}" style="position:absolute;inset:0"><span>${esc(p.name)}</span></div>`;
    return `<button class="dr-tile" data-go="/g/${game.id}/p/${p.id}">
      <div class="dr-cover">${face}${best ? `<span class="gg-cover-rank">#${i + 1}</span>` : ''}</div>
      <div class="dr-tile__title">${esc(p.name)}</div>
      <div class="dr-tile__meta">${best ? `${fmtScore(best.value)}${best.date ? ' · ' + fmtDate(best.date) : ''}` : 'No score yet'}</div>
    </button>`;
  });
  // Score photos on this game, to offer as the game's picture.
  const scorePics = [];
  for (const p of players) for (const s of p.scores || []) if (s.photoId && pic(s.photoId)) scorePics.push({ k: s.photoId, label: `Use ${p.name}’s ${fmtScore(s.value)} photo` });
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(cat.name)}</div>
      <div class="gg-titlerow"><h1 class="dr-title-xl" id="title">${esc(game.name)}</h1><button class="gg-pencil" id="rename" aria-label="Rename the game">✎</button></div></div>
    ${gamePicHtml(game, gamePic)}
    ${lead ? `<section class="dr-panel gg-hero">
      <div class="dr-eyebrow">High score</div>
      <div class="dr-big-number">${fmtScore(lead.best.value)}</div>
      <div class="gg-hero__who">${esc(lead.player.name)}</div>
      ${when(lead.best) ? `<div class="dr-body-sm">${esc(when(lead.best))}</div>` : ''}
    </section>` : ''}
    ${players.length ? `<div class="dr-shelf">${tiles.join('')}</div>`
      : `<div class="gg-empty"><p class="dr-body-lg">Nobody on ${esc(game.name)} yet. Tap + to add a player and their score.</p></div>`}
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="delete">Delete ${esc(game.name)}</button></div>
  </div>
  <button class="dr-btn dr-btn--icon gg-fab" data-go="/g/${game.id}/add" aria-label="Add a player">+</button>`)) return;
  bindGo();
  $('#rename').onclick = () => renameInline($('#title'), game.name, async (v) => { game.name = v; await touch('games', game); render(); });
  bindGamePic(game, gamePic, scorePics);
  $('#delete').onclick = async () => {
    if (!(await confirmSheet(`Delete ${game.name} and everyone’s scores on it?`, `Yes, delete ${game.name}`))) return;
    await deleteGame(game); toast(`${game.name} deleted.`); go(`/c/${cat.id}`);
  };
}

// The game's own picture (I4): a slot at the top of its page, set from the library or from a photo already on the game.
function gamePicHtml(game, gamePic) {
  const label = gamePic ? `Change the picture of ${esc(game.name)}` : `Add a picture of ${esc(game.name)}`;
  const face = gamePic ? `<img src="${photoUrl(gamePic)}" alt="">` : `<span class="gg-gamepic__empty"><span style="font-size:36px">🖼️</span><b>Add a picture of ${esc(game.name)}</b><span class="dr-caption">It shows here and on the tile.</span></span>`;
  return `<button class="dr-cover gg-gamepic ${gamePic ? 'has-picture' : ''}" id="gamePic" aria-label="${label}">${face}</button>
    <input type="file" accept="image/*" id="gamePicIn" hidden aria-label="Picture of the game">`;
}
function bindGamePic(game, gamePic, otherPics) {
  const picIn = $('#gamePicIn');
  // A picture of its own is deleted when replaced; a photo that belongs to a score or a night is only pointed at.
  const ownedPic = () => (game.photoId && !otherPics.some((x) => x.k === game.photoId) ? game.photoId : null);
  const setPic = async (photoId) => { const old = ownedPic(); game.photoId = photoId; await touch('games', game); if (old && old !== photoId) await db.del('photos', old); render(); };
  picIn.onchange = async () => {
    const f = picIn.files[0]; if (!f) return;
    const shrunk = await shrink(f);
    const ph = { id: uid(), gameId: game.id, blob: shrunk.blob, w: shrunk.w, h: shrunk.h, bytes: shrunk.blob.size, createdAt: Date.now() };
    await db.put('photos', ph);
    await setPic(ph.id);
    toast(`Picture added to ${game.name}.`);
  };
  $('#gamePic').onclick = async () => {
    if (!otherPics.length && !gamePic) { picIn.click(); return; }
    const choices = [{ k: 'library', label: 'From your photos' }, ...otherPics.filter((x) => x.k !== game.photoId)];
    if (gamePic) choices.push({ k: 'none', label: 'Remove the picture', danger: true });
    const k = await sheet(`A picture of ${game.name}`, choices);
    if (!k) return;
    if (k === 'library') { picIn.click(); return; }
    if (k === 'none') { await setPic(null); toast('Picture removed.'); return; }
    await setPic(k); toast(`Picture set for ${game.name}.`);
  };
}

// ---------- games played (I6): a tabletop game's page is its nights ----------
const shortDate = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Undated');
const joinNames = (arr) => (arr.length <= 1 ? arr.join('') : arr.length === 2 ? `${arr[0]} and ${arr[1]}` : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
// One line for a night: who played and who won, across its rounds.
function nightLine(n) {
  const rounds = n.rounds || [];
  if (n.live) return `<b style="color:var(--accent)">Live now</b>${rounds.length ? ' · ' + plural(rounds.length, 'round') + ' done' : ''}`;
  if (!rounds.length) return 'Nothing in it yet';
  const names = []; rounds.forEach((r) => (r.players || []).forEach((p) => { if (!names.some((x) => sameName(x, p.name))) names.push(p.name); }));
  if (rounds.length === 1) { const w = winnersOf(rounds[0]); return `${esc(names.join(', '))}${w.length ? ' · ' + esc(joinNames(w)) + ' won' : ''}`; }
  const wins = {}; rounds.forEach((r) => winnersOf(r).forEach((w) => { wins[w] = (wins[w] || 0) + 1; }));
  const tally = Object.entries(wins).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} ${v}`).join(', ');
  return `${plural(rounds.length, 'round')}${tally ? ' · ' + tally : ''}`;
}
async function nightsGamePage(cat, game) {
  const my = renderSeq;
  const both = kindOf(cat) === 'both';
  const nights = await nightsOf(game.id);
  const photos = await db.where('photos', 'gameId', game.id);
  const me = await db.setting('yourName', '');
  const players = both ? await playersOf(game.id) : [];
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name }], `/c/${cat.id}`);
  const pic = (id) => (id ? photos.find((x) => x.id === id) : null);
  const gamePic = pic(game.photoId);
  const t = totalsFor(me, nights);
  const nightPics = nights.filter((n) => n.photoId && pic(n.photoId)).map((n) => ({ k: n.photoId, label: `Use the ${shortDate(n.date)} photo` }));
  // In a "both" category the high scores sit above the nights (I10).
  const lead = both ? leaderOf(players) : null;
  for (const p of players) for (const sc of p.scores || []) if (sc.photoId && pic(sc.photoId)) nightPics.push({ k: sc.photoId, label: `Use ${p.name}’s ${fmtScore(sc.value)} photo` });
  const when = (sc) => [sc.date ? fmtDate(sc.date) : '', sc.where].filter(Boolean).join(' · ');
  const ranked = players.map((p) => ({ p, best: bestOf(p) })).sort((a, b) => (b.best?.value ?? -1) - (a.best?.value ?? -1));
  const playerTiles = ranked.map(({ p, best }, i) => {
    const ph = best ? pic(best.photoId) : null;
    const face = ph ? `<img src="${photoUrl(ph)}" alt="">` : `<div class="dr-cover--type" data-tone="${tone(players.indexOf(p))}" style="position:absolute;inset:0"><span>${esc(p.name)}</span></div>`;
    return `<button class="dr-tile" data-go="/g/${game.id}/p/${p.id}"><div class="dr-cover">${face}${best ? `<span class="gg-cover-rank">#${i + 1}</span>` : ''}</div>
      <div class="dr-tile__title">${esc(p.name)}</div><div class="dr-tile__meta">${best ? `${fmtScore(best.value)}${best.date ? ' · ' + fmtDate(best.date) : ''}` : 'No score yet'}</div></button>`;
  });
  const scoresHtml = !both ? '' : `${lead ? `<section class="dr-panel gg-hero"><div class="dr-eyebrow">High score</div><div class="dr-big-number">${fmtScore(lead.best.value)}</div><div class="gg-hero__who">${esc(lead.player.name)}</div>${when(lead.best) ? `<div class="dr-body-sm">${esc(when(lead.best))}</div>` : ''}</section>` : ''}
    ${players.length ? `<div class="dr-shelf">${playerTiles.join('')}</div>` : `<p class="dr-body-sm">No high scores on ${esc(game.name)} yet. Tap + and choose a high score.</p>`}`;
  const tiles = nights.map((n, i) => {
    const ph = pic(n.photoId);
    const face = ph ? `<img src="${photoUrl(ph)}" alt="">` : `<div class="dr-cover--type" data-tone="${tone(i)}" style="position:absolute;inset:0"><span>${esc(shortDate(n.date))}</span></div>`;
    return `<button class="dr-tile" data-go="/g/${game.id}/n/${n.id}"><div class="dr-cover">${face}</div>
      <div class="dr-tile__title">${esc(n.date ? fmtDate(n.date) : 'Undated')}</div><div class="dr-tile__meta">${nightLine(n)}</div></button>`;
  });
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(cat.name)}</div>
      <div class="gg-titlerow"><h1 class="dr-title-xl" id="title">${esc(game.name)}</h1><button class="gg-pencil" id="rename" aria-label="Rename the game">✎</button></div></div>
    ${gamePicHtml(game, gamePic)}
    ${scoresHtml}
    <section class="dr-panel gg-stack gg-stack--tight">
      <div class="dr-eyebrow">${me ? esc(me) + ' on ' + esc(game.name) : 'Your ' + esc(game.name)}${both ? ' · nights' : ''}</div>
      ${me ? `<div class="${both ? 'dr-heading' : 'dr-big-number'}">${t.won} <small>won of ${t.played}</small></div>
      <div class="gg-totals">
        <div><b>${t.played}</b><span>${t.played === 1 ? 'game' : 'games'} played</span></div>
        <div><b>${t.nights}</b><span>${t.nights === 1 ? 'night' : 'nights'}</span></div>
        <div><b>${t.best != null ? fmtScore(t.best) : '–'}</b><span>best winning score</span></div>
        <div><b>${t.people.size}</b><span>${t.people.size === 1 ? 'person' : 'people'} played with</span></div>
      </div>` : '<p class="dr-body-sm">Put your name in Settings &amp; help and your totals show here.</p>'}
      <div class="dr-field"><label for="howto">How scoring works</label><textarea class="dr-textarea dr-input" id="howto" rows="2" placeholder="Only if it needs saying: highest total wins, lowest wins, first to 10…">${esc(game.howToScore || '')}</textarea></div>
    </section>
    ${nights.length ? `<div class="dr-shelf">${tiles.join('')}</div>`
      : `<div class="gg-empty"><p class="dr-body-lg">No nights on ${esc(game.name)} yet. Tap + the next time you play.</p></div>`}
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="delete">Delete ${esc(game.name)}</button></div>
  </div>
  <button class="dr-btn dr-btn--icon gg-fab" ${both ? 'id="fab"' : `data-go="/g/${game.id}/n/new"`} aria-label="Add">+</button>`)) return;
  bindGo();
  if (both) $('#fab').onclick = async () => {
    const k = await sheet(`Add to ${game.name}`, [{ k: 'score', label: 'A high score' }, { k: 'night', label: 'A night we played' }]);
    if (k === 'score') go(`/g/${game.id}/add`); else if (k === 'night') go(`/g/${game.id}/n/new`);
  };
  $('#rename').onclick = () => renameInline($('#title'), game.name, async (v) => { game.name = v; await touch('games', game); render(); });
  bindGamePic(game, gamePic, nightPics);
  const howto = $('#howto');
  let timer; howto.oninput = () => { clearTimeout(timer); timer = setTimeout(async () => { game.howToScore = howto.value.trim(); await touch('games', game); }, 400); };
  leaveHook = async () => { clearTimeout(timer); if ((game.howToScore || '') !== howto.value.trim()) { game.howToScore = howto.value.trim(); await touch('games', game); } };
  $('#delete').onclick = async () => {
    if (!(await confirmSheet(`Delete ${game.name} and everything on it?`, `Yes, delete ${game.name}`))) return;
    await deleteGame(game); toast(`${game.name} deleted.`); go(`/c/${cat.id}`);
  };
}

function newNight(cat, game) {
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name, h: `/g/${game.id}` }, { t: 'New night' }], `/g/${game.id}`);
  app.innerHTML = `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(game.name)}</div><h1 class="dr-title-xl">When did you play?</h1></div>
    <div class="gg-fields gg-fields--two">
      <div class="dr-field"><label for="date">When</label><input class="dr-input" id="date" type="date" value="${todayIso()}"></div>
      <div class="dr-field"><label for="where">Where <span class="gg-opt">optional</span></label><input class="dr-input" id="where" placeholder="Whose place, which bar…" autocapitalize="words" autocomplete="off"></div>
    </div>
    <div class="gg-bar"><button class="dr-btn" id="live">Score it live</button><button class="dr-btn dr-btn--quiet" id="save">Write it down after</button></div>
    <div class="dr-field__hint">Live keeps the points as they happen and saves the round when you finish.</div>
  </div>`;
  const make = async () => {
    const now = Date.now();
    const n = { id: uid(), gameId: game.id, date: $('#date').value || '', where: $('#where').value.trim(), photoId: null, rounds: [], createdAt: now, updatedAt: now };
    await db.put('nights', n);
    return n;
  };
  $('#save').onclick = async () => { const n = await make(); go(`/g/${game.id}/n/${n.id}/new`); };
  $('#live').onclick = async () => { const n = await make(); go(`/g/${game.id}/n/${n.id}/live`); };
}

// A night, opened: its rounds, and the form for a new or edited round.
async function nightPage(cat, game, night, mode) {
  const my = renderSeq;
  const photos = await db.where('photos', 'gameId', game.id);
  const known = await knownNames();
  const allNights = mode === 'new' && !(night.rounds || []).length ? await nightsOf(game.id) : [];
  if (stale(my)) return;
  night.rounds = night.rounds || [];
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name, h: `/g/${game.id}` }, { t: shortDate(night.date) }], `/g/${game.id}`);
  const photo = night.photoId ? photos.find((x) => x.id === night.photoId) : null;
  let editing = null;
  if (mode === 'new') {
    // Start the new round with the people from the last round played: this night's, or the game's latest.
    const prev = night.rounds[night.rounds.length - 1] || allNights.flatMap((n) => n.rounds || []).slice(-1)[0];
    editing = { id: null, players: (prev?.players || []).map((p) => ({ name: p.name, score: null })), winners: [] };
  } else if (mode.startsWith('r:')) editing = night.rounds.find((r) => r.id === mode.slice(2)) || null;
  const rows = night.rounds.map((r, i) => {
    const w = winnersOf(r);
    const line = (r.players || []).map((p) => `${esc(p.name)}${p.score != null ? ' ' + fmtScore(p.score) : ''}`).join(' · ');
    return `<div class="dr-row" data-go="/g/${game.id}/n/${night.id}/r:${r.id}" role="button" tabindex="0"><div class="gg-disc">${i + 1}</div>
      <div class="dr-row__text"><div class="dr-row__title">${w.length ? esc(joinNames(w)) + ' won' : 'No winner marked'}</div><div class="dr-row__meta">${line || 'Nobody listed'}</div></div>
      <div class="dr-row__end"></div></div>`;
  });
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(game.name)}</div><h1 class="dr-title-xl">${esc(night.date ? fmtDate(night.date) : 'Undated night')}</h1></div>
    <div class="gg-photo ${photo ? 'has-picture' : ''}" id="photoBox">${photo ? `<img src="${photoUrl(photo)}" alt="">` : '<div class="gg-photo__empty"><span style="font-size:40px">🖼️</span><b>Add a picture</b><span class="dr-caption">The table, the board, the faces.</span></div>'}<input type="file" accept="image/*" id="photoIn" aria-label="Picture of the night"></div>
    <div class="gg-fields gg-fields--two">
      <div class="dr-field"><label for="date">When</label><input class="dr-input" id="date" type="date" value="${esc(night.date || '')}"></div>
      <div class="dr-field"><label for="where">Where <span class="gg-opt">optional</span></label><input class="dr-input" id="where" value="${esc(night.where || '')}" placeholder="Whose place, which bar…" autocapitalize="words" autocomplete="off"></div>
    </div>
    ${editing ? roundForm(editing, night.rounds.indexOf(editing) + 1 || night.rounds.length + 1, known) : ''}
    ${night.live ? `<section class="dr-panel gg-bar gg-bar--between"><div><div class="dr-eyebrow">Live now</div><div class="dr-body">${esc(night.live.players.map((p) => `${p.name} ${fmtScore(p.total)}`).join(' · '))}</div></div><button class="dr-btn" data-go="/g/${game.id}/n/${night.id}/live">Back to the board</button></section>` : ''}
    ${!editing && !night.live ? `<div class="gg-bar"><button class="dr-btn" data-go="/g/${game.id}/n/${night.id}/live">Score ${night.rounds.length ? 'the next' : 'the'} round live</button><button class="dr-btn dr-btn--quiet" data-go="/g/${game.id}/n/${night.id}/new">Write it down</button></div>` : ''}
    ${rows.length ? `<div><div class="dr-eyebrow">${plural(rows.length, 'round')}</div><div class="dr-list">${rows.join('')}</div></div>` : ''}
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="remove">Delete this night</button></div>
  </div>`)) return;
  bindGo();
  const dateIn = $('#date'), whereIn = $('#where');
  dateIn.onchange = async () => { night.date = dateIn.value || ''; await touch('nights', night); };
  let wt; whereIn.oninput = () => { clearTimeout(wt); wt = setTimeout(async () => { night.where = whereIn.value.trim(); await touch('nights', night); }, 400); };
  const photoIn = $('#photoIn');
  photoIn.onchange = async () => {
    const f = photoIn.files[0]; if (!f) return;
    const shrunk = await shrink(f);
    if (night.photoId && night.photoId !== game.photoId) await db.del('photos', night.photoId);
    const ph = { id: uid(), gameId: game.id, blob: shrunk.blob, w: shrunk.w, h: shrunk.h, bytes: shrunk.blob.size, createdAt: Date.now() };
    await db.put('photos', ph); night.photoId = ph.id; await touch('nights', night); render();
  };
  $('#remove').onclick = async () => {
    if (!(await confirmSheet(`Delete the ${shortDate(night.date)} night, rounds and all?`, 'Yes, delete it'))) return;
    await deleteNight(night, game); toast('Night deleted.'); go(`/g/${game.id}`);
  };
  if (editing) bindRoundForm(game, night, editing, known);
}

// ---------- live scoring (I7): the points as they happen, then the round lands on the night ----------
const leadersOf = (live) => {
  const tot = live.players.map((p) => p.total);
  if (!tot.length) return [];
  const best = live.winBy === 'low' ? Math.min(...tot) : Math.max(...tot);
  return live.players.filter((p) => p.total === best).map((p) => p.name);
};
async function livePage(cat, game, night, mode) {
  const my = renderSeq;
  const known = await knownNames();
  const allNights = await nightsOf(game.id);
  if (stale(my)) return;
  night.rounds = night.rounds || [];
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name, h: `/g/${game.id}` }, { t: shortDate(night.date), h: `/g/${game.id}/n/${night.id}` }, { t: 'Live' }], `/g/${game.id}/n/${night.id}`);
  if (!night.live || mode === 'setup') return liveSetup(cat, game, night, known, allNights, my);
  const live = night.live;
  const leaders = leadersOf(live);
  const status = [live.winBy === 'low' ? 'Lowest wins' : 'Highest wins', live.target ? `playing to ${fmtScore(live.target)}` : '', live.rounds ? `round ${live.round} of ${live.rounds}` : ''].filter(Boolean).join(' · ');
  const cards = live.players.map((p, i) => `<section class="dr-panel gg-lp ${leaders.includes(p.name) && live.players.length > 1 ? 'is-leading' : ''}" data-i="${i}">
      <div class="gg-lp__head"><span class="gg-lp__name">${esc(p.name)}</span>${leaders.includes(p.name) && live.players.length > 1 ? '<span class="dr-badge dr-badge--accent">Leading</span>' : ''}</div>
      <div class="gg-lp__total">${fmtScore(p.total)}</div>
      <div class="gg-lp__btns"><span class="gg-lp__more"><input class="dr-input" inputmode="decimal" placeholder="This turn" aria-label="Points for ${esc(p.name)} this turn" data-more="${i}"><button class="dr-btn gg-lp__add" data-addmore="${i}">Add</button></span>
        <button class="dr-btn dr-btn--quiet dr-btn--sm" data-add="${i}" data-n="-1" aria-label="Take a point from ${esc(p.name)}">−1</button><button class="dr-btn dr-btn--quiet dr-btn--sm" data-add="${i}" data-n="1" aria-label="A point for ${esc(p.name)}">+1</button></div>
    </section>`);
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">Live · ${esc(game.name)}</div><h1 class="dr-title-xl">${esc(night.date ? fmtDate(night.date) : 'Tonight')}</h1>
      <div class="gg-bar gg-bar--between"><span class="dr-body-sm">${esc(status)}</span><button class="dr-btn dr-btn--ghost dr-btn--sm" data-go="/g/${game.id}/n/${night.id}/live/setup">Change</button></div></div>
    <div class="gg-stack gg-stack--tight" id="board">${cards.join('')}</div>
    ${live.log.length ? `<section class="dr-panel gg-stack gg-stack--tight"><div class="dr-eyebrow">The sheet</div>
      <div class="gg-sheetwrap"><table class="gg-sheet"><thead><tr><th></th>${live.players.map((p) => `<th>${esc(p.name)}</th>`).join('')}</tr></thead>
      <tbody>${live.log.map((e, n) => `<tr><td>${live.rounds ? `R${e.round} · ` : ''}${n + 1}</td>${live.players.map((p, i) => `<td class="${i === e.i ? 'is-hit' : ''}">${i === e.i ? (e.n > 0 ? '+' : '') + fmtScore(e.n) : ''}</td>`).join('')}</tr>`).join('')}</tbody>
      <tfoot><tr><td>Total</td>${live.players.map((p) => `<td>${fmtScore(p.total)}</td>`).join('')}</tr></tfoot></table></div></section>` : ''}
    <div class="gg-bar">
      ${live.rounds ? `<button class="dr-btn dr-btn--quiet" id="nextRound">${live.round >= live.rounds ? 'Last round done' : 'Next round'}</button>` : ''}
      <button class="dr-btn dr-btn--quiet" id="undo" ${live.log.length ? '' : 'disabled'}>Undo</button>
      <button class="dr-btn" id="finish">Finish the game</button>
    </div>
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="abandon">Throw this one away</button></div>
  </div>`)) return;
  bindGo();
  const save = async () => { await touch('nights', night); };
  const add = async (i, n) => {
    if (!Number.isFinite(n) || n === 0) return;
    const p = live.players[i];
    p.total += n; live.log.push({ i, n, round: live.round, at: Date.now() });
    await save();
    if (live.target && n > 0 && p.total >= live.target && p.total - n < live.target) toast(`${p.name} reached ${fmtScore(live.target)}.`);
    render();
  };
  $$('[data-add]').forEach((b) => { b.onclick = () => add(Number(b.dataset.add), Number(b.dataset.n)); });
  $$('[data-addmore]').forEach((b) => { b.onclick = () => { const inp = $(`[data-more="${b.dataset.addmore}"]`); const n = parseScore(inp.value); if (n == null) { inp.focus(); return; } add(Number(b.dataset.addmore), n); }; });
  $$('[data-more]').forEach((inp) => { inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); $(`[data-addmore="${inp.dataset.more}"]`).click(); } }; });
  $('#undo').onclick = async () => { const last = live.log.pop(); if (!last) return; live.players[last.i].total -= last.n; if (last.round != null) live.round = last.round; await save(); render(); };
  const nr = $('#nextRound');
  if (nr) nr.onclick = async () => { if (live.round >= live.rounds) { toast('That was the last round. Finish the game when you’re ready.'); return; } live.round += 1; await save(); render(); };
  $('#finish').onclick = async () => {
    const w = leadersOf(live);
    const top = live.players.find((p) => p.name === w[0]);
    const k = await sheet(w.length === live.players.length && live.players.length > 1 ? 'All level. Who won?' : `${joinNames(w)} ${w.length === 1 ? 'wins' : 'win'} with ${fmtScore(top?.total ?? 0)}`, [
      { k: 'save', label: w.length === live.players.length && live.players.length > 1 ? 'Save it as a draw' : `Save: ${joinNames(w)} won` },
      { k: 'pick', label: 'Pick the winner myself' },
    ]);
    if (!k) return;
    let winners = w;
    if (k === 'pick') {
      const who = await sheet('Who won?', live.players.map((p) => ({ k: p.name, label: p.name })));
      if (!who) return;
      winners = [who];
    }
    const r = { id: uid(), players: live.players.map((p) => ({ name: p.name, score: p.total })), winners, live: { winBy: live.winBy, target: live.target, rounds: live.rounds }, createdAt: Date.now() };
    night.rounds.push(r); delete night.live;
    await save();
    toast(`${joinNames(winners)} won.`);
    go(`/g/${game.id}/n/${night.id}`);
  };
  $('#abandon').onclick = async () => {
    if (!(await confirmSheet('Throw this live round away? The points go with it.', 'Yes, throw it away'))) return;
    delete night.live; await save(); go(`/g/${game.id}/n/${night.id}`);
  };
}
// Setting up (or changing) a live round: who is playing, who wins, and whether there is a target or a number of rounds.
function liveSetup(cat, game, night, known, allNights, my) {
  const live = night.live;
  const prev = night.rounds[night.rounds.length - 1] || allNights.flatMap((n) => n.rounds || []).slice(-1)[0];
  const players = live ? live.players.map((p) => p.name) : (prev?.players || []).map((p) => p.name);
  const draft = { players, winBy: live?.winBy || game.winBy || 'high', target: live?.target ?? null, rounds: live?.rounds ?? null };
  const chipsHtml = () => known.filter((n) => !draft.players.some((p) => sameName(p, n))).map((n) => `<button class="gg-chip" data-name="${esc(n)}">+ ${esc(n)}</button>`).join('');
  const listHtml = () => draft.players.map((n, i) => `<span class="gg-chip is-on">${esc(n)} <button class="gg-chip__x" data-drop="${i}" aria-label="Take ${esc(n)} out">×</button></span>`).join('') || '<span class="dr-body-sm">Nobody yet. Tap a name below or type one.</span>';
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">Live · ${esc(game.name)}</div><h1 class="dr-title-xl">${live ? 'Change the game' : 'Who’s playing?'}</h1></div>
    <div class="gg-chips" id="list">${listHtml()}</div>
    <div class="gg-chips" id="chips">${chipsHtml()}</div>
    <div class="gg-bar"><input class="dr-input gg-grow" id="newName" placeholder="Someone else" autocapitalize="words" autocomplete="off"><button class="dr-btn dr-btn--quiet dr-btn--sm" id="addName">Add</button></div>
    <div class="dr-field"><label>Who wins?</label><div class="gg-seg" role="group"><button class="${draft.winBy === 'high' ? 'is-on' : ''}" data-winby="high">Highest score</button><button class="${draft.winBy === 'low' ? 'is-on' : ''}" data-winby="low">Lowest score</button></div></div>
    <div class="gg-fields gg-fields--two">
      <div class="dr-field"><label for="target">Playing to</label><input class="dr-input" id="target" inputmode="numeric" placeholder="Leave empty to end it yourself" value="${draft.target ?? ''}"><div class="dr-field__hint">A nudge when someone gets there; you still say when it’s over.</div></div>
      <div class="dr-field"><label for="rounds">Rounds</label><input class="dr-input" id="rounds" inputmode="numeric" placeholder="If it’s played in rounds" value="${draft.rounds ?? ''}"><div class="dr-field__hint">Points add up across them.</div></div>
    </div>
    <div class="gg-bar"><button class="dr-btn" id="start">${live ? 'Back to the board' : 'Start'}</button><button class="dr-btn dr-btn--ghost" data-go="/g/${game.id}/n/${night.id}${live ? '/live' : ''}">Never mind</button></div>
  </div>`)) return;
  bindGo();
  const redraw = () => { $('#list').innerHTML = listHtml(); $('#chips').innerHTML = chipsHtml(); bind(); };
  const add = (name) => { name = name.trim(); if (!name || draft.players.some((p) => sameName(p, name))) return; draft.players.push(name); redraw(); };
  const bind = () => {
    $$('[data-name]').forEach((b) => { b.onclick = () => add(b.dataset.name); });
    $$('[data-drop]').forEach((b) => { b.onclick = () => { draft.players.splice(Number(b.dataset.drop), 1); redraw(); }; });
  };
  bind();
  $$('[data-winby]').forEach((b) => { b.onclick = () => { draft.winBy = b.dataset.winby; $$('[data-winby]').forEach((x) => x.classList.toggle('is-on', x === b)); }; });
  const newName = $('#newName');
  $('#addName').onclick = () => { add(newName.value); newName.value = ''; newName.focus(); };
  newName.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(newName.value); newName.value = ''; } };
  $('#start').onclick = async () => {
    if (!draft.players.length) { toast('Who’s playing? Add at least one name.'); newName.focus(); return; }
    const num = (v) => { const n = parseScore(v); return n != null && n > 0 ? n : null; };
    draft.target = num($('#target').value); draft.rounds = num($('#rounds').value);
    const old = live?.players || [];
    night.live = { players: draft.players.map((n) => ({ name: n, total: old.find((p) => sameName(p.name, n))?.total || 0 })), winBy: draft.winBy, target: draft.target, rounds: draft.rounds, round: Math.min(live?.round || 1, draft.rounds || Infinity), log: (live?.log || []).filter((e) => e.i < draft.players.length), startedAt: live?.startedAt || Date.now() };
    game.winBy = draft.winBy; await touch('games', game);
    await touch('nights', night);
    go(`/g/${game.id}/n/${night.id}/live`);
  };
}

function roundForm(r, number, known) {
  const inRound = (n) => r.players.some((p) => sameName(p.name, n));
  const chips = known.filter((n) => !inRound(n));
  return `<section class="dr-panel gg-stack gg-stack--tight" id="form">
    <div class="dr-eyebrow">${r.id ? `Round ${number}` : `Round ${number}, new`}</div>
    <div class="gg-players" id="players">${r.players.map((p, i) => playerRow(p, i, r)).join('')}</div>
    ${chips.length ? `<div class="gg-chips" id="chips">${chips.map((n) => `<button class="gg-chip" data-name="${esc(n)}">+ ${esc(n)}</button>`).join('')}</div>` : ''}
    <div class="gg-bar"><input class="dr-input gg-grow" id="newName" placeholder="Someone else" autocapitalize="words" autocomplete="off"><button class="dr-btn dr-btn--quiet dr-btn--sm" id="addName">Add</button></div>
    <div class="dr-field__hint">Scores are optional. Mark who won, or leave it and the highest score wins.</div>
    <div class="gg-bar gg-bar--between"><div class="gg-bar">
      <button class="dr-btn" id="save">${r.id ? 'Save' : 'Add this round'}</button>
      <button class="dr-btn dr-btn--ghost" id="cancel">${r.id ? 'Done' : 'Never mind'}</button></div>
      ${r.id ? '<button class="dr-btn dr-btn--ghost dr-btn--sm" id="removeRound">Remove this round</button>' : ''}
    </div>
  </section>`;
}
function playerRow(p, i, r) {
  const won = (r.winners || []).some((w) => sameName(w, p.name));
  return `<div class="gg-prow" data-i="${i}">
    <span class="gg-prow__name">${esc(p.name)}</span>
    <input class="dr-input gg-prow__score" inputmode="decimal" placeholder="Score" value="${p.score != null ? fmtScore(p.score) : ''}" aria-label="${esc(p.name)}'s score">
    <button class="gg-chip gg-prow__won ${won ? 'is-on' : ''}" data-won="${i}" aria-pressed="${won}">Won</button>
    <button class="gg-x" data-drop="${i}" aria-label="Take ${esc(p.name)} out">×</button>
  </div>`;
}
function bindRoundForm(game, night, r, known) {
  const back = () => go(`/g/${game.id}/n/${night.id}`);
  // The form keeps its own copy until Save; players and winners live in r.
  const redraw = () => { $('#players').innerHTML = r.players.map((p, i) => playerRow(p, i, r)).join(''); const chips = $('#chips'); if (chips) chips.innerHTML = known.filter((n) => !r.players.some((p) => sameName(p.name, n))).map((n) => `<button class="gg-chip" data-name="${esc(n)}">+ ${esc(n)}</button>`).join(''); bind(); };
  const readScores = () => $$('.gg-prow').forEach((row) => { const i = Number(row.dataset.i); r.players[i].score = parseScore($('.gg-prow__score', row).value); });
  const add = (name) => { name = name.trim(); if (!name || r.players.some((p) => sameName(p.name, name))) return; readScores(); r.players.push({ name, score: null }); redraw(); };
  const bind = () => {
    $$('[data-name]').forEach((b) => { b.onclick = () => add(b.dataset.name); });
    $$('[data-won]').forEach((b) => { b.onclick = () => { readScores(); const name = r.players[Number(b.dataset.won)].name; r.winners = (r.winners || []).some((w) => sameName(w, name)) ? r.winners.filter((w) => !sameName(w, name)) : [...(r.winners || []), name]; redraw(); }; });
    $$('[data-drop]').forEach((b) => { b.onclick = () => { readScores(); const [gone] = r.players.splice(Number(b.dataset.drop), 1); r.winners = (r.winners || []).filter((w) => !sameName(w, gone.name)); redraw(); }; });
  };
  bind();
  const newName = $('#newName');
  $('#addName').onclick = () => { add(newName.value); newName.value = ''; newName.focus(); };
  newName.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(newName.value); newName.value = ''; } };
  $('#cancel').onclick = back;
  $('#save').onclick = async () => {
    readScores();
    if (!r.players.length) { toast('Who played? Add at least one name.'); newName.focus(); return; }
    r.winners = (r.winners || []).filter((w) => r.players.some((p) => sameName(p.name, w)));
    if (!r.id) { r.id = uid(); r.createdAt = Date.now(); night.rounds.push(r); }
    await touch('nights', night);
    const w = winnersOf(r);
    toast(w.length ? `${joinNames(w)} won.` : 'Round saved.');
    back();
  };
  const rm = $('#removeRound');
  if (rm) rm.onclick = async () => {
    if (!(await confirmSheet('Remove this round?', 'Yes, remove it'))) return;
    night.rounds = night.rounds.filter((x) => x.id !== r.id);
    await touch('nights', night);
    back();
  };
}

async function addPlayerPage(cat, game) {
  const my = renderSeq;
  const here = (await playersOf(game.id)).map((p) => p.name.toLowerCase());
  const names = (await knownNames()).filter((n) => !here.includes(n.toLowerCase()));
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name, h: `/g/${game.id}` }, { t: 'Add' }], `/g/${game.id}`);
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(game.name)}</div><h1 class="dr-title-xl">Who played?</h1></div>
    ${names.length ? `<div class="gg-chips">${names.map((n) => `<button class="gg-chip" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
    <div class="dr-field"><label for="name">${names.length ? 'Or someone new' : 'Their name'}</label><input class="dr-input" id="name" placeholder="First name is plenty" autocapitalize="words" autocomplete="off"></div>
    <div class="gg-bar"><button class="dr-btn" id="save">Add them</button></div>
  </div>`)) return;
  const input = $('#name'); if (!names.length) input.focus();
  const add = async (name) => {
    name = name.trim(); if (!name) { input.focus(); return; }
    const existing = (await playersOf(game.id)).find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) { go(`/g/${game.id}/p/${existing.id}`); return; }
    const now = Date.now();
    const p = { id: uid(), gameId: game.id, name, order: (await playersOf(game.id)).length, createdAt: now, updatedAt: now, scores: [] };
    await db.put('players', p);
    go(`/g/${game.id}/p/${p.id}/new`);
  };
  $$('[data-name]').forEach((b) => { b.onclick = () => add(b.dataset.name); });
  $('#save').onclick = () => add(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') add(input.value); };
}

// A player's tile, opened: their scores, best first, and the form for a new or edited one.
async function playerPage(cat, game, player, mode) {
  const my = renderSeq;
  const photos = await db.where('photos', 'gameId', game.id);
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name, h: `/c/${cat.id}` }, { t: game.name, h: `/g/${game.id}` }, { t: player.name }], `/g/${game.id}`);
  player.scores = player.scores || [];
  const best = bestOf(player);
  const pic = (id) => (id ? photos.find((x) => x.id === id) : null);
  const editing = mode === 'new' ? { id: null } : (mode.startsWith('s:') ? player.scores.find((s) => s.id === mode.slice(2)) : null);
  const sorted = [...player.scores].sort((a, b) => b.value - a.value || (b.date || '').localeCompare(a.date || ''));
  const rows = sorted.map((s) => {
    const ph = pic(s.photoId);
    const thumb = ph ? `<div class="gg-score__thumb"><img src="${photoUrl(ph)}" alt=""></div>` : '<div class="gg-score__thumb">·</div>';
    const meta = [s.date ? fmtDate(s.date) : 'Date not kept', s.where].filter(Boolean).join(' · ');
    return `<div class="gg-score ${s === best ? 'is-best' : ''}" data-go="/g/${game.id}/p/${player.id}/s:${s.id}" role="button" tabindex="0">${thumb}
      <div class="dr-row__text"><div class="gg-score__num">${fmtScore(s.value)}</div><div class="dr-row__meta">${esc(meta)}</div></div>
      <div class="dr-row__end">${s === best ? '<span class="dr-badge dr-badge--accent">Best</span>' : ''}</div></div>`;
  });
  const form = editing ? scoreForm(editing, pic(editing.photoId)) : '';
  if (!paint(my, `<div class="gg-stack">
    <div class="gg-bar"><div class="gg-disc gg-disc--big">${esc(initials(player.name))}</div>
      <div class="gg-grow"><div class="dr-eyebrow">${esc(game.name)}</div>
        <div class="gg-titlerow"><h1 class="dr-title-xl" id="title">${esc(player.name)}</h1><button class="gg-pencil" id="rename" aria-label="Rename">✎</button></div></div></div>
    ${form}
    ${!editing ? `<div class="gg-bar"><button class="dr-btn" data-go="/g/${game.id}/p/${player.id}/new">Add a score</button></div>` : ''}
    ${rows.length ? `<div><div class="dr-eyebrow">${plural(rows.length, 'score')}</div><div class="dr-list">${rows.join('')}</div></div>`
      : (editing ? '' : `<div class="gg-empty"><p class="dr-body-lg">No score for ${esc(player.name)} on ${esc(game.name)} yet.</p></div>`)}
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="remove">Take ${esc(player.name)} off ${esc(game.name)}</button></div>
  </div>`)) return;
  bindGo();
  $('#rename').onclick = () => renameInline($('#title'), player.name, async (v) => { player.name = v; await touch('players', player); render(); });
  $('#remove').onclick = async () => {
    if (!(await confirmSheet(`Take ${player.name} off ${game.name}, scores and all?`, `Yes, take ${player.name} off`))) return;
    await deletePlayer(player); toast(`${player.name} taken off ${game.name}.`); go(`/g/${game.id}`);
  };
  if (editing) bindScoreForm(game, player, editing);
}

function scoreForm(s, photo) {
  return `<section class="dr-panel gg-stack gg-stack--tight" id="form">
    <div class="dr-eyebrow">${s.id ? 'This score' : 'New score'}</div>
    <div class="gg-photo ${photo ? 'has-picture' : ''}" id="photoBox">${photo ? `<img src="${photoUrl(photo)}" alt="">` : '<div class="gg-photo__empty"><span style="font-size:40px">🖼️</span><b>Add a picture</b><span class="dr-caption">A photo of the score, from your photos.</span></div>'}<input type="file" accept="image/*" id="photoIn" aria-label="Picture of the score"></div>
    <div class="gg-fields">
      <div class="dr-field"><label for="score">Score</label><input class="dr-input gg-scorein" id="score" inputmode="numeric" placeholder="0" value="${s.value != null ? fmtScore(s.value) : ''}" autocomplete="off"></div>
      <div class="gg-fields gg-fields--two">
        <div class="dr-field"><label for="date">When</label><input class="dr-input" id="date" type="date" value="${esc(s.date || (s.id ? '' : todayIso()))}"></div>
        <div class="dr-field"><label for="where">Where <span class="gg-opt">optional</span></label><input class="dr-input" id="where" placeholder="The bar, the arcade…" value="${esc(s.where || '')}" autocapitalize="words" autocomplete="off"></div>
      </div>
    </div>
    <div class="gg-bar gg-bar--between"><div class="gg-bar">
      <button class="dr-btn" id="save">${s.id ? 'Save' : 'Add this score'}</button>
      <button class="dr-btn dr-btn--ghost" id="cancel">${s.id ? 'Done' : 'Never mind'}</button></div>
      ${s.id ? '<button class="dr-btn dr-btn--ghost dr-btn--sm" id="removeScore">Remove this score</button>' : ''}
    </div>
  </section>`;
}
function bindScoreForm(game, player, s) {
  const scoreIn = $('#score'), dateIn = $('#date'), whereIn = $('#where'), photoIn = $('#photoIn');
  let newPhoto = null; // {blob,w,h} chosen but not yet saved
  scoreIn.oninput = () => { const n = parseScore(scoreIn.value); scoreIn.value = n == null ? '' : fmtScore(n); };
  if (!s.id) scoreIn.focus();
  photoIn.onchange = async () => {
    const f = photoIn.files[0]; if (!f) return;
    newPhoto = await shrink(f);
    const box = $('#photoBox'); const url = URL.createObjectURL(newPhoto.blob); urls.push(url);
    box.classList.add('has-picture'); box.innerHTML = `<img src="${url}" alt="">`; box.append(photoIn);
  };
  const back = () => go(`/g/${game.id}/p/${player.id}`);
  $('#cancel').onclick = back;
  $('#save').onclick = async () => {
    const value = parseScore(scoreIn.value);
    if (value == null) { scoreIn.focus(); toast('Type the score first.'); return; }
    if (!s.id) { s = { id: uid(), value, date: '', where: '', photoId: null, createdAt: Date.now() }; player.scores.push(s); }
    s.value = value; s.date = dateIn.value || ''; s.where = whereIn.value.trim();
    if (newPhoto) {
      if (s.photoId && s.photoId !== game.photoId) await db.del('photos', s.photoId);
      const ph = { id: uid(), gameId: game.id, blob: newPhoto.blob, w: newPhoto.w, h: newPhoto.h, bytes: newPhoto.blob.size, createdAt: Date.now() };
      await db.put('photos', ph); s.photoId = ph.id;
    }
    await touch('players', player);
    toast(`${fmtScore(value)} saved for ${player.name}.`);
    back();
  };
  const rm = $('#removeScore');
  if (rm) rm.onclick = async () => {
    if (!(await confirmSheet(`Remove ${fmtScore(s.value)}?`, 'Yes, remove it'))) return;
    if (s.photoId && s.photoId !== game.photoId) await db.del('photos', s.photoId);
    player.scores = player.scores.filter((x) => x.id !== s.id);
    await touch('players', player);
    back();
  };
}

// ---------- settings, backup, import ----------
const HOW_IT_WORKS = [
  ['Categories and games', 'Home holds your categories. A category keeps high scores (one tile per player, like Pinball), games played (one tile per night, like Tabletop games), or both, with + asking which; you choose when you make it and can change it on the category’s page. Its games show as tiles, A to Z, with a search box and a list view if you like, and a game can carry a picture of itself.'],
  ['Scores', 'In a high-scores category, tap + on a game to add a player, then their score, with the date, where it was and a photo of it. A player can keep every score they ever got; the best one shows outside.'],
  ['Score it live', 'Starting a night, or a round, choose Score it live: who is playing, whether the highest or the lowest score wins, a score to play to if there is one, rounds if it is played in rounds. Then type what each person scored on their turn and Add (minus to take points off), or tap +1; the sheet under the board shows every turn like paper would; Undo if a finger slips, and Finish the game when it is over: the round lands on the night with its winner.'],
  ['Game nights', 'In a games-played category, tap + on a game the night you play it. Each round gets who played, scores if you keep them, and who won; several rounds can share a night. The top of the game keeps your totals, under the name you put in Settings.'],
  ['Sharing', 'Share the list on a category sends a plain list of its games and scores to a text, a note, anywhere. Add a person’s scores takes a friend’s list and puts their scores on every game in one go.'],
  ['Back up', 'Back up makes one file with everything in it, pictures included, for Files, iCloud, a text, anywhere. Import a backup brings it back onto a phone.'],
  ['Yours', 'Everything stays on this phone until you send it. Nothing is uploaded, nothing needs an account.'],
];
async function settingsPage() {
  const my = renderSeq;
  const name = await db.setting('yourName', '');
  const counts = { c: (await db.all('categories')).length, g: (await db.all('games')).length, p: (await db.all('players')).length, n: (await db.all('nights')).length, ph: (await db.all('photos')).length };
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: 'Settings & help' }], '/');
  if (!paint(my, `<div class="gg-stack">
    <h1 class="dr-title-xl">Settings &amp; help</h1>
    <div class="dr-panel gg-stack gg-stack--tight">
      <div class="dr-field"><label for="yourName">Your name</label><input class="dr-input" id="yourName" value="${esc(name)}" placeholder="First name is plenty" autocomplete="given-name" autocapitalize="words"><div class="dr-field__hint">Comes first when you add a player.</div></div>
      <div class="gg-bar gg-bar--between"><span class="dr-body-sm">${plural(counts.c, 'category').replace('categorys', 'categories')} · ${plural(counts.g, 'game')} · ${plural(counts.p, 'player tile')} · ${plural(counts.n, 'night')} · ${plural(counts.ph, 'picture')}</span></div>
      <div class="gg-bar"><button class="dr-btn dr-btn--sm" id="backup">Back up everything</button><label class="dr-btn dr-btn--ghost dr-btn--sm">Import a backup<input type="file" accept=".json,application/json" hidden id="importFile"></label></div>
      <div class="gg-bar gg-bar--between"><span class="dr-body-sm">Version ${APP_VERSION}</span><button class="dr-btn dr-btn--ghost dr-btn--sm" id="checkUpdate">Check for an update</button></div>
    </div>
    <div><div class="dr-eyebrow">How it works</div>
      <div class="gg-stack gg-stack--tight gg-help">${HOW_IT_WORKS.map(([h, p]) => `<section class="dr-panel"><h2 class="dr-label">${esc(h)}</h2><p class="dr-body-sm">${esc(p)}</p></section>`).join('')}</div></div>
    <div class="gg-foot">GG! is built for one phone at a time. Your scores never leave it unless you send them.</div>
  </div>`)) return;
  const nameIn = $('#yourName');
  let t; nameIn.oninput = () => { clearTimeout(t); t = setTimeout(() => db.setSetting('yourName', nameIn.value.trim()), 300); };
  leaveHook = async () => { clearTimeout(t); await db.setSetting('yourName', nameIn.value.trim()); };
  $('#backup').onclick = backup;
  $('#importFile').onchange = (e) => importBackup(e.target.files[0]);
  $('#checkUpdate').onclick = async () => {
    const btn = $('#checkUpdate'); btn.disabled = true; toast('Checking…');
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (!reg) { toast('No offline worker here; just reload.'); btn.disabled = false; return; }
      await reg.update();
      const fresh = reg.installing || reg.waiting;
      if (fresh) { toast('Update found. Reopening…'); fresh.addEventListener('statechange', () => { if (fresh.state === 'activated') location.reload(); }); }
      else {
        let live = 0;
        try { const txt = await (await fetch('sw.js', { cache: 'reload' })).text(); live = Number((txt.match(/gg-v(\d+)/) || [])[1] || 0); } catch { /* offline */ }
        if (live > APP_VERSION) toast(`Version ${live} is out, but this connection is still handing back the old files. Try again in a few minutes.`);
        else toast(`You have the latest: version ${APP_VERSION}.`);
        btn.disabled = false;
      }
    } catch { toast('Could not check right now.'); btn.disabled = false; }
  };
}

const blobToB64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
const b64ToBlob = (b64, type) => { const bin = atob(b64); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type }); };
async function backup() {
  toast('Packing it up…');
  const photos = [];
  for (const p of await db.all('photos')) photos.push({ id: p.id, gameId: p.gameId, w: p.w, h: p.h, type: p.blob.type || 'image/jpeg', data: await blobToB64(p.blob) });
  const pack = { app: 'gg', format: 2, exportedAt: new Date().toISOString(), categories: await db.all('categories'), games: await db.all('games'), players: await db.all('players'), nights: await db.all('nights'), photos };
  const name = `GG backup ${todayIso()}.json`;
  const file = new File([JSON.stringify(pack)], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); toast('Backed up.'); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Backup saved.');
}
// A backup file is data, not trusted: ids must look like ids, text is clipped, numbers must be numbers.
async function importBackup(file) {
  if (!file) return;
  let pack;
  try { pack = JSON.parse(await file.text()); } catch { toast('That file is not a GG! backup.'); return; }
  if (!pack || pack.app !== 'gg' || !Array.isArray(pack.categories)) { toast('That file is not a GG! backup.'); return; }
  const now = Date.now();
  const cats = [], games = [], players = [], photos = [];
  for (const c of pack.categories) { const id = safeId(c.id); if (id) cats.push({ id, name: safeText(c.name) || 'Untitled', kind: c.kind === 'nights' || c.kind === 'both' ? c.kind : 'scores', order: Number(c.order) || 0, createdAt: Number(c.createdAt) || now, updatedAt: Number(c.updatedAt) || now }); }
  const catIds = new Set(cats.map((c) => c.id));
  for (const g of pack.games || []) { const id = safeId(g.id), cid = safeId(g.categoryId); if (id && cid && catIds.has(cid)) games.push({ id, categoryId: cid, name: safeText(g.name) || 'Untitled', howToScore: safeText(g.howToScore, 500), order: Number(g.order) || 0, createdAt: Number(g.createdAt) || now, updatedAt: Number(g.updatedAt) || now }); }
  const gameIds = new Set(games.map((g) => g.id));
  for (const ph of pack.photos || []) {
    const id = safeId(ph.id), gid = safeId(ph.gameId);
    if (!id || !gid || !gameIds.has(gid) || typeof ph.data !== 'string') continue;
    const type = /^image\/(jpeg|png|webp|heic)$/.test(ph.type) ? ph.type : 'image/jpeg';
    try { const blob = b64ToBlob(ph.data, type); photos.push({ id, gameId: gid, blob, w: Number(ph.w) || 0, h: Number(ph.h) || 0, bytes: blob.size, createdAt: now }); } catch { /* skip a bad picture */ }
  }
  const photoIds = new Set(photos.map((p) => p.id));
  for (const g of pack.games || []) { const mine = games.find((x) => x.id === safeId(g.id)); const pid = safeId(g.photoId); if (mine) mine.photoId = pid && photoIds.has(pid) ? pid : null; }
  for (const p of pack.players || []) {
    const id = safeId(p.id), gid = safeId(p.gameId);
    if (!id || !gid || !gameIds.has(gid)) continue;
    const scores = [];
    for (const s of Array.isArray(p.scores) ? p.scores : []) {
      const sid = safeId(s.id), value = Number(s.value);
      if (!sid || !Number.isFinite(value)) continue;
      const pid = safeId(s.photoId);
      scores.push({ id: sid, value, date: /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : '', where: safeText(s.where), photoId: pid && photoIds.has(pid) ? pid : null, createdAt: Number(s.createdAt) || now });
    }
    players.push({ id, gameId: gid, name: safeText(p.name, 80) || 'Someone', order: Number(p.order) || 0, createdAt: Number(p.createdAt) || now, updatedAt: Number(p.updatedAt) || now, scores });
  }
  const nights = [];
  const isoOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  for (const n of pack.nights || []) {
    const id = safeId(n.id), gid = safeId(n.gameId);
    if (!id || !gid || !gameIds.has(gid)) continue;
    const pid = safeId(n.photoId);
    const rounds = [];
    for (const r of Array.isArray(n.rounds) ? n.rounds : []) {
      const rid = safeId(r.id); if (!rid) continue;
      const ps = (Array.isArray(r.players) ? r.players : []).map((p) => ({ name: safeText(p.name, 80), score: Number.isFinite(Number(p.score)) && p.score !== null && p.score !== '' ? Number(p.score) : null })).filter((p) => p.name);
      const winners = (Array.isArray(r.winners) ? r.winners : []).map((w) => safeText(w, 80)).filter(Boolean);
      rounds.push({ id: rid, players: ps, winners, createdAt: Number(r.createdAt) || now });
    }
    let live = null;
    if (n.live && typeof n.live === 'object' && Array.isArray(n.live.players)) {
      const lp = n.live.players.map((p) => ({ name: safeText(p.name, 80), total: Number(p.total) || 0 })).filter((p) => p.name);
      if (lp.length) live = { players: lp, winBy: n.live.winBy === 'low' ? 'low' : 'high', target: Number(n.live.target) > 0 ? Number(n.live.target) : null, rounds: Number(n.live.rounds) > 0 ? Number(n.live.rounds) : null, round: Number(n.live.round) || 1, log: [], startedAt: Number(n.live.startedAt) || now };
    }
    nights.push({ id, gameId: gid, date: isoOk(n.date) ? n.date : '', where: safeText(n.where), photoId: pid && photoIds.has(pid) ? pid : null, rounds, live, createdAt: Number(n.createdAt) || now, updatedAt: Number(n.updatedAt) || now });
  }
  await db.batch(['categories', 'games', 'players', 'nights', 'photos', 'meta'], (s) => {
    cats.forEach((c) => s.categories.put(c)); games.forEach((g) => s.games.put(g)); players.forEach((p) => s.players.put(p)); nights.forEach((n) => s.nights.put(n)); photos.forEach((p) => s.photos.put(p));
    s.meta.put({ key: 'seeded', value: true });
  });
  toast(`Brought in ${plural(games.length, 'game')}, ${plural(players.length, 'player tile')} and ${plural(nights.length, 'night')}.`);
  go('/'); render();
}

// ---------- start ----------
window.addEventListener('hashchange', render);
render();
