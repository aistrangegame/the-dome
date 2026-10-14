# Eric's walk-through: game plan, version 2 (draft, Oct 14, 2026)

**Status:** proposed, not yet agreed. Nothing is built until Ashrey confirms the open decisions below.

## The goal
Eric opens one link, reads a short guidebook, signs in with a 4-digit code, walks the real site at dome.aistrangegame.com, and leaves his thoughts wherever he has them. Everything lands in **one Airtable table** that Claude reads and answers. Nothing changes for guests.

## What Eric does
1. Opens **dome.aistrangegame.com/keep**: a one-page guidebook (what this is, how to walk it), then his code.
2. Walks the site. A small bar at the bottom: **Note · Ask · My notes**.
3. **Note:** tap a section (or the whole page), type or speak; speech is written out as he talks.
4. **Own words:** each dashed box shows its questions and a record button; he answers in his own voice and presses Approve when it's right.
5. **Ask:** a question about the page he's on, answered on the spot.
6. **Fix:** on the places map, drag any pin that's in the wrong spot.
7. **My notes:** everything he left, with its status and the reply.

## The one table: Eric's Notes

| Field | Holds |
|---|---|
| Note | A short title, filled in automatically (page · section) |
| Kind (single select) | Note · Own words · Question · Fix |
| Page | Which page |
| Section | Which part of the page, or which dashed box |
| Text | What he typed, or the transcript of what he said |
| Voice | The recording (attachment) |
| Reply | Claude's answer, or the guide's answer to a Question |
| Status (single select) | New · Heard · Changing · Changed · Answered · Approved · OLD |
| Created | When |

The page only ever adds rows. Nothing is deleted; finished notes are marked OLD.

## How it flows
Eric leaves something, a row appears, Claude reads new rows when Ashrey asks, makes the change or replies, sets the status, and Eric sees it in My notes. Replies are signed **Claude · Ashrey Intelligence**.

## Build order
1. Film: the night flight and the full backyard clip into the site.
2. The table.
3. The Worker: code check (locked after 5 wrong tries), add rows, upload voice, the guide (Claude via Ashrey's API key), list Eric's notes.
4. The site: /keep guidebook, bottom bar, notes, own words, ask, map pins, approved own words shown on the live site.
5. Test end to end, then an independent audit.
6. Deploy prompt for Claude Code on the Mac: four secrets (Airtable token, Anthropic key, codes, signing key), deploy to dome.aistrangegame.com; verify live.
7. The message to Eric with his link and code.

## Left out on purpose
Mona; the morning summary; separate tables; R2 (voice goes into Airtable, about 4 minutes per recording at most).

## Open decisions
1. Walk together in this round, or after Eric's first pass?
2. A code for Ashrey too?
3. An Anthropic API key for the guide, or Ask waits?
4. Table name: "Eric's Notes"?
