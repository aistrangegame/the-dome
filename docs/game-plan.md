# The game plan

**Ruling, October 13, 2026 (Ashrey):** we don't wait on Eric and Mona. We build the whole solution now, from everything already gathered, with a creative stand-in wherever their words (or Cody and Nicole's) belong, each one clearly marked. They see the finished result, and their words and any changes come in as the feedback round.

**State, October 14, 2026:** the full showcase is built in `site/`: every public page, the 13 places on and off the mountain, the Awakening (acts 0 to 7), the story you choose, the booking flow and the dashboard, all working in the browser with no server. Next: Eric and Mona walk it; their words replace the markers; then the Worker, Airtable booking tables and real payments go live.

**Ready to show, October 14, 2026:** film (four drone clips), animated icons, the living places map, the notes guide on every page, and a full audit with all findings fixed. See `docs/handoff-2026-10-14.md` for how to walk Eric and Mona through it.

**Behind the point, October 14, 2026:** the header point opens the dome's own room (`site/play/`): its story in nine stages and three games. *Find the Point* (find the dome from six heights of drone photos, high to close), *One Triangle at a Time* (rebuild the dome from the ground up, one guest per triangle in the order they came, coloured by season, with the leftover triangles kept for guests still to come) and *Be Still* (stillness lights a star for each of 14 guests who wrote about the night sky). The dome speaks there too; see recognition ruling 1.

**Eric's walk-through, October 14, 2026:** only Eric walks it this round (Mona left out, Ashrey's ruling). The whole site sits behind his code at dome.aistrangegame.com, with a guide at `/guide`. He leaves notes, his own words and map fixes, by voice or typing, into one Airtable table, Eric's Notes. Built, audited and tested; waiting on the deploy from Ashrey's Mac (`docs/deploy-prompt.md`). This is step 1.6, done early, for Eric alone. See `docs/keepers-plan.md` and `docs/handoff-2026-10-14.md`.

Each phase below starts when the gate before it passes. No dates are set.

## Phase 0 · Ground — now

| # | Step | Who | State |
|---|---|---|---|
| 0.1 | Repo skeleton | Claude | Done |
| 0.2 | Upload original photos and video to `media/` | Ashrey | In progress |
| 0.3 | Airtable base: Places, Reviews (252), Ideas, People, Media (94 photos catalogued) | Claude | Done |
| 0.4 | **Media mapping:** give every photo and clip a role (page, place, season, act, hero, background); make web copies; write the gap list and Eric's next shot list | Claude, new session | Next |
| 0.5 | **Round two, prepared:** a walk-through for Eric and Mona showing exactly where their words go, plus question lists (arc-storylines method) | Claude | Next |
| 0.6 | **Round two, held:** Eric and Mona's words; prices, seasons, minimum stays, cancellation policy; who handles the paperwork; Stripe account; who the woman in the summer photos is; whether robes and games were theirs | Ashrey with Eric and Mona | — |
| 0.7 | Cody and Nicole, approached by Eric and Mona: how it began, the place each loved, a line for future guests, the real choices behind "What would you have built?" | Eric and Mona | — |
| 0.8 | Paperwork started: NY sales tax, county occupancy certificate, registry, insurance, lawyer agreement | Eric and Mona | — |

**Gate:** Eric and Mona say yes to the map.

## Phase 1 · The Showcase

| # | Step |
|---|---|
| 1.1 | **Words** (shabdakarshini): the dome's voice; Home; three place pages (window, cedar pool, night sky); Awakening Act 1; The new chapter; "What would you have built?" (draft) |
| 1.2 | **Form** (rupakarshini briefs, then Claude Design): Home with the season switch and the drifting white dot; three places; Stay; the dashboard |
| 1.3 | **Worker v0:** availability gatekeeper, quote, hold, Stripe Checkout in test mode, webhook confirm, Airtable mirror, dashboard prices by day |
| 1.4 | **Airtable booking tables:** Property, Seasons, DateOverrides, Blocks, Fees, TaxRules, Discounts, CancellationPolicies, Holds, Quotes, Bookings, Guests, Payments, WebhookEvents |
| 1.5 | **Video v0:** the opening and closing sequence from the rising top-down clip; two scroll backgrounds |
| 1.6 | Deploy to a preview address; Eric and Mona walk it on their own phones |

**Gate:** they walk it and say yes.

## Phase 2 · The Door opens

Real payments (after the paperwork); the domain; all 13 places and printed QR cards; the ideas loop live and credited; stories and the living timeline; the Instagram river; the Airbnb listing retired.

**Gate:** the first direct bookings land cleanly.

## Phase 3 · The House wakes

All seven Awakening acts; smart light and sound through a home hub; the story-you-choose tally; export to your own AI.

**Gate:** ten guests have walked it end to end.

## Phase 4 · Growing

Return-stay levels; seasonal versions; the printed Book of Guests; the same craft carried into the fabric work.
