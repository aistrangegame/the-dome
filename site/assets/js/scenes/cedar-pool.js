/* The cedar plunge pool: let the water settle.
   Preview: rest a finger or the cursor on the water and keep it still (or hold Space); moving it stirs the water.
   Full, on the edge of the tub: hold the phone still; the motion sensor is the hand.
   After padakarshini "Water level (steady the vessel)": an event knocks the water every few seconds; stillness counts. */
Scene.register("cedar-pool", {
  title: "Let the water settle",
  line: "A breeze keeps finding the water. Rest your hand on it, and stay still.",
  full: true,
  voiceAt: "top",
  fullEnd: "Still water. Get in when you're ready.",
  mount(k) {
    const { g } = k.canvas();
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    let ex = 0, ey = 0, vx = 0, vy = 0, energy = 0.6, calm = 0, done = false, resting = false, still = 0, nextKnock = 2.5, lastSay = "";
    let hand = null, handMoved = 0, motionJitter = 0;
    const rings = [], leaves = [];
    const NEED = 16;
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say(k.mode === "full" ? "Sit on the edge and hold the phone still, flat in your hands." : "Rest a finger or the cursor on the water and keep it still (or hold Space).");

    k.drag(({ x, y, dx, dy, down, key }) => {
      hand = down ? { x, y } : null; resting = down;
      const m = Math.hypot(dx, dy);
      if (down && m > 2 && !key) { handMoved = Math.min(1, handMoved + m / 60); stir(x, y, Math.min(1, m / 40)); }
    });
    k.hold((on) => { if (!on) { resting = false; hand = null; } else if (!hand) { resting = true; } });
    if (k.mode === "full") {
      let pb = null, pg = null;
      k.sensor.tilt((e) => { if (e.motion) return; if (pb != null) motionJitter = Math.min(1, motionJitter * .9 + (Math.abs(e.beta - pb) + Math.abs(e.gamma - pg)) / 12); pb = e.beta; pg = e.gamma; resting = true; })
        .then((ok) => { if (!ok) say("No motion sensor here: rest a finger on the water instead."); });
    }

    function stir(x, y, s) { const { W, H } = view(); const c = centre(W, H); vx += (x - c.x) / c.r * s * .8; vy += (y - c.y) / c.r * s * .8; energy = Math.min(1.4, energy + s * .25); rings.push({ x, y, t: 0, s }); if (s > .4) k.noise(.25, .04 * s, 900); }
    function knock() {
      const { W, H } = view(), c = centre(W, H), a = Math.random() * Math.PI * 2, d = c.r * (.3 + Math.random() * .5);
      const x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
      rings.push({ x, y, t: 0, s: .9 }); vx += Math.cos(a) * .9; vy += Math.sin(a) * .9; energy = Math.min(1.4, energy + .35);
      if (Math.random() < .5) leaves.push({ x, y, r: 6 + Math.random() * 5, a: Math.random() * 6, t: 0 });
      k.tone(520 + Math.random() * 200, .5, .04);
    }
    const centre = (W, H) => ({ x: W / 2, y: H / 2, r: Math.min(W, H) * .4 });

    k.loop((dt, t) => {
      const { W, H } = view();
      nextKnock -= dt; if (nextKnock <= 0 && !done) { knock(); nextKnock = 6.5 + Math.random() * 3 + calm * .15; }
      // the water: a spring back to level, damped hard by a still hand, stirred by a moving one (or a shaking phone)
      const hold = resting && handMoved < .15 && motionJitter < .25;
      const damp = hold ? 3.2 : 0.5;
      vx += (-ex * 9 - vx * damp) * dt; vy += (-ey * 9 - vy * damp) * dt; ex += vx * dt; ey += vy * dt;
      energy += (-(hold ? 0.95 : 0.08) * energy + motionJitter * .3) * dt; energy = Math.max(0, energy);
      handMoved = Math.max(0, handMoved - dt * 1.5);
      const level = Math.min(1, Math.hypot(ex, ey) * .7 + energy);
      if (!done) {
        if (level < .16) { calm += dt; say(calm > NEED * .66 ? "Nearly still." : "Still. Stay with it."); }
        else say(hold ? "Good. Let it come to you." : resting ? "Gently. Keep your hand still." : k.mode === "full" ? "Hold the phone still." : "Rest your hand on the water.");
        k.progress(calm / NEED);
        if (calm > NEED / 3) k.reveal(0);
        if (calm > NEED * 2 / 3) k.reveal(1);
        if (calm >= NEED) { done = true; say(""); k.done(); }
      }
      draw(W, H, t, dt, level);
    });

    function draw(W, H, t, dt, level) {
      const c = centre(W, H);
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      // the cedar tub, seen from above: a ring of staves
      g.save(); g.translate(c.x, c.y);
      for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; g.rotate(Math.PI * 2 / 48); g.fillStyle = i % 2 ? "#6B4528" : "#7A5030"; g.fillRect(c.r * 1.0, -c.r * .07, c.r * .14, c.r * .135); }
      g.restore();
      g.strokeStyle = "#3A2618"; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, c.r * 1.14, 0, Math.PI * 2); g.stroke();
      // the water
      g.save(); g.beginPath(); g.arc(c.x, c.y, c.r, 0, Math.PI * 2); g.clip();
      const wg = g.createRadialGradient(c.x, c.y, c.r * .1, c.x, c.y, c.r); wg.addColorStop(0, "#16302E"); wg.addColorStop(1, "#0B1A19"); g.fillStyle = wg; g.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      // the sky's reflection slides as the water rocks
      const hx = c.x - c.r * .25 + ex * c.r * .5 + Math.sin(t * 1.3) * level * 10, hy = c.y - c.r * .3 + ey * c.r * .5;
      const hl = g.createRadialGradient(hx, hy, 2, hx, hy, c.r * (.55 + level * .2)); hl.addColorStop(0, `rgba(200,225,235,${.22 - level * .08})`); hl.addColorStop(1, "rgba(200,225,235,0)"); g.fillStyle = hl; g.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      // rings
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; if (r.t > 3.2) { rings.splice(i, 1); continue; }
        for (let j = 0; j < 3; j++) { const rr = (r.t * 70 + j * 16) * (1 + r.s); const a = (1 - r.t / 3.2) * .35 * r.s; if (a <= 0) continue; g.strokeStyle = `rgba(200,230,240,${a})`; g.lineWidth = 1.2; g.beginPath(); g.arc(r.x, r.y, rr, 0, Math.PI * 2); g.stroke(); } }
      // a fine shimmer while it's moving
      if (!k.reduce) { g.strokeStyle = `rgba(200,230,240,${level * .12})`; g.lineWidth = 1; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(c.x + ex * 20, c.y + ey * 20, c.r * i / 6 + Math.sin(t * 3 + i) * level * 6, c.r * i / 6, 0, 0, Math.PI * 2); g.stroke(); } }
      // leaves drift on the surface
      leaves.forEach((l) => { l.t += dt; l.x += vx * 14 * dt; l.y += vy * 14 * dt; l.a += dt * .3; g.save(); g.translate(l.x, l.y); g.rotate(l.a); g.fillStyle = "rgba(201,169,110,.85)"; g.beginPath(); g.ellipse(0, 0, l.r, l.r * .45, 0, 0, Math.PI * 2); g.fill(); g.restore(); });
      if (leaves.length > 6) leaves.shift();
      // the hand
      if (hand) { g.fillStyle = "rgba(245,240,232,.12)"; g.beginPath(); g.arc(hand.x, hand.y, 26, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }
});
