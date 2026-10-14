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
        <div><b>Behind the point</b><br><a href="${R("play/story.html")}">The dome’s own story</a><br><a href="${R("play/find.html")}">Find the point</a><br><a href="${R("play/build.html")}">One triangle at a time</a><br><a href="${R("play/still.html")}">Be still</a></div>
        <div><b>For Eric and Mona</b><br><a href="${R("dashboard/index.html")}">Dashboard</a><br><a href="${R("house/index.html")}">On the property</a><br><a href="${R("house/awakening/index.html")}">The Awakening</a></div>
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
    const label = () => (b.innerHTML = `<span class="dot"></span>${document.documentElement.classList.contains("clean") ? "Show where your words go" : "Hide the markers"}`);
    label();
    b.addEventListener("click", () => { const c = document.documentElement.classList.toggle("clean"); store.set("dome-clean", c); label(); });
    document.body.append(b);
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
  function passages() {
    const list = [...document.querySelectorAll(".passage")];
    list.forEach((sec) => {
      if (sec.dataset.built) return; sec.dataset.built = "1";
      const lines = JSON.parse(sec.dataset.lines || "[]");
      sec.style.height = (sec.dataset.h || 220) + "svh";
      sec.innerHTML = `<div class="p-stage"><div class="p-layer" data-season-img='${sec.dataset.seasonImg}'><img alt="${esc(sec.dataset.alt || "")}"><span class="imagined-tag">Imagined season</span></div>
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
    s.dataset.seasonImg = JSON.stringify({ summer: "disc" }); s.dataset.alt = "The dome from directly above, closing back into a single point.";
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


  /* ---------- Behind the point: the dome's own room ---------- */
  // The header point opens a dark room from exactly where it sits. The dome speaks here, about its own life.
  const DOORS = [
    ["story", "play/story.html", "My story", "Nine stages of a life, from an empty hillside to 252 guests.", "Read"],
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
          `<a class="door${walked[k] ? " walked" : ""}" href="${R(href)}" data-k="${k}" style="transition-delay:${0.9 + i * 0.55}s"${here === href ? ' aria-current="page"' : ""}><span class="slit" aria-hidden="true"></span><span><b>${t}</b><small>${line}</small></span><span class="k">${walked[k] ? "Again" : verb}</span></a>`).join("")}</nav>
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
  const api = { D, R, M, esc, store, openPortal, closePortal, markWalked, setSeason, seasonWipe, get season() { return season; }, seasonImage, slotHTML, voiceHTML, paintSeasonImages, rescan: null };
  window.Dome = api;

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.dataset.bare) { header(); footer(); }
    if (typeof window.page === "function") window.page(api);
    renderSlots();
    closingPassage();
    passages();
    api.rescan = rise();
    setSeason(season);
    markerToggle();
  });
})();
