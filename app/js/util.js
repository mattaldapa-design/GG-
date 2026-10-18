// Small helpers.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
export const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const fmtDate = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
// Scores are whole numbers typed with or without commas: "22,438,300" and "22438300" are the same score.
export const parseScore = (s) => { const t = String(s ?? '').replace(/[^0-9.-]/g, ''); if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n : null; };
export const fmtScore = (n) => (n == null ? '' : Number(n).toLocaleString('en-US'));
export const initials = (name) => String(name || '').trim().split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
// Imported files are data, not trusted markup. Ids must look like ids.
const ID_OK = /^[A-Za-z0-9_:.-]{1,64}$/;
export const safeId = (v) => (typeof v === 'string' && ID_OK.test(v) ? v : null);
export const safeText = (v, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

// Best score of a player entry, or null when they have none.
export function bestOf(player) {
  const list = (player.scores || []).filter((s) => s.value != null);
  if (!list.length) return null;
  return list.reduce((a, b) => (b.value > a.value ? b : a));
}
// The leader of a game: the player whose best is highest.
export function leaderOf(players) {
  let lead = null;
  for (const p of players) {
    const b = bestOf(p);
    if (b && (!lead || b.value > lead.best.value)) lead = { player: p, best: b };
  }
  return lead;
}
