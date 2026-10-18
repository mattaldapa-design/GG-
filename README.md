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
app/                 the build, version 2: index.html, sw.js,
                     manifest.webmanifest, css/app.css, js/app.js, js/db.js,
                     js/util.js, js/seed.js, written by the agent;
                     css/darkroom-tokens.css and css/darkroom.css copied from
                     the Dark Room kit; three placeholder icons (a red disc on
                     warm black, no lettering: the artwork is Matt's)
.claude/launch.json  the preview server for the desktop app
.github/workflows/   pages.yml, ready for when Matt publishes (not yet used)
git                  local only, branch claude/project-kickoff-985f79
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
in this session; the service worker's cache on a published address.

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
2. **Publish.** Not yet done. The plan, by the Decision of 2026-10-18: push
   to GitHub, switch Pages on once (Settings → Pages → Source → GitHub
   Actions), and `.github/workflows/pages.yml` serves `app/` from the
   repository's default branch. Bump `VERSION` in `app/sw.js` and
   `APP_VERSION` in `app/js/app.js` together with every publish, or phones
   keep the old files.
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

**Open decisions — waiting on Matt, oldest first:**


- *2026-10-18* — **Publishing to GitHub Pages**, after the names: Matt
  creates (or lets the agent create, in the browser he is signed in to) a
  repository `friendly-competition` under mattaldapa-design, the agent
  pushes, Matt switches Pages on once, then adds the address to his home
  screen. No remote and no `gh` tool on this PC as of 2026-10-18.

## Not now

- *2026-10-18* — **Game nights played together** (who played, the scores,
  who won, the date). Part of the Goal; after the first version, by the
  Decision of 2026-10-18 on scope.
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
