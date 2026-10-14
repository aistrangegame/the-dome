# site/ — the Door

Public pages, one self-contained HTML file each. Speaks in Eric and Mona's voice plus guests' verbatim words.

| File | Page | Shape (rupakarshini) |
|---|---|---|
| `index.html` | Home: the white point blooms into the dome in this season | Door, state-aware |
| `places/index.html` | The 13 places as lights on a map of the property | Navigator |
| `places/{place}.html` | One page per place (also what its QR card opens) | Room |
| `stories.html` | Guest stories, one screen at a time | Telling |
| `how-it-began.html` | Cody and Nicole | Telling, portrait |
| `the-new-chapter.html` | Eric and Mona | Telling, portrait |
| `timeline.html` | 2023 to now, every voice in its season, every change credited | Living timeline |
| `ideas.html` | What guests asked for, what got built, who asked | Crossing |
| `around.html` | The hosts' guidebook as a field guide | Guide |
| `stay.html` | Dates, the all-in price, pay, confirmed | Instrument, then Crossing |
| `your-stays.html` | A returning guest's own stays, found by phone | Portrait |

`assets/css`, `assets/js` for shared tokens and the season switch; `assets/media` for web copies made by `scripts/make-web-media.sh`.

Place slugs: `gate`, `window`, `couch`, `library`, `table`, `loft`, `hearth`, `cedar-pool`, `fire-circle`, `meadow`, `trails`, `night-sky`, `guest-book`.

## What is built (showcase, October 14, 2026)

Every page above except a separate seasons page: the season switch lives in the header of every page and changes photos, colours and lines site-wide. Also built:

- `house/` — the 13 on-property place pages (`house/places/{slug}.html`), the Awakening (`house/awakening/`, acts 0 to 7) and the story you choose (`house/choose/`).
- `dashboard/` — Eric and Mona's dashboard: today, prices and calendar, bookings, guests' words, the ideas board, photos by season.

**Shared files:** `assets/css/dome.css` (tokens, four seasons, markers), `assets/js/dome-data.js` (all content), `assets/js/dome.js` (header, seasons, the drifting point, slots), `assets/js/place.js` (place pages), `assets/js/booking.js` (the booking engine in demo form, same contract as the Worker), `assets/js/reviews.js` (the 252 reviews).

**Markers.** Every dashed card labelled "Eric and Mona's words go here" or "Cody and Nicole's words go here" holds a stand-in draft and the questions that would draw out their own words. The button at the bottom left hides the markers to see the page as a guest would.

**Showcase mode.** Bookings, words and prices are saved in the browser so the whole system can be walked with no server. In production the same calls go to the Worker (`/quote`, `/hold`, `/words`, `/tally`, `/house-cue`) and Airtable.

Regenerate the place and act shells with `python3 scripts/build-pages.py`.
