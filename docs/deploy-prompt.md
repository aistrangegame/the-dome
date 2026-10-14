# Deploy prompt: Eric's walk-through to dome.aistrangegame.com

Paste the block below into Claude Code on Ashrey's Mac. One step, adding the Airtable token, Ashrey does himself in Terminal, so the token never passes through any chat.

Before you start, make the Airtable token at airtable.com/create/tokens:
- Name: `dome-worker`
- Scopes: `data.records:read`, `data.records:write`
- Access: The Dome base only

Copy it; you'll paste it once, into Terminal, in step 4.

---

```
Deploy the Cloudflare Worker for the repo github.com/aistrangegame/the-dome to dome.aistrangegame.com. Work carefully and stop to tell me if any step fails; don't improvise around an error.

1. Get the code. If ~/the-dome exists, cd into it and run `git pull`; otherwise `git clone https://github.com/aistrangegame/the-dome.git ~/the-dome`. Then `cd ~/the-dome/worker`.
2. Run `npm install`, then `npx wrangler whoami`. If I'm not signed in, run `npx wrangler login` and wait for me to approve it in the browser. Confirm the account that owns the aistrangegame.com zone is the one in use.
3. Run `npx wrangler deploy`. It should upload the site, create the Durable Objects (migrations v1 and v2) and attach the custom domain dome.aistrangegame.com. Show me the output.
4. Set two secrets, without printing their values:
   - `openssl rand -hex 32 | npx wrangler secret put SESSION_SECRET`
   - `printf '%s' 'ERIC_CODE_HERE' | npx wrangler secret put ERIC_CODE`  (I will tell you the code in this chat; put it in place of ERIC_CODE_HERE)
   Then STOP and tell me: "Run this in Terminal yourself: cd ~/the-dome/worker && npx wrangler secret put AIRTABLE_TOKEN — and paste the token when it asks." Wait until I say it's done. Never ask me for the token or read it.
5. Check it worked:
   - `curl -s https://dome.aistrangegame.com/api/keep/health` must show "ready":true and "stored":"airtable".
   - `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://dome.aistrangegame.com/` must be 302 to /guide/?next=%2F
   - `curl -s -o /dev/null -w "%{http_code}\n" https://dome.aistrangegame.com/guide/` must be 200.
6. Run `npx wrangler secret list` and show me only the secret NAMES (there should be three: AIRTABLE_TOKEN, ERIC_CODE, SESSION_SECRET).
7. Report back with all the outputs above in one message, so I can paste it to Claude.

Never commit anything, and never write any secret into a file.
```

---

After it reports, bring the output back here. Claude then signs in to the live site, leaves one test note, checks that its row lands in Eric's Notes in Airtable, marks that row OLD, and you're ready to send Eric the link.

**If the custom domain step fails** (for instance, the zone isn't in that Cloudflare account, or a DNS record already exists for `dome`), the Worker still deploys at a `*.workers.dev` address. Bring the error back and we'll fix the domain separately.
