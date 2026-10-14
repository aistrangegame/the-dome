# worker/ — the API and booking engine

One Cloudflare Worker. Holds the Airtable token and Stripe keys as secrets (`wrangler secret put AIRTABLE_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Full design in `docs/booking-architecture.md`.

| Route | Does |
|---|---|
| `GET /availability` | Free nights for a range, from the property's Durable Object |
| `POST /quote` | Prices a stay (rate-limited) |
| `POST /hold` | Holds nights for 35 minutes and opens Stripe Checkout (rate-limited) |
| `POST /stripe/webhook` | The only thing that confirms a booking |
| `GET /cal/{secret}.ics` | Private calendar export, dates only |
| `POST /words` | A guest's word or idea from a place, held for approval |
| `POST /tally` | An anonymous story-you-choose choice |
| `GET /lookup` | A returning guest's stays, by first name and last four digits of phone |
| `/dash/*` | Dashboard API, behind Cloudflare Access |

`src/index.js` is a stub; every route answers 501 until it is built in Phase 1.
