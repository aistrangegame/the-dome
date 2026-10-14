/* The Dome — shared behaviour: nav, seasons, the drifting point, voices, slots. */
(function () {
  const D = window.DOME;
  const root = document.body.dataset.root || "./";
  const R = (p) => root + p;
  const M = (k, w) => R("assets/media/" + D.img(k, w));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Seasons ---------- */
  function seasonByDate(d = new Date()) {
    const m = d.getMonth() + 1;
    return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter";
  }
  let season = store.get("dome-season", null) || seasonByDate();
  function seasonImage(map) {
    // map: {summer, winter}. Returns {key, real}
    if (map[season]) return { key: map[season], real: true };
    if (season === "summer" && map.winter) return { key: map.winter, real: false };
    const k = map.summer || map.winter;
    return { key: k, real: season === "summer" && !!map.summer };
  }
  function paintSeasonImages() {
    document.querySelectorAll("[data-season-img]").forEach((el) => {
      const map = JSON.parse(el.dataset.seasonImg);
      const { key, real } = seasonImage(map);
      const img = el.querySelector("img");
      if (!img || !key) return;
      const w = el.dataset.w || 1600;
      const src = M(key, w);
      if (img.getAttribute("src") !== src) img.src = src;
      img.classList.add("seasonal"); img.classList.toggle("real", real);
      el.classList.toggle("has-imagined", !real);
    });
  }
  function setSeason(s) {
    season = s; store.set("dome-season", s);
    document.documentElement.dataset.season = s;
    document.querySelectorAll(".seasons button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    document.querySelectorAll(".season-select").forEach((x) => (x.value = s));
    document.querySelectorAll("[data-season-line]").forEach((el) => (el.textContent = D.seasons[s].line));
    document.querySelectorAll("[data-season-name]").forEach((el) => (el.textContent = D.seasons[s].name));
    paintSeasonImages();
    document.dispatchEvent(new CustomEvent("dome:season", { detail: s }));
  }
  function seasonSwitch() {
    return '<div class="seasons" role="group" aria-label="Season">' +
      ["spring", "summer", "fall", "winter"].map((s) => `<button type="button" data-s="${s}" aria-pressed="false">${D.seasons[s].name}</button>`).join("") + "</div>" +
      '<select class="season-select" aria-label="Season">' + ["spring", "summer", "fall", "winter"].map((s) => `<option value="${s}">${D.seasons[s].name}</option>`).join("") + "</select>";
  }

  /* ---------- Header and footer ---------- */
  const NAV = [["index.html", "Home"], ["places/index.html", "Places"], ["stories.html", "Stories"], ["timeline.html", "Timeline"], ["ideas.html", "Ideas"], ["around.html", "Around"], ["the-new-chapter.html", "Our story"]];
  function header() {
    const here = document.body.dataset.page || "";
    const h = document.createElement("header");
    h.className = "top" + (document.body.dataset.solid ? " solid" : "");
    h.innerHTML = `<span class="brand"><button class="pt" type="button" data-portal aria-label="The point: the dome's own story and games"></button><a href="${R("index.html")}">Catskill Mountain Domes</a></span>
      <div style="display:flex;gap:10px;align-items:center">${seasonSwitch()}
      <button class="menu-btn" type="button" aria-expanded="false">Menu</button>
      <nav>${NAV.map(([href, t]) => `<a href="${R(href)}"${here === href ? ' aria-current="page"' : ""}>${t}</a>`).join("")}<a class="stay-btn" href="${R("stay.html")}">Stay</a></nav></div>`;
    document.body.prepend(h);
    const btn = h.querySelector(".menu-btn"), nav = h.querySelector("nav");
    btn.addEventListener("click", () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
    h.querySelectorAll(".seasons button").forEach((b) => b.addEventListener("click", (e) => seasonWipe(b.dataset.s, e)));
    h.querySelector(".season-select").addEventListener("change", (e) => seasonWipe(e.target.value));
    if (!document.body.dataset.solid) {
      const onScroll = () => h.classList.toggle("solid", window.scrollY > window.innerHeight * 0.7);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
  }
  function footer() {
    const f = document.createElement("footer");
    f.className = "foot";
    f.innerHTML = `<div class="wrap"><p class="seed">Under the same sky.</p>
      <div class="cols">
        <div><b>The dome</b><br><a href="${R("places/index.html")}">The places</a><br><a href="${R("stories.html")}">Stories</a><br><a href="${R("timeline.html")}">Timeline</a><br><a href="${R("ideas.html")}">Ideas</a></div>
        <div><b>The people</b><br><a href="${R("how-it-began.html")}">How it began</a><br><a href="${R("the-new-chapter.html")}">The new chapter</a><br><a href="${R("your-stays.html")}">Your stays</a></div>
        <div><b>Stay</b><br><a href="${R("stay.html")}">Dates and booking</a><br><a href="${R("around.html")}">Around the mountain</a><br><a href="https://www.instagram.com/catskillmountaindomes/">@catskillmountaindomes</a></div>
        <div class="foot-play"><b>Behind the point</b><br><a href="${R("play/story.html")}">${icon("story", { size: 16 })}The dome’s own story</a><br><a href="${R("play/find.html")}">${icon("find", { size: 16 })}Find the point</a><br><a href="${R("play/build.html")}">${icon("build", { size: 16 })}One triangle at a time</a><br><a href="${R("play/still.html")}">${icon("still", { size: 16 })}Be still</a></div>
        <div class="owner-only"><b>For Eric and Mona</b><br><a href="${R("dashboard/index.html")}">Dashboard</a><br><a href="${R("house/index.html")}">On the property</a><br><a href="${R("house/awakening/index.html")}">The Awakening</a></div>
      </div><p style="margin-top:2rem"><small>Catskill Mountain Domes · Delaware County, New York · Guest words are quoted as written, with first names.</small></p></div>`;
    document.body.append(f);
  }

  /* ---------- Markers: where real people's words go ---------- */
  function markerToggle() {
    if (!document.querySelector(".slot")) return;
    const clean = store.get("dome-clean", false);
    document.documentElement.classList.toggle("clean", clean);
    const b = document.createElement("button");
    b.className = "marker-toggle"; b.type = "button";
    const label = () => (b.innerHTML = `<span class="dot"></span>${document.documentElement.classList.contains("clean") ? "Show where your words go" : "Hide where your words go"}`);
    label();
    b.addEventListener("click", () => { const c = document.documentElement.classList.toggle("clean"); store.set("dome-clean", c); label(); });
    dock().append(b);
  }
  function dock() { let d = document.querySelector(".dock"); if (!d) { d = document.createElement("div"); d.className = "dock"; document.body.append(d); } return d; }

  /* ---------- The notes: a behind-the-scenes guide on every page (Eric and Mona's walk-through) ---------- */
  function noteKey() {
    const b = document.body.dataset, path = location.pathname;
    if (b.place) return b.mode === "house" ? "house-place" : "place";
    if (document.getElementById("act") && b.act !== undefined) return "act";
    if (b.act !== undefined) return "awakening";
    if (/house\/choose\/(index\.html)?$/.test(path)) return "house/choose/index.html";
    if (/dashboard\/(index\.html)?$/.test(path)) return "dashboard/index.html";
    if (/house\/(index\.html)?$/.test(path)) return "house/index.html";
    return b.page || "index.html";
  }
  let notesOn = false, notesBtn = null, guideBtn = null;
  function loadNotes(cb) {
    if (window.DOME_NOTES) return cb();
    const sc = document.createElement("script"); sc.src = R("assets/js/notes.js"); sc.onload = cb; document.head.append(sc);
  }
  function notesInit() {
    const d = dock();
    notesBtn = document.createElement("button"); notesBtn.type = "button"; notesBtn.className = "notes-btn"; notesBtn.setAttribute("aria-pressed", "false");
    notesBtn.innerHTML = `<span class="nb-ic" aria-hidden="true"><i></i><i></i><i></i></span><span class="nb-t">Notes</span>`;
    guideBtn = document.createElement("button"); guideBtn.type = "button"; guideBtn.className = "notes-btn gbtn"; guideBtn.hidden = true; guideBtn.textContent = "This page’s guide";
    notesBtn.setAttribute("aria-label", "Notes: show the behind-the-scenes notes");
    d.prepend(guideBtn); d.prepend(notesBtn);
    notesBtn.addEventListener("click", () => setNotes(!notesOn, true));
    guideBtn.addEventListener("click", () => openGuide());
    addEventListener("keydown", (e) => { if (e.key === "N" && e.shiftKey && !/input|textarea|select/i.test(e.target.tagName)) setNotes(!notesOn, true); });
    const q = new URLSearchParams(location.search).get("notes");
    if (q === "1") store.set("dome-notes", true);
    if (q === "0") store.set("dome-notes", false);
    if (store.get("dome-notes", false)) setNotes(true, false);
  }
  function setNotes(on, user) {
    notesOn = on; store.set("dome-notes", on);
    notesBtn.setAttribute("aria-pressed", String(on)); notesBtn.querySelector(".nb-t").textContent = on ? "Notes on" : "Notes";
    notesBtn.setAttribute("aria-label", on ? "Notes are on: hide the behind-the-scenes notes" : "Notes: show the behind-the-scenes notes");
    guideBtn.hidden = !on;
    document.documentElement.classList.toggle("notes", on);
    if (!on) { document.querySelectorAll(".dnote").forEach((n) => n.remove()); document.querySelectorAll(".dn-target").forEach((t) => t.classList.remove("dn-target")); closeGuide(); return; }
    loadNotes(() => { placeNotes(); if (user) openGuide(); });
  }
  function pageNotes() { const N = window.DOME_NOTES; return N && N.P[noteKey()]; }
  function placeNotes() {
    const P = pageNotes(); if (!P) return;
    document.querySelectorAll(".dnote").forEach((n) => n.remove());
    (P.sections || []).forEach((sec, i) => {
      let t = null; try { t = document.querySelector(sec.sel); } catch (e) {}
      if (!t || t.closest(".portal")) return;
      t.classList.add("dn-target"); t.dataset.dn = i + 1;
      const n = document.createElement("aside"); n.className = "dnote"; n.id = "dnote-" + (i + 1); n.style.animationDelay = (i * 0.08) + "s";
      n.innerHTML = `<span class="dn-n">${i + 1}</span><div><b>${esc(sec.t)}</b><p>${esc(sec.x)}</p>${sec.d ? `<small>${esc(sec.d)}</small>` : ""}</div>`;
      t.before(n);
    });
  }
  let guideEl = null;
  function closeGuide() { if (!guideEl) return; const g = guideEl; guideEl = null; g.classList.remove("open"); setTimeout(() => g.remove(), 500); }
  function openGuide(tab) {
    const N = window.DOME_NOTES, P = pageNotes(); if (!N) return loadNotes(() => openGuide(tab));
    if (guideEl) guideEl.remove();
    const key = noteKey(), here = (P && P.one) || key;
    const layer = P ? N.LAYERS.find((l) => l.k === P.layer) : null;
    const short = (s) => s.split(/[:(]/)[0].replace(/^Airtable · /, "").trim();
    const g = document.createElement("aside"); g.className = "guide"; g.setAttribute("aria-label", "Notes for this page");
    const secs = P ? (P.sections || []).map((sec, i) => `<li><a href="#dnote-${i + 1}" data-dn="${i + 1}"><span class="dn-n">${i + 1}</span>${esc(sec.t)}</a></li>`).join("") : "";
    // the page among its connections: where its words come from (left), where it leads (right)
    const L = P ? P.data.slice(0, 4) : [], Rt = P ? P.links.slice(0, 5) : [];
    const node = (x, y, label, href, cls) => `<g class="${cls}">${href ? `<a href="${href}">` : ""}<circle cx="${x}" cy="${y}" r="${cls === "me" ? 9 : 4.5}"/><text x="${x + (cls === "src" ? -9 : cls === "me" ? 0 : 9)}" y="${y + (cls === "me" ? 24 : 4)}" text-anchor="${cls === "src" ? "end" : cls === "me" ? "middle" : "start"}">${esc(label)}</text>${href ? "</a>" : ""}</g>`;
    const ys = (n, i) => n === 1 ? 90 : 26 + (i * 128) / (n - 1);
    const svg = P ? `<svg class="constel" viewBox="0 0 360 190" role="img" aria-label="Where this page's content comes from, and where it leads">
      ${L.map((d, i) => `<path class="ln" style="animation-delay:${i * 0.12}s" d="M100 ${ys(L.length, i)} C130 ${ys(L.length, i)} 135 90 165 90"/>`).join("")}
      ${Rt.map((k, i) => `<path class="ln out" style="animation-delay:${0.3 + i * 0.12}s" d="M165 90 C195 90 200 ${ys(Rt.length, i)} 222 ${ys(Rt.length, i)}"/>`).join("")}
      ${L.map((d, i) => node(100, ys(L.length, i), short(d), null, "src")).join("")}
      ${node(165, 90, P.title, null, "me")}
      ${Rt.map((k, i) => node(222, ys(Rt.length, i), N.NAMES[k] || k, R(k), "dst")).join("")}</svg>` : "";
    const pageTab = P ? `<div class="g-pane" data-pane="page">
        <span class="g-layer">${esc(layer ? layer.name : "")}</span><h2>${esc(P.title)}</h2>
        <p class="g-purpose">${esc(P.purpose)}</p>
        <p class="g-who"><b>For</b> ${esc(P.who)}</p>
        ${svg}
        ${secs ? `<h3>On this page</h3><ol class="g-secs">${secs}</ol>` : ""}
        <h3>Where its words come from</h3><ul class="g-data">${P.data.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        ${P.later ? `<h3>When it goes live</h3><p>${esc(P.later)}</p>` : ""}
      </div>` : `<div class="g-pane" data-pane="page"><p>No notes for this page yet.</p></div>`;
    const houseTab = `<div class="g-pane" data-pane="house" hidden>
        <p class="g-purpose">Everything that has been built, in four layers. This page is lit.</p>
        ${N.LAYERS.map((l) => `<section class="g-l"><h3>${esc(l.name)}</h3><p>${esc(l.line)}</p><ul>${l.pages.map((k) => `<li${k === here ? ' class="here"' : ""}><a href="${R(k)}">${esc(N.NAMES[k] || k)}</a></li>`).join("")}</ul></section>`).join("")}
        <section class="g-l"><h3>Underneath</h3><p>Airtable holds the places, the words of the 252 guests who wrote, ideas, people and photos. A Cloudflare Worker will hold the calendar, take payment through Stripe and keep everything in step. Until then, everything here runs on this device.</p></section>
      </div>`;
    g.innerHTML = `<div class="g-bar"><div class="g-tabs" role="tablist"><button role="tab" aria-selected="true" data-t="page">This page</button><button role="tab" aria-selected="false" data-t="house">The whole house</button></div><button class="g-x" type="button" aria-label="Close the guide">Close</button></div><div class="g-body">${pageTab}${houseTab}</div>`;
    document.body.append(g); guideEl = g;
    requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add("open")));
    g.querySelector(".g-x").addEventListener("click", closeGuide);
    g.addEventListener("keydown", (e) => { if (e.key === "Escape") closeGuide(); });
    g.querySelectorAll(".g-tabs button").forEach((b) => b.addEventListener("click", () => {
      g.querySelectorAll(".g-tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      g.querySelectorAll(".g-pane").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.t));
    }));
    if (tab === "house") g.querySelector('[data-t="house"]').click();
    g.querySelectorAll(".g-secs a").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); const n = document.getElementById("dnote-" + a.dataset.dn); if (!n) return;
      if (innerWidth < 900) closeGuide();
      n.scrollIntoView({ behavior: "smooth", block: "center" }); n.classList.remove("flash"); void n.offsetWidth; n.classList.add("flash");
    }));
    g.querySelector(".g-x").focus({ preventScroll: true });
  }
  function slotHTML(key, opts = {}) {
    const s = D.slots[key];
    if (!s) return "";
    return `<aside class="slot" data-slot="${key}"><span class="slot-tag">${esc(s.who)}’s words go here · ${esc(s.title)}</span>
      ${opts.title ? `<h3>${esc(s.title)}</h3>` : ""}<p class="draft">${esc(s.draft)}</p>
      <ul class="prompts">${s.prompts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></aside>`;
  }
  function renderSlots() {
    document.querySelectorAll("[data-slot-key]").forEach((el) => (el.outerHTML = slotHTML(el.dataset.slotKey, { title: el.hasAttribute("data-title") })));
  }

  /* ---------- Voices ---------- */
  function voiceHTML(v) {
    const [n, name, text] = v;
    return `<figure class="voice-card rise"><blockquote class="voice">${esc(text)}</blockquote><figcaption class="voice-by">${esc(name)} · guest #${n}</figcaption></figure>`;
  }

  /* ---------- Passages: the point that opens, descends and closes ---------- */
  // <section class="passage" data-mode="open|descend|close" data-season-img='{"summer":"key"}' data-lines='[["text","who #n"],...]'>
  /* ---------- Moving pictures: drone clips, upright for phones and wide for screens ---------- */
  // Each clip has -p (720 wide, upright) and -l (1920 wide) versions with a still of the first frame.
  const tall = () => innerHeight > innerWidth * 1.05;
  // H.264 where the browser has it (Safari, Chrome, Edge), WebM (VP9) everywhere else
  const VEXT = (() => { try { return document.createElement("video").canPlayType('video/mp4; codecs="avc1.640028"') ? "mp4" : "webm"; } catch (e) { return "mp4"; } })();
  const vsrc = (key, ext) => R("assets/video/" + key + "-" + (tall() ? "p" : "l") + "." + (ext || VEXT));
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function videoHTML(key, cls) {
    return `<video class="dvid ${cls || ""}" data-key="${key}" muted playsinline loop preload="none" poster="${vsrc(key, "webp")}" aria-hidden="true"></video>`;
  }
  // play only while on screen; reduced motion keeps the still
  const vio = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !reduceMotion()) { if (!v.getAttribute("src")) v.src = vsrc(v.dataset.key); v.play().catch(() => {}); }
    else v.pause();
  }), { rootMargin: "120px" }) : null;
  function wireVideos(root) { (root || document).querySelectorAll("video.dvid:not([data-wired])").forEach((v) => { v.dataset.wired = "1"; if (vio) vio.observe(v); }); }

  function passages() {
    const list = [...document.querySelectorAll(".passage")];
    list.forEach((sec) => {
      if (sec.dataset.built) return; sec.dataset.built = "1";
      const lines = JSON.parse(sec.dataset.lines || "[]");
      sec.style.height = (sec.dataset.h || 220) + "svh";
      const vid = sec.dataset.video ? videoHTML(sec.dataset.video) : "";
      sec.innerHTML = `<div class="p-stage"><div class="p-layer${vid ? " has-video" : ""}" data-season-img='${sec.dataset.seasonImg}'><img alt="${esc(sec.dataset.alt || "")}">${vid}<span class="imagined-tag">Imagined season</span></div>
        ${sec.dataset.ring ? `<svg class="p-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96"/><circle class="t" cx="100" cy="100" r="88"/></svg>` : ""}
        <div class="p-point"></div><div class="p-words">${lines.map(([t, by], i) => `<p class="p-line" data-i="${i}">${by ? `<span class="voice">${esc(t)}</span><span class="voice-by">${esc(by)}</span>` : `<span class="serif">${esc(t)}</span>`}</p>`).join("")}</div></div>`;
    });
    if (!list.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function frame() {
      list.forEach((sec) => {
        const r = sec.getBoundingClientRect(); const span = sec.offsetHeight - innerHeight;
        if (r.bottom < -50 || r.top > innerHeight + 50) return;
        const p = Math.min(1, Math.max(0, -r.top / span));
        const layer = sec.querySelector(".p-layer"), point = sec.querySelector(".p-point"), mode = sec.dataset.mode;
        const max = Math.hypot(innerWidth, innerHeight) / 2 + 10;
        let open = 1, scale = 1;
        if (reduce) { open = 1; }
        else if (mode === "open") open = Math.min(1, p / 0.55);
        else if (mode === "close") open = 1 - Math.min(1, Math.max(0, (p - 0.35) / 0.55));
        else if (mode === "descend") { open = 1; scale = 1 + 2.2 * Math.pow(1 - Math.min(1, p / 0.7), 2); }
        const e = open * open * (3 - 2 * open);
        layer.style.clipPath = mode === "descend" ? "none" : `circle(${6 + e * max}px at 50% 50%)`;
        layer.style.transform = `scale(${scale})`;
        const ring = sec.querySelector(".p-ring");
        if (ring) { const rad = 6 + e * max; ring.style.width = ring.style.height = (rad * 2 + 28) + "px"; ring.style.opacity = String(Math.min(1, e * 2) * (1 - Math.max(0, (e - 0.85) / 0.15))); ring.style.transform = `rotate(${-p * 140}deg)`; }
        point.style.opacity = String(mode === "descend" ? Math.max(0, 1 - p * 3) * 0 : Math.max(0, 1 - e * 3));
        const ls = sec.querySelectorAll(".p-line"), n = ls.length;
        ls.forEach((l, i) => { const a = 0.25 + (i / Math.max(1, n)) * 0.55, b = a + 0.55 / Math.max(1, n) + 0.12; l.classList.toggle("on", p > a && (i === n - 1 ? p < 0.97 : p < b)); });
      });
    }
    let ticking = false;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
    addEventListener("resize", frame); frame();
  }
  function closingPassage() {
    if (document.body.dataset.noclose || document.body.dataset.bare) return;
    const f = document.querySelector("footer.foot"); if (!f) return;
    const s = document.createElement("section"); s.className = "passage"; s.dataset.mode = "close"; s.dataset.h = "170";
    s.dataset.seasonImg = JSON.stringify({ summer: "disc" }); s.dataset.alt = "The dome from directly above, turning slowly in the evening light, closing back into a single point.";
    s.dataset.video = "turn"; s.dataset.ring = "1";
    s.dataset.lines = JSON.stringify([["Under the same sky."]]);
    f.before(s);
  }

  /* ---------- Season change: a circle opens from where you chose ---------- */
  function seasonWipe(s, ev) {
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return setSeason(s);
    const x = ev && ev.clientX ? ev.clientX : innerWidth - 120, y = ev && ev.clientY ? ev.clientY : 30;
    document.documentElement.style.setProperty("--wx", x + "px"); document.documentElement.style.setProperty("--wy", y + "px");
    document.startViewTransition(() => setSeason(s));
  }

  /* ---------- Rise on view ---------- */
  function rise() {
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
    const scan = () => document.querySelectorAll(".rise:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
    scan(); return scan;
  }



  /* ---------- Animated icons: one figure per game, quiet until touched (live ones breathe on their own) ---------- */
  const ICONS = {
    story: () => { const d = [...Array(9)].map((_, i) => { const a = Math.PI - (i / 8) * Math.PI; return `<circle class="ic-dot" style="animation-delay:${(i * 0.28).toFixed(2)}s" cx="${(16 + 12 * Math.cos(a)).toFixed(2)}" cy="${(24 - 12 * Math.sin(a)).toFixed(2)}" r="1.7"/>`; }).join("");
      return `<path d="M3 27h26" class="ic-line"/>${d}<circle cx="16" cy="24" r="2.2" class="ic-core"/>`; },
    find: () => `<path class="ic-line" d="M4 10V5h5M23 5h5v5M28 22v5h-5M9 27H4v-5"/><circle class="ic-ring" cx="16" cy="16" r="6"/><circle class="ic-seek" cx="16" cy="16" r="2.4"/>`,
    build: () => { const T = ["4,26 12,26 8,18", "12,26 20,26 16,18", "20,26 28,26 24,18", "8,18 16,18 12,26", "16,18 24,18 20,26", "8,18 16,18 12,10", "16,18 24,18 20,10", "12,10 20,10 16,18", "12,10 20,10 16,3"];
      return T.map((t, i) => `<polygon class="ic-tri" style="animation-delay:${(i * 0.13).toFixed(2)}s" points="${t}"/>`).join(""); },
    // the thirteen places: each figure does what you do there
    gate: () => `<path d="M6 28V8M26 28V8M3 28h26"/><path class="a-swing" d="M6 12h10v12H6M6 18h10M11 12v12"/><path class="a-swing2" d="M26 12H18v12h8M26 18h-8M21 12v12"/>`,
    window: () => `<path class="ic-soft a-cloud" d="M6 15a2.6 2.6 0 0 1 2.6-2.6 3.6 3.6 0 0 1 6.6 0A2.6 2.6 0 0 1 15 17.6H8.6A2.6 2.6 0 0 1 6 15z"/><path d="M3 27L16 5l13 22zM9.5 16h13M16 27l-6.5-11M16 27l6.5-11"/>`,
    couch: () => `<path d="M5 24v-6.5a2 2 0 0 1 4 0V21h14v-3.5a2 2 0 0 1 4 0V24zM7 24v3M25 24v3"/><path class="a-sink" d="M9 20.5v-4.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4.5"/>`,
    library: () => `<path d="M4 27h24"/><rect x="6" y="10" width="4" height="17" rx=".6"/><rect x="11" y="7" width="4" height="20" rx=".6"/><rect class="a-tilt" x="16" y="9" width="4" height="18" rx=".6"/><rect x="21.5" y="12" width="5" height="15" rx=".6"/>`,
    table: () => `<path d="M8 16h13v5.5a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5zM21 18h1.5a2.5 2.5 0 0 1 0 5H21M5 29h21"/><path class="a-steam" d="M11.5 13c-1.6-2 1.6-3.2 0-5.4"/><path class="a-steam" style="animation-delay:.5s" d="M15.5 13c-1.6-2 1.6-3.2 0-5.4"/><path class="a-steam" style="animation-delay:1s" d="M19.5 13c-1.6-2 1.6-3.2 0-5.4"/>`,
    loft: () => `<rect class="a-glow" x="10" y="3" width="12" height="5" rx="1"/><path d="M10 29V12M18 29V12"/>${[25, 21, 17, 13].map((y, i) => `<path class="a-rung" style="animation-delay:${i * 0.35}s" d="M10 ${y}h8"/>`).join("")}<path d="M22 12h7M22 12v17" opacity=".45"/>`,
    hearth: () => `<path d="M4 28V11h24v17M2 28h28M8 11V7h16v4"/><path class="ic-fill a-flame" d="M16 26c-3.6 0-5-2.6-4-5.4.8-2 2.2-3 2.2-6 3 1.8 5.8 4.6 5.8 7.4 0 2.6-1.4 4-4 4z"/>`,
    "cedar-pool": () => `<ellipse cx="16" cy="15" rx="12" ry="5"/><path d="M4 15v8c0 2.8 5.4 5 12 5s12-2.2 12-5v-8M10 19.4v8M16 20v8M22 19.4v8"/><ellipse class="a-ripple" cx="16" cy="15" rx="3" ry="1.25"/><ellipse class="a-ripple" style="animation-delay:1.3s" cx="16" cy="15" rx="3" ry="1.25"/>`,
    "fire-circle": () => `${[...Array(9)].map((_, i) => { const a = (i / 9) * Math.PI * 2; return `<circle class="ic-fill" cx="${(16 + 12 * Math.cos(a)).toFixed(1)}" cy="${(23 + 4.4 * Math.sin(a)).toFixed(1)}" r="1.5"/>`; }).join("")}<path class="ic-fill a-flame" d="M16 24c-2.6 0-3.6-1.9-2.9-3.9.6-1.4 1.6-2.2 1.6-4.3 2.2 1.3 4.2 3.3 4.2 5.4 0 1.9-1 2.8-2.9 2.8z"/>${[0, 1, 2].map((i) => `<circle class="ic-fill a-spark" style="animation-delay:${i * 0.7}s" cx="${15 + i}" cy="13" r=".9"/>`).join("")}`,
    meadow: () => `<path d="M3 28h26"/>${[[9, 13, 0], [16, 9, .4], [23, 14, .8]].map(([x, y, d]) => `<g class="a-sway" style="animation-delay:${d}s"><path d="M${x} 28c.6-5-.6-9 0-${28 - y - 2}"/><circle class="ic-fill" cx="${x}" cy="${y}" r="2.2"/></g>`).join("")}`,
    trails: () => `<ellipse cx="25" cy="7.5" rx="4.5" ry="2.6"/><path class="a-draw" d="M3 29c5-1 5-6 9-7.5s5-5 8-7 3-3.6 4-4.6"/>`,
    "night-sky": () => `<path class="ic-fill a-twinkle" d="M12 7l1.4 4.6L18 13l-4.6 1.4L12 19l-1.4-4.6L6 13l4.6-1.4z"/><circle class="ic-fill a-twinkle" style="animation-delay:1.1s" cx="23" cy="20" r="1.2"/><circle class="ic-fill a-twinkle" style="animation-delay:.5s" cx="8" cy="25" r="1"/><path class="a-shoot" d="M29 4l-8 5"/><path d="M2 29c6-3 10-3 14-1.5s9 1 14-1" opacity=".55"/>`,
    "guest-book": () => `<path d="M16 9c-3-2-7.4-2.2-12-1v18c4.6-1.2 9-1 12 1 3-2 7.4-2.2 12-1V8c-4.6-1.2-9-1-12 1zM16 9v18"/>${[13, 16.5, 20].map((y, i) => `<path class="a-write" style="animation-delay:${i * 0.6}s" d="M19 ${y}h${i === 2 ? 3.5 : 6}"/>`).join("")}<path d="M7 13h5M7 16.5h5" opacity=".45"/>`,
    still: () => `<circle class="ic-wait" cx="16" cy="16" r="12"/><path class="ic-star" d="M16 8.5 L17.6 14.4 L23.5 16 L17.6 17.6 L16 23.5 L14.4 17.6 L8.5 16 L14.4 14.4 Z"/>`
  };
  function icon(name, opts = {}) {
    const f = ICONS[name]; if (!f) return "";
    return `<svg class="ic ic-${name}${opts.live ? " live" : ""}" viewBox="0 0 32 32" width="${opts.size || 22}" height="${opts.size || 22}" aria-hidden="true" focusable="false">${f()}</svg>`;
  }
  // Rows of two or more buttons get breathing room, wrapped or not
  function buttonRows() {
    document.querySelectorAll("p, div").forEach((el) => {
      if ([...el.children].filter((c) => c.classList.contains("btn")).length < 2) return;
      el.classList.add("btns");
      if (getComputedStyle(el).textAlign === "center") el.classList.add("center");
    });
  }
  /* ---------- Behind the point: the dome's own room ---------- */
  // The header point opens a dark room from exactly where it sits. The dome speaks here, about its own life.
  const DOORS = [
    ["story", "play/story.html", "My story", "Nine stages of a life, from an empty hillside to 252 guests who wrote.", "Read"],
    ["find", "play/find.html", "Find the point", "Look for me from the sky, from high to close.", "Look"],
    ["build", "play/build.html", "One triangle at a time", "Build me again, one guest in every triangle.", "Build"],
    ["still", "play/still.html", "Be still", "Stay without moving, and the stars come out.", "Stay"]
  ];
  let portalEl = null, lastFocus = null;
  function openPortal(from) {
    if (portalEl) return;
    lastFocus = document.activeElement;
    const walked = store.get("dome-play-walked", {});
    const here = (document.body.dataset.page || "");
    const r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: 12, top: 12, width: 24, height: 24 };
    const el = document.createElement("div");
    el.className = "portal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Behind the point");
    el.style.setProperty("--px", (r.left + r.width / 2) + "px"); el.style.setProperty("--py", (r.top + r.height / 2) + "px");
    el.innerHTML = `<div class="p-in"><div class="p-bar"><span>Behind the point</span><button class="p-close" type="button">Back to the site</button></div>
      <div class="p-main"><div class="p-point" aria-hidden="true"></div>
        <p class="p-line">You found my point.</p>
        <p class="p-sub">Out there, Eric and Mona and the guests do the talking. In here it’s me, the dome. I keep my own story, and three games.</p>
        <nav class="doors" aria-label="The dome's story and games">${DOORS.map(([k, href, t, line, verb], i) =>
          `<a class="door${walked[k] ? " walked" : ""}" href="${R(href)}" data-k="${k}" style="transition-delay:${0.9 + i * 0.55}s"${here === href ? ' aria-current="page"' : ""}><span class="door-ic">${icon(k, { live: true, size: 34 })}</span><span><b>${t}</b><small>${line}</small></span><span class="k">${walked[k] ? "Again" : verb}</span></a>`).join("")}</nav>
      </div><p class="p-foot">Press Escape, or touch the point again, to come back out.</p></div>`;
    document.body.append(el); portalEl = el;
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("open")));
    setTimeout(() => el.classList.add("ready"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650);
    el.querySelector(".p-close").addEventListener("click", closePortal);
    el.querySelector(".p-point").addEventListener("click", closePortal);
    el.querySelector(".p-close").focus({ preventScroll: true });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePortal();
      if (e.key === "Tab") { const f = [...el.querySelectorAll("a,button")]; const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
  }
  function closePortal() {
    const el = portalEl; if (!el) return;
    if (document.body.dataset.portalPage) { location.href = R("index.html"); return; }
    el.classList.remove("ready"); el.classList.add("closing"); el.classList.remove("open");
    setTimeout(() => { el.remove(); portalEl = null; document.documentElement.style.overflow = ""; if (lastFocus) lastFocus.focus({ preventScroll: true }); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720);
  }
  function markWalked(k) { const w = store.get("dome-play-walked", {}); w[k] = true; store.set("dome-play-walked", w); }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-portal]"); if (t) { e.preventDefault(); openPortal(t); } });
  const api = { D, R, M, esc, store, icon, videoHTML, vsrc, wireVideos, openPortal, closePortal, markWalked, setSeason, seasonWipe, get season() { return season; }, seasonImage, slotHTML, voiceHTML, paintSeasonImages, rescan: null };
  window.Dome = api;

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.dataset.bare) { header(); footer(); }
    if (typeof window.page === "function") window.page(api);
    renderSlots();
    document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon, { live: el.hasAttribute("data-icon-live"), size: +el.dataset.iconSize || 20 })));
    buttonRows();
    closingPassage();
    passages();
    wireVideos();
    api.rescan = rise();
    setSeason(season);
    markerToggle();
    notesInit();
  });
})();
