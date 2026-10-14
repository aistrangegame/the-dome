/* The meadow: press and hold, and wildflowers grow up under your finger.
   Preview: press and hold anywhere on the meadow (several fingers grow several patches); drag to spread it.
     Keys: Space or Enter grows at the cursor, the arrows move it.
   Full, on the mown path: walk it with the phone in your hand; each step grows a flower along the path (120 steps). Holding still works too.
   After padakarshini "Finger garden". */
Scene.register("meadow", {
  title: "Grow the meadow",
  line: "Press and hold the meadow, and it grows wild under your hand.",
  full: true,
  voiceAt: "top",
  fullEnd: "The meadow grew with every step you took.",
  mount(k) {
    const { g } = k.canvas();
    const scene = k.stage.closest(".scene");
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const NEED = 150, MAX = 230, STEPS = 120;
    const HOR = 0.44;                                   // the horizon line, as a share of the height
    const plants = [], flies = [], touches = new Map();
    let moved = false, began = performance.now() / 1000, cursor = null, keyHeld = false, grown = 0, steps = 0, done = false, lastSay = "", nextDrone = 0, lastBloom = 0, bg = null, bgKey = "";
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    const COLS = ["#F5F0E8", "#E2C48A", "#C9A96E", "#B9A7D8", "#E8D9F0", "#F0C9A0"];
    say(k.mode === "full" ? "Walk the mown path slowly, phone in hand. Every step grows a flower." : "Press and hold anywhere on the meadow. Use more fingers for more flowers.");

    // where the meadow is: below the horizon; nearer is bigger
    const depth = (y, H) => Math.max(0, Math.min(1, (y / H - HOR) / (1 - HOR)));
    const clampToMeadow = (p, H) => ({ x: p.x, y: Math.max(H * (HOR + .04), p.y) });

    // many fingers at once: our own pointer listeners
    k.stage.style.touchAction = "none";
    const local = (e) => { const r = k.stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    scene.addEventListener("pointerdown", (e) => { if (e.target.closest("button, a, input, textarea, .sc-end, .sc-begin")) return; const p = local(e); touches.set(e.pointerId, { ...p, held: 0 }); try { scene.setPointerCapture(e.pointerId); } catch (_) {} cursor = null; });
    scene.addEventListener("pointermove", (e) => { const q = touches.get(e.pointerId); if (q) { const p = local(e); q.x = p.x; q.y = p.y; } });
    const lift = (e) => touches.delete(e.pointerId);
    scene.addEventListener("pointerup", lift); scene.addEventListener("pointercancel", lift); scene.addEventListener("lostpointercapture", lift);

    // keys: a cursor moved by the arrows, Space or Enter to grow there
    scene.addEventListener("keydown", (e) => {
      if (document.activeElement !== scene) return;
      const { W, H } = view();
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (d) { e.preventDefault(); if (!cursor) cursor = { x: W / 2, y: H * .74, held: 0 }; const s = e.shiftKey ? 36 : 16; cursor.x = Math.max(8, Math.min(W - 8, cursor.x + d[0] * s)); cursor.y = Math.max(H * (HOR + .04), Math.min(H - 8, cursor.y + d[1] * s)); }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!cursor) cursor = { x: W / 2, y: H * .74, held: 0 }; keyHeld = true; }
    });
    addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") keyHeld = false; });

    function grow(src, W, H, auto) {
      if (plants.length >= MAX) plants.shift();
      const spread = Math.min(1, src.held / 3), a = Math.random() * Math.PI * 2, r = (6 + Math.random() * (18 + spread * 70)) * (.5 + depth(src.y, H));
      const p = clampToMeadow({ x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r * .45 }, H);
      const kind = Math.random(), z = depth(p.y, H);
      plants.push({ x: p.x, y: p.y, z, t: 0, kind: kind < .38 ? "grass" : kind < .55 ? "tall" : kind < .7 ? "cluster" : "flower", col: COLS[(Math.random() * COLS.length) | 0], h: .6 + Math.random() * .6, ph: Math.random() * 6, lean: (Math.random() - .5) * .3 });
      grown++;
      if (!auto) progress(false);
      const T = performance.now() / 1000;
      if (T - lastBloom > .35 && Math.random() < .35) { lastBloom = T; const P = [523.25, 587.33, 659.25, 784, 880]; k.tone(P[(Math.random() * 5) | 0] * (z < .4 ? 2 : 1), 1.4, .012); }
    }
    function progress(auto) {
      const f = k.mode === "full" ? Math.max(grown / NEED, steps / STEPS) : grown / NEED;
      k.progress(f);
      if (f > 1 / 3) k.reveal(0);
      if (f > 2 / 3) k.reveal(1);
      if (f >= 1 && !done) { done = true; say(""); k.done(); }
      else if (!done && (k.mode !== "full" || !auto)) say(f > .8 ? "Nearly full. Stay a little longer." : f > .3 ? "Keep holding. Try another spot." : "Keep holding. Watch it come up.");
    }

    // the full version: steps, from the motion sensor; each one grows a flower further along the mown path
    if (k.mode === "full") {
      let base = 9.8, prev = 0, rising = false, lastStep = 0;
      k.sensor.tilt((e) => {
        if (!e.motion || done) return;
        moved = true;
        const m = Math.hypot(e.ax, e.ay, e.az); base = base * .96 + m * .04;
        const T = performance.now() / 1000, v = m - base;
        if (v > 1.6 && v > prev) rising = true;
        else if (rising && v < prev && T - lastStep > .32) {
          rising = false; lastStep = T; steps++;
          const { W, H } = view(), p = pathAt(1 - steps / STEPS, W, H);
          for (let i = 0; i < 2; i++) grow({ x: p.x + (Math.random() - .5) * 30 * (.4 + depth(p.y, H)), y: p.y, held: 0 }, W, H, true);
          k.haptic(6); progress(true);
          say(steps < 10 ? "That's it. Keep walking." : "Slow steps. The path is blooming behind you.");
        }
        prev = v;
      }).then((ok) => { if (!ok) say("No motion sensor here: press and hold the meadow to grow it instead."); });
    }

    // the mown path: a curve from the near edge to the dome far off
    function pathAt(f, W, H) {
      const y = H * (HOR + .02) + f * H * (1 - HOR - .02), x = W * .66 - Math.sin(f * 2.6) * W * .2 * f + (f * f) * W * -.05;
      return { x, y, w: 3 + f * f * W * .16 };
    }

    k.loop((dt, t) => {
      const { W, H } = view();
      if (k.mode === "full" && !moved && !grown && performance.now() / 1000 - began > 4) say("No steps reach the screen here: press and hold the meadow to grow it instead.");
      const srcs = [...touches.values()]; if (keyHeld && cursor) srcs.push(cursor);
      const rate = 6.5 / Math.sqrt(Math.max(1, srcs.length));     // more hands grow more, but the meadow still takes its time
      if (!done) srcs.forEach((s) => { s.held += dt; s.acc = (s.acc || 0) + dt * rate; while (s.acc >= 1) { s.acc -= 1; grow(s, W, H); } });
      // the drone swells as the meadow fills (only heard when sound is on)
      const fill = Math.min(1, k.mode === "full" ? Math.max(grown / NEED, steps / STEPS) : grown / NEED);
      if (grown && t > nextDrone) { nextDrone = t + 2.6; const v = .008 + fill * .03; k.tone(110, 5.5, v); k.tone(164.81, 5.5, v * .7); if (fill > .4) k.tone(220, 5, v * .45); if (fill > .7) k.tone(277.18, 5, v * .3); }
      draw(W, H, t, dt, srcs, fill);
    });

    function bake(W, H) {
      const d = Math.min(2, devicePixelRatio || 1), c = document.createElement("canvas"); c.width = W * d; c.height = H * d;
      const w = c.getContext("2d"); w.scale(d, d);
      // dusk sky
      const sk = w.createLinearGradient(0, 0, 0, H * HOR); sk.addColorStop(0, "#0B1020"); sk.addColorStop(.55, "#1E2134"); sk.addColorStop(1, "#4A3B3A");
      w.fillStyle = sk; w.fillRect(0, 0, W, H * HOR + 2);
      const hz = w.createRadialGradient(W * .3, H * HOR, 4, W * .3, H * HOR, W * .7); hz.addColorStop(0, "rgba(226,170,110,.35)"); hz.addColorStop(1, "rgba(226,170,110,0)");
      w.fillStyle = hz; w.fillRect(0, 0, W, H * HOR + 2);
      let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 40; i++) { w.fillStyle = `rgba(245,240,232,${.2 + rnd() * .5})`; w.fillRect(rnd() * W, rnd() * H * HOR * .6, 1.1, 1.1); }
      // far hills
      w.fillStyle = "#1A1F22"; w.beginPath(); w.moveTo(0, H * HOR);
      for (let x = 0; x <= W; x += 6) w.lineTo(x, H * (HOR - .06) - Math.sin(x / W * 3.1 + .4) * H * .035 - Math.sin(x / W * 9) * H * .008);
      w.lineTo(W, H * HOR + 2); w.lineTo(0, H * HOR + 2); w.closePath(); w.fill();
      // the meadow ground
      const gr = w.createLinearGradient(0, H * HOR, 0, H); gr.addColorStop(0, "#1F2A1C"); gr.addColorStop(.5, "#141E13"); gr.addColorStop(1, "#0B120B");
      w.fillStyle = gr; w.fillRect(0, H * HOR, W, H * (1 - HOR));
      // the mown path
      w.fillStyle = "rgba(120,130,80,.22)"; w.beginPath();
      const L = [], Rr = []; for (let i = 0; i <= 40; i++) { const p = pathAt(i / 40, W, H); L.push([p.x - p.w / 2, p.y]); Rr.push([p.x + p.w / 2, p.y]); }
      L.forEach(([x, y], i) => (i ? w.lineTo(x, y) : w.moveTo(x, y))); Rr.reverse().forEach(([x, y]) => w.lineTo(x, y)); w.closePath(); w.fill();
      // the wild grass, unmown either side: short strokes, bigger as they come near
      for (let i = 0; i < 900; i++) {
        const y = H * HOR + Math.pow(rnd(), .8) * H * (1 - HOR), z = depth(y, H), x = rnd() * W;
        const p = pathAt(z, W, H); if (Math.abs(x - p.x) < p.w * .5) continue;
        const hh = (3 + z * 22) * (.6 + rnd() * .7);
        w.strokeStyle = `rgba(${70 + rnd() * 50},${90 + rnd() * 40},${50 + rnd() * 20},${.25 + z * .35})`; w.lineWidth = .6 + z * 1.2;
        w.beginPath(); w.moveTo(x, y); w.quadraticCurveTo(x + (rnd() - .5) * hh * .4, y - hh * .6, x + (rnd() - .5) * hh * .5, y - hh); w.stroke();
      }
      return c;
    }

    function dome(W, H) {
      const p = pathAt(0, W, H), r = Math.max(9, Math.min(W, H) * .032), x = p.x + W * .015, y = H * HOR - 2;
      const gl = w2(x, y - r * .5, r * 4); g.fillStyle = gl; g.beginPath(); g.arc(x, y - r * .5, r * 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#F2EEE6"; g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.closePath(); g.fill();
      g.strokeStyle = "rgba(120,110,95,.6)"; g.lineWidth = .7; g.beginPath(); g.moveTo(x - r * .7, y - r * .7); g.lineTo(x, y); g.lineTo(x + r * .7, y - r * .7); g.moveTo(x - r, y - r * .1); g.lineTo(x + r, y - r * .1); g.stroke();
      g.fillStyle = "rgba(255,210,140,.95)"; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .14, 0, Math.PI * 2); g.fill();
    }
    function w2(x, y, r) { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, "rgba(255,220,160,.2)"); q.addColorStop(1, "rgba(255,220,160,0)"); return q; }

    function draw(W, H, t, dt, srcs, fill) {
      const key = W + "x" + H; if (key !== bgKey) { bg = bake(W, H); bgKey = key; }
      g.drawImage(bg, 0, 0, W, H);
      dome(W, H);
      // the plants, far ones first
      plants.sort((a, b) => a.y - b.y);
      const wind = k.reduce ? 0 : 1;
      for (const p of plants) {
        p.t = Math.min(1, p.t + dt / 1.6);
        const e = 1 - Math.pow(1 - p.t, 3), sc = (.35 + p.z * 1.25) * Math.max(1, Math.min(1.4, W / 640)), hh = (p.kind === "tall" ? 46 : p.kind === "grass" ? 22 : 32) * p.h * sc * e;
        const sway = wind * Math.sin(t * 1.2 + p.x * .02 + p.ph) * hh * .08 + p.lean * hh;
        const tx = p.x + sway, ty = p.y - hh;
        g.lineCap = "round";
        if (p.kind === "grass") {
          g.strokeStyle = `rgba(150,170,100,${.5 + p.z * .4})`; g.lineWidth = .8 + p.z;
          for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(p.x + i * 2 * sc, p.y); g.quadraticCurveTo(p.x + i * 3 * sc, p.y - hh * .5, tx + i * 5 * sc, ty + Math.abs(i) * hh * .2); g.stroke(); }
          continue;
        }
        g.strokeStyle = `rgba(110,140,80,${.6 + p.z * .35})`; g.lineWidth = .8 + p.z * .9;
        g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(p.x, p.y - hh * .5, tx, ty); g.stroke();
        const bloom = Math.max(0, (p.t - .55) / .45), br = (p.kind === "tall" ? 2.6 : 3.6) * sc * bloom;
        if (br <= .2) continue;
        g.fillStyle = p.col;
        if (p.kind === "cluster") { for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(tx + Math.cos(i * 1.26) * br, ty + Math.sin(i * 1.26) * br * .6, br * .55, 0, Math.PI * 2); g.fill(); } }
        else if (p.kind === "tall") { for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(tx, ty + i * br * 1.4, br * (1 - i * .15), br * .7, 0, 0, Math.PI * 2); g.fill(); } }
        else {
          for (let i = 0; i < 5; i++) { const a = i * 1.2566 + p.ph; g.beginPath(); g.ellipse(tx + Math.cos(a) * br, ty + Math.sin(a) * br * .7, br * .8, br * .45, a, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = "#D9A441"; g.beginPath(); g.arc(tx, ty, br * .45, 0, Math.PI * 2); g.fill();
        }
      }
      // fireflies come out as it fills
      if (!k.reduce) {
        while (flies.length < Math.floor(fill * 14)) flies.push({ x: Math.random() * W, y: H * (HOR + .1 + Math.random() * .45), p: Math.random() * 6 });
        flies.forEach((f) => { f.x += Math.sin(t * .5 + f.p) * 8 * dt; f.y += Math.cos(t * .4 + f.p * 2) * 5 * dt; const a = Math.max(0, Math.sin(t * 1.6 + f.p)); const q = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, 7); q.addColorStop(0, `rgba(240,230,150,${a * .8})`); q.addColorStop(1, "rgba(240,230,150,0)"); g.fillStyle = q; g.beginPath(); g.arc(f.x, f.y, 7, 0, Math.PI * 2); g.fill(); });
      }
      // a soft light under each hand that's holding, and the key cursor
      srcs.forEach((s) => { const r = 26 + Math.min(1, s.held / 3) * 30; const q = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, r); q.addColorStop(0, "rgba(245,240,232,.16)"); q.addColorStop(1, "rgba(245,240,232,0)"); g.fillStyle = q; g.beginPath(); g.arc(s.x, s.y, r, 0, Math.PI * 2); g.fill(); });
      if (cursor && !done) { g.strokeStyle = keyHeld ? "#E2C48A" : "rgba(226,196,138,.7)"; g.lineWidth = 1.8; g.beginPath(); g.arc(cursor.x, cursor.y, 14, 0, Math.PI * 2); g.stroke(); }
    }
  }
});
