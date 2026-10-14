# The Dome — Catskill Mountain Domes

*Under the same sky.*

The owned home of Catskill Mountain Domes, kept by Eric and Mona Fernando, built by Cody and Nicole. One living house in three layers:

| Layer | What it is | Folder |
|---|---|---|
| **The Door** | The public site and booking | `site/` |
| **The House** | The 13 QR places, the Awakening and the story you choose, on the mountain only | `house/` |
| **The Keeping** | The owners' dashboard and the Worker over Airtable | `dashboard/`, `worker/` |

Everything else:

- `media/` — original photos and video from the shoots. **Never edited in place.**
- `site/assets/media/` — web-size copies made from `media/` by `scripts/make-web-media.sh`.
- `docs/` — the recognition, the game plan, the booking architecture, the Airtable schema, the media plan and the session handoffs.
- `data/` — exports: the 252 tagged reviews, and later snapshots of Airtable.
- `scripts/` — tools that turn originals into web assets.

## Where the truth lives

- **The map:** Claude Docs, "The Dome — Discovery Walk & Game Plan". Its first two sections, *The Recognition* and *The game plan, whole*, come before everything else.
- **The data:** Airtable base **The Dome** (`appQRdLbtZBzRsb7i`): Places, Reviews, Ideas, People, Media.
- **This repo:** the files that will become the site.

## Stack

Static single-file HTML pages on Cloudflare (Workers static assets), one Cloudflare Worker for the API (it holds the Airtable token and runs the booking engine), Airtable as the back end, Stripe Checkout for payments. The same proven pattern as humsitare.com.
