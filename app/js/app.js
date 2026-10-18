// GG! — the app. Categories → games → players (one tile each) → their scores.
import * as db from './db.js';
import { esc, uid, todayIso, fmtDate, parseScore, fmtScore, initials, safeId, safeText, bestOf, leaderOf } from './util.js';
import { SEED_CATEGORY, SEED_PLAYERS, SEED_GAMES, SEED_STERN } from './seed.js';

const APP_VERSION = 2; // keep in step with VERSION in sw.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const top = $('#top');
const go = (h) => { location.hash = h; };

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
  for (const ph of await db.where('photos', 'gameId', g.id)) await db.del('photos', ph.id);
  await db.del('games', g.id);
}
async function deleteCategory(c) {
  for (const g of await gamesOf(c.id)) await deleteGame(g);
  await db.del('categories', c.id);
}
// Every name that has ever been on a game, most used first: the chips on the "Who?" page.
async function knownNames() {
  const count = {};
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
  await db.batch(['categories', 'games', 'players', 'meta'], (s) => {
    s.categories.put(cat); games.forEach((g) => s.games.put(g)); players.forEach((p) => s.players.put(p));
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
    }
    if (p[0] === 'g') {
      const game = await db.get('games', p[1]);
      if (!game) return await home();
      const cat = await db.get('categories', game.categoryId);
      if (p.length === 2) return await gamePage(cat, game);
      if (p[2] === 'add') return await addPlayerPage(cat, game);
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
      : '<div class="gg-empty"><p class="dr-body-lg">No games yet. Add a category, like Pinball or Board games, and the games go inside it.</p></div>'}
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
    <div class="dr-field"><label for="name">What kind of games?</label><input class="dr-input" id="name" placeholder="Pinball, Board games, Pickleball…" autocapitalize="words" autocomplete="off"></div>
    <div class="gg-bar"><button class="dr-btn" id="save">Add it</button></div>
  </div>`;
  const input = $('#name'); input.focus();
  const save = async () => {
    const name = input.value.trim(); if (!name) { input.focus(); return; }
    const n = (await db.all('categories')).length;
    const now = Date.now();
    const c = { id: uid(), name, order: n, createdAt: now, updatedAt: now };
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
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: cat.name }], '/');
  const info = (g) => {
    const ps = players.filter((p) => p.gameId === g.id);
    const lead = leaderOf(ps);
    const ph = (g.photoId && photos.find((x) => x.id === g.photoId)) || (lead?.best.photoId ? photos.find((x) => x.id === lead.best.photoId) : null);
    const meta = lead ? `${esc(lead.player.name)} · ${fmtScore(lead.best.value)}` : (ps.length ? 'No scores yet' : 'Nobody on it yet');
    return { ps, lead, ph, meta };
  };
  const tile = (g, i) => {
    const { ph, meta } = info(g);
    const face = ph ? `<img src="${photoUrl(ph)}" alt="">` : `<div class="dr-cover--type" data-tone="${tone(i)}" style="position:absolute;inset:0"><span>${esc(g.name)}</span></div>`;
    return `<button class="dr-tile" data-go="/g/${g.id}"><div class="dr-cover">${face}</div>
      <div class="dr-tile__title">${esc(g.name)}</div><div class="dr-tile__meta">${meta}</div></button>`;
  };
  const row = (g) => {
    const { ps, lead, ph, meta } = info(g);
    const art = ph ? `<div class="dr-row__art dr-row__art--disc"><img src="${photoUrl(ph)}" alt=""></div>` : `<div class="gg-disc">${esc(initials(g.name))}</div>`;
    return `<div class="dr-row ${lead ? '' : 'is-empty'}" data-go="/g/${g.id}" role="button" tabindex="0" aria-label="${esc(g.name)}">${art}
      <div class="dr-row__text"><div class="dr-row__title">${esc(g.name)}</div><div class="dr-row__meta">${meta}</div></div>
      <div class="dr-row__end">${ps.length ? plural(ps.length, 'player') : ''}</div></div>`;
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
    <div class="gg-bar"><button class="dr-btn" data-go="/c/${cat.id}/new">Add a game</button></div>
    <div class="gg-bar gg-endbar"><button class="dr-btn dr-btn--ghost dr-btn--sm" id="delete">Delete ${esc(cat.name)}</button></div>
  </div>`)) return;
  bindGo();
  const redraw = () => { freeUrls(); $('#games').innerHTML = listHtml(); bindGo(); };
  const search = $('#search');
  if (search) search.oninput = () => { gameQuery = search.value; redraw(); };
  $$('[data-view]').forEach((b) => { b.onclick = () => { gameView = b.dataset.view; try { localStorage.setItem('gg-view', gameView); } catch { /* fine */ } $$('[data-view]').forEach((x) => x.classList.toggle('is-on', x === b)); redraw(); }; });
  $('#rename').onclick = () => renameInline($('#title'), cat.name, async (v) => { cat.name = v; await touch('categories', cat); render(); });
  $('#delete').onclick = async () => {
    const n = games.length;
    if (!(await confirmSheet(`Delete ${cat.name}${n ? ` and its ${plural(n, 'game')}` : ''}?`, `Yes, delete ${cat.name}`))) return;
    await deleteCategory(cat); toast(`${cat.name} deleted.`); go('/');
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
  const picLabel = gamePic ? `Change the picture of ${esc(game.name)}` : `Add a picture of ${esc(game.name)}`;
  const picFace = gamePic ? `<img src="${photoUrl(gamePic)}" alt="">` : `<span class="gg-gamepic__empty"><span style="font-size:36px">🖼️</span><b>Add a picture of ${esc(game.name)}</b><span class="dr-caption">It shows here and on the tile.</span></span>`;
  if (!paint(my, `<div class="gg-stack">
    <div><div class="dr-eyebrow">${esc(cat.name)}</div>
      <div class="gg-titlerow"><h1 class="dr-title-xl" id="title">${esc(game.name)}</h1><button class="gg-pencil" id="rename" aria-label="Rename the game">✎</button></div></div>
    <button class="dr-cover gg-gamepic ${gamePic ? 'has-picture' : ''}" id="gamePic" aria-label="${picLabel}">${picFace}</button>
    <input type="file" accept="image/*" id="gamePicIn" hidden aria-label="Picture of the game">
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
  const picIn = $('#gamePicIn');
  // A picture of its own is deleted when replaced; a score's photo is only pointed at, never deleted from here.
  const ownedPic = () => (game.photoId && !scorePics.some((x) => x.k === game.photoId) ? game.photoId : null);
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
    if (!scorePics.length && !gamePic) { picIn.click(); return; }
    const choices = [{ k: 'library', label: 'From your photos' }, ...scorePics.filter((x) => x.k !== game.photoId)];
    if (gamePic) choices.push({ k: 'none', label: 'Remove the picture', danger: true });
    const k = await sheet(`A picture of ${game.name}`, choices);
    if (!k) return;
    if (k === 'library') { picIn.click(); return; }
    if (k === 'none') { await setPic(null); toast('Picture removed.'); return; }
    await setPic(k); toast(`Picture set for ${game.name}.`);
  };
  $('#delete').onclick = async () => {
    if (!(await confirmSheet(`Delete ${game.name} and everyone’s scores on it?`, `Yes, delete ${game.name}`))) return;
    await deleteGame(game); toast(`${game.name} deleted.`); go(`/c/${cat.id}`);
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
        <div class="dr-field"><label for="where">Where</label><input class="dr-input" id="where" placeholder="The bar, the arcade…" value="${esc(s.where || '')}" autocapitalize="words" autocomplete="off"></div>
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
  ['Categories and games', 'Home holds your categories, like Pinball. A category shows its games as tiles, A to Z, with a search box and a list view if you like. A game holds one tile per player, and can carry a picture of itself.'],
  ['Scores', 'Tap + on a game to add a player, then their score, with the date, where it was and a photo of it. A player can keep every score they ever got; the best one shows outside.'],
  ['Back up', 'Back up makes one file with everything in it, pictures included, for Files, iCloud, a text, anywhere. Import a backup brings it back onto a phone.'],
  ['Yours', 'Everything stays on this phone until you send it. Nothing is uploaded, nothing needs an account.'],
];
async function settingsPage() {
  const my = renderSeq;
  const name = await db.setting('yourName', '');
  const counts = { c: (await db.all('categories')).length, g: (await db.all('games')).length, p: (await db.all('players')).length, ph: (await db.all('photos')).length };
  if (stale(my)) return;
  trail([{ t: 'Home', h: '/' }, { t: 'Settings & help' }], '/');
  if (!paint(my, `<div class="gg-stack">
    <h1 class="dr-title-xl">Settings &amp; help</h1>
    <div class="dr-panel gg-stack gg-stack--tight">
      <div class="dr-field"><label for="yourName">Your name</label><input class="dr-input" id="yourName" value="${esc(name)}" placeholder="First name is plenty" autocomplete="given-name" autocapitalize="words"><div class="dr-field__hint">Comes first when you add a player.</div></div>
      <div class="gg-bar gg-bar--between"><span class="dr-body-sm">${plural(counts.c, 'category').replace('categorys', 'categories')} · ${plural(counts.g, 'game')} · ${plural(counts.p, 'player tile')} · ${plural(counts.ph, 'picture')}</span></div>
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
  const pack = { app: 'gg', format: 1, exportedAt: new Date().toISOString(), categories: await db.all('categories'), games: await db.all('games'), players: await db.all('players'), photos };
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
  for (const c of pack.categories) { const id = safeId(c.id); if (id) cats.push({ id, name: safeText(c.name) || 'Untitled', order: Number(c.order) || 0, createdAt: Number(c.createdAt) || now, updatedAt: Number(c.updatedAt) || now }); }
  const catIds = new Set(cats.map((c) => c.id));
  for (const g of pack.games || []) { const id = safeId(g.id), cid = safeId(g.categoryId); if (id && cid && catIds.has(cid)) games.push({ id, categoryId: cid, name: safeText(g.name) || 'Untitled', order: Number(g.order) || 0, createdAt: Number(g.createdAt) || now, updatedAt: Number(g.updatedAt) || now }); }
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
  await db.batch(['categories', 'games', 'players', 'photos', 'meta'], (s) => {
    cats.forEach((c) => s.categories.put(c)); games.forEach((g) => s.games.put(g)); players.forEach((p) => s.players.put(p)); photos.forEach((p) => s.photos.put(p));
    s.meta.put({ key: 'seeded', value: true });
  });
  toast(`Brought in ${plural(games.length, 'game')} and ${plural(players.length, 'player tile')}.`);
  go('/'); render();
}

// ---------- start ----------
window.addEventListener('hashchange', render);
render();
