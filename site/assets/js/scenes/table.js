/* The table: knock, and the table knocks back.
   Preview: tap the tabletop a few times (or press Enter / Space), then wait; the table plays your rhythm back on rising tones.
   Full, at the real table: knock on the wood itself; the microphone hears each knock (sharp jumps above the room's level).
   After padakarshini "The echo": call and response, three times. */
Scene.register("table", {
  title: "Knock on the table",
  line: "Knock a little rhythm on the table, then wait. The table knows it.",
  full: true,
  voiceAt: "bottom",
  fullEnd: "The table knows your knock now.",
  mount(k) {
    const { g } = k.canvas();
    const scene = k.stage.closest(".scene");
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const now = () => performance.now() / 1000;
    const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
    const ROUNDS = 3, MAXTAPS = 9, WAIT = 1.2;
    let fresh = false, state = "call", taps = [], lastTap = 0, ans = null, rounds = 0, restUntil = 0, muteUntil = 0, done = false, lastSay = "";
    const rings = [], marks = [], steam = [];
    let wood = null, woodKey = "";
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    const ask = () => say(k.mode === "full" ? "Knock on the table a few times, any rhythm. Then wait, and listen." : "Tap the table a few times, any rhythm (or press Enter). Then wait, and listen.");
    ask();

    // where the rhythm is drawn: a line of light across the middle of the table, spaced by time
    const lineY = (H) => H * 0.5;
    const markX = (i, W) => {
      const t0 = taps[0] || 0, span = Math.max(0.001, (taps[taps.length - 1] || 0) - t0);
      const a = W * 0.2, b = W * 0.8;
      return taps.length < 2 ? W / 2 : a + ((taps[i] - t0) / span) * (b - a);
    };

    function knock(x, y) {
      const t = now();
      if (done || state !== "call" || t < restUntil) return;
      if (fresh) { taps = []; marks.length = 0; fresh = false; }
      if (taps.length >= MAXTAPS) return;
      taps.push(t); lastTap = t;
      rings.push({ x, y, t: 0, s: 1, warm: false });
      k.noise(0.09, 0.14, 180, "lowpass"); k.tone(72, 0.28, 0.07); k.haptic(10);
      say(taps.length === 1 ? "Keep going, or stop and listen." : "Now wait. Listen.");
    }

    // pointer and keys: every tap is a knock
    k.tap(({ x, y, key }) => { const { W, H } = view(); key ? knock(W / 2 + (Math.random() - .5) * W * .3, lineY(H) + (Math.random() - .5) * H * .2) : knock(x, y); });
    scene.addEventListener("keydown", (e) => { if (e.key === " " && document.activeElement === scene) { e.preventDefault(); if (!e.repeat) { const { W, H } = view(); knock(W / 2 + (Math.random() - .5) * W * .3, lineY(H) + (Math.random() - .5) * H * .2); } } });

    // the real table: a knock is a sharp jump above the room's running level
    if (k.mode === "full") {
      let avg = 0.01, last = 0;
      k.sensor.mic(({ level }) => {
        const t = now();
        if (level > avg * 3 && level > 0.03 && t - last > 0.13 && t > muteUntil) { last = t; const { W, H } = view(); knock(W / 2 + (Math.random() - .5) * W * .4, lineY(H) + (Math.random() - .5) * H * .2); }
        avg = avg * 0.95 + Math.min(level, 0.2) * 0.05;
      }).then((ok) => { if (!ok) say("No microphone here: tap the table on the screen instead."); });
    }

    function answer() {
      const gaps = taps.map((x, i) => (i ? Math.max(0.12, Math.min(1.1, x - taps[i - 1])) : 0));
      let at = now() + 0.5; const times = gaps.map((d) => (at += d));
      ans = { times, i: 0, base: rounds * 2 };
      state = "answer"; say("The table answers.");
      muteUntil = times[times.length - 1] + 0.6;
    }

    k.loop((dt, t) => {
      const { W, H } = view(), T = now();
      if (!done) {
        if (state === "call" && taps.length && !fresh && (T - lastTap > WAIT || (taps.length >= MAXTAPS && T - lastTap > 0.5))) {
          if (taps.length < 2) { taps = []; say("A few knocks in a row, then wait."); }
          else answer();
        }
        if (state === "answer") {
          while (ans.i < ans.times.length && T >= ans.times[ans.i]) {
            const i = ans.i, f = 110 * Math.pow(2, PENTA[Math.min(PENTA.length - 1, i + ans.base)] / 12);
            k.noise(0.08, 0.1, 180, "lowpass"); k.tone(f, 0.7, 0.06, "triangle"); k.tone(f * 2, 0.4, 0.015);
            marks[i] = 1; rings.push({ x: markX(i, W), y: lineY(H), t: 0, s: 0.8, warm: true }); ans.i++;
          }
          if (ans.i >= ans.times.length && T > ans.times[ans.times.length - 1] + 1.4) {
            rounds++; fresh = true; state = "call"; restUntil = T + 0.3;
            if (rounds === 1) { k.reveal(0); say("Again. Try a different rhythm."); }
            else if (rounds === 2) { k.reveal(1); say("Once more. Any rhythm you like."); }
            else { done = true; say(""); k.done(); }
          }
        }
        const part = state === "answer" ? 0.5 + 0.5 * (ans.i / ans.times.length) : fresh ? 0 : Math.min(0.45, taps.length * 0.1);
        k.progress((rounds + part) / ROUNDS);
      }
      draw(W, H, t, dt);
    });

    // the tabletop, baked once per size: boards, grain, a few knots, lamplight from above
    function bake(W, H) {
      const d = Math.min(2, devicePixelRatio || 1), c = document.createElement("canvas"); c.width = W * d; c.height = H * d;
      const w = c.getContext("2d"); w.scale(d, d);
      let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const boards = W / H < 1 ? 5 : 4, bh = H / boards;
      for (let b = 0; b < boards; b++) {
        const y0 = b * bh, tint = [[92, 60, 36], [84, 54, 32], [98, 64, 38], [88, 57, 34], [80, 52, 31]][b % 5];
        const bg = w.createLinearGradient(0, y0, 0, y0 + bh); bg.addColorStop(0, `rgb(${tint.map((v) => v + 8)})`); bg.addColorStop(1, `rgb(${tint.map((v) => v - 6)})`);
        w.fillStyle = bg; w.fillRect(0, y0, W, bh);
        const knots = [{ x: rnd() * W, y: y0 + bh * (.3 + rnd() * .4), r: 6 + rnd() * 10 }];
        for (let l = 0; l < 22; l++) {
          const yl = y0 + (l + rnd() * .6) * bh / 22, amp = 1 + rnd() * 3, fr = .004 + rnd() * .006, ph = rnd() * 6;
          w.strokeStyle = `rgba(${rnd() < .5 ? "40,24,14" : "130,92,58"},${.12 + rnd() * .2})`; w.lineWidth = .6 + rnd() * 1.1;
          w.beginPath();
          for (let x = 0; x <= W; x += 8) {
            let y = yl + Math.sin(x * fr + ph) * amp;
            for (const kn of knots) { const dx = x - kn.x, dy = y - kn.y, dd = Math.hypot(dx, dy * 1.6); if (dd < kn.r * 4) y += (dy >= 0 ? 1 : -1) * (kn.r * 4 - dd) * .35; }
            x ? w.lineTo(x, y) : w.moveTo(x, y);
          }
          w.stroke();
        }
        for (const kn of knots) { for (let r = 0; r < 4; r++) { w.strokeStyle = `rgba(36,20,12,${.5 - r * .1})`; w.lineWidth = 1.2; w.beginPath(); w.ellipse(kn.x, kn.y, kn.r * (1 + r * .5), kn.r * (.55 + r * .3), 0, 0, Math.PI * 2); w.stroke(); } }
        w.fillStyle = "rgba(14,8,4,.75)"; w.fillRect(0, y0 + bh - 1.5, W, 2.5);
      }
      const lamp = w.createRadialGradient(W * .5, H * .42, 10, W * .5, H * .45, Math.max(W, H) * .75);
      lamp.addColorStop(0, "rgba(255,200,130,.16)"); lamp.addColorStop(.5, "rgba(7,11,9,.2)"); lamp.addColorStop(1, "rgba(7,11,9,.86)");
      w.fillStyle = lamp; w.fillRect(0, 0, W, H);
      return c;
    }

    function plate(x, y, r) {
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(x + r * .08, y + r * .12, r, r, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#E9E2D4"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#DCD3C1"; g.beginPath(); g.arc(x, y, r * .68, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(201,169,110,.55)"; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r * .9, 0, Math.PI * 2); g.stroke();
    }

    function draw(W, H, t, dt) {
      const key = W + "x" + H; if (key !== woodKey) { wood = bake(W, H); woodKey = key; }
      g.drawImage(wood, 0, 0, W, H);
      const u = Math.min(W, H), port = W / H < 1;
      // two plates, a bread crust on one
      const p1 = port ? { x: W * .2, y: H * .15 } : { x: W * .14, y: H * .22 }, p2 = port ? { x: W * .44, y: H * .1 } : { x: W * .31, y: H * .13 };
      plate(p1.x, p1.y, u * .11); plate(p2.x, p2.y, u * .085);
      g.fillStyle = "#B88A52"; g.beginPath(); g.ellipse(p1.x + u * .02, p1.y - u * .01, u * .04, u * .022, .5, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#E7C994"; g.beginPath(); g.ellipse(p1.x + u * .02, p1.y - u * .012, u * .03, u * .014, .5, 0, Math.PI * 2); g.fill();
      // the mug, from above, and its steam
      const m = port ? { x: W * .8, y: H * .16 } : { x: W * .82, y: H * .24 }, mr = u * .07;
      g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.arc(m.x + mr * .12, m.y + mr * .18, mr * 1.05, 0, Math.PI * 2); g.fill();
      g.lineCap = "round"; g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = mr * .34; g.beginPath(); g.moveTo(m.x + mr * .9, m.y + mr * .2); g.lineTo(m.x + mr * 1.5, m.y + mr * .2); g.stroke();
      g.strokeStyle = "#D8D0C0"; g.lineWidth = mr * .3; g.beginPath(); g.moveTo(m.x + mr * .9, m.y); g.lineTo(m.x + mr * 1.45, m.y); g.stroke();
      g.fillStyle = "#EDE6D8"; g.beginPath(); g.arc(m.x, m.y, mr, 0, Math.PI * 2); g.fill();
      const cof = g.createRadialGradient(m.x - mr * .2, m.y - mr * .2, 1, m.x, m.y, mr * .82); cof.addColorStop(0, "#5A3820"); cof.addColorStop(1, "#24140A");
      g.fillStyle = cof; g.beginPath(); g.arc(m.x, m.y, mr * .8, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,230,190,.18)"; g.beginPath(); g.ellipse(m.x - mr * .25, m.y - mr * .3, mr * .25, mr * .1, -.6, 0, Math.PI * 2); g.fill();
      // steam: soft wisps lifting off the cup and drifting
      if (!k.reduce) {
        if (Math.random() < dt * 4 && steam.length < 12) steam.push({ a: -1.9 + (Math.random() - .5) * .9, t: 0, life: 2.6 + Math.random() * 1.6 });
        for (let i = steam.length - 1; i >= 0; i--) {
          const s = steam[i]; s.t += dt; if (s.t > s.life) { steam.splice(i, 1); continue; }
          const f = s.t / s.life, d = mr * (.2 + f * 1.6), x = m.x + Math.cos(s.a + Math.sin(t + i) * .3) * d, y = m.y + Math.sin(s.a) * d, r = mr * (.35 + f * .7);
          const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(245,240,232,${Math.sin(f * Math.PI) * .12})`); q.addColorStop(1, "rgba(245,240,232,0)");
          g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
      }
      // rings in the wood: wider along the grain
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt; const life = r.warm ? 1.8 : 1.4; if (r.t > life) { rings.splice(i, 1); continue; }
        const f = r.t / life;
        const glow = g.createRadialGradient(r.x, r.y, 0, r.x, r.y, u * .12 * r.s);
        glow.addColorStop(0, `rgba(255,${r.warm ? 190 : 220},${r.warm ? 110 : 170},${(1 - f) * (r.warm ? .35 : .22)})`); glow.addColorStop(1, "rgba(255,200,130,0)");
        g.fillStyle = glow; g.beginPath(); g.arc(r.x, r.y, u * .12 * r.s, 0, Math.PI * 2); g.fill();
        const rings_n = k.reduce ? 1 : 3;
        for (let j = 0; j < rings_n; j++) {
          const rr = (8 + f * u * .22 - j * 12) * r.s; if (rr <= 2) continue;
          g.strokeStyle = r.warm ? `rgba(226,196,138,${(1 - f) * .55})` : `rgba(245,225,190,${(1 - f) * .4})`; g.lineWidth = 1.4;
          g.beginPath(); g.ellipse(r.x, r.y, rr * 1.35, rr * .8, 0, 0, Math.PI * 2); g.stroke();
        }
      }
      // the rhythm, drawn as time across the table: your knocks faint, the table's answer warm
      const y = lineY(H);
      if (taps.length) {
        g.strokeStyle = "rgba(245,240,232,.08)"; g.lineWidth = 1; g.beginPath(); g.moveTo(W * .17, y); g.lineTo(W * .83, y); g.stroke();
        taps.forEach((_, i) => {
          const x = markX(i, W), lit = marks[i];
          if (lit) {
            const hg = g.createRadialGradient(x, y, 0, x, y, u * .05); hg.addColorStop(0, "rgba(255,205,130,.55)"); hg.addColorStop(1, "rgba(255,205,130,0)");
            g.fillStyle = hg; g.beginPath(); g.arc(x, y, u * .05, 0, Math.PI * 2); g.fill();
            g.fillStyle = "#E2C48A"; g.beginPath(); g.arc(x, y, 5.5, 0, Math.PI * 2); g.fill();
            g.fillStyle = "#FFF4DC"; g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
          } else {
            g.strokeStyle = "rgba(245,240,232,.55)"; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.stroke();
          }
        });
      }
    }
  }
});
