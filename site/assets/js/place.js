/* Renders one place, in public mode (the Door) or house mode (on the mountain, the dome speaks). */
window.page = function (Dome) {
  const { D, R, M, esc, store, voiceHTML, slotHTML } = Dome;
  const slug = document.body.dataset.place;
  const mode = document.body.dataset.mode || "public";
  const i = D.places.findIndex((p) => p.slug === slug);
  const p = D.places[i];
  const prev = D.places[(i + D.places.length - 1) % D.places.length], next = D.places[(i + 1) % D.places.length];
  const base = mode === "house" ? R("house/places/") : R("places/");
  const main = document.getElementById("main");
  const imgMap = p.img.summer || p.img.winter ? p.img : { summer: "dome_ridge" };
  document.title = p.name + " · Catskill Mountain Domes";

  const hero = `<section class="hero page-hero" data-season-img='${JSON.stringify(imgMap)}'>
    <div class="bg"><img alt="${esc(p.name)}">${p.film ? Dome.videoHTML(p.film) : ""}<span class="imagined-tag">Imagined season</span></div><div class="veil"></div>
    <div class="inner"><span class="hero-ic">${Dome.icon(p.slug, { live: true, size: 44 })}</span><span class="eyebrow" style="color:rgba(255,255,255,.75)">${String(p.n).padStart(2, "0")} · ${esc(p.short)}${mode === "house" ? " · on the mountain" : ""}</span>
    <h1>${esc(p.name)}</h1>${mode === "house" ? `<p class="lede" style="font-family:Lora,serif;font-style:italic">${esc(p.dome)}</p>` : ""}</div></section>`;

  const voices = `<section class="band"><div class="reading"><span class="eyebrow">What guests said here</span>
    <div class="voices">${p.voices.map(voiceHTML).join("")}</div></div></section>`;

  const keeper = `<section class="band soft"><div class="reading">${slotHTML("em_place")}</div></section>`;

  const todo = `<section class="band deep"><div class="reading center rise"><span class="eyebrow">One thing to do here</span>
    <h2>${esc(p.todo)}</h2></div></section>`;

  const leave = mode === "house" ? `<section class="band"><div class="reading rise">
      <span class="eyebrow">Your word</span><h2>Leave something for the next guest.</h2>
      <p class="lede">A line, a memory, an idea for this place. Eric and Mona read every one before it appears here.</p>
      <form id="leave"><div class="field"><label for="w">Your words</label><textarea id="w" required maxlength="600" placeholder="What did this place give you?"></textarea></div>
      <div class="field"><label for="kind">This is</label><select id="kind"><option value="word">A word for the next guest</option><option value="idea">An idea to make this place better</option></select></div>
      <div class="field"><label for="nm">First name (shown with your words)</label><input id="nm" maxlength="40" autocomplete="given-name"></div>
      <button class="btn act" type="submit">Leave it</button></form><p id="left" class="notice" hidden></p></div></section>` : "";

  const act = p.act && mode === "house" ? `<section class="band soft"><div class="reading center rise"><span class="eyebrow">The Awakening</span>
      <h2>Act ${p.act} begins here.</h2><p class="lede">If you are walking the Awakening, this place holds its ${["", "first", "second", "third", "fourth", "fifth", "sixth", "last"][p.act]} act.</p>
      <p><a class="btn act" href="${R("house/awakening/act-" + p.act + ".html")}">Open Act ${p.act}</a></p></div></section>` : "";

  const ideas = D.ideas.filter((x) => x.place === slug);
  const ideaBand = ideas.length ? `<section class="band"><div class="reading"><span class="eyebrow">Ideas guests left for this place</span>
    ${ideas.map((x) => `<div class="voice-card rise" style="margin-bottom:22px"><h3>${esc(x.idea)}</h3><p style="color:var(--muted);margin:.2rem 0 .6rem">Asked for by ${esc(x.who)} · <span class="pill">${esc(x.status)}</span></p><blockquote class="voice" style="font-size:1.05rem">${esc(x.words[2])}</blockquote></div>`).join("")}
    <p><a href="${R("ideas.html")}">All ideas</a></p></div></section>` : "";

  const nav = `<section class="band soft"><div class="wrap" style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <a class="btn" href="${base + prev.slug}.html">← ${esc(prev.name)}</a>
    <a class="btn" href="${mode === "house" ? R("house/index.html") : R("places/index.html")}">All places</a>
    <a class="btn" href="${base + next.slug}.html">${esc(next.name)} →</a></div></section>`;

  // The place's game: a short version on the website; on the mountain, the full version where the game has one
  const scene = `<section class="band scene-band" id="play"><div class="wrap"><div id="sceneHost"></div></div></section>`;
  main.innerHTML = hero + (mode === "house" ? todo + scene + voices + act + leave + ideaBand : voices + scene + keeper + todo + ideaBand) + nav;
  (function loadScene() {
    const host = document.getElementById("sceneHost");
    const add = (src, cb) => { const s = document.createElement("script"); s.src = src; s.onload = cb; s.onerror = () => host.closest("section").remove(); document.body.append(s); };
    const go = () => add(R("assets/js/scenes/" + slug + ".js"), () => window.Scene.mount(host, slug, mode === "house" ? "full" : "preview"));
    window.Scene ? go() : add(R("assets/js/scenes/kit.js"), go);
  })();

  const f = document.getElementById("leave");
  if (f) f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entry = { place: slug, kind: f.kind.value, text: f.w.value.trim(), name: f.nm.value.trim(), at: new Date().toISOString(), status: "waiting" };
    if (!entry.text) return;
    const q = store.get("dome-words", []); q.push(entry); store.set("dome-words", q);
    if (D.live) try { await fetch(R("words"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(entry) }); } catch (err) {}
    f.hidden = true; const done = document.getElementById("left"); done.hidden = false;
    done.textContent = entry.kind === "idea" ? "Thank you. Your idea is with Eric and Mona. If they build it, your name goes on it." : "Thank you. Your words are with Eric and Mona, and will wait here for the next guest.";
  });
};
