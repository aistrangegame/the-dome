/* The Awakening engine. Everything a guest writes or records stays on their own device.
   Pools (a-strange-game): essence = who, memory = what was walked, being = how they arrived each visit. */
window.page = function (Dome) {
  const { D, R, esc } = Dome;
  const ACTS = window.AWAKENING;
  const n = +document.body.dataset.act;
  const act = ACTS[n];
  const el = document.getElementById("act");
  const placeName = (slug) => (D.places.find((p) => p.slug === slug) || {}).name || "";
  const where = (slug) => ({ gate: "at the gate", window: "at the window", hearth: "by the hearth", couch: "on the couch", table: "at the table", loft: "up in the loft", "night-sky": "under the night sky" }[slug] || "");

  const K = { essence: "dome-aw-essence", memory: "dome-aw-memory", being: "dome-aw-being" };
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  if (new URLSearchParams(location.search).get("reset") === "host") { Object.values(K).forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} }); }
  const memory = get(K.memory, { acts: {} });
  const done = (i) => i === 0 ? !!get(K.essence, null) : !!memory.acts[i];
  const being = get(K.being, { visits: [] });
  const today = new Date().toISOString().slice(0, 10);
  if (!being.visits.includes(today)) { being.visits.push(today); put(K.being, being); }

  /* Voice notes live in IndexedDB on this device only */
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open("dome-awakening", 1); r.onupgradeneeded = () => r.result.createObjectStore("voice"); r.onsuccess = () => res(r.result); r.onerror = rej; });
  const saveVoice = async (key, blob) => { const db = await idb(); return new Promise((res) => { const t = db.transaction("voice", "readwrite"); t.objectStore("voice").put(blob, key); t.oncomplete = res; }); };
  const loadVoice = async (key) => { try { const db = await idb(); return await new Promise((res) => { const q = db.transaction("voice").objectStore("voice").get(key); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } };

  /* The awakening tone: a struck bowl, synthesised */
  let ctx;
  function tone(freq, secs = 3.5) {
    if (!freq) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.22; out.connect(ctx.destination);
      [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([m, g]) => {
        const o = ctx.createOscillator(), v = ctx.createGain(); o.type = "sine"; o.frequency.value = freq * m;
        v.gain.setValueAtTime(0.0001, now); v.gain.exponentialRampToValueAtTime(g, now + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, now + secs / m * 1.6);
        o.connect(v); v.connect(out); o.start(now); o.stop(now + secs * 1.7);
      });
    } catch (e) {}
  }
  /* The house answers (Phase 3): the Worker turns this into lights and sound through the home hub. Silent if absent. */
  function houseCue(stage) { try { fetch(R("house-cue"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ act: n, stage }) }).catch(() => {}); } catch (e) {} }

  function frame(inner, lum) {
    el.innerHTML = `<div class="aw" style="--hue:${act.hue};--lum:${lum ?? act.light}"><div class="glow"></div>
      <div class="bar"><span>The Awakening · ${n === 0 ? "Before" : "Act " + n}</span><span class="acts">${ACTS.slice(1).map((a) => `<i class="${done(a.n) ? "done" : ""} ${a.n === n ? "now" : ""}"></i>`).join("")}</span></div>
      <div class="scene"><div class="inner">${inner}</div></div><div class="foot" id="foot"></div></div>`;
  }

  /* Locked: never a wall, only a pointer */
  const prevOpen = n === 0 || done(n - 1);
  if (!prevOpen) {
    let first = 0; while (done(first) && first < n) first++;
    const go = ACTS[first];
    frame(`<div class="point"></div><p class="line on">Not yet.</p><p class="line on">Come find me ${esc(where(go.place) || "where we began")}.</p>
      <div class="btnrow"><a class="btn" href="act-${first}.html">Go to ${first === 0 ? "the beginning" : "Act " + first}</a></div>`, 0.03);
    return;
  }

  /* Lines, one at a time */
  function playLines(next) {
    frame(`<div class="point"></div><div class="title">${esc(act.title)}${act.place ? " · " + esc(placeName(act.place)) : ""}</div>${act.lines.map((l) => `<p class="line">${esc(l)}</p>`).join("")}`);
    const ls = [...el.querySelectorAll(".line")]; let i = 0;
    const foot = document.getElementById("foot");
    const step = () => {
      if (i < ls.length) { ls[i++].classList.add("on"); if (i === 1) houseCue("begin"); foot.innerHTML = `<button class="tap" type="button">${i < ls.length ? "Continue" : ""}</button>`; foot.querySelector("button").onclick = step; if (i === ls.length) setTimeout(next, 1600); }
    };
    step();
  }

  /* The hold: the signature gesture, 1.8 seconds */
  function holdThen(label, next) {
    const foot = document.getElementById("foot");
    foot.innerHTML = `<button class="hold" type="button" aria-label="Press and hold to ${esc(act.verb)}"><svg viewBox="0 0 108 108"><circle class="track" cx="54" cy="54" r="50" fill="none" stroke-width="2"/><circle class="fill" cx="54" cy="54" r="50" fill="none" stroke-width="3" stroke-dasharray="314" stroke-dashoffset="314"/></svg><span class="label">${esc(label)}</span></button>`;
    const b = foot.querySelector(".hold"), c = b.querySelector(".fill"); let t0 = 0, raf = 0;
    const tick = (now) => { const p = Math.min(1, (now - t0) / 1800); c.style.strokeDashoffset = String(314 * (1 - p)); if (p >= 1) { cancel(); tone(act.tone, 2); next(); } else raf = requestAnimationFrame(tick); };
    const start = (e) => { e.preventDefault(); t0 = performance.now(); raf = requestAnimationFrame(tick); };
    const cancel = () => { cancelAnimationFrame(raf); c.style.strokeDashoffset = "314"; };
    b.addEventListener("pointerdown", start); ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, cancel));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { tone(act.tone, 2); next(); } });
  }

  /* The question, answered by writing, speaking, or silence */
  function ask() {
    const prior = memory.acts[n] || {};
    frame(`<div class="title">${esc(act.title)}</div><p class="ask">${esc(act.ask)}</p>
      <textarea id="ans" placeholder="Write as much or as little as you like. Silence is an answer too.">${esc(prior.answer || "")}</textarea>
      <div class="btnrow"><button class="btn" type="button" id="rec"><span class="rec"></span>Speak it instead</button><button class="btn act" type="button" id="keep">Keep it</button></div>
      <p class="small" id="recnote">Only you will ever see or hear this. It stays on this phone.</p>`, act.light);
    let media = null, chunks = [], voice = null;
    document.getElementById("rec").onclick = async (e) => {
      const btn = e.currentTarget;
      if (media && media.state === "recording") { media.stop(); return; }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true }); media = new MediaRecorder(s); chunks = [];
        media.ondataavailable = (ev) => chunks.push(ev.data);
        media.onstop = () => { voice = new Blob(chunks, { type: media.mimeType }); s.getTracks().forEach((t) => t.stop()); btn.innerHTML = "Recorded · speak again"; document.getElementById("recnote").textContent = "Your voice note is kept on this phone only."; };
        media.start(); btn.innerHTML = "Stop recording";
      } catch (err) { document.getElementById("recnote").textContent = "The microphone isn’t available here. Writing works just as well."; }
    };
    document.getElementById("keep").onclick = async () => {
      const answer = document.getElementById("ans").value.trim();
      memory.acts[n] = { answer, voice: !!voice || !!prior.voice, at: new Date().toISOString(), act: n, title: act.title, question: act.ask, place: act.place };
      put(K.memory, memory);
      if (voice) await saveVoice("act-" + n, voice);
      closeAct();
    };
  }

  function closeAct() {
    tone(act.tone, 4.5); houseCue("awake");
    const next = ACTS[n + 1];
    frame(`<div class="point"></div><div class="title">${esc(placeName(act.place))} is awake</div><p class="line on">${esc(act.close)}</p>
      ${next ? `<p class="line on" style="margin-top:2rem">Come find me ${esc(where(next.place))}.</p><div class="btnrow"><a class="btn act" href="act-${next.n}.html">I’m there</a></div>` : ""}`, Math.min(1, act.light + 0.1));
  }

  /* Act 0: getting the phone ready */
  function readiness() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    frame(`<div class="point"></div><div class="title">Before</div>
      <div class="check"><div><b id="c1">1</b> <span>Sound on, softly. <button class="btn" type="button" id="test" style="min-height:34px;padding:0 14px;margin-left:6px">Test</button></span></div>
      <div><b id="c2" class="${standalone ? "ok" : ""}">2</b> <span>${standalone ? "Saved to your home screen." : "Add this page to your home screen: Share, then “Add to Home Screen”. iPhones forget a website’s saved words after about a week; a home-screen page keeps them."}</span></div>
      <div><b id="c3">3</b> <span>Let this phone keep what you leave. <button class="btn" type="button" id="keepok" style="min-height:34px;padding:0 14px;margin-left:6px">Allow</button></span></div></div>
      <div class="field" style="text-align:left"><label for="nm" style="color:rgba(245,240,232,.6)">Your first name, if you like (only this phone knows it)</label><input id="nm" autocomplete="given-name" style="width:100%"></div>
      <div class="btnrow"><button class="btn act" type="button" id="begin">Begin</button></div>`, 0.03);
    document.getElementById("test").onclick = () => { tone(174, 2.5); document.getElementById("c1").classList.add("ok"); };
    document.getElementById("keepok").onclick = async () => { try { await navigator.storage?.persist?.(); } catch (e) {} document.getElementById("c3").classList.add("ok"); };
    document.getElementById("begin").onclick = () => {
      put(K.essence, { name: document.getElementById("nm").value.trim(), began: new Date().toISOString() });
      frame(`<div class="point"></div><p class="line on">Then go to the gate, where you came in.</p><p class="line on">Scan the card there, or tap below when you’re standing at it.</p><div class="btnrow"><a class="btn act" href="act-1.html">I’m at the gate</a></div>`, 0.04);
    };
  }

  /* Act 7: the reveal, the returned answer, and taking it home */
  async function reveal() {
    const first = memory.acts[1] || {};
    const name = (get(K.essence, {}) || {}).name;
    frame(`<div class="point"></div><div class="title">Under the same sky</div>
      <p class="line on">At the gate, you told me what home felt like${name ? ", " + esc(name) : ""}:</p>
      <div class="returned" style="background:rgba(6,10,6,.55);border-radius:0 12px 12px 0;padding:12px 18px">${first.answer ? esc(first.answer) : "You answered in silence. That was an answer too."}</div>
      <p class="line on">It was in you the whole way up the mountain.</p>
      <div class="btnrow"><button class="btn act" type="button" id="dl">Keep everything on this phone</button><button class="btn" type="button" id="cp">Copy for your own AI</button></div>
      <p class="small" id="cpn">Your answers never left this phone. Take them with you, and use your own words to explore them.</p>
      <div class="btnrow"><a class="btn" href="${R("house/places/guest-book.html")}">Leave one line in the guest book</a></div>`, 1);
    tone(528, 6); houseCue("finale");
    const all = ACTS.filter((a) => a.ask).map((a) => ({ act: a.n, title: a.title, question: a.ask, answer: (memory.acts[a.n] || {}).answer || "", voiceNote: !!(memory.acts[a.n] || {}).voice, at: (memory.acts[a.n] || {}).at || null }));
    const text = window.AWAKENING_PROMPT + "\n\n" + all.map((a) => `Act ${a.act}, ${a.title}\nQ: ${a.question}\nA: ${a.answer || "(silence)"}${a.voiceNote ? " [I also left a voice note]" : ""}`).join("\n\n");
    document.getElementById("dl").onclick = async () => {
      const blob = new Blob([JSON.stringify({ walked: "The Awakening, Catskill Mountain Domes", essence: get(K.essence, {}), being: get(K.being, {}), answers: all }, null, 2) + "\n\n" + text], { type: "text/plain" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-awakening.txt"; a.click();
      for (const x of all) if (x.voiceNote) { const v = await loadVoice("act-" + x.act); if (v) { const b = document.createElement("a"); b.href = URL.createObjectURL(v); b.download = `act-${x.act}-voice.webm`; b.click(); } }
    };
    document.getElementById("cp").onclick = async () => { try { await navigator.clipboard.writeText(text); document.getElementById("cpn").textContent = "Copied. Paste it into your own AI, and ask it what it notices."; } catch (e) { document.getElementById("cpn").textContent = "Copy isn’t available here; use “Keep everything” instead."; } };
  }

  /* Run */
  if (n === 0) { playLines(readiness); return; }
  if (n === 7) { playLines(() => holdThen("receive", reveal)); return; }
  playLines(() => holdThen(act.verb, ask));
};
