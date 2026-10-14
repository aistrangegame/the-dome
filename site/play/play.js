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

  // Sound: the site's one sound ("Hear the mountain", top right). These games add their tones to it. Root 136.1 Hz for the point.
  const out = () => (window.Flow && window.Flow.Sound.out ? window.Flow.Sound.out() : null);
  P.sound = { get on() { return !!out(); } };
  P.ensureAudio = () => { const o = out(); return o ? o.ac : null; };
  P.setSound = (on) => { if (window.Flow) window.Flow.Sound.setOn(on); };
  P.tone = (f, dur = 1.8, vol = 0.12, type = "sine") => {
    const o = out(); if (!o) return; const ctx = o.ac;
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type; osc.frequency.value = f;
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g); g.connect(o.master); osc.start(); osc.stop(ctx.currentTime + dur + 0.05);
  };
  let drone = null, droneCtx = null;
  P.drone = (level) => { // a held 136.1 Hz with its octave, its loudness answering the game
    const o = out(); if (!o) { if (drone) drone.gain.setTargetAtTime(0, droneCtx.currentTime, 0.3); return; }
    if (!drone || droneCtx !== o.ac) {
      droneCtx = o.ac; drone = droneCtx.createGain(); drone.gain.value = 0; drone.connect(o.master);
      [136.1, 272.2, 68.05].forEach((f, i) => { const osc = droneCtx.createOscillator(); osc.frequency.value = f; const g = droneCtx.createGain(); g.gain.value = [1, 0.35, 0.5][i]; osc.connect(g); g.connect(drone); osc.start(); });
    }
    drone.gain.setTargetAtTime(Math.max(0, level) * 0.06, droneCtx.currentTime, 0.4);
  };

  P.bar = (opts = {}) => {
    const root = document.body.dataset.root || "../";
    const b = document.createElement("header"); b.className = "pbar";
    b.innerHTML = `<span class="brand"><button class="pt" type="button" data-portal aria-label="The point: the dome's own story and games"></button><a href="${root}index.html">Catskill Mountain Domes</a></span>
      <span class="tools">${(opts.tools || []).join("")}</span>`;
    document.body.prepend(b);
    // the site's sound button (top right) tells the game when it changes
    if (opts.onSound) document.addEventListener("dome:sound", (e) => opts.onSound(e.detail));
    return b;
  };
  window.Play = P;
})();
