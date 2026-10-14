/* The night sky: find the words in the stars.
   Preview: drag the sky (or the arrow keys) to look around; three faint gold stars hide guests' words.
   Bring one into the circle at the centre and hold still: it brightens and the words come.
   Full, under the real sky: point the phone; the compass turns the view and the tilt raises it.
   An optional camera layer shows the real sky behind the drawn one. If a sensor is missing or refused, drag works instead. */
Scene.register("night-sky", {
  title: "Find the words in the stars",
  line: "Three stars are holding something. Look around the sky and find them.",
  full: true,
  voiceAt: "bottom",
  fullEnd: "All three found. Lie back now, and wait for a shooting star of your own.",
  mount(k) {
    const { g, cv } = k.canvas();
    const stage = k.stage, full = k.mode === "full";
    const view = () => ({ W: stage.clientWidth, H: stage.clientHeight });
    const ppdOf = (W, H) => Math.max(W / 72, H / 60);        // pixels per degree of sky
    const ALT_MIN = -4, ALT_MAX = 78;
    let vaz = 0, valt = 13, tvaz = 0, tvalt = 13, speed = 0, lock = 0, found = 0, done = false, lastSay = "", endT = 0;
    let sensed = false, sensorTried = false, camOn = false, video = null, nextShoot = 6 + Math.random() * 5, hintT = 0;
    let holdSay = 0;
    const say = (t, hold) => { if (hold) holdSay = hold; else if (holdSay > 0) return; if (t !== lastSay) { lastSay = t; k.say(t); } };
    const wrap = (d) => ((d % 360) + 540) % 360 - 180;        // -180..180

    // the sky: seeded so it's the same sky every night
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const mwAlt = (az) => 34 + 30 * Math.sin((az - 30) * Math.PI / 180);
    const stars = [];
    for (let i = 0; i < 2600; i++) { const az = rnd() * 360, alt = ALT_MIN + Math.asin(rnd()) / (Math.PI / 2) * (90 - ALT_MIN); stars.push([az, alt, Math.pow(rnd(), 3), rnd() * 6, rnd() < .08 ? 1 : 0]); }
    for (let i = 0; i < 1500; i++) { const az = rnd() * 360, alt = mwAlt(az) + (rnd() + rnd() + rnd() - 1.5) * 9; stars.push([az, alt, Math.pow(rnd(), 4) * .7, rnd() * 6, 0]); }
    const haze = []; for (let az = 0; az < 360; az += 3.2) haze.push([az + (rnd() - .5) * 2, mwAlt(az) + (rnd() - .5) * 4, 6 + rnd() * 7, .05 + rnd() * .06]);
    const lanes = []; for (let az = 0; az < 360; az += 9) lanes.push([az + rnd() * 4, mwAlt(az) + (rnd() - .5) * 3, 2.5 + rnd() * 3]);
    // the treeline all the way round, and the dome in its clearing
    const DOME_AZ = 9, ridge = new Float32Array(1440);
    for (let i = 0; i < 1440; i++) { const az = i / 4; ridge[i] = 1.6 + 1.1 * Math.sin(az * .05) + .7 * Math.sin(az * .13 + 1); }
    for (let n = 0; n < 420; n++) { const c = rnd() * 360; if (Math.abs(wrap(c - DOME_AZ)) < 6) continue; const h = 2.2 + rnd() * 4.5, hw = .55 + rnd() * .7;
      for (let d = -hw; d <= hw; d += .25) { const i = (((Math.round((c + d) * 4)) % 1440) + 1440) % 1440, base = 1.6 + 1.1 * Math.sin(((c + d)) * .05) + .7 * Math.sin((c + d) * .13 + 1); ridge[i] = Math.max(ridge[i], base + h * (1 - Math.abs(d) / hw)); } }
    const ridgeAt = (az) => ridge[(((Math.round(az * 4)) % 1440) + 1440) % 1440];

    // the three stars that hold guests' words
    const gold = [{ az: 52, alt: 38 }, { az: 150, alt: 54 }, { az: 292, alt: 30 }].map((s, i) => ({ ...s, i, found: false, glow: 0 }));
    const shoots = [];

    say(full ? "Hold the phone up to the sky. Turn and look for a faint gold star." : "Drag the sky to look around (or use the arrow keys). Look for a faint gold star.", 3);

    // looking around by hand: a grab of the sky, or the arrow keys looking that way
    k.drag(({ dx, dy, down, key }) => {
      if (!down || done) return;
      const { W, H } = view(), ppd = ppdOf(W, H);
      if (key) { tvaz += dx * 3 / ppd; tvalt -= dy * 3 / ppd; }
      else { tvaz -= dx * 1.35 / ppd; tvalt += dy * 1.35 / ppd; }
      tvalt = Math.max(ALT_MIN + 6, Math.min(ALT_MAX, tvalt));
      if (sensed && !key) sensed = false;          // a hand on the sky takes over from the phone
    });

    // the full version: the phone itself is the window onto the sky
    let bootCheck = null;
    if (full) {
      let headSeen = false, bootT = 0, booted = false;
      const head = (h) => { headSeen = true; sensed = true; const d = wrap(h - tvaz); tvaz += d; };
      k.sensor.compass((h) => { if (!done) head(h); }).then((ok) => { sensorTried = true; if (!ok) fallback(); });
      k.sensor.tilt((e) => {
        if (e.motion || done || e.beta == null) return;
        if (e.beta === 0 && e.gamma === 0 && e.alpha === 0) return;
        sensed = true; tvalt = Math.max(ALT_MIN + 6, Math.min(ALT_MAX, e.beta - 90));
        if (!headSeen && e.alpha) { const d = wrap(360 - e.alpha - tvaz); tvaz += d; }   // no true north: turn by the phone's own heading
      }).then((ok) => { if (!ok) fallback(); });
      // nothing heard from the sensors in a few seconds: a desktop, or permission refused
      bootCheck = (dt) => { if (sensed || booted) return; bootT += dt; if (bootT > 2.5) { booted = true; fallback(); } };
      makeCameraToggle();
    }
    let fell = false;
    function fallback() { if (fell || sensed || done) return; fell = true; say("No compass here. Drag the sky to look around instead.", 5); }

    function makeCameraToggle() {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "See the real sky behind";
      b.setAttribute("aria-pressed", "false");
      b.style.cssText = "position:absolute;top:12px;right:12px;z-index:1;font:500 14px/1 'DM Sans',sans-serif;color:#F5F0E8;background:rgba(7,11,9,.55);border:1px solid rgba(226,196,138,.45);border-radius:999px;padding:9px 14px;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)";
      stage.append(b);
      b.addEventListener("click", async () => {
        if (camOn) { camOn = false; b.textContent = "See the real sky behind"; b.setAttribute("aria-pressed", "false"); if (video) { try { video.srcObject && video.srcObject.getTracks().forEach((t) => t.stop()); } catch (e) {} video.remove(); video = null; } return; }
        video = document.createElement("video");
        video.setAttribute("playsinline", ""); video.muted = true;
        video.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45;pointer-events:none";
        stage.insertBefore(video, cv);
        const ok = await k.sensor.camera(video);
        if (ok) { camOn = true; b.textContent = "Hide the real sky"; b.setAttribute("aria-pressed", "true"); }
        else { video.remove(); video = null; b.remove(); say("No camera here. The drawn sky will do.", 4); }
      });
    }

    function nearest() { let best = null, bd = 1e9; gold.forEach((s) => { if (s.found) return; const d = Math.hypot(wrap(s.az - vaz), s.alt - valt); if (d < bd) { bd = d; best = s; } }); return best; }

    k.loop((dt, t) => {
      dt = Math.max(0, dt);                 // the first frame can arrive a hair before the clock starts
      const { W, H } = view(), ppd = ppdOf(W, H);
      holdSay -= dt; if (bootCheck) bootCheck(dt);
      // the view follows its target softly (a phone's sensors are noisy; a hand is not)
      const ease = 1 - Math.exp(-dt * (sensed ? 6 : 12));
      const daz = wrap(tvaz - vaz) * ease, dalt = (tvalt - valt) * ease;
      vaz = (vaz + daz + 360) % 360; valt += dalt; tvaz = ((tvaz % 360) + 360) % 360;
      speed = speed * .85 + (Math.hypot(daz, dalt) / Math.max(dt, .001)) * .15;   // degrees a second
      if (!done) {
        const s = nearest(), R = 34 / ppd;
        if (s) {
          const d = Math.hypot(wrap(s.az - vaz), s.alt - valt);
          // a gentle pull once it's close, so a slow hand or the keys can settle it
          if (d < 7 && !sensed) { tvaz += wrap(s.az - tvaz) * dt * 1.4; tvalt += (s.alt - tvalt) * dt * 1.4; }
          if (d < R) {
            if (speed < (sensed ? 9 : 4)) lock += dt; else lock = Math.max(0, lock - dt * 2);
            say(lock > .2 ? "Stay with it." : "There. Hold still.");
          } else {
            lock = Math.max(0, lock - dt * 3);
            hintT += dt;
            if (d < 7) say("Nearly. Bring it into the circle.");
            else say(found === 0 ? (full && sensed ? "Turn slowly. Follow the gold glimmer at the edge." : "Follow the gold glimmer at the edge of the sky.") : found === 1 ? "Two more are out there. Follow the glimmer." : "One more is waiting.");
          }
          s.glow = Math.min(1, lock / 1.1);
          if (lock >= 1.1) {
            s.found = true; lock = 0; found++;
            k.tone(1318, 2.2, .045); setTimeout(() => k.tone(1760, 2.6, .03), 180); k.haptic(20);
            const p = toScreen(s.az, s.alt, W, H, ppd); k.ripple(p.x, p.y, .6);
            k.reveal(s.i);
            if (found === 3) { done = true; say("All three found.", 5); k.done(); }
            else say(found === 1 ? "One found. Two more are out there." : "Two found. One more is waiting.", 2.5);
          }
        }
        k.progress((found + (s ? Math.min(1, lock / 1.1) * .9 : 0)) / 3);
      } else { endT += dt; if (endT > 5) say(""); }
      // shooting stars, now and then (the place asks you to wait for one)
      nextShoot -= dt;
      if (nextShoot <= 0 && !k.reduce) {
        nextShoot = (done ? 3 : 8) + Math.random() * 7;
        const az = vaz + (Math.random() - .5) * W / ppd * .7, alt = valt + Math.random() * H / ppd * .35, dir = Math.random() < .5 ? -1 : 1;
        shoots.push({ az, alt, vaz: dir * (14 + Math.random() * 10), valt: -(6 + Math.random() * 6), t: 0, life: .9 + Math.random() * .4 });
        k.noise(.5, .012, 6000, "highpass");
      }
      draw(W, H, ppd, t, dt);
    });

    function toScreen(az, alt, W, H, ppd) { return { x: W / 2 + wrap(az - vaz) * ppd, y: H / 2 - (alt - valt) * ppd }; }

    function draw(W, H, ppd, t, dt) {
      g.clearRect(0, 0, W, H);
      const hy = H / 2 + valt * ppd;                       // the horizon on screen
      // the sky's own darkness, a little lighter toward the horizon; thinner when the real sky shows through
      const sg = g.createLinearGradient(0, Math.min(hy, H) - H * 1.2, 0, hy);
      const a = camOn ? .55 : 1;
      sg.addColorStop(0, `rgba(4,7,12,${a})`); sg.addColorStop(.7, `rgba(9,15,22,${a})`); sg.addColorStop(1, `rgba(24,32,36,${a})`);
      g.fillStyle = sg; g.fillRect(0, 0, W, H);
      const halfW = W / 2 / ppd + 14, halfH = H / 2 / ppd + 14;
      const vis = (az, alt, m) => Math.abs(wrap(az - vaz)) < halfW + m && Math.abs(alt - valt) < halfH + m;
      // the Milky Way: a soft haze with darker lanes
      g.globalCompositeOperation = "lighter";
      haze.forEach(([az, alt, r, o]) => { if (!vis(az, alt, r)) return; const p = toScreen(az, alt, W, H, ppd), rr = r * ppd;
        const hg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr); hg.addColorStop(0, `rgba(190,200,215,${o})`); hg.addColorStop(1, "rgba(190,200,215,0)");
        g.fillStyle = hg; g.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2); });
      g.globalCompositeOperation = "source-over";
      lanes.forEach(([az, alt, r]) => { if (!vis(az, alt, r)) return; const p = toScreen(az, alt, W, H, ppd), rr = r * ppd;
        const lg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr); lg.addColorStop(0, "rgba(4,7,12,.22)"); lg.addColorStop(1, "rgba(4,7,12,0)");
        g.fillStyle = lg; g.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2); });
      // the stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]; if (!vis(s[0], s[1], 0)) continue;
        const p = toScreen(s[0], s[1], W, H, ppd), tw = k.reduce ? 1 : .72 + .28 * Math.sin(t * (1 + s[3] * .3) + s[3] * 9);
        const al = (.22 + s[2] * .78) * tw, sz = .6 + s[2] * 1.5;
        if (s[2] > .6) { g.fillStyle = `rgba(235,240,255,${al * .14})`; g.beginPath(); g.arc(p.x, p.y, sz * 2.4, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = s[4] ? `rgba(255,226,200,${al})` : `rgba(240,244,255,${al})`;
        g.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      // the three gold stars: faint until found, then warm and steady
      gold.forEach((s) => {
        if (!vis(s.az, s.alt, 4)) return; const p = toScreen(s.az, s.alt, W, H, ppd);
        const b = s.found ? 1 : .32 + .14 * Math.sin(t * 2 + s.i) + s.glow * .6, r = 2 + b * 2.6;
        const hg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * (s.found ? 9 : 6)); hg.addColorStop(0, `rgba(226,196,138,${.5 * b})`); hg.addColorStop(1, "rgba(226,196,138,0)");
        g.fillStyle = hg; g.beginPath(); g.arc(p.x, p.y, r * (s.found ? 9 : 6), 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(255,236,190,${Math.min(1, .55 + b * .45)})`; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
        if (s.found && !k.reduce) { g.strokeStyle = `rgba(255,236,190,${.35 + .15 * Math.sin(t * 1.5 + s.i)})`; g.lineWidth = 1; const L = r * 4;
          g.beginPath(); g.moveTo(p.x - L, p.y); g.lineTo(p.x + L, p.y); g.moveTo(p.x, p.y - L); g.lineTo(p.x, p.y + L); g.stroke(); }
      });
      // shooting stars
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]; s.t += dt; if (s.t > s.life) { shoots.splice(i, 1); continue; }
        const f = s.t / s.life, az = s.az + s.vaz * s.t, alt = s.alt + s.valt * s.t, p = toScreen(az, alt, W, H, ppd), q = toScreen(az - s.vaz * .18, alt - s.valt * .18, W, H, ppd);
        const lg = g.createLinearGradient(q.x, q.y, p.x, p.y); lg.addColorStop(0, "rgba(245,240,232,0)"); lg.addColorStop(1, `rgba(245,240,232,${.85 * Math.sin(f * Math.PI)})`);
        g.strokeStyle = lg; g.lineWidth = 1.4; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(p.x, p.y); g.stroke();
      }
      // the treeline and the dome, lit, small in its clearing
      if (hy < H + 2) {
        g.fillStyle = camOn ? "rgba(3,5,4,.82)" : "#030504"; g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) { const az = vaz + (x - W / 2) / ppd; g.lineTo(x, hy - ridgeAt(az) * ppd); }
        g.lineTo(W, H); g.closePath(); g.fill();
        const dx = wrap(DOME_AZ - vaz);
        if (Math.abs(dx) < halfW + 6) {
          const cx = W / 2 + dx * ppd, R = 2.4 * ppd, by = hy - ridgeAt(DOME_AZ) * ppd + 1;
          const dg = g.createRadialGradient(cx, by - R * .4, 0, cx, by - R * .4, R * 3.4); dg.addColorStop(0, "rgba(226,196,138,.24)"); dg.addColorStop(1, "rgba(226,196,138,0)");
          g.fillStyle = dg; g.fillRect(cx - R * 3.4, by - R * 3.8, R * 6.8, R * 6.8);
          // a geodesic half-sphere: rows of triangles stepping up, lit from within (as on the still sky)
          const rows = 4, pts = [];
          for (let r = 0; r <= rows; r++) { const th = (r / rows) * Math.PI / 2, n = Math.max(1, Math.round((rows - r) * 2.2)), hw = R * Math.cos(th), y = by - R * .92 * Math.sin(th);
            pts.push(Array.from({ length: n + 1 }, (_, j) => [cx - hw + (2 * hw * j) / n, y])); }
          g.lineWidth = 1; g.strokeStyle = "rgba(255,226,170,.8)";
          for (let r = 0; r < rows; r++) { const A = pts[r], B = pts[r + 1]; let i = 0, j = 0, n = 0;
            while (i < A.length - 1 || j < B.length - 1) {
              const useA = j >= B.length - 1 || (i < A.length - 1 && (i + 1) / (A.length - 1) <= (j + 1) / Math.max(1, B.length - 1));
              g.beginPath(); g.moveTo(...A[i]); g.lineTo(...B[j]); if (useA) { g.lineTo(...A[i + 1]); i++; } else { g.lineTo(...B[j + 1]); j++; } g.closePath();
              g.fillStyle = `rgba(${200 + (n * 37) % 50},${150 + (n * 23) % 40},${80 + (n * 11) % 30},${.22 + ((n * 7) % 5) * .05 + (r === 0 ? .15 : 0)})`; g.fill(); g.stroke(); n++; } }
        }
      }
      // the hint: a gold glimmer at the edge, toward the nearest star still hidden
      const s = !done && nearest();
      if (s) {
        const p = toScreen(s.az, s.alt, W, H, ppd), m = 26;
        if (p.x < m || p.x > W - m || p.y < m || p.y > H - m) {
          const cx = W / 2, cy = H / 2, ddx = p.x - cx, ddy = p.y - cy, sc = Math.min((W / 2 - m) / Math.abs(ddx || 1e-6), (H / 2 - m) / Math.abs(ddy || 1e-6));
          const ex = cx + ddx * sc, ey = cy + ddy * sc, pulse = k.reduce ? .7 : .55 + .45 * Math.sin(t * 2.2), r = 26 + pulse * 10;
          const hg = g.createRadialGradient(ex, ey, 0, ex, ey, r); hg.addColorStop(0, `rgba(226,196,138,${.42 * pulse})`); hg.addColorStop(1, "rgba(226,196,138,0)");
          g.fillStyle = hg; g.beginPath(); g.arc(ex, ey, r, 0, Math.PI * 2); g.fill();
          g.fillStyle = `rgba(255,236,190,${.5 + .4 * pulse})`; g.beginPath(); g.arc(ex, ey, 1.8, 0, Math.PI * 2); g.fill();
        }
      }
      // the reticle: a quiet circle at the centre, warming as a star settles in it
      if (!done) {
        const cx = W / 2, cy = H / 2, lk = s ? s.glow : 0, r = 34 - lk * 6;
        g.strokeStyle = `rgba(245,240,232,${.22 + lk * .5})`; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = `rgba(226,196,138,${.3 + lk * .6})`;
        for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4)); g.lineTo(cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10)); g.stroke(); }
      }
    }
  }
});
