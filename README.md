# Friendly Competition — GG!

## Goal

> **An app Matt uses on his phone to keep score with his friends. It is an
> archive of the recreational games they play — pinball cabinets, board
> games — with each game's high scores, who holds them, the date they were
> set and a photo; and, for games played together, who won, what the scores
> were and when. He shares it with the friends in it. For a game played in
> the moment, like pickleball, it keeps the score live and adds the result to
> that game's record when it's done.**

*Signed by Matt 2026-10-18, in chat, when shown this block: "Yes". The
wording is the agent's, drafted from Matt's pitch (quoted under I1), until he
rewrites it in his own words.*

## Current state (2026-10-18)

```
README.md            this file
README-STANDARD.md   Starter Dough version 5
CLAUDE.md            Starter Dough, as committed in 9c1fcb3
reference/           Matt's pinball notes (text and screenshot) and his Stern
                     Insider scores (PDF and a table read from it), 2026-10-18
app/                 the build, version 12: index.html, sw.js,
                     manifest.webmanifest, css/app.css, js/app.js, js/db.js,
                     js/util.js, js/seed.js, js/symbols.js, written by the agent;
                     css/darkroom-tokens.css and css/darkroom.css copied from
                     the Dark Room kit (its 20 Oct 2026 files since version 12); icons/ is the die icon Matt settled
                     on (I5), drawn in code
.claude/launch.json  the preview server for the desktop app
.github/workflows/   pages.yml, ready for when Matt publishes (not yet used)
git                  remote: github.com/mattaldapa-design/GG- (Matt made it
                     2026-10-18); the local branch claude/project-kickoff-985f79
                     is pushed there as main, the default branch
```

Started from a portion of Starter Dough (commit `9c1fcb3`, standard
version 5). **Version 1 built 2026-10-18**, the first version by the
Decision on scope: Home is a shelf of categories; a category is a list of its
games with the leader's name and score on each row; a game shows the high
score as its one loud line, with the holder, date and place, then one tile
per player ranked by their best; a player's tile opens to their scores, best
first, and a form to add or edit one (score, date, where, a picture from the
photo library, shrunk to 1600px JPEG). Rename anything in place with the
pencil. "Who played?" offers the names already in the app as chips. Back up
everything to one `.json` with the pictures inside (share sheet, or a
download), and Import a backup brings it back. An offline shell through a
service worker. On first open the app seeds itself with Pinball: Matt's 22
cabinets from his Notes (Matt and Jordan) plus 21 cabinets from his Stern
Insider scores (Matt only; a Pro and a Premium score become two score lines
on the one cabinet), and his Stern Walking Dead score as a second line on
the Notes' Walking Dead (Decision of 2026-10-18). Where the Notes used a loose spelling the seed
uses the cabinet's real name (Theatre of Magic, Ghostbusters, Indiana Jones,
Addams Family, Monster Mash); "5,948000" was read as 5,948,000. Those are the
agent's readings, and every name can be changed in the app.

**Version 2, the same day (I4):** a category shows its games as tiles, A to
Z, with "Find a game" at the top and a Tiles / List switch the phone
remembers; a game carries a picture of itself, set from the photo library or
from a score photo already on it, shown at the top of its page and on its
tile (a tile with no picture of its own shows the leader's score photo, else
the name). Removing a score keeps its photo if the game is using it.

**Version 3, same day (I5):** the home-screen icon is the die, after four
drawings with Matt. A phone that already has GG! on its home screen keeps
the old icon until the app is removed and added again.

**Version 4, same day (I6, game nights):** a category is made as "High
scores" or "Games played" (Decision of 2026-10-18). In a games-played
category a game's page carries Matt's totals at the top under the name from
Settings (rounds won of rounds played, nights, best winning score, people
played with), a "How scoring works" note, and one tile per night. Tap + on
a night: when and where, then the round: who played (chips of known names,
or a new one), a score each if kept, "Won" marked by hand or taken as the
highest score. A night can hold several rounds; the next round starts with
the last round's players. The seed adds a Board games category with Catan,
empty. Backups carry nights; a phone on version 3 upgrades its database in
place. The home-screen icon is unchanged. A phone that already has GG! will
not get the seeded Board games category (seeding runs once); Matt adds it
with "Add a category" → Games played.

**Verified 2026-10-18, version 4**, same browser, same size: a fresh open
showed Pinball (43 games) and Board games (1 game) → Catan opened with
"Matt on Catan", 0 won of 0, and the scoring note → + made a night dated
today at "Jordan’s place" and went straight to round 1 → Matt and Jordan
from the chips, Sam typed, scores 10, 8, 7 → saved as "Matt won · Matt 10 ·
Jordan 8 · Sam 7" with no winner marked by hand → the next round opened
with the same three people; 6, 9, 5 made "Jordan won" → Catan's page read
1 won of 2, 2 games played, 1 night, best winning score 10, 2 people, and
the night's tile said "2 rounds · Matt 1, Jordan 1" → "Add a category" with
Games played chosen made a nights category → a database built at version 1
with one cabinet and one score opened at version 2 with the nights store
added and the cabinet intact. No console errors.

**Version 5, same day (I7, live scoring):** starting a night, or a round on
one, offers "Score it live". Setup asks who is playing (chips, or a name),
Highest or Lowest score wins, an optional score to play to, and optional
rounds. The board is one card per player with the total big, −1, +1 and an
"Add" for any number of points, the leader marked, Undo, "Next round" when
rounds were set, and "Finish the game": the winner by the chosen rule is
offered, or picked by hand, and the round lands on the night with its
scores and winner. A live round survives leaving the page (it is kept on
the night) and shows as "Live now" on the night's tile; "Throw this one
away" drops it. "Playing to" only nudges when someone gets there; the game
ends when Matt says. The game remembers whether highest or lowest wins.
Also fixed: going to the address already shown now repaints (the live setup
saves and shows the board at the same address).

**Verified 2026-10-18, version 5**, same browser, same size: a new night on
Catan offered "Score it live" → setup with Matt and Jordan from the chips,
Sam typed, playing to 10 → the board showed the three at 0 → +1, +1, +1
and 5 points added gave 2, 1, 5 with Sam leading → Undo took the 5 back →
−1 took Matt to 1 → 10 points for Jordan made 11 and the nudge "Jordan
reached 10." → Finish offered "Save: Jordan won" and saved the round as
Matt 1 · Jordan 11 · Sam 0 with no live round left on the night → the next
round live with Lowest score and 2 rounds: 7, 3, 9 put Jordan in the lead;
Next round moved to 2 of 2; 2, 8, 1 made 9, 11, 10 with Matt leading; a
third Next round only said the last round was done → Finish said "Matt wins
with 9"; "Pick the winner myself" listed the three and Sam was saved as the
winner. No console errors.

**Version 6, same day (I8, sharing the simple way):** a category page has
"Share the list": a plain text list, one line per game with each player's
best (or, in a games-played category, the nights and Matt's won-of-played),
sent through the share sheet, else copied to the clipboard, else saved as a
text file. A high-scores category also has "Add a person's scores": one
screen that asks whose, when (optional), and lists every game with a score
box; the filled-in ones become score lines on that person's tile on each
game, with the tile made where they were not on it yet. Both are from a
friend's list, not from a file; file matching stays set aside.

**Verified 2026-10-18, version 6**, same browser, same size, with the
share sheet stood in for by a stub: Pinball showed "Add a game", "Add a
person's scores" and "Share the list" → the list came out as 47 lines,
"Pinball — GG!" on top, "007: Matt 82,126,150" and "Addams Family: Matt
34,251,560 · Jordan 24,000,000" among them, "Sent from GG! on Oct 18, 2026"
last → the bulk screen listed all 43 games; tapping Jordan showed "has …"
on his 18 games; Sam typed showed none → 12345678 formatted as 12,345,678
→ Deadpool and Jaws filled, dated 10 Oct → "Added 2 scores for Sam." and
Sam's tiles on those two games held the scores with the date. No console
errors.

**Version 7, same day (I9):** "Tabletop games" everywhere the app speaks
(the seed's category, the help, the examples); "Where" says "optional"
beside it on nights and scores; and the live board carries the sheet: the
points box ("This turn") and Add are the main control per person, with −1
and +1 beside, and under the cards a table like paper, a turn a row and a
person a column, with the totals along the bottom.

**Verified 2026-10-18, version 7**, same browser, same size: Home showed
Pinball and Tabletop games → a new night's label read "Where optional" → a
live round on Catan with Matt and Jordan, playing to 200 → 50 for Matt,
100 for Jordan, 150 for Matt, −50 for Jordan through the "This turn" boxes
→ the sheet showed the four turns in order, +50 / +100 / +150 / -50 each in
its own column, totals 200 and 50, and "Matt reached 200." No console
errors.

**Version 8, same day (I10):** a category can keep "Both". Making one
offers three kinds, and a category's page has "Keeps: … · change" to switch
an existing one. In a Both category a game's page shows the high score and
the player tiles first, then the nights with Matt's totals, and + asks "A
high score" or "A night we played". The shared list carries both parts.

**Verified 2026-10-18, version 8**, same browser, same size: Pinball's page
read "Keeps: High scores · change"; the sheet offered Games played and
Both; Both made it "Keeps: Both" and Spider-Man's tile read "Matt ·
21,932,000 · no nights" → Spider-Man's page showed the 21,932,000 high
score, the two player tiles, then "Matt on Spider-Man · nights" → + asked
"A high score" or "A night we played", and the night choice opened "When
did you play?" with "Where optional". No console errors.

**Version 9, same day (I11, symbols):** twenty-three symbols drawn in
code as SVG in `app/js/symbols.js`, in the icon's manner (a cream shape
with a darker edge of the tile's tone, and after Matt's note a gloss: lit
from the top left, shaded at the bottom, through one gradient defined in
`index.html`): pinball machine, token, game
controller, meeple, hand of cards, spade, twelve-sided die, six-sided die,
trophy, arcade joystick, dartboard, eight ball, paddle, chess knight,
domino, bowling pin, puzzle piece, poker chip, crown, hourglass, alien,
UFO, disco ball. A category, a game or a player made from now on gets one
at random; anything older gets one from its id, so it keeps it. A tile
with no picture shows its symbol instead of its name in colour. A
category page has "Symbol"; a game's picture sheet and a player's new
picture (the disc beside their name) offer "From your photos", "Choose a
symbol" and, with a picture, "Remove the picture". A player's own photo
leads their tile, then their best score's photo, then the symbol. The
picker is a grid of all twenty-three on the four tones. Backups carry
symbols and player photos.

**Verified 2026-10-18, version 9**, same browser, same size: Home showed
Pinball with an eight ball and Tabletop games with a domino → Pinball's
tiles each wore a symbol (puzzle piece, hand of cards, paddle, alien,
trophy, chess knight among the first) → "Symbol" opened the grid of 23
with the eight ball marked; the UFO set Pinball's symbol → Spider-Man's
picture slot showed its hourglass and the player tiles a paddle and a
spade → the picture sheet offered "From your photos" and "Choose a symbol";
the alien took the slot → Matt's page showed the paddle beside his name;
its sheet offered the same two, and the disco ball replaced it. No console
errors.

**Version 10, same day:** Matt, from his phone: *"On the score sheet the
font in 'this turn' needs to be shrunk down as the 'n' is cut off on my
phone"*. The placeholder in the live board's points box is now body-sized
(16px) while typed points stay big, and the box is a little wider.

**Version 11, same day, after a code review (ten findings, all fixed):**
the live board repaints in place and keeps its scroll instead of jumping
to the top on every point; the live log is kept by the person's name, so
changing who is playing mid-game keeps the sheet honest, and "Next round"
is itself a log entry Undo takes back (with a toast); a backup carries
Matt's name and a live round's log, and import keeps both (the name only
when the phone has none); a night with nothing in it is deleted when he
backs out of its first round or its live setup; a category page reads only
the pictures its tiles show, by id, instead of every photo in the store;
the high-score hero and player tiles are one function shared by the two
game pages; name chips and "people played with" treat "sam" and "Sam" as
one person; and score boxes format when the finger leaves them, not on
every keystroke.

**Verified 2026-10-18, version 11**, same browser, same size: Pinball's 43
tiles and Spider-Man's hero and two player tiles drew as before → on Catan,
Score it live then Never mind left no night behind and landed on the game
→ a live round with Matt, Jordan and "sam", 3 rounds: scrolled to 295px, +1
on the third card kept the page at 295px → 50, 100, Next round (2 of 3),
10, Undo took the 10, Undo again said "Back to round 1." → Change the game
with Matt dropped: the sheet's columns read Jordan and sam, Jordan's +100
and sam's +1 stayed in their own columns, totals 100 and 1. No console
errors.

**Version 12, 2026-10-21 (I12, the Dark Room repaint):** the kit's
20 October tokens and stylesheet copied in, so every panel is lit by the
one lamp from the top left, raised and floating things carry the named
elevations and the light edge, and grain scales by surface. The sleeve
rack replaces the four cycling tones: a category wears one sleeve
(tangerine, gold, leaf, lilac, lagoon by its order, kept on the record
for new ones) and its symbol tiles, night covers and picture slot take
that sleeve's gradient; the players on a game wear the sleeve two along,
so a screen shows two sleeves beside signal. The high score is the app's
one plum field, with the loud number on it. "Live now" on a night is a
peach hint; "Leading" on the live board is gold. The symbol picker cycles
the rack. Gradient sleeves are the kit's provisional form; if Matt pulls
them, `.dr-cover--flat` on the symbol tiles is the fallback.

**Verified 2026-10-21, version 12**, same browser, same size: Home showed
Pinball in tangerine and Tabletop games in gold, each with its symbol and
badge → Pinball's 43 tiles all wore tangerine → Spider-Man showed the
symbol slot in tangerine, the high score on plum with peach eyebrow and
cream number, and Matt and Jordan in leaf → Catan's totals panel carried
the lamp. No console errors.

**Published 2026-10-18:** workflow run 1 on commit `6951d49` succeeded
16 seconds after the first push, without anyone switching Pages on by hand
(the agent could not see the repository settings: the desktop app's browser
is not signed in to GitHub). `curl` on
<https://mattaldapa-design.github.io/GG-/> returned 200 and served sw.js at
`gg-v2`; in the desktop app's browser the page loaded with the manifest,
Pinball at 43 games, and the service worker "activated", no console errors.

**Verified 2026-10-18** by the agent in the desktop app's built-in browser
at 375×812, served by the launch.json server: first open seeded 1 category
and 31 games → Pinball lists all 31 with the leader on each row → Spider-Man
shows 21,932,000 Matt as the high score, Matt #1 and Jordan #2 → Matt's tile
lists his one score → Add a score with 25,000,000, today and "Test arcade"
saved, became his Best, and the game page's high score followed → "Who
played?" with a new name Sam went straight to his first score → a synthetic
800×600 picture attached, was stored as an 18 KB JPEG and showed on the
score row and on Sam's tile → renaming Pinball in place changed the title
and the trail and back again → the service worker reached "activated" with
the shell and fonts cached. No console errors. **Version 2, same browser:**
Pinball opened as 31 tiles A to Z (Addams Family first) → "spid" in the
search left one → List showed it as a row, and all 31 with the search
cleared; the choice persisted → a synthetic 1200×750 picture attached to
Spider-Man showed at the top of its page and on its tile → tapping the
picture offered "From your photos" and "Remove the picture"; removing it
cleared the slot and deleted the stored photo. No console errors.

**Not verified:** anything on an iPhone (home-screen install, the photo
picker, the share sheet for backups); the backup file itself was not opened
in this session.

**At risk:** the service worker serves the app shell cache-first, so a
changed file does not reach an installed phone until `VERSION` in
`app/sw.js` and `APP_VERSION` in `app/js/app.js` are bumped together.

**Seed completed 2026-10-18:** Matt named the 12 Stern cards whose logos did
not print (see `reference/stern-insider-scores-2026-10-18.md`), so the
seed now holds 43 games: his 22 from Notes and 21 from Stern Insider.

## Runbook

1. **Preview on the PC.** In the desktop app, start the `gg` server from
   `.claude/launch.json`; it runs
   `python -m http.server 8790 --bind 127.0.0.1 --directory app`. Open
   <http://localhost:8790>. Warning: after editing files under `app/`, bump
   `VERSION` in `app/sw.js` or unregister the service worker in the browser,
   or the old files keep being served.
2. **Publish.** The code is on GitHub at
   <https://github.com/mattaldapa-design/GG->. Pushing `main` (this folder's
   branch is pushed there as `main`) runs `.github/workflows/pages.yml`,
   which serves `app/` at <https://mattaldapa-design.github.io/GG-/>. Pages
   came on with the first run on 2026-10-18 without a hand switch; if a
   later run fails on Pages, the switch is Settings → Pages → Source →
   GitHub Actions. Bump `VERSION` in `app/sw.js` and `APP_VERSION` in
   `app/js/app.js` together with every publish, or phones keep the old
   files. Push with `git push origin claude/project-kickoff-985f79:main`.
3. **On the phone.** Open the published address in Safari or Chrome on the
   iPhone, Share → Add to Home Screen, then open it from the icon.
4. **Start over on a phone.** Delete the home-screen app and add it again; the
   first open seeds Pinball afresh. Import a backup instead to keep scores.

## Intentions

What Matt has said he wants, in his words, not yet decided. Each closes in one
of three ways: promoted to a Decision, absorbed into the signed Goal, or
struck.

- **I1 — A phone app that archives scores for the games Matt and his friends
  play, and keeps score live for some of them.** *(2026-10-18)* **Absorbed
  into the Goal, 2026-10-18.** The pitch, as Matt said it:

  *"it's going to be an application that um, I'll mostly be using on my
  phone, um, but really what I want it to do is um, I want it to be able to
  track scores for various recreational games that I play with my friends.
  Um, I want it to like, let me give you an example. Like I currently um, have
  a like a notes document on my iPhone which is just uh, um, basically just me
  typing in um, the scores that I have, the high score that I have for
  pinball, um, and some other games, and like I kind of use it to keep track
  of um, the like like what I've won and stuff like that. Um, so like, and I
  and and me and my friends kind of keep track of him. Individually, I also
  like. I also play some some board games together. Uh, we play board games
  together, and sometimes we like to keep track of who won the game, what the
  game was, and what the scores were. That kind of stuff, and and just keep
  track of it. Uh, like when we played it, and everything. So it's mostly like
  a an archiving type tool, and and being able to to keep track of those over
  time, um, yeah. And I have a I have an idea on on you know how it will. It
  will work. Like I imagine, the app will be something that you uh, like. I
  open up, and like, let's say, like I have like a pinball like section, and I
  tap pinball section. Then it has all the cabinets that I've played for
  pinball, all the different games um, that I can like add a photo of. I can
  enter in the high score. I can have my friends that I've added um, like
  myself. And what their score, high score is, um, I can have like the date
  that the high score was achieved, um, I can um, share that out with them,
  um, as well, and then like, I also um, you know, and then I can do the same
  with like maybe a very a certain board game. So instead of like pinball, I
  can have like a board game section, and I can tip board games, and I can go
  into that section, and I can add a board game, and I can add the scores,
  uh, on there, and the date and stuff. And it's the same kind of concept, um,
  and then I would also like it to have a feature where I it can also um, for
  certain games it can keep score for me. So I can like use it for specific
  scoring purposes on the moment. Like if I'm playing a game in real time, I
  can create a score sheet for it and uh, input my scores on the fly and then
  add them to the game once I'm done. So like if I'm playing um, like
  pickleball or something like that, and I need to keep track of the score on
  my phone or something like that, I can use it to to track the points for
  that game. And I can add that to my um, I can add it to the game's profile
  in the app."*

  Closed 2026-10-18: absorbed into the Goal when Matt signed it. What the
  first version records for a game, and which games it keeps score for live,
  are still open and will be decided under the Goal.

- **I2 — GG! has the same shape and feel as Matt's travel journal app: a home
  page of categories, a category holds its games, a game holds its scores.**
  *(2026-10-18, drafted by the agent.)* **Confirmed by Matt 2026-10-18**,
  choosing the first version: *"I just want to make sure it's clear that
  this is going to be uh, the, a similar app style where I can save it to
  my iPhone um, home screen. Much like in my journal application."* Matt:
  *"I imagine that I have my homepage with with my different um, games that
  I I play, um, at least like our category of games. Um, and then like I can
  go into those categories and within those categories, I can select specific
  things."* The pattern comes from a travel journal he has nearly finished:
  *"Australia would be the equivalent of pinball. And then each day within
  that tr- that trip of Australia uh, instead would be the uh, name of the,
  the the game, the pinball machine that we're playing."* And: *"it's kind of
  like like the same feeling of uh, that app that I made. Is a good starting
  point for this."* He wants the agent to look at that app before building,
  but: *"I don't need you to like infer the um, like all the details of what
  I'm going to want to include in it."* The app lives at
  `D:\Moments That Matter\.claude\worktrees\journaling-app-0aafd1` (Matt,
  2026-10-18), and runs live at
  <https://mattaldapa-design.github.io/moments-that-matter/>. The agent
  walked it on 2026-10-18: Trips → a trip's days → a day's board of moments
  → add (a grid of kinds, or type anything) → a moment's editor (picture
  first, then title, place, note, optional details). Same Dark Room style.

  **Settled 2026-10-18:** the agent walked the journal and Matt confirmed
  the shape; the Decision of 2026-10-18 on the app's form carries it.

- **I3 — On a game's page, + adds one player: their name, their score, a
  photo of it, and where and when. A player's entry can hold more than one
  score, each with its date; the highest is what shows from outside. The
  page shows the high score at the top with the holder's name, and the
  other players' scores beside it.** *(2026-10-18, drafted by the agent;
  updated the same day with his answer below.)* **Confirmed by Matt
  2026-10-18**, shown the whole entry: *"Yes!"* The wording is the agent's.
  Matt, asked what + adds on a game: *"let's say the cabinet that I'm
  playing is the Deadpool [...] cabinet. And so what I would do is I would
  hit, so so that would be like the day I'd go into the Deadpool cabinet and
  then I hit plus and then I would input my name, my high score, maybe a
  photo that I took of the high score, um, where and when I attained that
  score. And then if I go back out and I'm in the, the Deadpool you know,
  cabinet page, the high score shows at the top and with my like name next
  to it. And then if I add another plus, I can add uh, a friend's score and
  I could do the same thing for a friend. So I could see like my friends
  right next to mine. So it's kind of the similar to like the moments that I
  add for the day, but those moments instead are just different players on
  that cabinet. And what their score is, so I can kind of compare it with
  theirs."*

  Tabled by Matt in the same breath: a friend sharing their score into his
  copy of the game, the way the journal shares a day. *"it might have to
  work as like a a cabinet level. So because since since since that's really
  based on date, um, and so maybe we just have to have, make sure we have
  the same name and title of it or something like that. But I think that
  would be cool. And or right now we can just like table that as a side."*

  *Added 2026-10-18*, asked whether beating his own score adds a second
  entry or changes the first: *"you would just click on the same moment in
  your um, uh, that you that you had, and then you can just add a new score
  to it. If you want to, um, you can either edit your high score that you
  had in there and just remove the other one, or you can just add another
  line item another score and um if it's higher it'll move into the higher
  score spot but other than that it's um you know maybe if you want to have
  multiple scores on there like a second highest or something or I don't
  know like you can maybe add a just a, another line item of the score and
  the date that you got it if you really want to just keep track of every
  single score that you got but really what's going to be shown is your
  high score um from the like outside view of that."*

  With his confirmation Matt sent his current record: a screenshot of the
  iPhone Notes page he keeps today and its text, 22 pinball cabinets with a
  score for "J" (Jordan) and "M" (Matt), some blank. Kept word for word in
  `reference/pinball-notes-2026-10-18.md` and
  `reference/notes-screenshot-2026-10-18.png`.

  **Settled 2026-10-18** by Matt's confirmation. What it means in the build
  will be recorded as Decisions.

- **I4 — A category shows its games as tiles, alphabetical by default,
  with a search box at the top and a list view to switch to; a game can
  carry a picture of itself, shown at the top of its page and on its tile.**
  *(2026-10-18, drafted by the agent.)* **Confirmed by Matt 2026-10-18**,
  shown the entry: *"Yes, I4 is what I want. Build it."* Matt, after the
  first build: *"when I go into pinball, there it's a list view. I
  think I want it to be tiles. Um, the tiles can be listed alphabetically, I
  think, as a default, but I would like to be able to search for the like a
  game at the top, so that way I can just like go directly to it as my list
  gets longer. [...] I think it's a little boring just having it as a list
  view from there. I think we should be able to have a, a list view and a
  tile view from, from that. And that way I can also, like when I open up
  the the cabinet itself, um, I can also attach a picture. Um, so like of of
  it to the game itself. If I want to have like a little visual image of
  like, let's say Spider-Man at the top. And that way the tile in, in the
  uh, in the pinball folder shows the um, the cabinet that I'm I'm referring
  to. This can also be the same photo that I add to like my own score um, on
  my own little tile."* The agent's reading of the last sentence: the game's
  picture can be chosen from a photo already on one of its scores, as well
  as from the photo library; it is not that every score photo becomes the
  game's picture.

  **Settled 2026-10-18:** confirmed, and built as version 2 (see Current
  state).

- **I5 — The home-screen icon is a six-sided die, a little 3D, its three
  faces carrying outlines of a pinball machine, a meeple and a hand of
  cards, so GG! is told apart from the journal while keeping the same
  design.** *(2026-10-18, drafted by the agent; not yet confirmed by
  Matt.)* Matt, after adding the app to his home screen: *"the icon that I
  save um, onto my home screen looks very similar to the one uh, for my
  journaling app. Which is okay, because they're like kind of the same, but
  um, I want this one to look a, like a dice. Um, so like that way it gives
  kind of that that same design, but but I want it to be a um, let's
  actually have it be like a um, like a Six-sided dice with at least like
  some pips showing. Uh, it doesn't have to be all of them, maybe just make
  it look a little bit like um, 3D."*

  *Added 2026-10-18*, shown the first drawing (a red die with five, three
  and one in pips): *"I like the concept. Um, but now, actually, instead of
  pips, um, let's have the three sides have a just an outline of um, of
  these of three different objects. The the uh, front side, on the bottom
  left, where the three pips are, I want that to look like the outline of a
  pinball. Machine. I want the top to look like the um, um, to look like a
  meeple, uh, the the design, uh, you know, for from a meeple design from a
  board game, and then I want the last one to look like um, um, like a hand
  of playing cards."* The agent's readings: the pinball machine as its side
  profile (backbox, sloped cabinet, legs); the cards as three fanned.

  *Added 2026-10-18*, shown the second drawing (cream outlines on the red
  faces): *"I want to inverse the um, outline, though. So the outline uh,
  the outlines should be red and um, it's like the the icon is engraved
  within the die, um, as a solid white. [...] so just inverse the, the reds
  and the whites in this case. And also shrink them down to be a little,
  um, they're a little blocky. Um, this way I would like them to just be a
  little more rounded in their edges. There shouldn't really be too many
  sharp corners in, in the design. So a little more compact and, and and
  rounded."*

  *Added 2026-10-18*, shown the third drawing (solid cream shapes, red
  edges): *"that looks good. I think the cards look the best. The um, the
  meeple has a line through its head, that needs to be fixed. And I don't
  think it needs to separate the the head from the body [...] it's almost
  like a starfish in how it's designed, except it, it should still really
  look be a be a meeple. Um, um the the arms don't need to be bigger than
  the legs. [...] the pinball machine [...] the legs should kind of be an
  extension of the the actual table portion of the pinball machine. Um, it
  looks like they're just kind of glued on, so like the red outline, if
  it's going to be outlining, it should outline the leg, like it should all
  be one outline from the legs to the um, the machine, as well as um, you
  know, with with probably only the score of the video um, screen on the
  top, being the only red outline. Um, within the interior of the machine,
  we can keep the little plunger as well [...] but I think we should kind
  of smooth that out uh, all a little bit so everything is is looks
  consistent."*

  **Settled 2026-10-18**, on the fourth drawing: *"Yes, that looks good. Go
  ahead and publish it."* Published as version 3. The icon is drawn in code
  (an isometric die in signal red on warm black, cream shapes set into the
  faces); the drawing script is not kept, the PNGs in `app/icons/` are the
  artwork.

- **I6 — For a board game, each time it is played is its own tile on the
  game's page: the date, who played, who won. The top of the page keeps
  Matt's totals: how many times he has played it, how many he has won, and
  the highest score he has won with. Adding a night adds a tile and the
  totals follow.** *(2026-10-18, drafted by the agent; not yet confirmed by
  Matt.)* Matt, choosing game nights as the next piece: *"in board games, I
  go into board games and then it has Catan as the uh, just as as the tile
  there. And then when I go into Catan, um, then I have the um, the each
  game is its own moment. So so um, that's where you'll have like the um,
  the date on that tile that it was played, who played, the game, and then
  maybe who won that game. And then I'm saying that, like, if I go into
  Catan at the top, it would probably have, like, my total games that I
  played of Catan that I have entered in there and how many I've won. Um,
  and maybe my highest score. Uh, that I've won with. Uh, and then, like, I
  can just add more of the each time I play Catan with people, I can just
  add that to the um, as a as a new little tile. And it'll update that top
  information."* So a board game's tiles are nights, where a pinball
  cabinet's tiles are players; which way a game works is a choice the
  agent has asked about (per game, or per category).

  *Added 2026-10-18*, choosing per category: *"with board games, you know,
  it, it's it could be a little nuanced because like there are some board
  games where you you know, you usually have a winner at the end, whether
  you win or you lost. But sometimes one night is is um played over the
  course of a couple of games as well. So you could play multiple rounds in
  a night, uh, and and have multiple winners on a night. As well, so that
  should be something that can be captured. But really, what I want, like
  at the you know, this is for me, and Catan is my game that I uh made. So,
  like, it's gonna have my scores at the very top of how many games I
  played, you know, maybe the number of different people I played with. Um,
  um, but uh, you know, each each tile can have uh, you know, will really
  focus on that night. And uh, like the the scoring for that game in, in
  particular. Which which sometimes I might have to explain how the scoring
  works. uh, on a game, because um, um, you know, scores can be very, very
  high in some some board games, and then they could be you know, you could
  just they could just be one zero uh, on another type of game."* The
  agent's readings: "games I played" counts rounds, not nights; the
  explanation of scoring is a note on the game, written once.

  **Settled 2026-10-18** by the Decision below on categories; built as
  version 4.

- **I7 — In a game, + can score a round live: Matt tells the app how the
  scoring works, adds each person's points as they happen, and when the
  game is done the round lands on the game as its own tile.**
  *(2026-10-18, drafted by the agent; not yet confirmed by Matt.)* Matt,
  choosing live scoring as the next piece: *"a live score in the moment um,
  is might be the probably the trickiest because I would imagine that you
  can, like, this is mostly going to be for board games. Maybe we should
  even just call them tabletop games because they're maybe they may be card
  games too. [...] the way that I would like to do it, so maybe in a
  perfect world is that like if I'm in the game, I can hit the little plus
  sign and live score a game in the moment. And so for that one, I would
  need to make sure that I can tell the app what the scoring is like in
  there. So like whether I'm gonna do points scoring and add each person's
  points up, um, it would be nice if I can like like keeps track of those
  in real time. Um, so like if somebody gains a point, I can I can add
  their point to this this app. As well, and um, and have that type of
  scoring. Um, and then when I'm when I'm done, when I finish the game,
  that that can turn into a game series within the um, like its own tile,
  its own you know game moment within the, the game that I'm playing."*
  The agent's reading: the first live version is a points tally, a big +
  per person, highest total wins, with an optional "playing to" number; it
  lives in games-played categories, where a finished live round becomes a
  round on that night. "Tabletop games" is a passing remark about the
  category's name, not acted on; the category can be renamed in the app.

  *Added 2026-10-18*, asked whether a points tally is enough: *"Yeah,
  that's that's great. You know, because sometimes a game could be
  triggered by the number of turns and not necessarily by a highest total
  or anything like that. So you should have the option to just you know,
  choose when to end the game as well. And then like, um, sometimes the
  winner of the game could be the lowest score as well. So maybe you can,
  can can when you end the game, you can preset whether it's high score
  wins or low score wins as like a toggleable switch. Um, same thing with
  like, let's say there's um, a trick-taking game or something like that,
  and and a game's played over the course of rounds that you're logging,
  and then uh, you know it's totaling up to a to a total score. You know
  you can you can put the number of rounds in, um, and then you know it can
  it can reflect against the highest score, lowest score, winning."*

  **Settled 2026-10-18** by that answer; built as version 5.

- **I8 — Sharing, the simple way: export a readable list of games and
  high scores to send to a friend, and a bulk-add screen that adds a person
  and their scores across all the games in one go.** *(2026-10-18, drafted
  by the agent.)* **Confirmed by Matt 2026-10-18**, shown the entry:
  *"Yes, I8 is what I want. Build it."* Matt, thinking it through after
  live scoring: *"what I'm using as my my base of of uh,
  functionality is similar in the journaling project where if somebody has
  the same date and they share the day with you, their moments will come in
  as their own and you can import them into that same day because they
  share the same actual date. [...] I don't know if it's going to work the
  same. [...] the worst thing that I can do is I can just add them as
  another person and, and count their score next to mine. [...] The only
  thing that I think that will be is it'll be a lot of um, it'd be a lot of
  coordinating. So the way that I'm trying to think of it first is that I
  think what we should really do is focus on what what are we exporting?
  And I would say we can export a list of games um, to share out with
  somebody, and then they can just look at that list of what your highest
  scores are. For what games, and then they can just add them like maybe
  there is a, a bulk add feature of the games like of all your cabinets
  that you already have installed in your game, and you can just easily add
  a person and add their scores to that from just one screen that lists
  them out as you're adding a person."* Set aside by Matt for now: a
  file import that matches a friend's games to his by name, the journal's
  way (by date). The agent's readings: the export is a plain, readable
  list (text or a picture for the share sheet), one category at a time or
  all; the bulk-add screen lives in a high-scores category, lists its
  games with a score box each, and skips the ones left blank.

  **Settled 2026-10-18:** confirmed, and built as version 6.

- **I9 — "Tabletop games", not board games; "where" is optional and says
  so; and a live score sheet: each person's total with what they scored
  each turn added to it, or taken off, climbing toward the target.**
  *(2026-10-18, drafted by the agent; not yet confirmed by Matt.)* Matt:
  *"I want to change all iterations to uh, of of board game to tabletop
  game. Um, I don't want where to be um, I don't want where to be a
  default thing. I think that can be added. Um, or at least if you want
  to, you can, it can just say optional next to it. Um, With the scoring
  uh, on the board games, one thing I would like is like, I'd, I'd like a
  score sheet feature. So like I can live do score sheets and like if
  somebody's keeping track of the score, they can do it on the app instead
  of using a pen and paper. Um, I kind of want that to be something that
  we're that we're doing and, and like each person can have their live
  score next to it. Um, you know, I'm gonna use an example. There's a board
  game called Farkle. And uh, that is going to be scored by first person to
  200 is going to be the winner. And so one of the things that I like to do
  is like, it'd be nice to um, you know, have my total score and then
  whatever I score each round, each on each of my turns, I can just add
  that to my total score. Which is accumulating towards 100. Um, so I can
  either add or subtract based on whatever I whatever the game entails.
  And that way I just know how close I'm getting to that and I can keep
  track of everybody's score, like player one, player two, player three."*
  The agent's reading: the live board of version 5 already keeps a total
  per person with points added or taken off each turn and a score to play
  to; what it lacks is the sheet itself, the turn-by-turn record one sees
  on paper. So the build is the sheet under the board, and the points box
  made the main control. "Tabletop" is applied to the app's own words and
  the seed; Matt's quoted words in this file stay as he said them.

  **Settled 2026-10-18**, shown the sheet: *"Yes, that's the score sheet I
  meant."* Built as version 7.

- **I10 — A category can keep both high scores and games played; a game
  in it shows both, and + asks which one.** *(2026-10-18, drafted by the
  agent in chat, confirmed by Matt the same day: "Yes, I think that's
  something that I, I want.")* Matt, after the tabletop rename: *"the
  realization is that um, you know, like I, anybody can just custom make
  their category and their rule set. Um, you know, and that, which makes me
  also think, you know, if you are doing either high scores or games won or
  anything, maybe it should just be an option if you want a combination of
  both for that game. For that category, that is. Is that possible?"* The
  agent's additions: an existing category can be switched between the
  three from its page, since Pinball on his phone was made before this.

  **Settled 2026-10-18** by his confirmation; built as version 8.

- **I11 — A category or game with no picture gets a default symbol, one
  of a set of about twenty drawn in the app icon's style, picked at random
  when it is made and changeable, so the tiles are not blank colour.**
  *(2026-10-18, drafted by the agent; not yet confirmed by Matt.)* Matt:
  *"I love, you know, it's using my my darkroom color palette. Um, but kind
  of like what we did with the um, home screen app icon, I want some, I, I
  want every added category to um, have a generic um, like I want it to
  default to a, a randomized um, symbol or or at least like I want the
  user to have to choose a icon for it if they don't have a picture already
  or to use. That way it's just um, like I think I think there's I think
  there there could be just default game icons that we can design together.
  Um, that encompass a variety of uh, um, like objects that are used. So
  like let's say like we have a pinball machine, we have a um, you know, we
  have a token or a quarter. We have a um, a, a video game controller, a
  um, a meeple. Like all these, like like maybe like let's come up with a
  list of like twenty different items, like like a hand of cards, a spade,
  a um, uh, I don't know, as many different a twelve sided dice, as many
  different items as we can think of that it will just randomize default to
  when you start a new um category or adding a new cabinet you know that
  you don't um have a picture for immediately. That way it's just not a
  bunch of blank swashes of my of my um color palette."* The agent's
  readings: the symbols are drawn in code like the icon (a cream shape
  with a darker edge on one of the four tile tones); they go on category
  tiles and game tiles, and the picture sheet gains "Choose a symbol".

  *Added 2026-10-18*: *"I think that I can also have a, either a photo for
  a person that I add or for myself, or use one of these icons For um,
  their profile."* So a player's tile, too, can carry a photo of them or
  a symbol, chosen on their page. Matt said "Yes, and that's good" before
  the agent had actually shown him the list of twenty (the agent's slip);
  the list is still his to check.

  *Added 2026-10-18*, shown the list of twenty (pinball machine, token,
  game controller, meeple, hand of cards, spade, twelve-sided die,
  six-sided die, trophy, arcade joystick, dartboard, eight ball, paddle,
  chess knight, domino, bowling pin, puzzle piece, poker chip, crown,
  hourglass): *"All right, just three more that I really want for personal
  reasons And it's more or less custom for me. I want a um, a little alien
  uh, a UFO and a disco ball."* Twenty-three in all.

  *Added 2026-10-18*, shown the first sheet: *"it's a good start. I like
  the general shapes, but um, this is like like the you know darkroom is
  kind of like a like a punk poppy like art style, and the um, it has a bit
  of a like like you know the, that means it has like a little bit of a, a
  gloss to it, and and these feel kind of flat. So um, you know, I want
  them to. To feel a little more a little more sleek than the hard shapes
  that these are are in. [...] the alien eyes. Um, they need to just be um,
  like the eye holes. They are. They just need to be like flipped inverse
  um, from each other, so that way because um, right now they're kind of
  pointing like at the base outward. Where they should be pointing at the
  base inward of the eye."* So: a gloss (a light from the top left over
  each cream shape, a shade at the bottom), a thinner edge, and the alien's
  eyes tilted so they funnel toward its chin.

  **Settled 2026-10-18**, on the second sheet: *"Yes, that's the look."*
  Built as version 9.

- **I12 — A fresh coat of paint from the updated Dark Room kit (sleeve
  rack and depth, 20 Oct 2026), for more visual variety.** *(2026-10-20,
  drafted by the agent; not yet confirmed by Matt.)* Matt: *"the darkroom
  style design that I have incorporated into this project just received
  some updates. I think it'd be nice to try and incorporate them into the
  design that we already have currently. That way it has like a little bit
  of a fresh coat of paint based on some of the feedback I had. [...] apply
  the kit and give the app a little more visual variety given the
  expansion of the design kit."* What the kit added, read by the agent in
  the dark-room skill folder (the same files as `D:\UI Guide\Dark Room\`):
  sleeve colours (tangerine, gold, leaf, lilac, lagoon) for things rather
  than chrome, at most two per screen beside signal; plum as the one other
  large field; peach and rose tints; a heat ramp; gradient sleeves
  (provisional, `.dr-cover--flat` the fallback); one lamp lighting every
  panel from the top left, three named elevations, grain scaled by surface.
  The agent's draft of how it lands on GG!: the kit's new tokens and
  stylesheet copied in; each category wears one sleeve and its symbol tiles
  take that sleeve (so a shelf shows one sleeve beside signal, not four
  tones); players in a second sleeve; the high score panel as the one plum
  field; sleeve badges on the Home tiles; "Live now" as a peach hint. The
  kit's own working rule asks for a `ui-refresh/<app>` branch made by Matt
  before any restyle; none exists here, and the agent asked.

  **Confirmed by Matt 2026-10-21** in substance, with the Decision below on
  where it runs: *"you can make these updates and add these kind of
  cosmetic changes to your main thread."* The mapping above is still the
  agent's draft until Matt sees it.

  **Settled 2026-10-21**, shown four screens: *"Yes, that's the look."*
  Built as version 12.

## Decisions

Dated, append-only. Each says what was chosen, the alternative, why, who
decided, where it is enforced, and what it **serves**.

- **2026-10-18 — This project started from a portion of Starter Dough
  (commit `9c1fcb3`, standard version 5).** Matt pitched the app in a session
  opened inside `D:\Starter Dough`. Alternative: build it there. Why: the
  kit's own rule is that a project takes a portion into its own folder.
  Enforced: this folder; `README-STANDARD.md` and `CLAUDE.md`, copied from
  the kit's commit `9c1fcb3`. **Serves →** Goal.

- **2026-10-18 — The folder is `Friendly Competition`; the app is named
  `GG!`.** Matt: *"the folder is going to be called Friendly Competition"* —
  and: *"I want the app's name to be the letters GG with an exclamation point
  at the end. So kind of like saying good game. Um, to each other."*
  Alternative: none was offered; both names are Matt's. The folder's
  capitalisation and its place, `D:\Friendly Competition` beside his other
  projects, are the agent's. **Serves →** Goal.

- **2026-10-18 — The first version is pinball only: categories, the
  games in each, and on a game one tile per player holding their scores
  (I3), loaded with Matt's 22 cabinets.** Shown three options, Matt: *"let's
  just start with number one."* Alternatives: (2) add game nights played
  together, with who played, the scores and who won; (3) that plus live
  scoring. Why they lost: both take longer before the app is on his phone,
  and both add a kind of entry on top of (1) without reworking it; live
  scoring has the most unknowns. Recommended by the agent, chosen by Matt.
  Enforced: the two "Not now" entries below; the first build. **Serves →**
  Goal (the high-score part) and I3.

- **2026-10-18 — GG! is an installable web app in the journal's mould:
  added to the iPhone home screen from a published address, Dark Room
  style, the same kind of build (static files, data on the phone, offline
  through a service worker).** Matt: *"this is going to be uh, the, a
  similar app style where I can save it to my iPhone um, home screen. Much
  like in my journal application. And so we can um, I'm already logged into
  GitHub. And so we can always do that step whenever it's necessary."*
  Alternative: a native iPhone app. Why it lost: Matt pointed at the journal
  as the model, and a native app would need Xcode and the App Store rather
  than a web address. The agent's inferences: that "that step" means
  publishing through GitHub Pages as the journal does, and that the build
  uses the journal's stack. Asked outright whether "that step" means GitHub
  Pages, Matt: *"Yes, unless um, unless you see any reason why we shouldn't
  go the same route."* The agent's one caution is the Open item below on
  sharing. Enforced: an `app/` folder served as static files; a Pages
  workflow when it is time to publish. **Serves →** Goal ("on his phone"),
  I2.

- **2026-10-18 — One game per title, whatever the cabinet's iteration;
  the Where on a score is what tells two machines apart for now.** Matt,
  on the Stern score of 41,354,380: *"The 41, 254 is actually for a
  different the walking dead machine than the one I have on my notepad-
  which is a nuance I didn't consider is that some IP's have different
  iterations of the same cabinet. [...] but I don't think that nuance needs
  to be completely fleshed out yet - so for now treat them as one and the
  same. The location that you got the score will help identify that element
  of the machine for now."* Alternative: a game per iteration, or an
  iteration detail on each cabinet; parked under Not now. Why: Matt's call,
  not fleshed out yet. Enforced: the seed puts that score on Walking Dead as
  a second line for Matt; the app has no iteration field. **Serves →** I3.

- **2026-10-18 — A category is either "high scores" or "games played",
  chosen when it is made, and every game in it works that way.** Matt,
  asked whether the choice is per game or per category: *"Yeah, I think
  category is the is what I'm imagining."* Alternative: per game, asked
  each time a game is added. Why it lost: one fewer question per game, and
  it matches how Matt described it (pinball one way, board games the
  other). Recommended by the agent, chosen by Matt. Enforced: `kind` on a
  category (`scores` or `nights`), asked on the "Add a category" page;
  Pinball from the seed is `scores`. *Widened 2026-10-18 by I10:* a third
  kind, `both`, and the kind can be changed on the category's page.
  **Serves →** I6, I10, Goal.

- **2026-10-21 — The Dark Room repaint runs on this project's branch, as
  version 12, not on a `ui-refresh/gg` branch.** Matt: *"the dark room was
  implemented from the start on this project. So the stuff about the
  separate branch was mostly intended for projects that that I designed
  dark room after they're created. And so I wanted to make sure that it
  didn't impact the design, but since it's already kind of built in, to
  it, you can make these updates and add these kind of cosmetic changes to
  your main thread."* Alternative: the kit's playbook (a branch Matt makes,
  a baseline pass, a report before merging). Why it lost: the playbook
  guards apps restyled after the fact; GG! wore Dark Room from its first
  commit. Enforced: this branch, pushed as `main` like every version.
  **Serves →** I12.

**Open decisions — waiting on Matt, oldest first:**

None.

## Not now

- *2026-10-18* — **Game nights played together** (who played, the scores,
  who won, the date). Part of the Goal; after the first version, by the
  Decision of 2026-10-18 on scope. Taken up the same day as I6.
- *2026-10-18* — **Live scoring** for a game played in the moment, such as
  pickleball. Part of the Goal; after game nights, by the same Decision.
  Taken up the same day as I7.
- *2026-10-18* — **A friend sharing their score into Matt's copy of a
  game.** Tabled by Matt under I3.
- *2026-10-18* — **A cabinet's iteration as a detail on a game.** Matt:
  *"some IP's have different iterations of the same cabinet [...] so that
  may be an element to track as well as a 'detail' is the detail of the
  cabinet."* Parked by the Decision of 2026-10-18 on one game per title.

## Open items

- *2026-10-18* — **Sharing beyond a file needs more than GitHub Pages.**
  Pages serves files only; each phone keeps its own data. Sharing works the
  journal's way, by sending a file. If Matt later wants him and Jordan to
  see one live, shared record, that needs a small service behind the app
  (a sync store), which Pages cannot host. Raised by the agent when Matt
  asked for reasons not to go the journal's route; not a reason to change
  the first version.

## Do not

None yet.
