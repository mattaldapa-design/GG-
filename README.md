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
app/                 the build, version 4: index.html, sw.js,
                     manifest.webmanifest, css/app.css, js/app.js, js/db.js,
                     js/util.js, js/seed.js, written by the agent;
                     css/darkroom-tokens.css and css/darkroom.css copied from
                     the Dark Room kit; icons/ is the die icon Matt settled
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
  Pinball from the seed is `scores`. **Serves →** I6, Goal.

**Open decisions — waiting on Matt, oldest first:**

None.

## Not now

- *2026-10-18* — **Game nights played together** (who played, the scores,
  who won, the date). Part of the Goal; after the first version, by the
  Decision of 2026-10-18 on scope. Taken up the same day as I6.
- *2026-10-18* — **Live scoring** for a game played in the moment, such as
  pickleball. Part of the Goal; after game nights, by the same Decision.
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
