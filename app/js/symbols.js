// Default symbols (I11): twenty-three things from Matt's game nights, drawn like the app icon's faces,
// a cream shape with a darker edge, on one of the four tile tones. Each is SVG in a 100×100 box;
// fill and stroke come from the tile (currentColor for the cream, --edge for the outline).
const S = 'fill="currentColor" stroke="var(--edge)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const E = 'fill="none" stroke="var(--edge)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const D = 'fill="var(--edge)"';

export const SYMBOLS = [
  ['pinball', 'Pinball machine', `<rect x="18" y="12" width="24" height="34" rx="4" ${S}/><path d="M42 46 L86 58 L86 74 L22 66 L18 46 Z M30 67 L28 90 M82 74 L80 90" ${S}/><rect x="23" y="17" width="14" height="14" rx="3" ${E}/><circle cx="83" cy="64" r="2.4" ${D}/>`],
  ['token', 'Token', `<circle cx="50" cy="50" r="36" ${S}/><circle cx="50" cy="50" r="27" ${E}/><path d="M50 32 L55 45 L69 46 L58 55 L62 69 L50 61 L38 69 L42 55 L31 46 L45 45 Z" ${D}/>`],
  ['controller', 'Game controller', `<path d="M30 30 H70 C84 30 90 42 90 54 L88 70 C87 78 78 80 73 74 L66 64 H34 L27 74 C22 80 13 78 12 70 L10 54 C10 42 16 30 30 30 Z" ${S}/><path d="M28 40 V56 M20 48 H36" ${E} stroke-width="5"/><circle cx="68" cy="43" r="4" ${D}/><circle cx="78" cy="51" r="4" ${D}/>`],
  ['meeple', 'Meeple', `<path d="M38 36 C30 34 20 38 20 44 C20 49 26 50 32 50 C28 60 24 70 20 80 C28 84 36 82 44 80 C46 74 48 70 50 66 C52 70 54 74 56 80 C64 82 72 84 80 80 C76 70 72 60 68 50 C74 50 80 49 80 44 C80 38 70 34 62 36 A12 12 0 1 0 38 36 Z" ${S}/>`],
  ['cards', 'Hand of cards', `<g transform="rotate(-24 50 92)"><rect x="34" y="28" width="32" height="54" rx="5" ${S}/></g><g transform="rotate(0 50 92)"><rect x="34" y="24" width="32" height="54" rx="5" ${S}/></g><g transform="rotate(24 50 92)"><rect x="34" y="28" width="32" height="54" rx="5" ${S}/><circle cx="42" cy="36" r="2.8" ${D}/></g>`],
  ['spade', 'Spade', `<path d="M50 14 C62 30 82 40 82 58 C82 70 70 76 60 70 C57 68 55 66 54 64 C55 72 58 78 64 84 H36 C42 78 45 72 46 64 C45 66 43 68 40 70 C30 76 18 70 18 58 C18 40 38 30 50 14 Z" ${S}/>`],
  ['d12', 'Twelve-sided die', `<path d="M50 12 L72 19 L86 38 L86 62 L72 81 L50 88 L28 81 L14 62 L14 38 L28 19 Z" ${S}/><path d="M50 30 L69 44 L62 66 H38 L31 44 Z" ${E}/><path d="M50 12 L50 30 M72 19 L69 44 M86 62 L62 66 M28 81 L38 66 M14 38 L31 44" ${E}/>`],
  ['d6', 'Six-sided die', `<rect x="16" y="16" width="68" height="68" rx="12" ${S}/><circle cx="34" cy="34" r="5.5" ${D}/><circle cx="66" cy="34" r="5.5" ${D}/><circle cx="50" cy="50" r="5.5" ${D}/><circle cx="34" cy="66" r="5.5" ${D}/><circle cx="66" cy="66" r="5.5" ${D}/>`],
  ['trophy', 'Trophy', `<path d="M30 16 H70 V40 C70 54 60 62 50 62 C40 62 30 54 30 40 Z" ${S}/><path d="M30 24 H18 C18 40 24 46 32 48 M70 24 H82 C82 40 76 46 68 48" ${E}/><path d="M44 62 H56 V72 H44 Z M34 72 H66 V84 H34 Z" ${S}/>`],
  ['joystick', 'Arcade joystick', `<rect x="14" y="62" width="72" height="24" rx="6" ${S}/><path d="M50 62 V38" ${E} stroke-width="7"/><circle cx="50" cy="28" r="14" ${S}/><circle cx="30" cy="74" r="4" ${D}/><circle cx="42" cy="74" r="4" ${D}/>`],
  ['dartboard', 'Dartboard', `<circle cx="50" cy="50" r="38" ${S}/><circle cx="50" cy="50" r="28" ${E}/><circle cx="50" cy="50" r="18" ${E}/><circle cx="50" cy="50" r="8" ${D}/><path d="M50 12 V88 M12 50 H88" ${E}/>`],
  ['eightball', 'Eight ball', `<circle cx="50" cy="50" r="38" ${S}/><circle cx="50" cy="50" r="17" ${E}/><text x="50" y="59" text-anchor="middle" font-family="Outfit, sans-serif" font-weight="800" font-size="26" fill="var(--edge)">8</text>`],
  ['paddle', 'Paddle', `<ellipse cx="50" cy="40" rx="28" ry="30" ${S}/><path d="M44 68 H56 L58 90 H42 Z" ${S}/><path d="M40 30 L60 50 M60 30 L40 50" ${E}/>`],
  ['knight', 'Chess knight', `<path d="M36 86 H70 V78 C70 70 66 66 60 64 C68 56 72 46 68 36 C64 26 54 20 46 24 L40 18 L38 30 C30 34 24 42 24 50 C24 54 28 56 32 54 L38 50 C36 58 36 66 34 72 C32 76 30 80 30 86 Z" ${S}/><circle cx="52" cy="34" r="2.6" ${D}/>`],
  ['domino', 'Domino', `<rect x="30" y="10" width="40" height="80" rx="7" ${S}/><path d="M30 50 H70" ${E}/><circle cx="40" cy="24" r="4" ${D}/><circle cx="60" cy="36" r="4" ${D}/><circle cx="40" cy="64" r="4" ${D}/><circle cx="60" cy="64" r="4" ${D}/><circle cx="40" cy="76" r="4" ${D}/><circle cx="60" cy="76" r="4" ${D}/>`],
  ['bowlingpin', 'Bowling pin', `<path d="M50 10 C58 10 62 16 61 24 C60 32 56 38 60 48 C66 60 68 72 62 86 C58 92 42 92 38 86 C32 72 34 60 40 48 C44 38 40 32 39 24 C38 16 42 10 50 10 Z" ${S}/><path d="M40 36 H60 M41 42 H59" ${E}/>`],
  ['puzzle', 'Puzzle piece', `<path d="M24 24 H42 C40 14 60 14 58 24 H76 V42 C86 40 86 60 76 58 V76 H58 C60 86 40 86 42 76 H24 V58 C14 60 14 40 24 42 Z" ${S}/>`],
  ['chip', 'Poker chip', `<circle cx="50" cy="50" r="38" ${S}/><circle cx="50" cy="50" r="38" ${E} stroke-width="8" stroke-dasharray="12 12"/><circle cx="50" cy="50" r="22" ${E}/>`],
  ['crown', 'Crown', `<path d="M16 72 L14 34 L34 50 L50 24 L66 50 L86 34 L84 72 Z" ${S}/><path d="M16 80 H84" ${E} stroke-width="6"/><circle cx="50" cy="60" r="4" ${D}/>`],
  ['hourglass', 'Hourglass', `<path d="M26 14 H74 V24 C74 36 62 42 56 50 C62 58 74 64 74 76 V86 H26 V76 C26 64 38 58 44 50 C38 42 26 36 26 24 Z" ${S}/><path d="M34 22 H66 M34 78 H66" ${E}/><path d="M50 46 L54 66 H46 Z" ${D}/>`],
  ['alien', 'Alien', `<path d="M50 12 C72 12 84 32 80 50 C76 66 62 82 50 88 C38 82 24 66 20 50 C16 32 28 12 50 12 Z" ${S}/><ellipse cx="37" cy="46" rx="7.5" ry="12.5" transform="rotate(-24 37 46)" ${D}/><ellipse cx="63" cy="46" rx="7.5" ry="12.5" transform="rotate(24 63 46)" ${D}/>`],
  ['ufo', 'UFO', `<path d="M34 42 C34 26 66 26 66 42" ${S}/><ellipse cx="50" cy="50" rx="42" ry="14" ${S}/><circle cx="26" cy="52" r="3" ${D}/><circle cx="50" cy="56" r="3" ${D}/><circle cx="74" cy="52" r="3" ${D}/><path d="M40 68 L34 84 M60 68 L66 84" ${E}/>`],
  ['discoball', 'Disco ball', `<path d="M50 4 V16" ${E}/><circle cx="50" cy="52" r="36" ${S}/><path d="M14 52 H86 M20 36 H80 M20 68 H80 M50 16 V88 M34 20 V84 M66 20 V84" ${E}/>`],
];

export const symbolOf = (key) => SYMBOLS.find((s) => s[0] === key) || null;
// A stable pick for things made before symbols existed: the id decides, so a tile keeps its symbol.
export function symbolFor(key, id) {
  if (symbolOf(key)) return key;
  let h = 0; for (const ch of String(id || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SYMBOLS[h % SYMBOLS.length][0];
}
export const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)][0];
// The gloss (I11, Matt's note): the cream shapes drawn once more on top, lit from the top left and shaded
// at the bottom, through the gradient index.html defines once as #gg-gloss. Edges and dark marks stay as they are.
const glossLayer = (body) => body
  .replace(/fill="currentColor"/g, 'fill="url(#gg-gloss)"')
  .replace(/fill="var\(--edge\)"/g, 'fill="none"')
  .replace(/stroke="var\(--edge\)"/g, 'stroke="none"')
  .replace(/<text[^>]*>[^<]*<\/text>/g, '');
export const symbolSvg = (key, cls = 'gg-sym') => { const s = symbolOf(key); return s ? `<svg class="${cls}" viewBox="0 0 100 100" aria-label="${s[1]}" role="img"><g>${s[2]}</g><g class="gg-sym__gloss">${glossLayer(s[2])}</g></svg>` : ''; };
