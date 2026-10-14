/* The fire circle: pass the ember around the ring of log seats.
   Preview, for 2 to 6 people around one screen: whoever has the ember presses and holds (or holds Space) while a line of sparks rises;
   then lets go and taps (or presses Enter) to pass it to the next seat. Each pass feeds the fire. Twice around the circle completes it.
   Full (later): a real phone passed hand to hand. */
Scene.register("fire-circle", {
  title: "Pass the ember",
  line: "Sit around the fire together. Keep the ember glowing, then pass it on.",
  full: false,
  voiceAt: "top",
  mount(k) {
    const { g } = k.canvas();
    const scene = k.stage.closest(".scene");
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const now = () => performance.now() / 1000;
    let n = 0, at = 0, passes = 0, total = 0, charge = 0, holding = false, ready = false, readyAt = 0, downAt = 0, move = null, fire = 0.12, done = false, lastSay = "", NEED = 4;
    const parts = [], stars = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random() * .5, s: .4 + Math.random(), p: Math.random() * 6 }));
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Choose how many of you are around the fire.");

    // how many are playing: a few plain buttons on the stage
    const pick = document.createElement("div");
    pick.style.cssText = "position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:18px;z-index:2;text-align:center;padding:20px;background:radial-gradient(ellipse at center,rgba(7,11,9,.62),rgba(7,11,9,0) 62%)";
    pick.innerHTML = `<p style="margin:0;font:italic 400 clamp(1.05rem,2.6vw,1.3rem)/1.4 Lora,serif;color:#F5F0E8">How many of you are around the fire?</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${[2, 3, 4, 5, 6].map((v) => `<button type="button" data-n="${v}" style="width:52px;height:52px;border-radius:50%;border:1px solid rgba(226,196,138,.55);background:rgba(20,16,12,.7);color:#F5F0E8;font:500 1.15rem/1 'DM Sans',sans-serif;cursor:pointer">${v}</button>`).join("")}</div>`;
    k.stage.append(pick);
    const btns = [...pick.querySelectorAll("button")];
    btns.forEach((b, i) => {
      b.addEventListener("focus", () => { b.style.boxShadow = "0 0 0 3px #C9A96E"; }); b.addEventListener("blur", () => { b.style.boxShadow = "none"; });
      b.addEventListener("keydown", (e) => { const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key]; if (d) { e.preventDefault(); btns[(i + d + btns.length) % btns.length].focus(); } });
      b.addEventListener("click", (e) => { e.stopPropagation(); start(+b.dataset.n); });
    });
    if (matchMedia("(hover: hover)").matches) setTimeout(() => btns[0].focus({ preventScroll: true }), 50);   // ready for the keys; no ring on touch screens

    function start(v) {
      n = v; total = n * 2; NEED = Math.max(3, 4.6 - .27 * n); at = 0; pick.remove(); scene.focus({ preventScroll: true });
      k.tone(196, 1.2, .04); say("Whoever has the ember: press and hold (or hold Space) to keep it glowing.");
    }

    // holding keeps the ember glowing; a tap after letting go passes it on
    k.hold((on) => { holding = on; if (on) { downAt = now(); if (n && !move && !done && !ready) k.noise(.4, .03, 600, "lowpass"); } });
    function pass() {
      if (!n || !ready || move || done) return;
      ready = false; charge = 0; move = { from: at, to: (at + 1) % n, f: 0 };
      k.haptic(20); k.noise(.25, .07, 2400, "highpass"); k.tone(130.8 * Math.pow(2, (passes % 5) * 2 / 12), 1.4, .05);
    }
    scene.addEventListener("pointerup", (e) => { if (e.target.closest("button")) return; if (ready && downAt >= readyAt) pass(); });
    scene.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.repeat && document.activeElement === scene) { e.preventDefault(); if (ready) pass(); } });

    // the ring, in perspective
    const ring = (W, H) => { const rx = Math.min(W * (W < H ? .4 : .3), H * .55), ry = rx * .38; return { cx: W / 2, cy: H * .66, rx, ry }; };
    const seatAng = (i) => Math.PI / 2 + (i / n) * Math.PI * 2;    // seat 0 at the front, then around
    const seatPos = (a, R) => ({ x: R.cx + Math.cos(a) * R.rx, y: R.cy + Math.sin(a) * R.ry });

    k.loop((dt, t) => {
      const { W, H } = view();
      if (n && !done) {
        if (move) {
          move.f += dt / .9;
          if (move.f >= 1) {
            at = move.to; move = null; passes++; fire = .12 + .88 * passes / total; k.progress(passes / total);
            k.tone(98, 1.6, .04);
            if (passes >= total / 3) k.reveal(0);
            if (passes >= total * 2 / 3) k.reveal(1);
            if (passes >= total) { done = true; say(""); k.done(); }
            else say(passes === n ? "Once more around the circle." : "The next seat has it now. Press and hold to keep it glowing.");
          }
        } else if (!ready) {
          charge = holding ? Math.min(1, charge + dt / NEED) : Math.max(0, charge - dt * .2);
          k.progress((passes + charge * .5) / total);
          if (charge >= 1) { ready = true; readyAt = now(); k.tone(392, 1, .04); say(holding ? "Now let go, and tap to pass it to the next seat (or press Enter)." : "Tap to pass it to the next seat (or press Enter)."); }
          else if (holding) say("Keep holding. Let the sparks rise.");
          else if (charge > 0) say("Press and hold again to keep it glowing.");
        } else if (!holding) say("Tap to pass it to the next seat (or press Enter).");
      }
      draw(W, H, t, dt);
    });

    function flame(cx, cy, hgt, w, t) {
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const off = (i - 2) / 2, base = cx + off * w * 1.6;
        const hh = hgt * (1 - Math.abs(off) * .45) * (k.reduce ? .9 : (.75 + .25 * Math.sin(t * (2.1 + i * .37) + i * 1.7)));
        const sway = k.reduce ? 0 : Math.sin(t * (1.7 + i * .29) + i) * hh * .12, ww = w * (1 - Math.abs(off) * .3), tipX = base + sway * 1.6, tipY = cy - hh;
        const fg = g.createLinearGradient(0, cy, 0, tipY); fg.addColorStop(0, "rgba(255,170,60,.55)"); fg.addColorStop(.45, "rgba(255,110,35,.36)"); fg.addColorStop(1, "rgba(180,40,20,0)");
        g.fillStyle = fg; g.beginPath(); g.moveTo(base - ww, cy);
        g.bezierCurveTo(base - ww * 1.1, cy - hh * .45, tipX - ww * .5 + sway, cy - hh * .7, tipX, tipY);
        g.bezierCurveTo(tipX + ww * .5 + sway, cy - hh * .7, base + ww * 1.1, cy - hh * .45, base + ww, cy); g.closePath(); g.fill();
        const cg = g.createLinearGradient(0, cy, 0, cy - hh * .5); cg.addColorStop(0, "rgba(255,240,190,.5)"); cg.addColorStop(1, "rgba(255,200,120,0)");
        g.fillStyle = cg; g.beginPath(); g.moveTo(base - ww * .45, cy); g.quadraticCurveTo(base + sway * .6, cy - hh * .55, base + ww * .45, cy); g.closePath(); g.fill();
      }
      g.globalCompositeOperation = "source-over";
    }

    function log(p, a, R, lit) {
      const len = R.rx * (n > 4 ? .3 : .38), th = Math.max(9, R.rx * .07), ang = a + Math.PI / 2;   // a log lies along the ring
      const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2 * .36;
      g.lineCap = "round"; g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = th + 4; g.beginPath(); g.moveTo(p.x - dx, p.y - dy + 4); g.lineTo(p.x + dx, p.y + dy + 4); g.stroke();
      g.strokeStyle = lit ? "#5A3A22" : "#3A2618"; g.lineWidth = th; g.beginPath(); g.moveTo(p.x - dx, p.y - dy); g.lineTo(p.x + dx, p.y + dy); g.stroke();
      g.strokeStyle = `rgba(255,170,90,${lit ? .35 : .12})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.x - dx, p.y - dy - th * .3); g.lineTo(p.x + dx, p.y + dy - th * .3); g.stroke();
    }

    function draw(W, H, t, dt) {
      const R = ring(W, H);
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      // a night sky and the tree line
      const sk = g.createLinearGradient(0, 0, 0, H * .55); sk.addColorStop(0, "#08101A"); sk.addColorStop(1, "#0C1310"); g.fillStyle = sk; g.fillRect(0, 0, W, H * .55);
      stars.forEach((s) => { g.fillStyle = `rgba(245,240,232,${k.reduce ? .5 : .3 + .3 * Math.sin(t + s.p)})`; g.fillRect(s.x * W, s.y * H, s.s, s.s); });
      g.fillStyle = "#050806"; g.beginPath(); g.moveTo(0, H * .5);
      for (let x = 0; x <= W; x += 3) { const tip = 1 - Math.abs(((x / 8) % 2) - 1); g.lineTo(x, H * .47 - Math.abs(Math.sin(x * .006 + 1)) * H * .05 - tip * H * (.018 + .014 * Math.sin(x * .045))); }
      g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
      // the clearing, warmed by the fire
      const glow = g.createRadialGradient(R.cx, R.cy, 4, R.cx, R.cy, R.rx * (1.1 + fire * 1.1));
      glow.addColorStop(0, `rgba(255,150,60,${.12 + fire * .38})`); glow.addColorStop(1, "rgba(7,11,9,0)");
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      g.save(); g.translate(R.cx, R.cy); g.scale(1, R.ry / R.rx);
      const cl = g.createRadialGradient(0, 0, R.rx * .2, 0, 0, R.rx * 1.45); cl.addColorStop(0, "rgba(46,34,22,.9)"); cl.addColorStop(.7, "rgba(30,24,16,.6)"); cl.addColorStop(1, "rgba(20,16,12,0)");
      g.fillStyle = cl; g.beginPath(); g.arc(0, 0, R.rx * 1.45, 0, Math.PI * 2); g.fill(); g.restore();
      // the stone ring and its fire
      const sr = R.rx * .28;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; if (Math.sin(a) > 0) continue; stone(R.cx + Math.cos(a) * sr, R.cy + Math.sin(a) * sr * .4, sr * .2); }
      g.fillStyle = "#1A100A"; g.beginPath(); g.ellipse(R.cx, R.cy, sr * .9, sr * .34, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 10; i++) { const x = R.cx + (i / 9 - .5) * sr * 1.2, a = .3 + .7 * fire * (k.reduce ? 1 : Math.abs(Math.sin(t * 1.4 + i))); g.fillStyle = `rgba(255,${100 + i * 8},40,${a})`; g.beginPath(); g.arc(x, R.cy + Math.sin(i * 2) * 3, 2.4, 0, Math.PI * 2); g.fill(); }
      flame(R.cx, R.cy, Math.min(H * .34, (16 + fire * 150) * Math.min(1.3, R.rx / 260)), sr * .2, t);
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; if (Math.sin(a) <= 0) continue; stone(R.cx + Math.cos(a) * sr, R.cy + Math.sin(a) * sr * .4, sr * .2); }
      if (!k.reduce && Math.random() < fire * .9 && parts.length < 80) parts.push({ x: R.cx + (Math.random() - .5) * sr, y: R.cy - 10, vy: -(40 + Math.random() * 60), t: 0, life: 1 + Math.random() * 1.2 });
      if (!n) { drawParts(dt, t); return; }
      // the seats, back ones first
      const order = [...Array(n).keys()].sort((a, b) => Math.sin(seatAng(a)) - Math.sin(seatAng(b)));
      order.forEach((i) => log(seatPos(seatAng(i), R), seatAng(i), R, i === at && !move));
      if (ready && !move) { const q = seatPos(seatAng((at + 1) % n), R), rr = R.rx * .24, a = k.reduce ? .35 : .25 + .2 * Math.sin(t * 3);
        g.strokeStyle = `rgba(226,196,138,${a})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(q.x, q.y, rr, rr * .38, 0, 0, Math.PI * 2); g.stroke(); }
      // the ember: with a seat, or travelling around the ring to the next
      let ea, ep;
      if (move) { const a0 = seatAng(move.from), a1 = seatAng(move.from) + Math.PI * 2 / n, f = move.f < .5 ? 2 * move.f * move.f : 1 - Math.pow(-2 * move.f + 2, 2) / 2; ea = a0 + (a1 - a0) * f; ep = seatPos(ea, R); ep.y -= Math.sin(f * Math.PI) * R.ry * .6; }
      else { ea = seatAng(at); ep = seatPos(ea, R); }
      ep.y -= Math.max(9, R.rx * .07) * .9;
      const glowR = (14 + charge * 22 + (move ? 10 : 0)) * Math.min(1, .45 + R.rx / 400), pulse = k.reduce ? 1 : .85 + .15 * Math.sin(t * 5);
      const eg = g.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, glowR); eg.addColorStop(0, `rgba(255,190,100,${(.5 + charge * .4) * pulse})`); eg.addColorStop(1, "rgba(255,120,40,0)");
      g.fillStyle = eg; g.beginPath(); g.arc(ep.x, ep.y, glowR, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgb(255,${170 + Math.round(charge * 70)},${90 + Math.round(charge * 100)})`; g.beginPath(); g.arc(ep.x, ep.y, 4 + charge * 2, 0, Math.PI * 2); g.fill();
      // the spark line rising from the seat as it's held
      if (!move && charge > 0) {
        const top = ep.y - charge * Math.min(H * .22, R.rx * .7);
        const lg = g.createLinearGradient(0, ep.y, 0, top); lg.addColorStop(0, "rgba(255,200,120,.7)"); lg.addColorStop(1, "rgba(255,200,120,0)");
        g.strokeStyle = lg; g.lineWidth = 2; g.beginPath(); g.moveTo(ep.x, ep.y - 6); g.lineTo(ep.x + (k.reduce ? 0 : Math.sin(t * 3) * 3), top); g.stroke();
        const dots = k.reduce ? 3 : 7;
        for (let i = 0; i < dots; i++) { const f = ((t * .6 + i / dots) % 1) * charge, y = ep.y - f * Math.min(H * .22, R.rx * .7); g.fillStyle = `rgba(255,220,150,${(1 - f) * .9})`; g.beginPath(); g.arc(ep.x + Math.sin(t * 4 + i) * 4, y, 1.6, 0, Math.PI * 2); g.fill(); }
        if (ready) { g.strokeStyle = "rgba(245,230,196,.7)"; g.lineWidth = 1.5; g.beginPath(); g.arc(ep.x, ep.y, glowR + 4 + (k.reduce ? 0 : Math.sin(t * 4) * 2), 0, Math.PI * 2); g.stroke(); }
      }
      drawParts(dt, t);
    }
    function drawParts(dt, t) {
      g.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t += dt; if (q.t > q.life) { parts.splice(i, 1); continue; } q.y += q.vy * dt; q.x += Math.sin(t * 4 + q.y * .04) * 16 * dt; g.fillStyle = `rgba(255,190,110,${(1 - q.t / q.life) * .85})`; g.beginPath(); g.arc(q.x, q.y, 1.4, 0, Math.PI * 2); g.fill(); }
      g.globalCompositeOperation = "source-over";
    }
    function stone(x, y, r) { g.fillStyle = "#2B2925"; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "rgba(255,170,90,.12)"; g.beginPath(); g.ellipse(x, y - r * .2, r * .7, r * .3, 0, 0, Math.PI * 2); g.fill(); }
  }
});
