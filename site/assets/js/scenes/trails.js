/* Trails, pond and stream: call the rain.
   Preview: press and hold on the pond to call rain where you touch (several fingers, more rain); swipe sideways for wind.
   Keyboard: hold Space for rain at a cursor the arrows move; Shift with left/right brings the wind.
   After about thirty seconds of rain the clouds part and the pond goes glassy and still.
   After padakarshini "The rain". Full (later): listening for the real stream with the microphone. */
Scene.register("trails", {
  title: "Call the rain",
  line: "Press on the pond to call the rain. Swipe sideways for wind.",
  full: false,
  voiceAt: "top",
  mount(k) {
    const { g } = k.canvas();
    const stage = k.stage, scene = stage.closest(".scene");
    const view = () => ({ W: stage.clientWidth, H: stage.clientHeight });
    const NEED = 30;                        // seconds of rain
    let rained = 0, wind = 0, cloud = 0.62, clear = 0, done = false, windUsed = false, lastSay = "", endT = 0;
    let cur = null, keyRain = false, toneBudget = 0, hissT = 0, gustT = 0, spawnAcc = 0;
    const touches = new Map();              // pointerId -> { x, y }
    const drops = [], rings = [], splashes = [];
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Press and hold on the pond to call the rain (or hold Space; the arrows move it).");

    // a fixed shoreline: pines on the far bank, reeds on the near one, stones along the stream
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pines = Array.from({ length: 46 }, (_, i) => ({ x: i / 45 + (rnd() - .5) * .02, h: .05 + rnd() * .08, w: .016 + rnd() * .012 }));
    const reeds = Array.from({ length: 22 }, (_, i) => ({ side: i < 15 ? 0 : 1, x: rnd(), h: .17 + rnd() * .15, ph: rnd() * 6, head: rnd() < .45 }));
    const stones = Array.from({ length: 9 }, () => ({ u: rnd(), r: .5 + rnd() * .7, off: rnd() }));
    const clouds = Array.from({ length: 7 }, (_, i) => ({ x: i / 6, y: .05 + rnd() * .16, s: .7 + rnd() * .6, drift: (rnd() - .5) * .006 }));
    const sky = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), b: rnd() }));

    const geo = (W, H) => { const hy = H * .44; return { hy, depth: (y) => Math.max(0, Math.min(1, (y - hy) / (H - hy))) }; };
    const onPond = (x, y) => { const { W, H } = view(), { hy } = geo(W, H); return { x: Math.max(4, Math.min(W - 4, x)), y: Math.max(hy + (H - hy) * .08, Math.min(H * .97, y)) }; };
    const local = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    // pointers: every finger calls its own rain
    stage.style.touchAction = "none";
    stage.addEventListener("pointerdown", (e) => {
      if (done || e.target.closest("button")) return;
      touches.set(e.pointerId, local(e)); try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      k.haptic(8);
    });
    stage.addEventListener("pointermove", (e) => {
      const p = touches.get(e.pointerId); if (!p) return;
      const q = local(e), dx = q.x - p.x; touches.set(e.pointerId, q);
      if (Math.abs(dx) > 1.5) gust(dx * .02, Math.abs(dx));
    });
    const lift = (e) => touches.delete(e.pointerId);
    stage.addEventListener("pointerup", lift); stage.addEventListener("pointercancel", lift); stage.addEventListener("lostpointercapture", lift);

    // keyboard: Space holds the rain at a cursor; arrows move it; Shift with left/right is the wind
    const centre = () => { const { W, H } = view(), { hy } = geo(W, H); return { x: W / 2, y: hy + (H - hy) * .45 }; };
    scene.addEventListener("keydown", (e) => {
      if (document.activeElement !== scene || done) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!cur) cur = centre(); keyRain = true; return; }
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
      e.preventDefault();
      if (e.shiftKey && d[0]) { gust(d[0] * .9, 34); return; }
      if (!cur) cur = centre(); cur = onPond(cur.x + d[0] * 18, cur.y + d[1] * 12);
    });
    const keyUp = (e) => { if (e.key === " " || e.key === "Enter") keyRain = false; };
    addEventListener("keyup", keyUp);

    function gust(dw, strength) {
      wind = Math.max(-2.6, Math.min(2.6, wind + dw));
      if (strength > 16) windUsed = true;
      if (gustT <= 0 && strength > 16) { gustT = .7; k.noise(1.1, .045 * Math.min(1, strength / 40), 650, "bandpass"); }
    }

    function sources() { const s = [...touches.values()].map((p) => onPond(p.x, p.y)); if (keyRain && cur) s.push(cur); return s; }

    function spawn(src, H, hy) {
      const d = (src.y - hy) / (H - hy), sx = (34 + 70 * d) * Math.min(1.4, Math.max(.8, stage.clientWidth / 700));
      const tx = src.x + (Math.random() - .5) * 2 * sx, ty = Math.max(hy + 3, src.y + (Math.random() - .5) * 2 * sx * (.18 + .3 * d));
      if (k.reduce) { land(tx, ty, H, hy); return; }
      drops.push({ tx, ty, y: ty - H * (.55 + Math.random() * .3), v: H * (1.5 + Math.random() * .4) });
    }
    function land(x, y, H, hy) {
      const d = (y - hy) / (H - hy);
      rings.push({ x, y, t: 0, s: (.55 + d * .9) * Math.min(1.5, Math.max(.9, stage.clientWidth / 640)), life: 2.2 + Math.random() * .9 });
      if (!k.reduce) for (let i = 0; i < 2; i++) splashes.push({ x, y, vx: (Math.random() - .5) * 40, vy: -30 - Math.random() * 40, t: 0 });
      if (toneBudget > 0) { toneBudget -= 1; k.tone(1900 + Math.random() * 1500, .09 + Math.random() * .06, .008 + Math.random() * .006); }
    }

    k.loop((dt, t) => {
      dt = Math.max(0, dt);                 // the first frame can arrive a hair before the clock starts
      const { W, H } = view(), { hy } = geo(W, H);
      const src = done ? [] : sources(), raining = src.length > 0;
      toneBudget = Math.min(3, toneBudget + dt * 9); gustT -= dt; hissT -= dt;
      wind *= Math.exp(-.55 * dt);
      if (raining) {
        spawnAcc += dt * Math.min(40, (k.reduce ? 8 : 20) * src.length);
        while (spawnAcc >= 1) { spawnAcc -= 1; spawn(src[Math.floor(Math.random() * src.length)], H, hy); }
        if (hissT <= 0) { hissT = .55; k.noise(.7, .018, 5200, "highpass"); }
        rained += dt * (src.length > 1 ? 1.3 : 1);
      }
      if (!done) {
        cloud += ((raining ? 1 : .66) - cloud) * dt * .5;
        k.progress(rained / NEED);
        if (rained > NEED / 3) k.reveal(0);
        if (rained > NEED * 2 / 3) k.reveal(1);
        if (raining) say(!windUsed ? "Let it fall. Swipe sideways for wind (or Shift and the arrows)." : rained > NEED * .7 ? "The clouds are thinning. A little more." : "Let it fall wherever you like.");
        else if (rained > 0) say("Press again when you’re ready. The pond is waiting.");
        if (rained >= NEED) { done = true; touches.clear(); keyRain = false; say("The clouds are parting."); k.tone(392, 3, .04); k.tone(587, 3.4, .03); k.done(); }
      } else {
        endT += dt; cloud = Math.max(0, cloud - dt * .3); clear = Math.min(1, clear + dt * .28);
        if (endT > 4) say("");
      }
      draw(W, H, hy, t, dt, src);
    });

    function draw(W, H, hy, t, dt, src) {
      const D = (y) => Math.max(0, Math.min(1, (y - hy) / (H - hy)));
      // sky
      const sg = g.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, `rgb(${7 + clear * 3},${11 + clear * 6},${13 + clear * 16})`); sg.addColorStop(1, `rgb(${17 + clear * 6},${25 + clear * 8},${24 + clear * 12})`);
      g.fillStyle = sg; g.fillRect(0, 0, W, hy + 2);
      // stars and the moon come through as the clouds go
      if (clear > 0) {
        sky.forEach((s) => { const a = clear * (.25 + s.b * .6) * (.8 + .2 * Math.sin(t * 1.3 + s.b * 30)); g.fillStyle = `rgba(245,240,232,${a})`; g.fillRect(s.x * W, s.y * hy * .92, s.b > .8 ? 1.6 : 1, s.b > .8 ? 1.6 : 1); });
      }
      const mx = W * .7, my = hy * .55, mr = Math.min(W, H) * .035;
      if (clear > 0) {
        const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 7); mg.addColorStop(0, `rgba(245,240,232,${.28 * clear})`); mg.addColorStop(1, "rgba(245,240,232,0)");
        g.fillStyle = mg; g.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14);
        g.fillStyle = `rgba(248,244,234,${clear})`; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
      }
      // clouds: heavier while it rains, drawn apart when it ends
      clouds.forEach((c, i) => {
        if (!k.reduce) c.x += (c.drift + wind * .004) * dt;
        const spread = (k.reduce ? 0 : clear * (i % 2 ? 1 : -1) * .5), cx = (((c.x + spread) % 1.4 + 1.4) % 1.4 - .2) * W, cy = c.y * H, s = c.s * Math.max(W, H) * .12;
        const a = cloud * (.55 + .3 * c.s) * (1 - (k.reduce ? clear : 0));
        if (a < .01) return;
        g.fillStyle = `rgba(${26 + i},${33 + i},${32 + i},${a})`;
        for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(cx + (j - 1.5) * s * .55, cy + Math.sin(j * 2 + i) * s * .12, s * (.55 + (j % 2) * .2), s * .32, 0, 0, Math.PI * 2); g.fill(); }
      });
      // far hill and the pines on the far bank
      g.fillStyle = "#0D1513"; g.beginPath(); g.moveTo(0, hy); g.quadraticCurveTo(W * .3, hy - H * .1, W * .55, hy - H * .05); g.quadraticCurveTo(W * .8, hy - H * .0, W, hy - H * .08); g.lineTo(W, hy); g.closePath(); g.fill();
      const tree = (dir) => { pines.forEach((p) => { const x = p.x * W, h = p.h * H * (W < H ? .8 : 1), w = p.w * Math.max(W, 500);
        g.beginPath(); g.moveTo(x - w, hy); g.lineTo(x, hy - dir * h); g.lineTo(x + w, hy); g.closePath(); g.fill(); }); };
      g.fillStyle = "#070D0B"; tree(1);
      // the pond
      const pg = g.createLinearGradient(0, hy, 0, H);
      pg.addColorStop(0, `rgb(${22 + clear * 8},${33 + clear * 10},${33 + clear * 16})`); pg.addColorStop(.35, "#0D1918"); pg.addColorStop(1, "#060C0B");
      g.fillStyle = pg; g.fillRect(0, hy, W, H - hy);
      // the far bank, upside down in the water
      g.save(); g.globalAlpha = .55; g.fillStyle = "#08100E"; tree(-.7); g.restore();
      // the moon on the water: broken by the rain, a clean line once it is still
      if (clear > 0) {
        const busy = Math.min(1, rings.length / 30);
        for (let i = 0; i < 26; i++) { const y = hy + 4 + i * (H - hy) * .028, w = mr * (1.4 - i * .02) * (1 + busy * Math.sin(t * 3 + i) * .6);
          g.fillStyle = `rgba(245,240,232,${clear * (.32 - i * .011)})`; g.fillRect(mx - w + (k.reduce ? 0 : Math.sin(t * 1.2 + i) * busy * 6), y, w * 2, Math.max(1, (H - hy) * .012)); }
      }
      // the stream: it comes out of the trees on the right and spills into the pond over a lip of stones
      const sy = hy + (H - hy) * .07, mouth = W * (W < H ? .66 : .74), sw = (H - hy) * .045;
      const sg2 = g.createLinearGradient(W, 0, mouth, 0); sg2.addColorStop(0, "rgba(70,96,96,.10)"); sg2.addColorStop(1, "rgba(90,120,122,.32)");
      g.fillStyle = sg2; g.beginPath(); g.moveTo(W + 2, sy - sw * .9); g.bezierCurveTo(W * .95, sy - sw * .5, mouth + (W - mouth) * .4, sy - sw * .2, mouth, sy + sw * .3);
      g.bezierCurveTo(mouth + (W - mouth) * .35, sy + sw * 1.4, W * .95, sy + sw * 1.1, W + 2, sy + sw * .7); g.closePath(); g.fill();
      for (let i = 0; i < 12; i++) { const u = ((t * .16 + i / 12) % 1), x = W - u * (W - mouth), y = sy + sw * (-.3 + .65 * u) + Math.sin(i * 2.3) * sw * .35;
        g.fillStyle = `rgba(214,232,236,${.32 * Math.sin(u * Math.PI)})`; g.fillRect(x - 8, y, 7 + (1 - u) * 7, 1); }
      // where it meets the pond: a soft lip of foam that keeps moving
      for (let i = 0; i < 5; i++) { const a = .1 + .08 * Math.sin(t * 2 + i); g.strokeStyle = `rgba(214,232,236,${a})`; g.lineWidth = 1;
        g.beginPath(); g.ellipse(mouth - i * 3, sy + sw * .45 + i * 2, sw * (1.2 + i * .5), sw * (.25 + i * .1), 0, Math.PI * .55, Math.PI * 1.45); g.stroke(); }
      stones.forEach((s) => { const x = mouth + s.u * (W - mouth), side = s.off > .5 ? 1 : -1, y = sy + side * sw * (.9 - s.u * .2) + sw * (.3 - s.u * .5), r = s.r * Math.min(W, H) * .012;
        g.fillStyle = "#18211F"; g.beginPath(); g.ellipse(x, y, r * 1.6, r * .7, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(200,220,220,.06)"; g.beginPath(); g.ellipse(x - r * .3, y - r * .25, r * .8, r * .25, 0, 0, Math.PI * 2); g.fill(); });
      // wind on the water: fine lines that run with it
      const aw = Math.min(1, Math.abs(wind) / 1.6);
      if (aw > .05 && !k.reduce) { g.strokeStyle = `rgba(190,215,220,${aw * .14})`; g.lineWidth = 1;
        for (let i = 0; i < 18; i++) { const y = hy + ((i * 37) % 100) / 100 * (H - hy), d = D(y), x = (((i * 131 + t * wind * 60 * (1 + d)) % W) + W) % W, l = 20 + d * 60;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); } }
      // rings: ellipses flattened by the angle we see the pond from
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt; if (r.t > r.life) { rings.splice(i, 1); continue; }
        const d = D(r.y), sq = .16 + .3 * d, f = r.t / r.life;
        for (let j = 0; j < 2; j++) { const rr = (r.t * 34 + j * 9) * r.s; if (rr <= 0) continue; const a = (1 - f) * (.42 - j * .16) * Math.min(1, r.t * 8);
          g.strokeStyle = `rgba(214,232,236,${a})`; g.lineWidth = .8 + d * .7; g.beginPath(); g.ellipse(r.x, r.y, rr, rr * sq, 0, 0, Math.PI * 2); g.stroke(); }
      }
      if (rings.length > 130) rings.splice(0, rings.length - 130);
      // falling drops, slanted by the wind
      g.strokeStyle = "rgba(228,238,240,.62)"; g.lineWidth = 1.1; g.beginPath();
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i]; p.y += p.v * dt;
        if (p.y >= p.ty) { drops.splice(i, 1); land(p.tx, p.ty, H, hy); continue; }
        const rem = p.ty - p.y, x = p.tx - wind * rem * .3, l = 14 + D(p.ty) * 16;
        g.moveTo(x, p.y); g.lineTo(x - wind * l * .3, p.y - l);
      }
      g.stroke();
      if (drops.length > 140) drops.splice(0, drops.length - 140);
      for (let i = splashes.length - 1; i >= 0; i--) { const s = splashes[i]; s.t += dt; if (s.t > .35) { splashes.splice(i, 1); continue; } s.vy += 300 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        g.fillStyle = `rgba(225,235,238,${.5 * (1 - s.t / .35)})`; g.fillRect(s.x, s.y, 1.4, 1.4); }
      if (splashes.length > 80) splashes.splice(0, splashes.length - 80);
      // where the rain is called: a soft glow under each finger, and the keyboard's cursor
      src.forEach((p) => { const d = D(p.y), r = 30 + d * 30, gl = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gl.addColorStop(0, "rgba(226,196,138,.14)"); gl.addColorStop(1, "rgba(226,196,138,0)"); g.fillStyle = gl; g.beginPath(); g.ellipse(p.x, p.y, r, r * (.3 + d * .3), 0, 0, Math.PI * 2); g.fill(); });
      if (cur && !done && !keyRain) { const d = D(cur.y); g.strokeStyle = "rgba(226,196,138,.45)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cur.x, cur.y, 14 + d * 10, (14 + d * 10) * (.2 + d * .3), 0, 0, Math.PI * 2); g.stroke(); }
      // the near bank and its reeds, leaning with the wind
      g.fillStyle = "#050907";
      g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * .86); g.quadraticCurveTo(W * .16, H * .87, W * .3, H * .97); g.lineTo(W * .32, H); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(W, H); g.lineTo(W, H * .9); g.quadraticCurveTo(W * .9, H * .92, W * .84, H); g.closePath(); g.fill();
      g.lineCap = "round";
      reeds.forEach((r) => {
        const bx = r.side ? W - r.x * W * .14 : r.x * W * .28, by = r.side ? H * .95 : H * (.88 + r.x * .08), h = r.h * H;
        const lean = (k.reduce ? 0 : Math.sin(t * .9 + r.ph) * .05) + wind * .09, tx = bx + lean * h, ty = by - h;
        g.strokeStyle = "#101A12"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + lean * h * .2, by - h * .6, tx, ty); g.stroke();
        if (r.head) { g.strokeStyle = "#2A1E14"; g.lineWidth = 5; g.beginPath(); g.moveTo(tx - lean * 4, ty + 16); g.lineTo(tx - lean * 1, ty + 4); g.stroke(); }
      });
    }
  }
});
