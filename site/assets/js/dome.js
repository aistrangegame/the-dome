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
    h.innerHTML = `<a class="brand" href="${R("index.html")}"><span class="pt"></span>Catskill Mountain Domes</a>
      <div style="display:flex;gap:10px;align-items:center">${seasonSwitch()}
      <button class="menu-btn" type="button" aria-expanded="false">Menu</button>
      <nav>${NAV.map(([href, t]) => `<a href="${R(href)}"${here === href ? ' aria-current="page"' : ""}>${t}</a>`).join("")}<a class="stay-btn" href="${R("stay.html")}">Stay</a></nav></div>`;
    document.body.prepend(h);
    const btn = h.querySelector(".menu-btn"), nav = h.querySelector("nav");
    btn.addEventListener("click", () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
    h.querySelectorAll(".seasons button").forEach((b) => b.addEventListener("click", () => setSeason(b.dataset.s)));
    h.querySelector(".season-select").addEventListener("change", (e) => setSeason(e.target.value));
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

  /* ---------- The point that drifts with you ---------- */
  function driftDot() {
    if (document.body.dataset.nodot) return;
    const dot = document.createElement("div"); dot.className = "drift-dot"; document.body.append(dot);
    let t = 0;
    function place() {
      const h = document.documentElement.scrollHeight - innerHeight || 1;
      const p = Math.min(1, Math.max(0, scrollY / h));
      const x = innerWidth * (0.5 + 0.38 * Math.sin(p * Math.PI * 3 + t * 0.0004));
      const y = innerHeight * (0.18 + 0.64 * p);
      dot.style.left = x + "px"; dot.style.top = y + "px";
    }
    function loop(now) { t = now; place(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  /* ---------- Rise on view ---------- */
  function rise() {
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
    const scan = () => document.querySelectorAll(".rise:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
    scan(); return scan;
  }

  const api = { D, R, M, esc, store, setSeason, get season() { return season; }, seasonImage, slotHTML, voiceHTML, paintSeasonImages, rescan: null };
  window.Dome = api;

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.dataset.bare) { header(); footer(); }
    if (typeof window.page === "function") window.page(api);
    renderSlots();
    api.rescan = rise();
    setSeason(season);
    markerToggle();
    if (!document.body.dataset.bare) driftDot();
  });
})();
