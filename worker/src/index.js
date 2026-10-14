// The Dome Worker: dome.aistrangegame.com
//
// For now the whole site is Eric's alone (Oct 14, 2026): every page sits behind one code,
// except the guide at /guide, which is the way in. What he leaves goes to the Airtable
// table "Eric's Notes". Without an Airtable token the notes are kept in the Gate's own
// storage instead, so the site can go live first and be connected after.
//
// Secrets (set with `wrangler secret put`, never in this repo): ERIC_CODE, SESSION_SECRET, AIRTABLE_TOKEN.
// Booking routes stay unbuilt (501) until Phase 1: docs/booking-architecture.md.

const COOKIE = "dome_keep";
const DAYS_30 = 60 * 60 * 24 * 30;
const MAX_VOICE = 5 * 1024 * 1024;                     // Airtable's upload limit
const KINDS = ["Note", "Own words", "Fix"];
const BOOKING = [["GET", /^\/availability$/], ["POST", /^\/(quote|hold)$/], ["POST", /^\/stripe\/webhook$/], ["GET", /^\/cal\/[A-Za-z0-9_-]+\.ics$/], ["*", /^\/dash\//]];

// Open without the code: the guide and what a page needs to draw itself. Pages (HTML) and the notes API are not.
const OPEN = [/^\/guide(\/|\/index\.html)?$/, /^\/assets\//, /^\/favicon/, /^\/robots\.txt$/, /^\/api\/keep\/(signin|signout|health)$/];

export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname;
    try {
      if (path.startsWith("/api/")) return await api(request, env, url);
      if (BOOKING.some(([m, re]) => (m === "*" || m === request.method) && re.test(path))) return json({ error: "not built yet" }, 501);
      const signed = await session(request, env);
      if (!signed && !OPEN.some((re) => re.test(path))) {
        if (path === "/" || path.endsWith(".html") || !path.split("/").pop().includes(".")) {
          return Response.redirect(new URL("/guide/?next=" + encodeURIComponent(path + url.search), url).toString(), 302);
        }
        return new Response("Not here", { status: 404 });
      }
      const res = await env.ASSETS.fetch(request);
      return secure(res, path);
    } catch (e) {
      console.error(e);
      return json({ error: "Something went wrong on our side." }, 500);
    }
  },
};

/* ---------------- The notes API ---------------- */
async function api(request, env, url) {
  const path = url.pathname, method = request.method;
  if (path === "/api/keep/health") return json({ ok: true, stored: env.AIRTABLE_TOKEN ? "airtable" : "local", ready: !!(env.ERIC_CODE && env.SESSION_SECRET) });

  if (path === "/api/keep/signin" && method === "POST") return signin(request, env);
  if (path === "/api/keep/signout" && method === "POST") return json({ ok: true }, 200, { "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` });

  const who = await session(request, env);
  if (path === "/api/keep/me") return json(who ? { who, name: "Eric", stored: env.AIRTABLE_TOKEN ? "airtable" : "local" } : { who: null });
  if (!who) return json({ error: "Please sign in at /guide." }, 401);
  const store = notesStore(env);

  if (path === "/api/keep/notes" && method === "GET") return json({ notes: await store.list() });

  if (path === "/api/keep/notes" && method === "POST") {
    const b = await readJson(request);
    const kind = KINDS.includes(b.kind) ? b.kind : "Note";
    const page = clip(b.page, 200).replace(/[^\w\-./#?=&%]/g, "");
    const section = clip(b.section, 200) || "Whole page";
    const text = clip(b.text, 8000);
    if (!text && !b.voiceComing && kind !== "Fix") return json({ error: "Say or write something first." }, 400);
    const row = {
      Note: clip(`${clip(b.title, 80) || page} · ${section}`, 180),
      Kind: kind, Page: page, "Page title": clip(b.title, 140), Section: section, Text: text,
      Value: clip(typeof b.value === "string" ? b.value : JSON.stringify(b.value ?? ""), 20000),
      Status: "New", Created: new Date().toISOString(),
    };
    return json({ id: await store.create(row) }, 201);
  }

  let m;
  if ((m = path.match(/^\/api\/keep\/notes\/(rec[A-Za-z0-9]{14}|loc[A-Za-z0-9]{10,20})\/voice$/)) && method === "POST") {
    const type = (request.headers.get("content-type") || "").split(";")[0].trim();
    if (!/^audio\/(webm|mp4|mpeg|ogg|aac|x-m4a|wav)$/.test(type)) return json({ error: "That isn't a recording this page knows." }, 415);
    const buf = await request.arrayBuffer();
    if (!buf.byteLength) return json({ error: "The recording was empty." }, 400);
    if (buf.byteLength > MAX_VOICE) return json({ error: "That recording is too long. Keep it under about four minutes." }, 413);
    await store.attachVoice(m[1], buf, type);
    return json({ ok: true });
  }

  if ((m = path.match(/^\/api\/keep\/notes\/(rec[A-Za-z0-9]{14}|loc[A-Za-z0-9]{10,20})\/approve$/)) && method === "POST") {
    const row = await store.get(m[1]);
    if (!row || row.kind !== "Own words") return json({ error: "Only your own words can be approved." }, 400);
    await store.update(m[1], { Status: "Approved" });
    return json({ ok: true });
  }

  // Approved own words, newest per box: what replaces the stand-ins on the site
  if (path === "/api/keep/words" && method === "GET") {
    const words = {};
    for (const n of (await store.list()).filter((n) => n.kind === "Own words" && n.status === "Approved").sort((a, b) => a.created.localeCompare(b.created))) words[n.section] = { text: n.text, created: n.created };
    return json({ words });
  }

  return json({ error: "Not found" }, 404);
}

/* ---------------- The code, the cookie, the lock ---------------- */
async function signin(request, env) {
  if (!env.ERIC_CODE || !env.SESSION_SECRET) return json({ error: "The door isn't set up yet. Ashrey needs to add the code." }, 503);
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const gate = env.GATE.get(env.GATE.idFromName("door"));
  const state = await (await gate.fetch("https://gate/check?ip=" + encodeURIComponent(ip))).json();
  if (state.locked) return json({ error: `Too many tries. Try again in ${Math.ceil(state.wait / 60)} minutes.` }, 429);
  const b = await readJson(request);
  const code = String(b.code || "").replace(/\D/g, "");
  if (!(await sameText(code, String(env.ERIC_CODE)))) {
    const after = await (await gate.fetch("https://gate/fail?ip=" + encodeURIComponent(ip), { method: "POST" })).json();
    return json({ error: after.locked ? "Too many tries. Try again in 15 minutes." : "That isn't the code." }, after.locked ? 429 : 401);
  }
  await gate.fetch("https://gate/clear?ip=" + encodeURIComponent(ip), { method: "POST" });
  const exp = Math.floor(Date.now() / 1000) + DAYS_30;
  const token = `eric.${exp}.${await sign(`eric.${exp}`, env.SESSION_SECRET)}`;
  return json({ ok: true, name: "Eric" }, 200, { "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${DAYS_30}; HttpOnly; Secure; SameSite=Lax` });
}

async function session(request, env) {
  if (!env.SESSION_SECRET) return null;
  const c = (request.headers.get("cookie") || "").split(/;\s*/).find((x) => x.startsWith(COOKIE + "="));
  if (!c) return null;
  const [who, exp, mac] = c.slice(COOKIE.length + 1).split(".");
  if (who !== "eric" || !exp || !mac || +exp < Date.now() / 1000) return null;
  return (await sameText(mac, await sign(`${who}.${exp}`, env.SESSION_SECRET))) ? who : null;
}

async function sign(text, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// compare without leaking where two strings differ
async function sameText(a, b) {
  const h = async (x) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let d = 0; for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0 && a.length === b.length;
}

/* ---------------- Where the notes live ---------------- */
function notesStore(env) {
  return env.AIRTABLE_TOKEN ? airtableStore(env) : localStore(env);
}

const FROM_ROW = (id, f, voice) => ({
  id, kind: f.Kind || "Note", page: f.Page || "", title: f["Page title"] || "", section: f.Section || "",
  text: f.Text || "", value: f.Value || "", reply: f.Reply || "", status: f.Status || "New", created: f.Created || "",
  voice: voice || null,
});

function airtableStore(env) {
  const base = env.AIRTABLE_BASE_ID, table = env.NOTES_TABLE;
  const H = { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" };
  const at = async (u, init = {}) => {
    const r = await fetch(u, { ...init, headers: { ...H, ...(init.headers || {}) } });
    if (!r.ok) throw new Error(`Airtable ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return r.json();
  };
  const rec = (r) => FROM_ROW(r.id, r.fields, (r.fields.Voice || [])[0] ? { url: r.fields.Voice[0].url, type: r.fields.Voice[0].type } : null);
  return {
    async list() {
      const out = []; let offset = "";
      do {
        const q = new URLSearchParams({ pageSize: "100", "sort[0][field]": "Created", "sort[0][direction]": "desc", filterByFormula: "{Status} != 'OLD'" });
        if (offset) q.set("offset", offset);
        const j = await at(`https://api.airtable.com/v0/${base}/${table}?${q}`);
        out.push(...j.records.map(rec)); offset = j.offset || "";
      } while (offset && out.length < 1000);
      return out;
    },
    async get(id) { try { return rec(await at(`https://api.airtable.com/v0/${base}/${table}/${id}`)); } catch (e) { return null; } },
    async create(fields) { return (await at(`https://api.airtable.com/v0/${base}/${table}`, { method: "POST", body: JSON.stringify({ fields, typecast: true }) })).id; },
    async update(id, fields) { await at(`https://api.airtable.com/v0/${base}/${table}/${id}`, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) }); },
    async attachVoice(id, buf, type) {
      const ext = { "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/mpeg": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "audio/aac": "aac" }[type] || "webm";
      await at(`https://content.airtable.com/v0/${base}/${id}/${env.VOICE_FIELD}/uploadAttachment`, {
        method: "POST", body: JSON.stringify({ contentType: type, filename: `eric-${id}.${ext}`, file: b64(buf) }),
      });
    },
  };
}

// Before Airtable is connected: rows kept in the Gate's own storage (voice included, up to the same limit)
function localStore(env) {
  const g = env.GATE.get(env.GATE.idFromName("door"));
  const call = async (op, body, raw) => (await g.fetch("https://gate/store/" + op, { method: "POST", body: raw || JSON.stringify(body || {}) })).json();
  return {
    async list() { return (await call("list")).notes; },
    async get(id) { return (await call("get", { id })).note; },
    async create(fields) { return (await call("create", { fields })).id; },
    async update(id, fields) { await call("update", { id, fields }); },
    async attachVoice(id, buf, type) { await call("voice", { id, type, data: b64(buf) }); },
  };
}

/* ---------------- The Gate: the lock, and the store before Airtable ---------------- */
export class Gate {
  constructor(state) { this.state = state; this.sql = state.storage.sql; this.sql.exec("CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, fields TEXT, voice TEXT, vtype TEXT, created TEXT)"); }
  async fetch(request) {
    const url = new URL(request.url), st = this.state.storage;
    if (url.pathname.startsWith("/store/")) return this.store(url.pathname.slice(7), await request.json());
    const ip = url.searchParams.get("ip") || "?", key = "tries:" + ip, now = Date.now();
    const t = (await st.get(key)) || { n: 0, until: 0, first: now };
    if (url.pathname === "/check") return json({ locked: t.until > now, wait: Math.max(0, Math.round((t.until - now) / 1000)) });
    if (url.pathname === "/clear") { await st.delete(key); return json({ ok: true }); }
    if (url.pathname === "/fail") {
      if (now - t.first > 15 * 60e3) { t.n = 0; t.first = now; }
      t.n++; if (t.n >= 5) { t.until = now + 15 * 60e3; t.n = 0; t.first = now; }
      await st.put(key, t);
      return json({ locked: t.until > now });
    }
    return json({ error: "?" }, 404);
  }
  store(op, b) {
    const one = (id) => [...this.sql.exec("SELECT * FROM notes WHERE id = ?", id)][0];
    const shape = (r) => FROM_ROW(r.id, JSON.parse(r.fields), r.voice ? { url: `data:${r.vtype};base64,${r.voice}`, type: r.vtype } : null);
    if (op === "list") return json({ notes: [...this.sql.exec("SELECT * FROM notes ORDER BY created DESC")].map(shape).filter((n) => n.status !== "OLD") });
    if (op === "get") { const r = one(b.id); return json({ note: r ? shape(r) : null }); }
    if (op === "create") { const id = "loc" + crypto.randomUUID().replace(/-/g, "").slice(0, 14); this.sql.exec("INSERT INTO notes (id, fields, created) VALUES (?, ?, ?)", id, JSON.stringify(b.fields), b.fields.Created); return json({ id }); }
    if (op === "update") { const r = one(b.id); if (r) this.sql.exec("UPDATE notes SET fields = ? WHERE id = ?", JSON.stringify({ ...JSON.parse(r.fields), ...b.fields }), b.id); return json({ ok: true }); }
    // SQLite keeps values up to 2 MB, so a longer recording is noted but not kept here (Airtable takes up to 5 MB)
    if (op === "voice") { this.sql.exec("UPDATE notes SET voice = ?, vtype = ? WHERE id = ?", b.data.length < 1900000 ? b.data : null, b.type, b.id); return json({ ok: true }); }
    return json({ error: "?" }, 404);
  }
}

// One per property: the only gatekeeper for nights. Airtable mirrors, never locks. (Phase 1)
export class Property {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch() { return new Response("Not built yet", { status: 501 }); }
}

/* ---------------- Helpers ---------------- */
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}
async function readJson(request) {
  if (+(request.headers.get("content-length") || 0) > 64 * 1024) return {};
  try { return await request.json(); } catch (e) { return {}; }
}
function clip(s, n) { return String(s ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n); }
function b64(buf) {
  let s = ""; const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
function secure(res, path) {
  const r = new Response(res.body, res);
  r.headers.set("X-Content-Type-Options", "nosniff");
  r.headers.set("Referrer-Policy", "same-origin");
  r.headers.set("Permissions-Policy", "microphone=(self), camera=(), geolocation=()");
  if (path === "/" || path.endsWith(".html") || path.endsWith("/")) { r.headers.set("Cache-Control", "no-store"); r.headers.set("X-Robots-Tag", "noindex"); }
  return r;
}
