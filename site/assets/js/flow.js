/* Flow: the site moves like water around one still point.
   - Ripples leave the point wherever it opens or closes (the home opening, the passages, every page's close,
     arriving on a page). How fast you scroll sets how many rings and how strong; the glide after a flick
     is damped at 0.956 a frame (rupakarshini). Each page's element sets the ripple's character
     (padakarshini ceremony grammar: water pools, fire rises, air drifts, earth settles, light radiates).
   - Pictures swell a little with a hard scroll and settle when it stops.
   - Sound, generated here, off until chosen ("Hear the mountain"), remembered on this device; at most two voices.
   - Phone vibration only on acts of will (the games), never on scrolling; reduced motion turns ripples and swell off.
   Plan: docs/remembering-plan.md §2–3. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body.dataset;
  const path = location.pathname;

  /* ---------- Which element is this page? ---------- */
  const PLACE_EL = { gate: "air", window: "light", couch: "light", library: "earth", table: "earth", loft: "light", hearth: "fire",
    "cedar-pool": "water", "fire-circle": "fire", meadow: "air", trails: "water", "night-sky": "light", "guest-book": "earth" };
  const PLACE_BED = { gate: "wind", window: "birds", couch: "room", library: "room", table: "room", loft: "room", hearth: "fire",
    "cedar-pool": "water", "fire-circle": "fire", meadow: "meadow", trails: "water", "night-sky": "night", "guest-book": "room" };
  const slug = body.place || (path.match(/(?:places|scenes)\/([\w-]+)\.html$/) || [])[1];
  const PAGE = [[/stories/, "water", "water"], [/around/, "water", "water"], [/timeline|new-chapter|how-it-began|stay|your-stays/, "earth", "meadow"],
    [/ideas/, "air", "meadow"], [/\/play\//, "light", "night"], [/remembering|awakening/, "light", "night"]];
  let element = "light", bed = "wind";
  if (slug && PLACE_EL[slug]) { element = PLACE_EL[slug]; bed = PLACE_BED[slug]; }
  else for (const [re, e, b] of PAGE) if (re.test(path)) { element = e; bed = b; break; }
  if (body.element) element = body.element;
  if (body.bed) bed = body.bed;

  // The character of each element's ripple: colour, life (s), spread, how many in a burst, drift (px/s, + is down), wobble
  const E = {
    water: { c: "170,210,235", life: 6.5, spread: 1, burst: 4, drift: 0, wob: 0, flat: 1 },
    fire: { c: "245,180,110", life: 5.5, spread: .8, burst: 4, drift: -26, wob: 2.2, flat: 1 },
    air: { c: "225,232,224", life: 6, spread: 1.5, burst: 5, drift: 0, wob: 0, flat: 1, off: 46 },
    earth: { c: "215,195,150", life: 7.5, spread: .65, burst: 2, drift: 0, wob: 0, flat: .58 },
    light: { c: "255,244,214", life: 3.8, spread: 1.25, burst: 5, drift: 0, wob: 0, flat: 1 }
  };

  /* ---------- Scroll speed, with glide ---------- */
  let vel = 0, lastY = scrollY, lastT = performance.now(), dir = 1;
  addEventListener("scroll", () => {
    const t = performance.now(), y = scrollY, dt = Math.max(8, t - lastT);
    const v = Math.abs(y - lastY) / dt * 16;            // px per frame at 60 fps
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    vel = Math.min(80, Math.max(vel, v * 0.9 + vel * 0.1));
    lastY = y; lastT = t; wake();
  }, { passive: true });

  /* ---------- The ripples: each ring is a light circle that only grows and fades (transform and opacity),
     so the graphics chip draws it on its own and scrolling never waits for it ---------- */
  let layer = null, live = 0, src = null, acc = 0, running = false, prev = 0;
  function host() {
    if (layer) return layer;
    layer = document.createElement("div"); layer.className = "flow-rings"; layer.setAttribute("aria-hidden", "true");
    document.body.append(layer); return layer;
  }
  function ring(x, y, a, k, el) {
    if (reduce || live > 10 || !document.body.animate) return;
    const e = E[el || element], d = document.createElement("i"), R = Math.min(760, Math.hypot(innerWidth, innerHeight) * .62 * e.spread * .75);
    const life = (e.life / Math.min(2.2, k)) * 1000, w = Math.min(3, .8 + k * .7);
    d.style.cssText = `left:${x - R}px;top:${y - R}px;width:${2 * R}px;height:${2 * R}px;border:${w}px solid rgba(${e.c},1)`;
    host().append(d); live++;
    const sy = e.flat, dy = e.drift * life / 1000;
    const kf = e.wob
      ? [{ transform: `translateY(0) scale(.01, ${.01 * sy})`, opacity: a }, { transform: `translateY(${dy * .5}px) scale(.5, ${.47 * sy}) rotate(4deg)`, opacity: a * .45 }, { transform: `translateY(${dy}px) scale(1, ${.94 * sy}) rotate(-3deg)`, opacity: 0 }]
      : [{ transform: `translateY(0) scale(.01, ${.01 * sy})`, opacity: a }, { transform: `translateY(${dy}px) scale(1, ${sy})`, opacity: 0 }];
    d.animate(kf, { duration: life, easing: "cubic-bezier(.2,.6,.35,1)", fill: "forwards" }).onfinish = () => { d.remove(); live--; };
  }

  // Called by the zooms every frame they are on screen: where the point is, and whether it is opening or closing now
  function zoom(on, x, y, opening) { if (on) { src = { x, y, opening, until: performance.now() + 120 }; wake(); } }

  // A burst: the ring-set of this element (arrival on a page, a tap, a game's answer)
  function burst(x, y, strength = 1, el) {
    const e = E[el || element]; if (reduce) return;
    for (let i = 0; i < e.burst; i++) setTimeout(() => ring(x + (e.off ? (Math.random() - .5) * e.off : 0), y, .55 * strength, 1 + strength * .4, el), i * (e.life * 1000 / (e.burst + 2)));
    Sound.drop(strength);
  }

  // The swell goes straight onto the few pictures that carry it (a page-wide variable would restyle the whole page)
  let swelled = [];
  function swellOn(v) {
    if (!swelled.length) swelled = [...document.querySelectorAll(".hero .bg > img, .hero .bg > video")];
    const t = v ? `scale(${(1 + v * .035).toFixed(4)})` : "";
    swelled.forEach((n) => { if (n._t !== t) { n._t = t; n.style.transform = t; } });
  }

  // others (the zooms) join this tick while the glide fades, instead of running loops of their own
  const ticks = new Set();
  function wake() { if (!running) { running = true; prev = performance.now(); requestAnimationFrame(tick); } }
  function tick(now) {
    const dt = Math.min(.05, (now - prev) / 1000); prev = now;
    vel *= Math.pow(0.956, dt * 60);
    if (vel < .05) vel = 0;
    if (!reduce) swellOn(Math.min(1, vel / 40));
    Sound.speed(vel);
    ticks.forEach((f) => { try { f(vel); } catch (e) {} });
    // rings from the point, while a zoom is on screen and you are moving
    if (src && now < src.until && vel > .6) {
      acc += (0.5 + vel * 0.22) * dt;
      while (acc >= 1) { acc -= 1; const e = E[element]; ring(src.x + (e.off ? (Math.random() - .5) * e.off : 0), src.y, Math.min(.9, .22 + vel / 45), 1 + vel / 22); Sound.pulse(vel); }
    } else acc = Math.min(acc, .8);
    if (vel > 0 || (src && now < src.until)) requestAnimationFrame(tick);
    else { running = false; swellOn(0); }
  }

  /* ---------- Sound: generated, two voices at most (a bed and the ripples) ---------- */
  const Sound = (() => {
    let ac = null, master = null, bedGain = null, bedNode = null, noise = null, on = false, lastPulse = 0, wind = null, curBed = null;
    const KEY = "dome-sound";
    const want = () => { try { return localStorage.getItem(KEY) === "on"; } catch (e) { return false; } };
    function ctx() {
      if (ac) return ac;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      // a long buffer of soft noise, shared by every bed
      const len = ac.sampleRate * 3, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
      let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = last * 3.2; }
      noise = b; return ac;
    }
    const src = () => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.loopStart = Math.random(); return s; };
    function stopBed() { if (!bedNode) return; const n = bedNode, g = bedGain; g.gain.setTargetAtTime(0, ac.currentTime, .6); setTimeout(() => n.forEach((x) => { try { x.stop ? x.stop() : x.disconnect(); } catch (e) {} }), 2500); bedNode = null; wind = null; }
    // Each bed is a few nodes; "timers" are interval ids for the scattered sounds (crackles, chirps, drops)
    function startBed(kind) {
      if (!ac || curBed === kind) return; stopBed(); curBed = kind;
      const g = ac.createGain(); g.gain.value = 0; g.connect(master); g.gain.setTargetAtTime(1, ac.currentTime, 1.2); bedGain = g;
      const nodes = [], timers = [];
      const noiseThrough = (type, f, q, gain) => { const s = src(), fl = ac.createBiquadFilter(), gg = ac.createGain(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; gg.gain.value = gain; s.connect(fl); fl.connect(gg); gg.connect(g); s.start(); nodes.push(s); return { s, fl, gg }; };
      const blip = (f0, f1, dur, vol, type = "sine") => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(vol, t + .01); gg.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(gg); gg.connect(g); o.start(t); o.stop(t + dur + .05); };
      const every = (min, max, fn) => { let alive = true; const go = () => { if (!alive) return; fn(); setTimeout(go, min + Math.random() * (max - min)); }; setTimeout(go, Math.random() * max); timers.push(() => (alive = false)); };
      if (kind === "wind" || kind === "meadow") {
        wind = noiseThrough("bandpass", 380, .6, .22);
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .07; lg.gain.value = .12; lfo.connect(lg); lg.connect(wind.gg.gain); lfo.start(); nodes.push(lfo);
        if (kind === "meadow") every(2500, 7000, () => { const f = 2600 + Math.random() * 1800; blip(f, f * 1.4, .09, .025); setTimeout(() => blip(f * 1.2, f * .9, .12, .02), 130); });
      } else if (kind === "water") {
        noiseThrough("lowpass", 900, .4, .16);
        const hi = noiseThrough("bandpass", 1800, 1.4, .07);
        every(60, 220, () => { hi.fl.frequency.setTargetAtTime(1200 + Math.random() * 1800, ac.currentTime, .03); });
        every(400, 1600, () => { const f = 500 + Math.random() * 700; blip(f, f * 1.9, .07, .02); });
      } else if (kind === "fire") {
        noiseThrough("lowpass", 220, .7, .3);
        every(40, 380, () => { const s = src(), fl = ac.createBiquadFilter(), gg = ac.createGain(), t = ac.currentTime; fl.type = "highpass"; fl.frequency.value = 1500 + Math.random() * 2500; gg.gain.setValueAtTime(.18 * Math.random(), t); gg.gain.exponentialRampToValueAtTime(.0001, t + .015 + Math.random() * .03); s.connect(fl); fl.connect(gg); gg.connect(g); s.start(t); s.stop(t + .08); });
      } else if (kind === "night") {
        noiseThrough("lowpass", 300, .5, .05);
        every(900, 2600, () => { for (let i = 0; i < 3 + (Math.random() * 3 | 0); i++) setTimeout(() => blip(4400, 4300, .035, .012, "triangle"), i * 70); });
      } else if (kind === "birds") {
        noiseThrough("bandpass", 500, .5, .07);
        every(1800, 5200, () => { const f = 2400 + Math.random() * 2400; [0, 140, 260].forEach((d, i) => setTimeout(() => blip(f * (1 + i * .12), f * (1.3 + i * .1), .08, .03), d)); });
      } else { // room: the hush inside the dome, a far bird now and then
        noiseThrough("lowpass", 160, .5, .08);
        every(6000, 14000, () => { const f = 2800 + Math.random() * 1200; blip(f, f * 1.3, .1, .012); });
      }
      bedNode = [...nodes, { stop: () => timers.forEach((t) => t()) }];
    }
    function setOn(v) {
      if (v && !ctx()) v = false;   // no Web Audio here: stay off, and say so honestly
      on = v; try { localStorage.setItem(KEY, v ? "on" : "off"); } catch (e) {}
      if (v) { ac.resume(); startBed(passageBed || bed); master.gain.setTargetAtTime(.9, ac.currentTime, .5); }
      else if (ac) { master.gain.setTargetAtTime(0, ac.currentTime, .3); setTimeout(() => { if (!on) { stopBed(); curBed = null; } }, 1200); }
      document.dispatchEvent(new CustomEvent("dome:sound", { detail: on }));
      document.querySelectorAll(".flow-sound").forEach((b) => { b.setAttribute("aria-pressed", String(on)); b.querySelector(".t").textContent = on ? "Sound on" : "Hear the mountain"; });
    }
    let passageBed = null;
    return {
      get on() { return on; },
      want, setOn,
      // the games' sounds come through here: one context, one volume, silent unless sound is on
      out() { return on && ac ? { ac, master } : null; },
      ensure() { if (want() && !on) setOn(true); },
      bed(kind) { passageBed = kind; if (on) startBed(kind || bed); },
      speed(v) { if (on && wind) wind.gg.gain.setTargetAtTime(.22 + Math.min(.5, v / 60), ac.currentTime, .15); },
      gust() { if (on && wind) { const t = ac.currentTime; wind.gg.gain.setTargetAtTime(.8, t, .08); wind.gg.gain.setTargetAtTime(.22, t + .5, .5); } },
      // the ripples' own voice: a soft drop of water, or a low hum for fire and earth
      pulse(v) { if (!on || performance.now() - lastPulse < 380) return; lastPulse = performance.now(); this.drop(Math.min(1, v / 30) * .7); },
      drop(s = .6) {
        if (!on || !ac) return; const t = ac.currentTime, o = ac.createOscillator(), gg = ac.createGain();
        const warm = element === "fire" || element === "earth";
        o.type = "sine"; o.frequency.setValueAtTime(warm ? 140 : 900 + Math.random() * 300, t); o.frequency.exponentialRampToValueAtTime(warm ? 90 : 320, t + (warm ? .5 : .16));
        gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(.06 * s, t + .008); gg.gain.exponentialRampToValueAtTime(.0001, t + (warm ? .9 : .4));
        o.connect(gg); gg.connect(master); o.start(t); o.stop(t + 1);
      }
    };
  })();

  // sound rests while the page is hidden, and comes back with it
  document.addEventListener("visibilitychange", () => { const a = Sound.out(); if (!a) return; document.hidden ? a.ac.suspend() : a.ac.resume(); });

  /* The quiet control, in the dock beside Notes */
  function soundButton() {
    // top right, outside the menu: the header's sound slot (every page has one; dome.js makes it)
    const d = document.querySelector(".hd-sound") || (window.Dome && window.Dome.rightSlot && window.Dome.rightSlot()) || document.body;
    const b = document.createElement("button"); b.type = "button"; b.className = "flow-sound"; b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Hear the mountain");
    b.innerHTML = `<span class="wave" aria-hidden="true"><i></i><i></i><i></i></span><span class="t">Hear the mountain</span>`;
    b.addEventListener("click", () => Sound.setOn(!Sound.on));
    d.append(b);
    // Browsers only allow sound after a touch or a key: if it was on last time, it comes back with the first one
    // (iPhone only unlocks sound on a finished touch or a click, so those are what bring it back)
    if (Sound.want()) { b.querySelector(".t").textContent = "Sound on"; const evs = ["click", "touchend", "keydown"]; const go = () => { Sound.ensure(); evs.forEach((x) => removeEventListener(x, go, true)); }; evs.forEach((x) => addEventListener(x, go, true)); }
  }

  /* Touch: a tap on a picture ripples there; a fast sideways swipe is a gust */
  function touches() {
    let sx = 0, st = 0;
    document.addEventListener("pointerdown", (e) => {
      sx = e.clientX; st = performance.now();
      const pic = e.target.closest && e.target.closest(".hero .bg, .p-stage, .bloom .stage, .flow-tap");
      if (!pic || e.target.closest("a, button, input, textarea, select, label")) return;
      burst(e.clientX, e.clientY, .8);
    }, { passive: true });
    document.addEventListener("pointerup", (e) => { const dx = Math.abs(e.clientX - sx), dt = performance.now() - st; if (dx > 90 && dt < 350) Sound.gust(); }, { passive: true });
  }

  /* Arriving on a page: the rings leave from where you tapped on the page before (or from the centre) */
  function arrival() {
    let at = null; try { at = JSON.parse(sessionStorage.getItem("dome-tap") || "null"); sessionStorage.removeItem("dome-tap"); } catch (e) {}
    const x = at ? at.x * innerWidth : innerWidth / 2, y = at ? at.y * innerHeight : innerHeight / 2;
    document.documentElement.style.setProperty("--wx", x + "px"); document.documentElement.style.setProperty("--wy", y + "px");
    setTimeout(() => burst(x, y, .7), 350);
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]"); if (!a || a.target || e.metaKey || e.ctrlKey) return;
      try { sessionStorage.setItem("dome-tap", JSON.stringify({ x: e.clientX / innerWidth, y: e.clientY / innerHeight })); } catch (err) {}
    }, true);
  }

  // Sections can carry their own sound (data-sound="night" on the stars passage): it takes over while pinned
  let pinnedSound = null;
  function passageSound(kind) { if (kind === pinnedSound) return; pinnedSound = kind; Sound.bed(kind); }

  window.Flow = { element, bed, ring, burst, zoom, passageSound, Sound, get speed() { return vel; }, get dir() { return dir; }, reduce, onTick(f) { ticks.add(f); } };
  soundButton(); touches(); arrival();
})();
