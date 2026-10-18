// Matt's record on 2026-10-18, from the iPhone Notes page he kept until GG! (reference/pinball-notes-2026-10-18.md).
// "J" is Jordan, "M" is Matt. A missing score means that player had none yet; a list is several scores. Dates and places were not kept.
export const SEED_CATEGORY = 'Pinball';
export const SEED_PLAYERS = { M: 'Matt', J: 'Jordan' };
export const SEED_GAMES = [
  ['Spider-Man', { J: 16900000, M: 21932000 }],
  ['Walking Dead', { J: 5600000, M: [22438300, 41354380] }], // M's second score is from Stern Insider, a later cabinet (Decision 2026-10-18: one game)
  ['Twilight Zone', { J: 143794390, M: 79246000 }],
  ['Wizard of Oz', { J: 19441, M: 34101 }],
  ['Shrek', { J: 8900000, M: 16789000 }],
  ['Monster Mash', { J: 26045000, M: 15400000 }],
  ['Elvira', { J: 3585570, M: 3257710 }],
  ['Theatre of Magic', { M: 150000000, J: 363280000 }],
  ['Ghostbusters', { M: 308616080 }],
  ['Dracula', { M: 122920610 }],
  ['Junkyard', { J: 2800000 }],
  ['Whitewater', { J: 33116000, M: 147645000 }],
  ['Tron', { M: 8600000, J: 7900000 }],
  ['Indiana Jones', { M: 101287730, J: 186500000 }],
  ['Dredd', { M: 53000000 }],
  ['Terminator 2', { M: 13240000, J: 24618570 }],
  ['Kiss', { J: 11217000, M: 36147600 }],
  ['Metallica', { M: 5948000, J: 9137000 }],
  ['Revenge from Mars', { J: 36025860 }],
  ['Game of Thrones', { M: 199311310 }],
  ['Arabian Nights', { J: 5130830, M: 3518550 }],
  ["Addams Family", { M: 34251560, J: 24000000 }],
];
// Matt's Stern Insider Connected scores (reference/stern-insider-scores-2026-10-18.md), the nine cabinets whose
// names printed. A cabinet with a Pro and a Premium score gets both as score lines; the best shows outside.
export const SEED_STERN = [
  ['Dungeons & Dragons', [222327420]],
  ['Fallout', [59899200]],
  ['Transformers', [127981410]],
  ['Godzilla', [125202950, 19971040]],
  ['John Wick', [94140660]],
  ['Guardians of the Galaxy', [153290910]],
  ['The Mandalorian', [77266990]],
  ['Star Wars', [228113220]],
  ['Iron Maiden', [109818380, 20711870]],
];
