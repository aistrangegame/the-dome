/* The gate and the drive: look back down the drive.
   Preview: drag sideways (or use the arrow keys) to turn around, slowly, from the dome to the drive; facing back down it,
   the film of arriving runs backwards: the drive falls away, the trees part, the dome's white shell rises into the frame.
   Full, at the top of the drive: the compass is the turn; the guest physically turns half a circle from where they started.
   After Ashrey's "turn until you face back down the drive; the clip runs back up it" (remembering-plan §4, air). */
Scene.register("gate", {
  title: "Look back down the drive",
  line: "You’re at the top of the drive, facing the dome. Turn around, slowly, and look back the way you came.",
  full: true,
  voiceAt: "top",
  fullEnd: "That’s the way you came. Go on in when you’re ready.",
  mount(k) {
    const { g } = k.canvas();
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const wrap = (a) => ((a % 360) + 540) % 360 - 180;
    let h = 0, target = 0, best = 0, film = 0, arrived = false, done = false, lastSay = "", windT = 0, moved = 0;
    let sensorOn = false, start = null;
    const SPEED = 13, FILM = 10;           // degrees a second at most; seconds of film
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };

    // the world, laid out once: trees, stars and valley lights around a full circle
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const trees = [];
    while (trees.length < 84) {
      const az = rnd() * 360, d = rnd();
      if (Math.abs(wrap(az - 180)) < 5 + d * 16 || Math.abs(wrap(az)) < 16 + d * 6) continue;
      const r = Math.round(38 - d * 28), gg = Math.round(50 - d * 32), b = Math.round(58 - d * 44);
      trees.push({ az, d, hf: .7 + rnd() * .6, col: `rgb(${r},${gg},${b})` });
    }
    trees.sort((a, b) => a.d - b.d);
    const stars = []; for (let i = 0; i < 110; i++) stars.push({ az: rnd() * 360, y: rnd(), r: rnd() < .12 ? 1.5 : .9, tw: rnd() * 6 });
    const lights = []; for (let i = 0; i < 11; i++) lights.push({ off: (rnd() - .5) * 34, y: rnd() });
    const road = new Float32Array(52);
    const flies = []; for (let i = 0; i < 14; i++) flies.push({ az: 40 + rnd() * 280, y: .55 + rnd() * .35, ph: rnd() * 6, sp: .4 + rnd() * .5 });
    const GATE = 96;                         // the old field gate, off to the side of the drive

    say(k.mode === "full" ? "Stand at the top of the drive, facing the dome. Now turn, slowly, until you face back down the drive." : "Drag sideways to turn around (or use the arrow keys). Slowly.");

    k.drag(({ dx, down, key }) => {
      if (!down || done) return;
      const d = key ? dx * .3 : -dx * 180 / k.stage.clientWidth;
      target = Math.max(-180, Math.min(180, Math.max(h - 34, Math.min(h + 34, target + d))));   // the turn stops facing the drive
    });
    if (k.mode === "full") {
      k.sensor.compass((head) => { if (start == null) start = head; sensorOn = true; target = h + wrap(wrap(head - start) - h); })
        .then((ok) => { if (!ok) say("No compass here: drag sideways to turn instead."); });
      setTimeout(() => { if (!sensorOn && !done && best < .05) say("No compass here: drag sideways to turn instead."); }, 3500);
    }

    k.loop((dt, t) => {
      const { W, H } = view();
      if (!W || !H) return;
      const gap = target - h, max = (sensorOn ? 140 : SPEED) * dt, step = Math.max(-max, Math.min(max, gap));
      h += step; moved += Math.abs(step);
      windT -= dt; if (windT <= 0) { if (moved > 1) k.noise(.7, Math.min(.06, .012 + moved * .004), 420, "lowpass"); windT = .35; moved = 0; }
      const face = Math.abs(wrap(h));
      best = Math.max(best, face / 180);
      if (!done) {
        if (!arrived && face > 168) { arrived = true; k.haptic(20); k.tone(293.66, 3.2, .05); k.tone(440, 3.2, .03); k.ripple(W / 2, H * .6, .7); }
        if (arrived && face > 150) film = Math.min(1, film + dt / FILM);
        const p = .62 * best + .38 * film;
        k.progress(p);
        if (p > .33) k.reveal(0);
        if (p > .66) k.reveal(1);
        if (arrived) say(face > 150 ? "There it is. The way you came, running back up the mountain." : "Turn back to the drive.");
        else if (Math.abs(gap) > 28 && !sensorOn) say("Slowly. Let it come round.");
        else if (face > 120) say("Nearly round. Keep coming.");
        else if (face > 12) say("Keep turning. The drive is behind you.");
        if (film >= 1) { done = true; say(""); k.tone(587.33, 3.4, .04); k.done(); }
      }
      draw(W, H, t, face);
    });

    function cone(x, y, th) {          // a spruce: three tiers
      const tw = th * .42;
      g.beginPath();
      for (let i = 0; i < 3; i++) { const top = y - th * (.45 + i * .275), bot = y - th * (i * .28), w = tw * (1 - i * .26);
        g.moveTo(x, top); g.lineTo(x + w, bot); g.lineTo(x - w, bot); g.closePath(); }
      g.fill();
    }

    function draw(W, H, t, face) {
      const s = H / 600, fov = W > H ? 72 : 52, ppd = W / fov;
      const sx = (az) => W / 2 + wrap(az - h) * ppd;
      const fw = film * Math.max(0, Math.min(1, (face - 140) / 40));       // the film, while you look down the drive
      const hy = H * (.6 - fw * .05);
      // the evening sky; the sun went down behind the drive
      const sky = g.createLinearGradient(0, 0, 0, hy); sky.addColorStop(0, "#0A1322"); sky.addColorStop(.6, "#22304A"); sky.addColorStop(1, "#3A4258");
      g.fillStyle = sky; g.fillRect(0, 0, W, hy + 2);
      const sd = wrap(180 - h);
      if (Math.abs(sd) < fov / 2 + 80) {
        const x = sx(180), gl = g.createRadialGradient(x, hy, 4, x, hy, W * .95);
        gl.addColorStop(0, `rgba(250,184,110,${.8 + fw * .15})`); gl.addColorStop(.18, "rgba(232,150,110,.45)"); gl.addColorStop(.5, "rgba(170,120,130,.16)"); gl.addColorStop(1, "rgba(201,169,110,0)");
        g.fillStyle = gl; g.fillRect(Math.max(0, x - W * .95), 0, Math.min(W, x + W * .95) - Math.max(0, x - W * .95), hy + 2);
      }
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i], x = sx(st.az); if (x < 0 || x > W) continue;
        const a = Math.max(0, (Math.abs(wrap(st.az - 180)) - 55) / 125) * (k.reduce ? .8 : .55 + .3 * Math.sin(t * 1.3 + st.tw));
        if (a <= .02) continue; g.fillStyle = `rgba(245,240,232,${a})`; g.fillRect(x, st.y * hy * .82, st.r, st.r);
      }
      // two ridges, far and near; the near one is the ground you stand on
      ridge(W, hy, s, ppd, "#2A3346", 26, 1.0);
      if (Math.abs(sd) < fov / 2 + 30) {         // a band of mist down in the valley, and houses lit along it
        const x = sx(180), m = g.createLinearGradient(0, hy - 14 * s, 0, hy + 18 * s);
        m.addColorStop(0, "rgba(226,196,138,0)"); m.addColorStop(.5, `rgba(226,196,138,${.1 + fw * .1})`); m.addColorStop(1, "rgba(226,196,138,0)");
        g.fillStyle = m; g.fillRect(x - W * .6, hy - 14 * s, W * 1.2, 32 * s);
      }
      const gr = g.createLinearGradient(0, hy - 20 * s, 0, H); gr.addColorStop(0, "#1D2620"); gr.addColorStop(1, "#0B100D");
      ridge(W, hy, s, ppd, gr, 10, 2.3);
      if (Math.abs(sd) < fov / 2 + 30) for (let i = 0; i < lights.length; i++) {
        const l = lights[i], x = sx(180 + l.off), a = .35 + fw * .55;
        g.fillStyle = `rgba(255,214,150,${a * (k.reduce ? 1 : .8 + .2 * Math.sin(t * 2 + i))})`; g.beginPath(); g.arc(x, hy + (6 + l.y * 12) * s, 1.3 * Math.max(1, s), 0, Math.PI * 2); g.fill();
      }
      // far trees, then the dome on its rise, then the drive, then near trees
      let i = 0;
      for (; i < trees.length && trees[i].d < .35; i++) tree(trees[i], W, H, hy, s, sx, fw);
      const dd = wrap(0 - h);
      if (Math.abs(dd) < fov / 2 + 30) dome(sx(0), hy + 18 * s, 78 * s, t);
      if (Math.abs(dd) < fov / 2 + 40) {             // the last bit of drive, up to the dome
        const x = sx(0), up = g.createLinearGradient(0, hy + 20 * s, 0, H); up.addColorStop(0, "#5A4C3A"); up.addColorStop(1, "#231F19");
        g.fillStyle = up; g.beginPath(); g.moveTo(x - 14 * s, hy + 20 * s); g.lineTo(x + 14 * s, hy + 20 * s); g.lineTo(x + W * .3, H + 4); g.lineTo(x - W * .3, H + 4); g.closePath(); g.fill();
      }
      if (Math.abs(sd) < fov / 2 + 40) drive(sx(180), W, H, hy, s, fw);
      if (Math.abs(wrap(GATE - h)) < fov / 2 + 20) fieldGate(sx(GATE), hy + (H - hy) * .42, s);
      for (; i < trees.length; i++) tree(trees[i], W, H, hy, s, sx, fw);
      if (!k.reduce) for (let j = 0; j < flies.length; j++) {     // fireflies over the grass
        const f = flies[j], x = sx(f.az + Math.sin(t * f.sp + f.ph) * 2); if (x < 0 || x > W) continue;
        const a = Math.max(0, Math.sin(t * f.sp * 2.3 + f.ph)); if (a < .1) continue;
        g.fillStyle = `rgba(255,226,140,${a * .8})`; g.beginPath(); g.arc(x, hy + (H - hy) * f.y + Math.sin(t * .7 + f.ph) * 6 * s, 1.6 * Math.max(1, s), 0, Math.PI * 2); g.fill();
      }
      // the film: you rise up and back over the dome; its white shell comes into the frame below you
      if (fw > 0) {
        const RR = Math.max(W, H) * .9, cy = H + RR - fw * H * .17;
        g.save(); g.beginPath(); g.arc(W / 2, cy, RR, 0, Math.PI * 2); g.clip();
        const sh = g.createLinearGradient(0, cy - RR, 0, cy - RR + H * .2); sh.addColorStop(0, "#E6E0D4"); sh.addColorStop(1, "#8F8A80");
        g.fillStyle = sh; g.fillRect(0, cy - RR, W, H);
        g.strokeStyle = "rgba(60,52,40,.35)"; g.lineWidth = 1.2; g.beginPath();
        const step = 46 * s, top = cy - RR;
        for (let r = 0; r < 5; r++) { const y = top + r * step * .55; g.moveTo(0, y); g.lineTo(W, y); }
        for (let c = -2; c < W / step + 2; c++) { const x = c * step; g.moveTo(x, top); g.lineTo(x + step * 1.4, top + step * 2.2); g.moveTo(x, top); g.lineTo(x - step * 1.4, top + step * 2.2); }
        g.stroke();
        const warm = g.createRadialGradient(W / 2, top, 2, W / 2, top, W * .5); warm.addColorStop(0, "rgba(240,170,96,.35)"); warm.addColorStop(1, "rgba(240,170,96,0)");
        g.fillStyle = warm; g.fillRect(0, top, W, H);
        g.restore();
      }
    }

    function fieldGate(x, y, s) {
      const w = 130 * s, ph = 46 * s;
      g.strokeStyle = "#3A2E22"; g.lineCap = "round";
      g.lineWidth = 6 * s; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - ph * 1.15); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y - ph * 1.15); g.stroke();
      g.lineWidth = 3.2 * s; g.beginPath();
      for (let r = 0; r < 4; r++) { const yy = y - ph * (.2 + r * .25); g.moveTo(x - w / 2, yy); g.lineTo(x + w / 2, yy); }
      g.moveTo(x - w / 2, y - ph * .2); g.lineTo(x + w / 2, y - ph * .95); g.stroke();
      g.strokeStyle = "rgba(226,196,138,.18)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w / 2, y - ph * .95); g.lineTo(x + w / 2, y - ph * .95); g.stroke();
    }

    function ridge(W, hy, s, ppd, col, amp, f) {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, k.stage.clientHeight + 2);
      for (let x = 0; x <= W + 6; x += 6) {
        const a = (h + (x - W / 2) / ppd) * Math.PI / 180;
        g.lineTo(x, hy - (amp + amp * .55 * Math.sin(a * 2 + f) + amp * .35 * Math.sin(a * 5 + f * 2) + amp * .18 * Math.sin(a * 11 + f)) * s);
      }
      g.lineTo(W + 6, k.stage.clientHeight + 2); g.closePath(); g.fill();
    }

    function tree(tr, W, H, hy, s, sx, fw) {
      let x = sx(tr.az);
      const rd = wrap(tr.az - 180);
      if (fw > 0 && Math.abs(rd) < 45) x += Math.sign(rd) * fw * (.2 + tr.d) * W * .22;     // the trees part
      if (x < -160 || x > W + 160) return;
      const y = hy + tr.d * (H - hy) * .55, th = (24 + tr.d * tr.d * 240) * s * tr.hf;
      g.fillStyle = tr.col; cone(x, y, th);
      const rim = Math.max(0, 1 - Math.abs(rd) / 70) * (.15 + tr.d * .35);
      if (rim > .03) { g.fillStyle = `rgba(240,176,110,${rim * .35})`; g.fill(); }
    }

    function drive(rx, W, H, hy, s, fw) {
      const N = 25, far = hy + 4 * s, w0 = W * .46 * (1 - fw * .45);
      for (let i = 0; i <= N; i++) {
        const t = i / N, y = far + (H + 8 - far) * (1 - t) * (1 - t), w = w0 * (1 - t) * (1 - t) + 2 * s;
        const cx = rx + Math.sin(t * 5.5) * W * .2 * t * (1 - t);
        road[i * 2] = cx; road[i * 2 + 1] = y;
        if (i === 0) { g.beginPath(); g.moveTo(cx - w / 2, y); } else g.lineTo(cx - w / 2, y);
      }
      for (let i = N; i >= 0; i--) { const t = i / N, w = w0 * (1 - t) * (1 - t) + 2 * s; g.lineTo(road[i * 2] + w / 2, road[i * 2 + 1]); }
      g.closePath();
      const gr = g.createLinearGradient(0, far, 0, H); gr.addColorStop(0, "#6A5A44"); gr.addColorStop(.4, "#3C352B"); gr.addColorStop(1, "#2A2620");
      g.fillStyle = gr; g.fill();
      // two worn tracks in the gravel
      g.strokeStyle = "rgba(20,17,13,.45)"; g.lineWidth = Math.max(1, 3 * s);
      for (let m = -1; m <= 1; m += 2) {
        const side = m * .22; g.beginPath();
        for (let i = 0; i <= N; i++) { const t = i / N, w = w0 * (1 - t) * (1 - t); const x = road[i * 2] + side * w, y = road[i * 2 + 1]; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
    }

    function dome(x, base, R, t) {
      const glow = g.createRadialGradient(x, base - R * .5, R * .3, x, base - R * .5, R * 2.4);
      glow.addColorStop(0, "rgba(226,196,138,.22)"); glow.addColorStop(1, "rgba(226,196,138,0)"); g.fillStyle = glow; g.fillRect(x - R * 2.5, base - R * 3, R * 5, R * 5);
      const sh = g.createLinearGradient(x - R, 0, x + R, 0); sh.addColorStop(0, "#9C978E"); sh.addColorStop(.6, "#D6D0C4"); sh.addColorStop(1, "#B9B3A8");
      g.fillStyle = sh; g.beginPath(); g.arc(x, base, R, Math.PI, 0); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.arc(x, base, R, Math.PI, 0); g.closePath(); g.clip();
      g.strokeStyle = "rgba(50,44,36,.32)"; g.lineWidth = 1; g.beginPath();
      for (let r = 1; r < 4; r++) { const y = base - R * r / 4 * .95; g.moveTo(x - R, y); g.lineTo(x + R, y); }
      for (let c = -4; c <= 4; c++) { g.moveTo(x + c * R * .25, base); g.lineTo(x + c * R * .25 + R * .3, base - R); g.moveTo(x + c * R * .25, base); g.lineTo(x + c * R * .25 - R * .3, base - R); }
      g.stroke(); g.restore();
      // the great window, lit from inside
      const a = k.reduce ? .85 : .8 + .06 * Math.sin(t * .8);
      g.fillStyle = `rgba(240,196,120,${a})`; g.beginPath(); g.moveTo(x - R * .42, base - R * .08); g.lineTo(x, base - R * .78); g.lineTo(x + R * .42, base - R * .08); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,44,24,.6)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, base - R * .78); g.lineTo(x, base - R * .08); g.moveTo(x - R * .21, base - R * .43); g.lineTo(x + R * .21, base - R * .43); g.stroke();
    }
  }
});
