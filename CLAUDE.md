# Working in this repo

Load the `bindu-dome` skill first. Then read, in order:

1. `docs/recognition.md`, the ground every page stands on.
2. `docs/game-plan.md`, the current phase and its gate.
3. The latest file in `docs/` whose name starts with `handoff-`, for the forward edge.

## Rules

- **Originals are sacred.** Never edit, rename, move or recompress anything in `media/`. Web copies go to `site/assets/media/`, made by `scripts/make-web-media.sh`.
- **Media names match Airtable.** A file's name in `media/` is the `File name` in the Airtable Media table. Look up a file's catalogue row before using it.
- **Respect the media rule.** Never use a file whose Media row says `Photographer in frame? = Yes - do not use`. Treat `Unsure` as not usable on the public site until it is resolved.
- **Guest words are verbatim.** Quote reviews exactly, with first name and review number, from the Airtable Reviews table. Never paraphrase or invent a guest voice.
- **Never invent a real person's words.** Eric, Mona, Cody and Nicole speak only through `||PLACEHOLDERS IN CAPS||` until their own words arrive.
- **Airtable:** never delete a record, field or table; mark it OLD.
- **The dome speaks only on the mountain** (`house/`) **and behind the point** (`site/play/` and the portal the header point opens; ruled Oct 14, 2026). Every other public page speaks in Eric and Mona's voice plus guests' words. On the mountain it stays unnamed until the last act.
- **Private and shared never mix.** Awakening answers stay on the guest's device. Shared tallies are anonymous and opt-in.
- **Words never used in guest copy:** feedback, survey, review, mindfulness, curated, intentional, journey (noun), experience (as a noun for the product).
- **Secrets** (Airtable token, Stripe keys) live only in Worker secrets, never in this repo.
