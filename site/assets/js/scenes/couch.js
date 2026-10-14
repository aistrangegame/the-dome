/* The couch: one song, face down.
   Preview: rest a finger or the cursor on the couch and keep it there, still (or hold Space), for one short song;
   moving while resting gently pauses it. The song is slow sine chords if sound is on; the room carries it if not.
   Full, on the couch: lay the phone face down and the song plays; lift it and the song waits.
   After Ashrey's "lay the phone face down for one song" and padakarshini "Be still" (remembering-plan §4, light). */
Scene.register("couch", {
  title: "One song, face down",
  line: "Put your phone face down for one song’s length, and let the evening go on without you.",
  full: true,
  voiceAt: "top",
  fullEnd: "One whole song. The valley kept going without you.",
  mount(k) {
    const { g } = k.canvas();
    k.stage.style.touchAction = "none"; k.stage.addEventListener("contextmenu", (e) => e.preventDefault());   // a long press is the game, not a menu
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const BEAT = 1.25, BEATS = 32, SONG = BEAT * BEATS;      // forty seconds
    const CH = [[146.83, 185, 220, 277.18], [123.47, 146.83, 185, 220], [98, 123.47, 146.83, 185], [110, 138.59, 164.81, 220]];
    const ARP = [0, 1, 2, 3, 2, 1, 2, 3];
    let song = 0, beat = -1, holding = false, still = 0, stir = 0, moveAcc = 0, faceDown = false, done = false, lastSay = "", sensorOn = false;
    const rings = [];
    let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const stars = []; for (let i = 0; i < 70; i++) stars.push({ x: rnd(), y: rnd(), r: rnd() < .15 ? 1.5 : .9, tw: rnd() * 6 });
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say(k.mode === "full" ? "Lay your phone face down on the couch, and leave it there for one song." : "Rest a finger or the cursor on the couch and keep it still (or hold Space). One song.");

    k.hold((on) => { holding = on; moveAcc = 0; });
    let hand = null;
    k.drag(({ x, y, dx, dy, down, key }) => { hand = down && !key ? { x, y } : null; if (down && holding) { moveAcc += Math.hypot(dx, dy) * (key ? 2 : 1); if (moveAcc > 12) { stir = 1.4; moveAcc = 0; } } });
    if (k.mode === "full") {
      const ios = typeof (window.DeviceMotionEvent || {}).requestPermission === "function" || /iP(hone|ad|od)/.test(navigator.userAgent);
      let byBeta = false, byAcc = false;
      k.sensor.tilt((e) => {
        sensorOn = true;
        if (e.motion) byAcc = ios ? e.az > 7.5 : e.az < -7.5;      // face down: iOS reports gravity as +z, Android as -z
        else byBeta = Math.abs(e.beta) > 150;                      // face down: beta near ±180 on both
        faceDown = byBeta || byAcc;
      }).then((ok) => { if (!ok) say("No motion sensor here: rest your hand on the couch and stay still instead."); });
    }

    k.loop((dt, t) => {
      const { W, H } = view();
      if (!W || !H) return;
      moveAcc = Math.max(0, moveAcc - dt * 30); stir = Math.max(0, stir - dt);
      const playing = !done && (faceDown || (holding && stir <= 0));
      if (playing) {
        song = Math.min(SONG, song + dt);
        const b = Math.floor(song / BEAT);
        if (b !== beat && b < BEATS) { beat = b; play(b, W, H); }
      }
      if (!done) {
        k.progress(song / SONG);
        if (song > SONG / 3) k.reveal(0);
        if (song > SONG * 2 / 3) k.reveal(1);
        if (song >= SONG) { done = true; say(""); k.tone(293.66, 5, .04); k.tone(440, 5, .025); k.tone(554.37, 5, .02); k.done(); }
        else if (playing) say(song > SONG * .8 ? "The last few bars." : faceDown ? "Face down. Let it play." : "That’s it. Just listen.");
        else if (holding && stir > 0) say("Stay still. The song waits.");
        else if (k.mode === "full" && sensorOn) say(song > 0 ? "Lifted. Lay it face down again when you’re ready." : "Lay your phone face down on the couch, and leave it there for one song.");
        else if (song > 0) say("The song waits for you. Rest your hand again.");
      }
      draw(W, H, t, dt, playing);
    });

    function play(b, W, H) {
      const c = CH[Math.floor(b / 8) % 4];
      if (b % 8 === 0) k.tone(c[0] / 2, 7, .045);
      k.tone(c[ARP[b % 8]] * 2, 3.2, .03);
      if (b % 2 === 0) k.tone(c[(b / 2) % 4] * 4, 2.6, .012);
      if (!k.reduce && rings.length < 14) { const p = phone(W, H); rings.push({ x: p.x + p.w / 2, y: p.y, t: 0, big: b % 8 === 0 }); }
    }
    const phone = (W, H) => ({ x: W * .66, y: H * .705, w: Math.min(W, H) * .1 });

    function draw(W, H, t, dt, playing) {
      const p = song / SONG;                        // dusk deepens to night across the song
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      const x0 = W * .06, x1 = W * .94, y0 = H * .3, y1 = H * .76;
      // the valley at dusk, through the triangles
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      const sky = g.createLinearGradient(0, y0, 0, y1);
      sky.addColorStop(0, mix([58, 54, 82], [8, 13, 26], p)); sky.addColorStop(.7, mix([201, 138, 90], [28, 36, 52], p)); sky.addColorStop(1, mix([232, 180, 120], [40, 46, 58], p));
      g.fillStyle = sky; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let i = 0; i < stars.length; i++) { const s = stars[i], a = Math.max(0, p * 1.4 - .25 - s.y * .3) * (k.reduce ? .8 : .6 + .3 * Math.sin(t + s.tw));
        if (a > .02) { g.fillStyle = `rgba(245,240,232,${Math.min(.9, a)})`; g.fillRect(x0 + s.x * (x1 - x0), y0 + s.y * (y1 - y0) * .55, s.r, s.r); } }
      // the moon comes up over the far ridge
      const mx = x0 + (x1 - x0) * (.22 + p * .12), my = y1 - (y1 - y0) * (.25 + p * .45), mr = Math.min(W, H) * .028;
      if (p > .05) { const ma = Math.min(1, (p - .05) * 3); g.fillStyle = `rgba(245,236,214,${ma * .9})`; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(245,236,214,${ma * .08})`; g.beginPath(); g.arc(mx, my, mr * 4, 0, Math.PI * 2); g.fill(); }
      hill(x0, x1, y1 - (y1 - y0) * .32, (y1 - y0) * .12, 1.3, mix([74, 70, 92], [16, 22, 32], p));
      hill(x0, x1, y1 - (y1 - y0) * .16, (y1 - y0) * .1, 3.1, mix([44, 46, 56], [10, 14, 18], p));
      g.restore();
      // the struts: one band of the dome, triangles of glass
      const n = W > H ? 8 : 5, tw = (x1 - x0) / n;
      g.strokeStyle = "#1E1912"; g.lineWidth = Math.max(4, W * .006); g.lineJoin = "round"; g.beginPath();
      g.rect(x0, y0, x1 - x0, y1 - y0); g.moveTo(x0, (y0 + y1) / 2); g.lineTo(x1, (y0 + y1) / 2);
      for (let i = 0; i < n; i++) { const a = x0 + i * tw; g.moveTo(a, y1); g.lineTo(a + tw / 2, (y0 + y1) / 2); g.lineTo(a + tw, y1); g.moveTo(a, y0); g.lineTo(a + tw / 2, (y0 + y1) / 2); g.lineTo(a + tw, y0); }
      g.stroke();
      g.strokeStyle = `rgba(226,196,138,${.16 + (1 - p) * .12})`; g.lineWidth = 1; g.stroke();
      // a floor lamp on the left warms as the light goes
      const lx = W * .1, lt = H * .5, la = .25 + p * .55;
      const lg = g.createRadialGradient(lx, lt, 4, lx, lt, Math.max(W, H) * .45); lg.addColorStop(0, `rgba(240,180,100,${la * .5})`); lg.addColorStop(1, "rgba(240,180,100,0)");
      const lr = Math.max(W, H) * .45; g.fillStyle = lg; g.fillRect(0, Math.max(0, lt - lr), lx + lr, Math.min(H, lr * 2));
      g.strokeStyle = "#2B231A"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, lt); g.lineTo(lx, H); g.stroke();
      g.fillStyle = `rgba(232,200,150,${.5 + la * .5})`; g.beginPath(); const sw = Math.min(W, H) * .05; g.moveTo(lx - sw * .6, lt - sw); g.lineTo(lx + sw * .6, lt - sw); g.lineTo(lx + sw, lt); g.lineTo(lx - sw, lt); g.closePath(); g.fill();
      // the couch, from behind: its long back, soft cushion tops, a throw over one end
      const cy = H * .7, cl = W * .14, cr = W * .97, bumps = W > H ? 4 : 3, bw = (cr - cl) / bumps;
      const cg = g.createLinearGradient(0, cy - H * .04, 0, H); cg.addColorStop(0, mix([74, 58, 44], [52, 40, 31], p)); cg.addColorStop(.35, "#30251C"); cg.addColorStop(1, "#1A140F");
      g.fillStyle = cg; g.beginPath(); g.moveTo(cl, H + 2); g.lineTo(cl, cy + 10);
      for (let i = 0; i < bumps; i++) { const a = cl + i * bw; g.quadraticCurveTo(a + bw / 2, cy - H * .035, a + bw, cy + 10); }
      g.lineTo(cr, H + 2); g.closePath(); g.fill();
      g.strokeStyle = `rgba(226,196,138,${.22 + (1 - p) * .25})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cl, cy + 10);
      for (let i = 0; i < bumps; i++) { const a = cl + i * bw; g.quadraticCurveTo(a + bw / 2, cy - H * .035, a + bw, cy + 10); }
      g.stroke();
      // seams between the cushions
      g.strokeStyle = "rgba(0,0,0,.28)"; g.lineWidth = 2; g.beginPath();
      for (let i = 1; i < bumps; i++) { const a = cl + i * bw; g.moveTo(a, cy + 12); g.lineTo(a, H); } g.stroke();
      // a knitted throw left over the back
      const tx = cl + bw * .18, tw2 = bw * .5, tg = g.createLinearGradient(tx, 0, tx + tw2, 0);
      tg.addColorStop(0, "#8E7B62"); tg.addColorStop(.5, "#B29C7C"); tg.addColorStop(1, "#7E6C55");
      g.fillStyle = tg; g.beginPath(); g.moveTo(tx, cy - H * .012); g.quadraticCurveTo(tx + tw2 * .5, cy - H * .04, tx + tw2, cy - H * .008);
      g.bezierCurveTo(tx + tw2 * 1.05, cy + H * .1, tx + tw2 * .92, cy + H * .16, tx + tw2 * .96, cy + H * .2);
      g.quadraticCurveTo(tx + tw2 * .55, cy + H * .23, tx + tw2 * .08, cy + H * .19);
      g.bezierCurveTo(tx + tw2 * .02, cy + H * .12, tx - tw2 * .06, cy + H * .06, tx, cy - H * .012); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,46,32,.35)"; g.lineWidth = 1; g.beginPath();
      for (let i = 1; i < 6; i++) { const fx = tx + tw2 * i / 6; g.moveTo(fx, cy - H * .02); g.quadraticCurveTo(fx + tw2 * .03, cy + H * .1, fx - tw2 * .02 * i, cy + H * .2); } g.stroke();
      // the phone, face down on the cushion; its screen glows at the edges while the song plays
      const ph = phone(W, H);
      if (song > 0 && !done) { const ga = playing ? .45 + (k.reduce ? 0 : .15 * Math.sin(t * 2.5)) : .15;
        const gg = g.createRadialGradient(ph.x + ph.w / 2, ph.y, 2, ph.x + ph.w / 2, ph.y, ph.w * 1.3); gg.addColorStop(0, `rgba(226,196,138,${ga})`); gg.addColorStop(1, "rgba(226,196,138,0)");
        g.fillStyle = gg; g.fillRect(ph.x - ph.w, ph.y - ph.w, ph.w * 3, ph.w * 2); }
      g.fillStyle = "#0E0F10"; g.beginPath(); g.moveTo(ph.x + ph.w * .12, ph.y - ph.w * .12); g.lineTo(ph.x + ph.w, ph.y - ph.w * .12); g.lineTo(ph.x + ph.w * .88, ph.y + ph.w * .12); g.lineTo(ph.x, ph.y + ph.w * .12); g.closePath(); g.fill();
      g.strokeStyle = "rgba(245,240,232,.18)"; g.lineWidth = 1; g.stroke();
      // your hand, resting
      if (hand && holding) { g.fillStyle = stir > 0 ? "rgba(245,240,232,.06)" : "rgba(245,240,232,.12)"; g.beginPath(); g.arc(hand.x, hand.y, 24, 0, Math.PI * 2); g.fill(); }
      // the song, seen: soft rings off the phone
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; if (r.t > 4) { rings.splice(i, 1); continue; }
        const a = (1 - r.t / 4) * (r.big ? .35 : .22); g.strokeStyle = `rgba(226,196,138,${a})`; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(r.x, r.y - r.t * H * .03, (r.big ? 20 : 12) + r.t * ph.w * .9, ((r.big ? 20 : 12) + r.t * ph.w * .9) * .35, 0, 0, Math.PI * 2); g.stroke(); }
    }

    function hill(x0, x1, base, amp, f, col) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x0, base + amp * 3);
      for (let x = x0; x <= x1 + 6; x += 6) g.lineTo(x, base - amp * (.5 + .5 * Math.sin(x / (x1 - x0) * 6 + f) * Math.cos(x / (x1 - x0) * 2.3 - f)));
      g.lineTo(x1 + 6, base + amp * 3); g.closePath(); g.fill();
    }
    function mix(a, b, f) { return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`; }
  }
});
