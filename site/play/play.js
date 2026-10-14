/* Behind the point: shared shell for the dome's games. Loaded before dome.js on pages with data-bare. */
(function () {
  const P = {};
  // Guests in the order they came, by the month they stayed (review numbers are not in date order)
  P.guests = () => (window.DOME_REVIEWS || []).slice().sort((a, b) => (a.year - b.year) || (a.month - b.month) || (b.n - a.n));
  // One whole sentence from a guest, exactly as written (never cut mid-sentence).
  P.sentence = (text, min = 28, max = 170) => {
    const parts = String(text).split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
    return parts.find((x) => x.length >= min && x.length <= max) || parts.find((x) => x.length <= max) || null;
  };
  P.month = (r) => ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][r.month] + " " + r.year;
  P.seasonColor = { spring: "#9CC48A", summer: "#E2C48A", fall: "#D9864E", winter: "#B9CFE4" };

  // Sound waits for the reader's switch. Root 136.1 Hz for the point.
  let ctx = null, master = null, drone = null;
  P.sound = { on: false };
  P.ensureAudio = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    return ctx;
  };
  P.setSound = (on) => {
    P.sound.on = on; const c = P.ensureAudio(); if (!c) return;
    if (c.state === "suspended") c.resume();
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.linearRampToValueAtTime(on ? 0.9 : 0, c.currentTime + 0.6);
  };
  P.tone = (f, dur = 1.8, vol = 0.12, type = "sine") => {
    if (!P.sound.on || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.05);
  };
  P.drone = (level) => { // a held 136.1 Hz with its octave, its loudness answering the game
    if (!ctx) return;
    if (!drone) {
      drone = ctx.createGain(); drone.gain.value = 0; drone.connect(master);
      [136.1, 272.2, 68.05].forEach((f, i) => { const o = ctx.createOscillator(); o.frequency.value = f; const g = ctx.createGain(); g.gain.value = [1, 0.35, 0.5][i]; o.connect(g); g.connect(drone); o.start(); });
    }
    drone.gain.setTargetAtTime(Math.max(0, level) * 0.06, ctx.currentTime, 0.4);
  };

  P.bar = (opts = {}) => {
    const root = document.body.dataset.root || "../";
    const b = document.createElement("header"); b.className = "pbar";
    b.innerHTML = `<span class="brand"><button class="pt" type="button" data-portal aria-label="The point: the dome's own story and games"></button><a href="${root}index.html">Catskill Mountain Domes</a></span>
      <span class="tools">${opts.sound ? '<button class="tool" type="button" data-sound aria-pressed="false">Sound off</button>' : ""}${(opts.tools || []).join("")}</span>`;
    document.body.prepend(b);
    const sb = b.querySelector("[data-sound]");
    if (sb) sb.addEventListener("click", () => { const on = !P.sound.on; P.setSound(on); sb.setAttribute("aria-pressed", String(on)); sb.textContent = on ? "Sound on" : "Sound off"; if (opts.onSound) opts.onSound(on); });
    return b;
  };
  window.Play = P;
})();
