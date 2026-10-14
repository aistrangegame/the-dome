/* The hearth: light the fire, then keep it alive.
   Preview: press and hold (or Space) to blow on the embers; tap (or Enter) to add a log.
   Full, by the stove: blow on the phone itself (the microphone hears the breath); tap to add a log.
   After padakarshini "The fire (tend it)": fuel burns down, a log adds to it, time kept between too little and too much counts. */
Scene.register("hearth", {
  title: "Light the fire",
  line: "Blow the embers into a flame, then keep it going.",
  full: true,
  voiceAt: "top",
  fullEnd: "The fire is yours tonight.",
  mount(k) {
    const { g } = k.canvas();
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    let heat = 6, fuel = 0, lit = false, blowing = false, kept = 0, done = false, roar = 0, lastSay = "";
    const NEED = 22;                       // seconds kept in the band
    const parts = [], sparks = [];
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say(k.mode === "full" ? "Blow gently on the phone, near the bottom where the microphone is." : "Press and hold anywhere on the fire (or hold Space) to blow on the embers.");

    // breath: a held press in the preview, the microphone in the full version
    k.hold((on) => { blowing = on; if (on) k.noise(0.6, 0.05, 500, "lowpass"); });
    if (k.mode === "full") k.sensor.mic(({ low }) => { blowing = low > 0.32; }).then((ok) => { if (!ok) say("No microphone here: press and hold the fire to blow instead."); });

    // a log: only once it's lit
    k.tap(({ x, y }) => {
      if (!lit || done) return;
      fuel = Math.min(100, fuel + 22); k.haptic(15);
      for (let i = 0; i < 18; i++) sparks.push({ x: view().W / 2 + (Math.random() - .5) * 60, y: view().H * .78, vx: (Math.random() - .5) * 90, vy: -80 - Math.random() * 160, t: 0 });
      k.noise(0.18, 0.08, 2600, "highpass"); k.tone(110, 0.5, 0.05);
    });

    k.loop((dt, t) => {
      const { W, H } = view();
      if (!lit) {
        heat += (blowing ? 22 : -6) * dt; heat = Math.max(4, Math.min(100, heat));
        k.progress(heat / 300);
        if (heat >= 100) {
          lit = true; fuel = 55; k.haptic(40); k.ripple(W / 2, H * .7, 1); k.tone(196, 2.4, 0.05); k.reveal(0);
          say(k.mode === "full" ? "It caught. Tap the screen to add a log when it sinks; not too often." : "It caught. Tap (or press Enter) to add a log when it sinks; not too often.");
        } else if (blowing) say("Keep going. Slow and steady.");
      } else if (!done) {
        fuel -= 4.2 * dt * (blowing ? 0.7 : 1);      // a log lasts about five seconds
        if (blowing) fuel = Math.min(100, fuel + 6 * dt);
        fuel = Math.max(0, fuel);
        const inBand = fuel > 15 && fuel < 82;
        if (inBand) kept += dt;
        roar = fuel >= 82 ? Math.min(1, roar + dt) : Math.max(0, roar - dt);
        say(fuel >= 82 ? "Easy. Let it breathe." : fuel <= 15 ? (fuel <= 2 ? "Almost out. A log, quick." : "It’s sinking. Add a log.") : "That’s it. Just keep it here.");
        k.progress(0.34 + 0.66 * (kept / NEED));
        if (kept > NEED / 2) k.reveal(1);
        if (kept >= NEED) { done = true; say(""); k.done(); }
        if (fuel <= 0) { lit = false; heat = 30; say("It went out. Blow on the embers again."); }
      }
      draw(W, H, t, dt);
    });

    function draw(W, H, t, dt) {
      g.clearRect(0, 0, W, H);
      // the room: dark, warmed by the fire
      const level = lit ? fuel / 100 : heat / 220;
      const glow = g.createRadialGradient(W / 2, H * .8, 10, W / 2, H * .8, Math.max(W, H) * (.35 + level * .6));
      glow.addColorStop(0, `rgba(255,150,60,${.18 + level * .45})`); glow.addColorStop(1, "rgba(7,11,9,0)");
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H); g.fillStyle = glow; g.fillRect(0, 0, W, H);
      // the stove's mouth
      const mw = Math.min(W * .62, 520), mh = mw * .55, mx = W / 2 - mw / 2, my = H * .86 - mh;
      g.fillStyle = "#14100C"; g.beginPath(); g.moveTo(mx, H * .86); g.lineTo(mx, my + mh * .35); g.quadraticCurveTo(W / 2, my - mh * .25, mx + mw, my + mh * .35); g.lineTo(mx + mw, H * .86); g.closePath(); g.fill();
      g.strokeStyle = `rgba(226,196,138,${.25 + level * .4})`; g.lineWidth = 2; g.stroke();
      // logs
      g.lineCap = "round"; g.strokeStyle = "#3A2618"; g.lineWidth = Math.max(10, mw * .06);
      g.beginPath(); g.moveTo(W / 2 - mw * .3, H * .84); g.lineTo(W / 2 + mw * .18, H * .8); g.moveTo(W / 2 + mw * .3, H * .84); g.lineTo(W / 2 - mw * .18, H * .8); g.stroke();
      // embers along the logs
      for (let i = 0; i < 14; i++) { const x = W / 2 - mw * .28 + (i / 13) * mw * .56, a = .25 + .75 * Math.abs(Math.sin(t * (1.3 + i * .17) + i)) * Math.min(1, level * 2 + (blowing ? .5 : 0));
        g.fillStyle = `rgba(255,${90 + (i * 9) % 60},40,${a})`; g.beginPath(); g.arc(x, H * .82 + Math.sin(i) * 3, 2.4 + (blowing ? 1.4 : 0), 0, Math.PI * 2); g.fill(); }
      // the flame: tongues of fire that sway and lick upward, a hot core inside; height follows the fuel
      const hgt = (lit ? 40 + fuel * 2.1 * (1 + roar * .25) : heat * .9) * Math.min(1.4, mw / 360);
      g.globalCompositeOperation = "lighter";
      const tongues = 7;
      for (let i = 0; i < tongues; i++) {
        const off = (i - (tongues - 1) / 2) / ((tongues - 1) / 2), base = W / 2 + off * mw * .2;
        const hh = hgt * (1 - Math.abs(off) * .45) * (.75 + .25 * Math.sin(t * (2.1 + i * .37) + i * 1.7)) * (blowing ? 1.15 : 1);
        if (hh < 4) continue;
        const sway = Math.sin(t * (1.7 + i * .29) + i) * hh * .12, w = mw * .085 * (1 - Math.abs(off) * .3);
        const y0 = H * .81, tipX = base + sway * 1.6, tipY = y0 - hh;
        const fg = g.createLinearGradient(0, y0, 0, tipY);
        fg.addColorStop(0, "rgba(255,170,60,.55)"); fg.addColorStop(.45, "rgba(255,110,35,.38)"); fg.addColorStop(1, "rgba(180,40,20,0)");
        g.fillStyle = fg; g.beginPath(); g.moveTo(base - w, y0);
        g.bezierCurveTo(base - w * 1.1, y0 - hh * .45, tipX - w * .5 + sway, y0 - hh * .7, tipX, tipY);
        g.bezierCurveTo(tipX + w * .5 + sway, y0 - hh * .7, base + w * 1.1, y0 - hh * .45, base + w, y0); g.closePath(); g.fill();
        // the hot core
        const cg = g.createLinearGradient(0, y0, 0, y0 - hh * .55); cg.addColorStop(0, "rgba(255,240,190,.5)"); cg.addColorStop(1, "rgba(255,200,120,0)");
        g.fillStyle = cg; g.beginPath(); g.moveTo(base - w * .45, y0); g.quadraticCurveTo(base + sway * .6, y0 - hh * .6, base + w * .45, y0); g.closePath(); g.fill();
      }
      // a few embers lifting off
      if (!k.reduce && Math.random() < (lit ? fuel / 160 : heat / 400)) parts.push({ x: W / 2 + (Math.random() - .5) * mw * .3, y: H * .8 - hgt * .4, vy: -(50 + Math.random() * 70), t: 0, life: 1 + Math.random(), r: 1.2 + Math.random() * 1.3 });
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.t += dt; if (q.t > q.life) { parts.splice(i, 1); continue; }
        q.y += q.vy * dt; q.x += Math.sin(t * 4 + q.y * .04) * 18 * dt;
        g.fillStyle = `rgba(255,190,110,${(1 - q.t / q.life) * .9})`; g.beginPath(); g.arc(q.x, q.y, q.r, 0, Math.PI * 2); g.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; if (s.t > 1.2) { sparks.splice(i, 1); continue; } s.vy += 160 * dt; s.x += s.vx * dt; s.y += s.vy * dt; g.fillStyle = `rgba(255,200,120,${1 - s.t / 1.2})`; g.fillRect(s.x, s.y, 2, 2); }
      g.globalCompositeOperation = "source-over";
      if (parts.length > 120) parts.splice(0, parts.length - 120);
    }
  }
});
