/* The window: let the light in.
   Preview: press and hold anywhere (or hold Space) and the morning comes up over the valley, pane by pane, triangle by triangle.
   Letting go dims it gently and keeps what has come in; about twenty seconds of holding fills every pane.
   After padakarshini G0 hold ("Hold to let morning light fill the frame", remembering-plan §4, light). */
Scene.register("window", {
  title: "Let the light in",
  line: "It’s just before dawn at the great window. Hold, and let the morning come over the valley.",
  full: false,
  voiceAt: "bottom",
  mount(k) {
    const { g } = k.canvas();
    k.stage.style.touchAction = "none"; k.stage.addEventListener("contextmenu", (e) => e.preventDefault());   // a long press is the game, not a menu
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const N = 24, FILL = 20;                    // panes; seconds of holding
    const NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
    let fill = 0, holding = false, done = false, lastSay = "", lw = 0, lh = 0, cx = 0, cy = 0, R = 0, sx = 1;
    const panes = [];                           // { p: [x0,y0,x1,y1,x2,y2], a }
    for (let i = 0; i < N; i++) panes.push({ p: new Float32Array(6), a: 0 });
    const dark = document.createElement("canvas"), lit = document.createElement("canvas");
    const motes = [];
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Press and hold anywhere (or hold Space) to let the morning in.");

    k.hold((on) => { holding = on; if (on && !done) k.tone(196, 1.6, .025); });

    // the geodesic window: a flat-topped hexagon of six wedges, each cut into four triangles; panes light nearest the sunrise first
    function layout(W, H) {
      lw = W; lh = H; sx = Math.max(1, Math.min(1.45, W / H * .95));
      R = Math.min(H * .37, W * .46 / sx); cx = W / 2; cy = H * .08 + Math.sqrt(3) / 2 * R;
      const V = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; V.push([cx + Math.cos(a) * R * sx, cy + Math.sin(a) * R]); }
      const C = [cx, cy], mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], tris = [];
      for (let i = 0; i < 6; i++) { const a = V[i], b = V[(i + 1) % 6], m1 = mid(C, a), m2 = mid(C, b), m3 = mid(a, b);
        tris.push([C, m1, m2], [m1, a, m3], [m2, m3, b], [m1, m3, m2]); }
      const sun = [cx + R * sx * .3, cy + R * .7];
      tris.sort((A, B) => d2(A, sun) - d2(B, sun));
      tris.forEach((tr, i) => { const p = panes[i].p; for (let j = 0; j < 3; j++) { p[j * 2] = tr[j][0]; p[j * 2 + 1] = tr[j][1]; } });
      paint(dark, W, H, 0); paint(lit, W, H, 1);
    }
    const d2 = (tr, s) => { const x = (tr[0][0] + tr[1][0] + tr[2][0]) / 3 - s[0], y = (tr[0][1] + tr[1][1] + tr[2][1]) / 3 - s[1]; return x * x + y * y; };

    // the valley, painted twice: before dawn and in the morning
    function paint(c, W, H, m) {
      const d = Math.min(2, devicePixelRatio || 1); c.width = W * d; c.height = H * d; const q = c.getContext("2d"); q.setTransform(d, 0, 0, d, 0, 0);
      const top = cy - R, hz = cy + R * .32, sun = cx + R * sx * .3;
      const sky = q.createLinearGradient(0, top, 0, hz);
      if (m) { sky.addColorStop(0, "#7FA3B8"); sky.addColorStop(.55, "#E9CFA0"); sky.addColorStop(1, "#F6DCA6"); }
      else { sky.addColorStop(0, "#060A14"); sky.addColorStop(1, "#162231"); }
      q.fillStyle = sky; q.fillRect(0, 0, W, H);
      if (m) { const s = q.createRadialGradient(sun, hz, 2, sun, hz, R * 1.5); s.addColorStop(0, "rgba(255,244,214,1)"); s.addColorStop(.08, "rgba(255,226,160,.9)"); s.addColorStop(.4, "rgba(246,200,130,.35)"); s.addColorStop(1, "rgba(246,200,130,0)"); q.fillStyle = s; q.fillRect(0, 0, W, H); }
      else { let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        q.fillStyle = "rgba(245,240,232,.75)"; for (let i = 0; i < 70; i++) q.fillRect(cx - R * sx + r() * R * sx * 2, top + r() * (hz - top) * .85, r() < .15 ? 1.6 : 1, r() < .15 ? 1.6 : 1); }
      const ridges = m ? ["#8C9A8C", "#5F7560", "#3F5A41", "#2C4430"] : ["#141C26", "#101820", "#0C1318", "#090F11"];
      for (let j = 0; j < 4; j++) {
        const base = hz + j * R * .2, amp = R * (.1 + j * .05);
        q.fillStyle = ridges[j]; q.beginPath(); q.moveTo(0, H);
        for (let x = 0; x <= W; x += 5) q.lineTo(x, base - amp * (.5 + .5 * Math.sin(x / (R * (.45 + j * .12)) + j * 1.7) * Math.cos(x / (R * .9) - j)));
        q.lineTo(W, H); q.closePath(); q.fill();
        if (m && j < 3) { const mist = q.createLinearGradient(0, base - amp * .2, 0, base + R * .08); mist.addColorStop(0, "rgba(255,240,215,0)"); mist.addColorStop(.6, "rgba(255,240,215,.28)"); mist.addColorStop(1, "rgba(255,240,215,0)"); q.fillStyle = mist; q.fillRect(0, base - amp * .2, W, R * .28); }
      }
      // the stream down in the valley catches the light
      q.strokeStyle = m ? "rgba(255,236,190,.75)" : "rgba(120,140,170,.25)"; q.lineWidth = 2; q.beginPath();
      for (let x = cx - R * sx; x <= cx + R * sx; x += 6) { const y = cy + R * .78 + Math.sin(x / (R * .3)) * R * .05; x === cx - R * sx ? q.moveTo(x, y) : q.lineTo(x, y); }
      q.stroke();
    }

    k.loop((dt, t) => {
      const { W, H } = view();
      if (!W || !H) return;
      if (W !== lw || H !== lh) layout(W, H);
      if (!done) {
        const before = Math.floor(fill);
        if (holding) fill = Math.min(N, fill + dt * N / FILL);
        else fill = Math.max(before, fill - dt * .15);       // what has come in stays; only the pane in progress fades back
        const now = Math.floor(fill);
        if (now > before) { k.tone(NOTES[Math.floor((now - 1) / 2) % NOTES.length], 2.4, .035); }
        k.progress(fill / N);
        if (fill > N / 3) k.reveal(0);
        if (fill > N * 2 / 3) k.reveal(1);
        if (fill >= N) { done = true; say(""); k.tone(523.25, 3.6, .04); k.tone(783.99, 3.6, .03); k.done(); }
        else if (holding) say(fill > N * .8 ? "Nearly the whole valley." : fill > N * .4 ? "It’s coming over the hills. Keep holding." : "That’s it. Let it come.");
        else if (fill > .5) say("It waits for you. Hold again when you’re ready.");
      }
      draw(W, H, t, dt);
    });

    function draw(W, H, t, dt) {
      const L = Math.floor(fill), part = fill - L, light = fill / N;
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      // the room, warmed by what has come in
      const rg = g.createRadialGradient(cx, cy + R, 10, cx, cy + R, Math.max(W, H) * .9);
      rg.addColorStop(0, `rgba(226,196,138,${.04 + light * .22})`); rg.addColorStop(1, "rgba(7,11,9,0)"); g.fillStyle = rg; g.fillRect(0, 0, W, H);
      // the dome's wall around the window: the same triangles, in wood and shadow, caught by what light comes in
      const rh = Math.sqrt(3) / 2 * R / 2, half = R / 4 * sx, t0 = -cy / rh - 1, t1 = (H - cy) / rh + 1;
      g.strokeStyle = `rgba(226,196,138,${.05 + light * .1})`; g.lineWidth = 1; g.beginPath();
      for (let n = Math.ceil(t0); n <= t1; n++) { g.moveTo(0, cy + n * rh); g.lineTo(W, cy + n * rh); }
      const span = Math.ceil((W / 2 + (t1 - t0) * half) / (2 * half)) + 1;
      for (let m = -span; m <= span; m++) { const x0 = cx + m * 2 * half;
        g.moveTo(x0 + t0 * half, cy + t0 * rh); g.lineTo(x0 + t1 * half, cy + t1 * rh);
        g.moveTo(x0 - t0 * half, cy + t0 * rh); g.lineTo(x0 - t1 * half, cy + t1 * rh); }
      g.stroke();
      // the panes
      // the valley before dawn fills the whole window once; each pane that has light gets the morning, drawn only over its own triangle
      const d = dark.width / W, hx = cx - R * sx, hy0 = cy - R, hw = R * sx * 2, hh = R * 2;
      g.save(); g.beginPath();
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = cx + Math.cos(a) * R * sx, y = cy + Math.sin(a) * R; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.clip(); g.drawImage(dark, hx * d, hy0 * d, hw * d, hh * d, hx, hy0, hw, hh); g.restore();
      for (let i = 0; i < N; i++) {
        const P = panes[i], p = P.p;
        const tgt = i < L ? (holding || done ? 1 : .58) : i === L ? part * (holding ? .9 : .5) : 0;
        P.a += (tgt - P.a) * Math.min(1, dt * (k.reduce ? 8 : 2.2));
        if (P.a <= .005) continue;
        const x0 = Math.max(0, Math.min(p[0], p[2], p[4]) - 1), y0 = Math.max(0, Math.min(p[1], p[3], p[5]) - 1);
        const bw = Math.min(W - x0, Math.max(p[0], p[2], p[4]) + 1 - x0), bh = Math.min(H - y0, Math.max(p[1], p[3], p[5]) + 1 - y0);
        g.save(); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[2], p[3]); g.lineTo(p[4], p[5]); g.closePath(); g.clip();
        g.globalAlpha = P.a; g.drawImage(lit, x0 * d, y0 * d, bw * d, bh * d, x0, y0, bw, bh); g.globalAlpha = 1;
        g.restore();
      }
      // the frame: struts and hubs
      g.lineJoin = "round"; g.strokeStyle = "#2B241B"; g.lineWidth = Math.max(3, R * .03); g.beginPath();
      for (let i = 0; i < N; i++) { const p = panes[i].p; g.moveTo(p[0], p[1]); g.lineTo(p[2], p[3]); g.lineTo(p[4], p[5]); g.closePath(); }
      g.stroke();
      g.strokeStyle = `rgba(226,196,138,${.18 + light * .4})`; g.lineWidth = 1; g.stroke();
      g.strokeStyle = "#1B1610"; g.lineWidth = Math.max(6, R * .06); g.beginPath();
      for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3, x = cx + Math.cos(a) * R * sx, y = cy + Math.sin(a) * R; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.fillStyle = `rgba(226,196,138,${.35 + light * .5})`;
      for (let i = 0; i < N; i++) { const p = panes[i].p; for (let j = 0; j < 6; j += 2) { g.beginPath(); g.arc(p[j], p[j + 1], Math.max(1.5, R * .012), 0, Math.PI * 2); g.fill(); } }
      // the sill, and morning light falling into the room
      const sill = cy + Math.sqrt(3) / 2 * R;
      g.fillStyle = "#14100B"; g.fillRect(cx - R * sx * .55, sill, R * sx * 1.1, Math.max(4, R * .04));
      if (light > .02) {
        const sh = g.createLinearGradient(0, sill, 0, H); sh.addColorStop(0, `rgba(246,214,150,${light * .22})`); sh.addColorStop(1, "rgba(246,214,150,0)");
        g.fillStyle = sh; g.beginPath(); g.moveTo(cx - R * sx * .5, sill); g.lineTo(cx + R * sx * .5, sill); g.lineTo(cx + R * sx * .95, H); g.lineTo(cx - R * sx * .05, H); g.closePath(); g.fill();
        if (!k.reduce) {
          if (motes.length < 30 && Math.random() < light * .5) motes.push({ x: cx - R * sx * .3 + Math.random() * R * sx, y: sill + Math.random() * (H - sill), t: 0, life: 3 + Math.random() * 3 });
          for (let i = motes.length - 1; i >= 0; i--) { const m = motes[i]; m.t += dt; if (m.t > m.life) { motes.splice(i, 1); continue; }
            m.x += Math.sin(t * .7 + i) * 6 * dt; m.y -= 4 * dt; const a = Math.sin(Math.PI * m.t / m.life) * .5 * light;
            g.fillStyle = `rgba(255,236,190,${a})`; g.fillRect(m.x, m.y, 1.6, 1.6); }
        }
      }
    }
  }
});
