/* The scenes kit: one stage for the thirteen place games (docs/remembering-plan.md §4).
   A game registers with Scene.register(slug, { title, line, full?, mount(k) }) and gets a kit `k`:
     k.stage            the stage element (position: relative; the game draws inside it)
     k.canvas()         a canvas filling the stage, kept sized: { cv, g, W, H }
     k.place            the place (name, short, voices: [[n, name, text], …] verbatim)
     k.mode             "preview" (the website) or "full" (on the property, device sensors allowed)
     k.reveal(i)        show guest voice i, verbatim, over the stage (the story, revealed by play)
     k.say(text)        the one instruction line under the stage
     k.progress(f)      0…1 shown as light along the stage's edge (never a number, never a score)
     k.done()           the ending: the last voice, a ripple, and "the full version waits at …"
     k.loop(fn)         fn(dt, t) every frame while the stage is on screen
     k.hold(cb)         pressing anywhere on the stage, or holding Space/Enter: cb(true|false)
     k.drag(cb)         pointer or arrow keys: cb({ x, y, dx, dy, down }) in stage pixels
     k.tap(cb)          a tap/click on the stage, or Enter: cb({ x, y })
     k.tone(f, dur, vol, type) / k.noise(dur, vol, filterHz)   sound, only if "Hear the mountain" is on
     k.ripple(x, y, s)  the page's ripple from a point on the stage
     k.haptic(ms)       a short vibration, on acts of will only (Android; iPhone has none)
     k.sensor.mic(cb) / k.sensor.tilt(cb) / k.sensor.compass(cb) / k.sensor.camera(video)  full mode only
     k.reduce           reduced motion is on
   Care laws (lalita-family): no streaks, no scores, one gesture at a time, silence counts. */
(function () {
  const games = {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let ac = null;
  const audio = () => {
    if (!(window.Flow && window.Flow.Sound.on)) return null;
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC(); }
    if (ac.state === "suspended") ac.resume();
    return ac;
  };

  function mount(host, slug, mode) {
    const G = games[slug], D = window.DOME, p = D.places.find((x) => x.slug === slug);
    if (!G || !p) return;
    const full = mode === "full" && !!G.full;
    host.innerHTML = `<div class="sc-head"><span class="sc-ic">${window.Dome.icon(slug, { live: true, size: 30 })}</span>
        <div><span class="eyebrow">${full ? "Play it here, where you’re standing" : "Play it here"}</span><h2>${esc(G.title)}</h2></div></div>
      <div class="scene${G.voiceAt === "top" ? " voice-top" : ""}" data-slug="${slug}" tabindex="0" aria-label="${esc(G.title)}: ${esc(G.line)}">
        <div class="sc-stage"></div>
        <div class="sc-edge" aria-hidden="true"><i></i></div>
        <div class="sc-voice" aria-live="polite"></div>
        <div class="sc-begin"><p>${esc(G.line)}</p><button class="btn act" type="button">Begin</button></div>
        <div class="sc-end" hidden></div>
      </div>
      <p class="sc-say" aria-live="polite"></p>
      <p class="sc-note">${full ? "The full version, for this place." : `A short version, to play from anywhere. The full version waits at ${esc(lowerFirst(p.name))}, when you’re there.`}</p>`;
    const scene = host.querySelector(".scene"), stage = host.querySelector(".sc-stage"), edge = host.querySelector(".sc-edge i");
    const voice = host.querySelector(".sc-voice"), say = host.querySelector(".sc-say"), begin = host.querySelector(".sc-begin"), end = host.querySelector(".sc-end");
    let loops = [], running = false, visible = true, prev = 0, ended = false, shown = new Set(), cleanups = [];
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && running) kick(); }, { threshold: 0.15 }); io.observe(scene);
    function kick() { if (!loops.length) return; prev = performance.now(); requestAnimationFrame(frame); }
    function frame(t) { if (!running || !visible) return; const dt = Math.min(0.05, (t - prev) / 1000); prev = t; loops.forEach((f) => f(dt, t / 1000)); requestAnimationFrame(frame); }
    const local = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    const k = {
      stage, place: p, mode: full ? "full" : "preview", reduce,
      canvas() {
        const cv = document.createElement("canvas"); cv.className = "sc-cv"; stage.append(cv); const g = cv.getContext("2d"); const o = { cv, g, W: 0, H: 0 };
        const size = () => { const d = Math.min(2, devicePixelRatio || 1); o.W = stage.clientWidth; o.H = stage.clientHeight; cv.width = o.W * d; cv.height = o.H * d; g.setTransform(d, 0, 0, d, 0, 0); };
        size(); const ro = new ResizeObserver(size); ro.observe(stage); cleanups.push(() => ro.disconnect()); return o;
      },
      reveal(i) {
        const v = p.voices[i]; if (!v || shown.has(i)) return; shown.add(i);
        voice.innerHTML = `<blockquote>${esc(v[2])}</blockquote><span>${esc(v[1])} · guest #${v[0]}</span>`;
        voice.classList.remove("on"); void voice.offsetWidth; voice.classList.add("on");
        const r = stage.getBoundingClientRect(); k.ripple(r.width / 2, r.height * 0.8, 0.5);
      },
      say(t) { say.textContent = t; },
      progress(f) { edge.style.transform = `scaleX(${Math.max(0, Math.min(1, f)).toFixed(3)})`; },
      done() {
        if (ended) return; ended = true;
        p.voices.forEach((_, i) => { if (!shown.has(i)) setTimeout(() => k.reveal(i), 300 + i * 2600); });
        k.progress(1); k.haptic(30);
        const r = stage.getBoundingClientRect(); k.ripple(r.width / 2, r.height / 2, 1);
        setTimeout(() => {
          end.hidden = false; scene.classList.add("ending");
          end.innerHTML = full
            ? `<p>${esc(G.fullEnd || "Done. This one is yours.")}</p><button class="btn act" type="button" data-again>Again</button>`
            : `<p>That was the short version. The full one waits at ${esc(lowerFirst(p.name))}: scan the card there.</p><button class="btn act" type="button" data-again>Play again</button>`;
          end.querySelector("[data-again]").addEventListener("click", () => { teardown(); mount(host, slug, mode); host.querySelector(".sc-begin button").click(); });
        }, 300 + p.voices.length * 2600);
      },
      loop(fn) { loops.push(fn); if (running) kick(); },
      hold(cb) {
        let on = false; const set = (v) => { if (v !== on) { on = v; cb(v); } };
        const dn = (e) => { if (e.target.closest("button")) return; set(true); }, up = () => set(false);
        const kd = (e) => { if ((e.key === " " || e.key === "Enter") && document.activeElement === scene) { e.preventDefault(); set(true); } };
        const ku = (e) => { if (e.key === " " || e.key === "Enter") set(false); };
        scene.addEventListener("pointerdown", dn); addEventListener("pointerup", up); addEventListener("pointercancel", up); scene.addEventListener("keydown", kd); addEventListener("keyup", ku);
        cleanups.push(() => { removeEventListener("pointerup", up); removeEventListener("pointercancel", up); removeEventListener("keyup", ku); });
      },
      drag(cb) {
        let down = false, last = null;
        stage.style.touchAction = "none";
        scene.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; down = true; last = local(e); scene.setPointerCapture(e.pointerId); cb({ ...last, dx: 0, dy: 0, down: true }); });
        scene.addEventListener("pointermove", (e) => { const q = local(e); cb({ ...q, dx: last ? q.x - last.x : 0, dy: last ? q.y - last.y : 0, down }); last = q; });
        scene.addEventListener("pointerup", () => { down = false; cb({ ...(last || { x: 0, y: 0 }), dx: 0, dy: 0, down: false }); });
        scene.addEventListener("keydown", (e) => {
          const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
          e.preventDefault(); const s = e.shiftKey ? 30 : 12; const q = last || { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
          last = { x: Math.max(0, Math.min(stage.clientWidth, q.x + d[0] * s)), y: Math.max(0, Math.min(stage.clientHeight, q.y + d[1] * s)) };
          cb({ ...last, dx: d[0] * s, dy: d[1] * s, down: true, key: true });
        });
      },
      tap(cb) {
        scene.addEventListener("click", (e) => { if (e.target.closest("button")) return; cb(local(e)); });
        scene.addEventListener("keydown", (e) => { if (e.key === "Enter" && document.activeElement === scene) { e.preventDefault(); cb({ x: stage.clientWidth / 2, y: stage.clientHeight / 2, key: true }); } });
      },
      tone(f, dur = 1.2, vol = 0.08, type = "sine") {
        const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
      },
      noise(dur = 0.3, vol = 0.05, hz = 1200, type = "bandpass") {
        const a = audio(); if (!a) return; const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; f.type = type; f.frequency.value = hz; g.gain.value = vol;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start();
      },
      ripple(x, y, s = 0.7) { if (!window.Flow) return; const r = stage.getBoundingClientRect(); window.Flow.burst(r.left + x, r.top + y, s); },
      haptic(ms = 12) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} },
      sensor: sensors(full, cleanups)
    };

    function teardown() { running = false; io.disconnect(); cleanups.forEach((f) => { try { f(); } catch (e) {} }); }
    begin.querySelector("button").addEventListener("click", async () => {
      begin.classList.add("gone"); running = true; scene.focus({ preventScroll: true });
      if (window.Flow) window.Flow.Sound.ensure();
      try { await G.mount(k); } catch (e) { console.error(e); }
      kick();
    });
  }
  function lowerFirst(s) { return /^The /.test(s) ? "t" + s.slice(1) : s; }

  /* Device sensors, for the full version on the property. Each asks at the moment it is needed. */
  function sensors(full, cleanups) {
    const no = () => Promise.resolve(false);
    if (!full) return { mic: no, tilt: no, compass: no, camera: no };
    const iosAsk = async (C) => { if (C && typeof C.requestPermission === "function") { try { return (await C.requestPermission()) === "granted"; } catch (e) { return false; } } return true; };
    return {
      async mic(cb) {
        try {
          const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
          const A = new (window.AudioContext || window.webkitAudioContext)(), an = A.createAnalyser(); an.fftSize = 1024; A.createMediaStreamSource(st).connect(an);
          const buf = new Float32Array(an.fftSize), low = new Uint8Array(an.frequencyBinCount); let alive = true;
          (function read() { if (!alive) return; an.getFloatTimeDomainData(buf); an.getByteFrequencyData(low); let s = 0; for (const v of buf) s += v * v;
            let lo = 0; for (let i = 1; i < 12; i++) lo += low[i]; cb({ level: Math.sqrt(s / buf.length), low: lo / (11 * 255) }); requestAnimationFrame(read); })();
          cleanups.push(() => { alive = false; st.getTracks().forEach((t) => t.stop()); A.close(); });
          return true;
        } catch (e) { return false; }
      },
      async tilt(cb) {
        if (!(await iosAsk(window.DeviceMotionEvent)) || !(await iosAsk(window.DeviceOrientationEvent))) return false;
        const h = (e) => cb({ beta: e.beta || 0, gamma: e.gamma || 0, alpha: e.alpha || 0 }); addEventListener("deviceorientation", h); cleanups.push(() => removeEventListener("deviceorientation", h));
        const m = (e) => { const a = e.accelerationIncludingGravity || {}; cb({ ax: a.x || 0, ay: a.y || 0, az: a.z || 0, motion: true }); }; addEventListener("devicemotion", m); cleanups.push(() => removeEventListener("devicemotion", m));
        return true;
      },
      async compass(cb) {
        if (!(await iosAsk(window.DeviceOrientationEvent))) return false;
        const h = (e) => { const head = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null); if (head != null) cb(head, e); };
        addEventListener("deviceorientationabsolute", h); addEventListener("deviceorientation", h);
        cleanups.push(() => { removeEventListener("deviceorientationabsolute", h); removeEventListener("deviceorientation", h); });
        return true;
      },
      async camera(video) {
        try { const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); video.srcObject = st; video.muted = true; video.playsInline = true; await video.play(); cleanups.push(() => st.getTracks().forEach((t) => t.stop())); return true; }
        catch (e) { return false; }
      }
    };
  }

  window.Scene = { register(slug, g) { games[slug] = g; }, mount, games };
})();
