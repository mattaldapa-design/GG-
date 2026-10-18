// IndexedDB wrapper. Stores: categories, games, players, photos, meta.
const NAME = 'gg';
const VERSION = 1;
let opening = null;

function open() {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    const r = indexedDB.open(NAME, VERSION);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('categories', { keyPath: 'id' });
      const games = d.createObjectStore('games', { keyPath: 'id' });
      games.createIndex('categoryId', 'categoryId');
      const players = d.createObjectStore('players', { keyPath: 'id' });
      players.createIndex('gameId', 'gameId');
      const photos = d.createObjectStore('photos', { keyPath: 'id' });
      photos.createIndex('gameId', 'gameId');
      d.createObjectStore('meta', { keyPath: 'key' });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  return opening;
}

const wait = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export async function get(store, key) {
  const d = await open();
  return wait(d.transaction(store).objectStore(store).get(key));
}
export async function all(store) {
  const d = await open();
  return wait(d.transaction(store).objectStore(store).getAll());
}
export async function where(store, index, value) {
  const d = await open();
  return wait(d.transaction(store).objectStore(store).index(index).getAll(value));
}
export async function put(store, value) {
  const d = await open();
  return wait(d.transaction(store, 'readwrite').objectStore(store).put(value));
}
export async function del(store, key) {
  const d = await open();
  return wait(d.transaction(store, 'readwrite').objectStore(store).delete(key));
}
// Several writes across several stores in ONE transaction: all land or none do.
// fn receives an object of stores and must only queue requests (no awaits inside).
export async function batch(storeNames, fn) {
  const db = await open();
  const t = db.transaction(storeNames, 'readwrite');
  const stores = Object.fromEntries(storeNames.map((n) => [n, t.objectStore(n)]));
  fn(stores);
  return new Promise((resolve, reject) => { t.oncomplete = resolve; t.onerror = () => reject(t.error); t.onabort = () => reject(t.error); });
}
export async function setting(key, fallback) {
  const row = await get('meta', key);
  return row ? row.value : fallback;
}
export async function setSetting(key, value) {
  return put('meta', { key, value });
}
