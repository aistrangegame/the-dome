# Eric's walk-through: game plan, version 3 (Oct 14, 2026)

**Status:** built and tested locally (Oct 14, 2026); waiting on the deploy from Ashrey's Mac. The code is agreed with Ashrey and lives only as a Worker secret.

## Done looks like
Eric opens **dome.aistrangegame.com/guide**, reads the guide, enters his code, walks the whole site, leaves a typed or spoken note on any part of it, and records his own words into the boxes waiting for them. Each lands as a row in **Eric's Notes** in Airtable. Claude reads the rows, makes the changes or replies, and sets the status; Eric sees it all under **My notes**.

## Now (this round)
| Piece | What it is |
|---|---|
| Film | The night flight (night sky place, the home sky passage) and the full backyard rise (home opening, down to the pool; the pool at the cedar pool place). |
| The guide, `/guide` | The way in: what this is, the four layers, how to walk it, what Notes / Add a note / My notes / Own words do; then the code. |
| The code | One code, Eric's; the only door. The whole site sits behind it for now (`/guide` excepted). Checked on the server, locks for 15 minutes after 5 wrong tries, keeps him signed in for 30 days. Stored as a Worker secret, never in the repo. |
| Add a note | Tap a section (or the whole page), type or speak; speech is written out as he talks; the recording goes with it. |
| Own words | Each dashed box: its questions, a record button, Approve. Approved words replace the stand-in. |
| Fix | Drag a map pin to the right spot; saved as a note of kind Fix. |
| My notes | Everything he has left, with status and reply (signed Claude · Ashrey Intelligence). |
| The page notes | The existing behind-the-scenes notes, on and off, unchanged. |

**Eric's Notes** (one table): Note (auto title) · Kind (Note / Own words / Fix) · Page · Section · Text · Voice · Reply · Status (New / Heard / Changing / Changed / Answered / Approved / OLD) · Created.

## Later (held, not dropped)
- **Who's on the site, live**: built with the booking engine. The same Durable Object that guards the calendar can show Eric, in his dashboard, who is browsing and booking right now. It belongs with guest accounts and bookings, not with a one-person walk-through.
- Opening the public pages to everyone, with the dashboard and keeper pages staying behind the code.
- The remaining 86 drone clips (proxies can run on the Mac whenever), the Awakening as played scenes, Worker booking + Stripe, R2 for video.
- Dropped for this project: Ask, walk together, Mona, the morning summary.

## Steps
**Ashrey**
1. Confirm the code. Done.
2. Create an Airtable token: scopes `data.records:read`, `data.records:write`; base The Dome only.
3. Run the deploy prompt in Claude Code on the Mac: sign in to Cloudflare, add three secrets (Airtable token, Eric's code, a signing key the prompt generates), deploy to dome.aistrangegame.com.
4. Walk it once as Eric; leave one test note.
5. Send Eric the message (Claude drafts it).

**Claude**
1. Film into the site.
2. Create Eric's Notes in Airtable.
3. The Worker: the code gate, add a note, upload voice into Airtable, list his notes, approved own words.
4. `/guide`, Add a note, My notes, Own words, map pin fix.
5. Test every path end to end here, then an independent audit, then fix.
6. Write the deploy prompt; after Ashrey deploys, check the live site and the first test row.
7. Draft the message to Eric; update the handoff and the project doc.
