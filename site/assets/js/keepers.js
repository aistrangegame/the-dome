/* The keeper layer: Eric's way to leave his thoughts on any part of the site.
   Loaded by dome.js only after /api/keep/me says he is signed in. Everything he leaves becomes a row
   in the Airtable table "Eric's Notes" (through the Worker; the page never holds a key).
   Add a note · My notes · Say it in your own words (the dashed boxes) · Move the pins (places map). */
(function () {
  const Dome = window.Dome; if (!Dome) return;
  const { D, esc } = Dome;
  const PAGE = (location.pathname.replace(/^\//, "") || "index.html").replace(/\/$/, "/index.html");
  const TITLE = (document.title.replace(/ · Catskill Mountain Domes$/, "").replace(/^Catskill Mountain Domes$/, "") || "Home");
  const SIGN = "Claude · Ashrey Intelligence";
  let notes = [], words = {};

  const api = async (path, opts = {}) => {
    const r = await fetch("/api/keep" + path, { credentials: "same-origin", ...opts });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Something went wrong."), { status: r.status });
    return j;
  };
  const toast = (t, ms = 3200) => { const el = document.createElement("div"); el.className = "k-toast"; el.setAttribute("role", "status"); el.textContent = t; document.body.append(el); setTimeout(() => el.remove(), ms); };
  const when = (iso) => { try { return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } };

  /* ---------- The bar ---------- */
  const bar = document.createElement("div"); bar.className = "k-bar";
  bar.innerHTML = `<button class="k-btn act" type="button" id="kAdd">＋ Add a note</button><button class="k-btn" type="button" id="kMine">My notes <span class="n" id="kCount">0</span></button>`;
  document.body.append(bar); document.body.classList.add("k-on");
  bar.querySelector("#kAdd").addEventListener("click", () => pick());
  bar.querySelector("#kMine").addEventListener("click", () => panel());

  /* ---------- Where on the page: a path back to the same element next time ---------- */
  const CAND = ".slot, .voice-card, .card, .placecard, figure, .passage, .map, form, .pane, section, header.top, footer.foot";
  function anchorOf(el) {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 7; n = n.parentElement) {
      if (n.id && !/^dnote-|^k/.test(n.id)) { parts.unshift("#" + CSS.escape(n.id)); break; }
      let i = 1; for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === n.tagName) i++;
      parts.unshift(n.tagName.toLowerCase() + ":nth-of-type(" + i + ")");
    }
    return parts.join(" > ");
  }
  function labelOf(el) {
    if (el.matches(".slot")) { const s = D.slots[el.dataset.slot]; if (s) return s.title; }
    const c = el.cloneNode(true); c.querySelectorAll(".k-pin, .dnote, .k-own, .k-draft, script, style").forEach((x) => x.remove());
    const h = c.querySelector("h1, h2, h3, .p-line .serif, .p-line .voice, blockquote, .eyebrow, b, legend, label");
    const t = (h ? h.textContent : el.getAttribute("aria-label") || c.textContent || "").replace(/\s+/g, " ").trim();
    return t ? (t.length > 70 ? t.slice(0, 68) + "…" : t) : "Part of the page";
  }

  /* ---------- Add a note: choose the part, then write or speak ---------- */
  function pick() {
    if (document.querySelector(".k-banner")) return;
    document.body.classList.add("k-pick");
    const banner = document.createElement("div"); banner.className = "k-banner"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Choose what your note is about");
    banner.innerHTML = `<span>Touch the part of the page your note is about.</span><span style="display:flex;gap:6px"><button class="k-btn act" type="button" data-w>The whole page</button><button class="k-btn" type="button" data-c>Cancel</button></span>`;
    document.body.append(banner);
    let hover = null;
    const over = (e) => { const el = e.target.closest && e.target.closest(CAND); if (hover && hover !== el) hover.classList.remove("k-hover"); if (el && !el.closest(".k-banner, .k-bar, .dock")) { el.classList.add("k-hover"); hover = el; } };
    const done = () => { document.body.classList.remove("k-pick"); if (hover) hover.classList.remove("k-hover"); banner.remove(); document.removeEventListener("mouseover", over, true); document.removeEventListener("click", click, true); document.removeEventListener("keydown", key, true); };
    const click = (e) => {
      if (e.target.closest(".k-banner")) return;
      if (e.target.closest(".k-bar, .dock")) { done(); return; }
      e.preventDefault(); e.stopPropagation();
      const el = e.target.closest(CAND); done();
      if (el) sheet({ kind: "Note", section: labelOf(el), anchor: anchorOf(el) }); else sheet({ kind: "Note", section: "Whole page" });
    };
    const key = (e) => { if (e.key === "Escape") done(); };
    document.addEventListener("mouseover", over, true); document.addEventListener("click", click, true); document.addEventListener("keydown", key, true);
    banner.querySelector("[data-w]").addEventListener("click", () => { done(); sheet({ kind: "Note", section: "Whole page" }); });
    banner.querySelector("[data-c]").addEventListener("click", done);
    banner.querySelector("[data-w]").focus();
  }

  /* The sheet: type, or talk (recorded, and written out as he speaks where the browser can) */
  function sheet(o) {
    const slot = o.kind === "Own words" ? D.slots[o.section] : null;
    const back = document.createElement("div"); back.className = "k-sheet-back";
    const el = document.createElement("div"); el.className = "k-sheet"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", slot ? "Say it in your own words" : "Add a note");
    el.innerHTML = `<h3>${slot ? "In your own words" : "A note"}</h3>
      <p class="k-about">${esc(TITLE)} · ${esc(slot ? slot.title : o.section)}</p>
      ${slot ? `<ul class="k-prompts">${slot.prompts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      <label class="sr" for="kText">${slot ? "Your words" : "Your note"}</label>
      <textarea id="kText" placeholder="${slot ? "Press Speak and answer out loud, or type." : "Type, or press Speak and just talk."}"></textarea>
      <div class="k-row"><button class="k-rec" type="button" id="kRec"><span class="dot"></span><span class="t">Speak</span></button><span class="k-time" id="kTime"></span></div>
      <p class="k-status" id="kStatus" role="status" aria-live="polite"></p>
      <div class="k-row" style="justify-content:flex-end"><button class="btn" type="button" id="kCancel">Cancel</button><button class="btn act" type="button" id="kSend">${slot ? "Save as a draft" : "Send"}</button></div>`;
    document.body.append(back, el);
    const ta = el.querySelector("#kText"), status = el.querySelector("#kStatus"), recBtn = el.querySelector("#kRec"), time = el.querySelector("#kTime");
    setTimeout(() => ta.focus(), 50);

    let rec = null, chunks = [], blob = null, stream = null, speech = null, t0 = 0, timer = 0, base = "";
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    async function start() {
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { status.textContent = "The microphone isn’t available here. Typing works just as well."; return; }
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
      rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined); chunks = []; blob = null;
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        blob = new Blob(chunks, { type: (rec.mimeType || "audio/webm").split(";")[0] });
        stream.getTracks().forEach((t) => t.stop());
        let a = el.querySelector("audio"); if (!a) { a = document.createElement("audio"); a.controls = true; recBtn.parentElement.after(a); }
        a.src = URL.createObjectURL(blob);
        status.textContent = "Recorded. Listen back if you like, then " + (slot ? "save it." : "send it.");
      };
      rec.start(1000); t0 = Date.now(); recBtn.classList.add("on"); recBtn.querySelector(".t").textContent = "Stop";
      timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; if (s >= 240) stop(); }, 250);
      base = ta.value ? ta.value.replace(/\s*$/, " ") : "";
      if (SR) {
        speech = new SR(); speech.continuous = true; speech.interimResults = true; speech.lang = "en-US";
        let final = "";
        speech.onresult = (e) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript; } ta.value = base + final + interim; };
        speech.onerror = () => {}; speech.onend = () => { if (rec && rec.state === "recording") try { speech.start(); } catch (e) {} };
        try { speech.start(); } catch (e) {}
        status.textContent = "Listening. Your words appear above as you speak.";
      } else status.textContent = "Recording. This browser can’t write it out as you speak, but we’ll hear the recording.";
    }
    function stop() {
      clearInterval(timer); recBtn.classList.remove("on"); recBtn.querySelector(".t").textContent = "Speak again";
      if (speech) { const s = speech; speech = null; try { s.stop(); } catch (e) {} }
      if (rec && rec.state === "recording") rec.stop();
    }
    recBtn.addEventListener("click", () => (rec && rec.state === "recording" ? stop() : start()));
    const close = () => { stop(); back.remove(); el.remove(); };
    back.addEventListener("click", close); el.querySelector("#kCancel").addEventListener("click", close);
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    el.querySelector("#kSend").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      if (rec && rec.state === "recording") { stop(); await new Promise((r) => setTimeout(r, 400)); }
      const text = ta.value.trim();
      if (!text && !blob) { status.textContent = "Say or type something first."; return; }
      btn.disabled = true; status.textContent = "Sending…";
      try {
        const { id } = await api("/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: o.kind, page: PAGE, title: TITLE, section: o.section, text, voiceComing: !!blob, value: o.anchor ? { anchor: o.anchor } : "" }) });
        if (blob) { status.textContent = "Sending the recording…"; await api(`/notes/${id}/voice`, { method: "POST", headers: { "content-type": blob.type || "audio/webm" }, body: blob }); }
        close(); toast(slot ? "Saved as a draft. Approve it in the box when it sounds right." : "Sent. It’s with Ashrey and Claude.");
        await refresh();
      } catch (err) { btn.disabled = false; status.textContent = err.message; }
    });
  }

  /* ---------- My notes ---------- */
  function panel(focusId) {
    document.querySelector(".k-panel")?.remove();
    const p = document.createElement("aside"); p.className = "k-panel"; p.setAttribute("aria-label", "My notes");
    let scope = focusId ? "all" : "page";
    p.innerHTML = `<header><h3>My notes</h3><div class="k-tabs"><button type="button" data-s="page">This page</button><button type="button" data-s="all">Everywhere</button></div><button class="k-x" type="button">Close</button></header><div class="k-list"></div>`;
    document.body.append(p);
    const list = p.querySelector(".k-list");
    const draw = () => {
      p.querySelectorAll(".k-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === scope)));
      const show = notes.filter((n) => scope === "all" || n.page === PAGE);
      list.innerHTML = show.length ? show.map((n) => `<article class="k-note" data-id="${esc(n.id)}">
          <div class="k-meta"><span class="k-chip">${esc(n.kind)}</span><span class="k-chip s-${esc(n.status)}">${esc(n.status)}</span><span class="k-chip">${esc(when(n.created))}</span></div>
          <a class="where" href="/${esc(n.page)}">${esc(n.title || n.page)} · ${esc(n.kind === "Own words" ? ((D.slots[n.section] || {}).title || n.section) : n.section)}</a>
          ${n.text ? `<p>${esc(n.text)}</p>` : `<p><i>A recording.</i></p>`}
          ${n.voice && n.voice.url ? `<audio controls preload="none" src="${esc(n.voice.url)}"></audio>` : ""}
          ${n.reply ? `<div class="k-reply">${esc(n.reply)}<small>${SIGN}</small></div>` : ""}
        </article>`).join("") : `<p class="k-empty">${scope === "page" ? "Nothing on this page yet. Tap ＋ Add a note." : "Nothing yet. Every note you leave appears here, with our reply."}</p>`;
      if (focusId) { const a = list.querySelector(`[data-id="${CSS.escape(focusId)}"]`); if (a) { a.scrollIntoView({ block: "center" }); a.classList.add("flash"); } focusId = null; }
    };
    p.querySelectorAll(".k-tabs button").forEach((b) => b.addEventListener("click", () => { scope = b.dataset.s; draw(); }));
    p.querySelector(".k-x").addEventListener("click", () => p.remove());
    p.addEventListener("keydown", (e) => { if (e.key === "Escape") p.remove(); });
    draw(); p.querySelector(".k-x").focus();
  }

  /* ---------- Pins where his notes sit ---------- */
  function pins() {
    document.querySelectorAll(".k-pin").forEach((x) => x.remove());
    const here = notes.filter((n) => n.page === PAGE && n.kind === "Note");
    const byEl = new Map();
    here.forEach((n) => {
      let anchor = ""; try { anchor = (JSON.parse(n.value || "{}") || {}).anchor || ""; } catch (e) {}
      let el = null; try { el = anchor ? document.querySelector(anchor) : null; } catch (e) {}
      if (!el) return;
      (byEl.get(el) || byEl.set(el, []).get(el)).push(n);
    });
    byEl.forEach((ns, el) => {
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const b = document.createElement("button"); b.type = "button"; b.className = "k-pin";
      b.textContent = ns.length > 1 ? `${ns.length} notes` : "Note"; b.setAttribute("aria-label", `Your ${ns.length > 1 ? ns.length + " notes" : "note"} on this part`);
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); panel(ns[0].id); });
      el.append(b);
    });
  }

  /* ---------- His own words, in the dashed boxes ---------- */
  function slots() {
    document.querySelectorAll(".slot[data-slot]").forEach((s) => {
      const key = s.dataset.slot, def = D.slots[key]; if (!def) return;
      s.querySelectorAll(".k-own, .k-draft, .k-words, .k-words-by").forEach((x) => x.remove()); s.classList.remove("k-approved");
      if (words[key]) {   // approved: his words stand where the stand-in was
        s.classList.add("k-approved");
        s.insertAdjacentHTML("beforeend", `<p class="k-words">${esc(words[key].text)}</p><span class="k-words-by">Eric</span>`);
        return;
      }
      if (!/Eric/.test(def.who)) return;     // Cody and Nicole's boxes wait for them
      const draft = notes.find((n) => n.kind === "Own words" && n.section === key && n.status !== "Approved");
      if (draft) {
        s.insertAdjacentHTML("beforeend", `<div class="k-draft"><b>Your draft</b>${draft.text ? `<p>${esc(draft.text)}</p>` : `<p>A recording.</p>`}${draft.voice && draft.voice.url ? `<audio controls preload="none" src="${esc(draft.voice.url)}" style="width:100%;margin-bottom:10px"></audio>` : ""}
          <button class="btn act" type="button" data-ok>It sounds like me. Use it.</button> <button class="btn" type="button" data-again>Say it again</button></div>`);
        s.querySelector("[data-ok]").addEventListener("click", async (e) => {
          if (!draft.text) { toast("We’ll write this one out from the recording first."); return; }
          e.currentTarget.disabled = true;
          try { await api(`/notes/${draft.id}/approve`, { method: "POST" }); toast("Done. Your words now stand here."); await refresh(); } catch (err) { toast(err.message); e.currentTarget.disabled = false; }
        });
        s.querySelector("[data-again]").addEventListener("click", () => sheet({ kind: "Own words", section: key }));
      } else {
        s.insertAdjacentHTML("beforeend", `<button class="k-own" type="button"><span class="dot"></span>Say it in your own words</button>`);
        s.querySelector(".k-own").addEventListener("click", () => sheet({ kind: "Own words", section: key }));
      }
    });
  }

  /* ---------- Move the pins (places map) ---------- */
  function mapTools() {
    const M = window.DOME_MAP, map = document.getElementById("map"); if (!M || !map || map.querySelector(".k-pins-tools")) return;
    const latest = notes.find((n) => n.kind === "Fix" && n.section === "Places map pins");
    if (latest) { try { const v = JSON.parse(latest.value); Object.assign(M.pos, v.pos || {}); if (v.home) M.home.splice(0, 2, ...v.home); M.layout(); } catch (e) {} }
    const t = document.createElement("div"); t.className = "k-pins-tools";
    t.innerHTML = `<button class="k-btn" type="button" data-m>Move the pins</button>`;
    map.append(t);
    const btn = t.querySelector("[data-m]");
    let moving = false, moved = new Set();
    const toPhoto = (sx) => (innerWidth <= 600 ? 50 + (sx - 50) * 9 / 16 : sx);   // the phone map shows the middle of the photo
    btn.addEventListener("click", async () => {
      if (!moving) {
        if (map.classList.contains("inside")) map.querySelector(".pin.home").click();
        moving = true; map.classList.add("k-moving"); btn.textContent = "Save the pins"; btn.classList.add("act");
        toast("Drag any pin to where it really is, then save.", 4000); return;
      }
      moving = false; map.classList.remove("k-moving"); btn.textContent = "Move the pins"; btn.classList.remove("act");
      if (!moved.size) return;
      const names = [...moved].map((k) => (k === "home" ? "The dome" : (D.places.find((p) => p.slug === k) || {}).name || k));
      try {
        await api("/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "Fix", page: PAGE, title: TITLE, section: "Places map pins", text: "Moved: " + names.join(", "), value: { pos: M.pos, home: M.home } }) });
        moved.clear(); toast("Saved. Thank you: the map will use your positions."); await refresh();
      } catch (err) { toast(err.message); }
    });
    map.addEventListener("pointerdown", (e) => {
      if (!moving) return;
      const pin = e.target.closest(".pin.out, .pin.home"); if (!pin) return;
      e.preventDefault(); e.stopPropagation(); pin.setPointerCapture(e.pointerId); pin.classList.add("dragging");
      const r = map.getBoundingClientRect(), key = pin.dataset.slug || "home";
      const mv = (ev) => {
        const x = Math.max(2, Math.min(98, ((ev.clientX - r.left) / r.width) * 100)), y = Math.max(2, Math.min(98, ((ev.clientY - r.top) / r.height) * 100));
        pin.style.left = x + "%"; pin.style.top = y + "%";
        const px = +toPhoto(x).toFixed(1), py = +y.toFixed(1);
        if (key === "home") M.home.splice(0, 2, px, py); else M.pos[key] = [px, py];
        moved.add(key);
      };
      const up = () => { pin.classList.remove("dragging"); pin.removeEventListener("pointermove", mv); pin.removeEventListener("pointerup", up); M.layout(); };
      pin.addEventListener("pointermove", mv); pin.addEventListener("pointerup", up);
    }, true);
    map.addEventListener("click", (e) => { if (moving && e.target.closest(".pin")) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ---------- Load and draw ---------- */
  async function refresh() {
    try { [{ notes }, { words }] = await Promise.all([api("/notes"), api("/words")]); }
    catch (e) { if (e.status === 401) { bar.remove(); return; } }
    document.getElementById("kCount").textContent = String(notes.length);
    pins(); slots(); mapTools();
    const open = document.querySelector(".k-panel"); if (open) { open.remove(); panel(); }
  }
  refresh();
})();
