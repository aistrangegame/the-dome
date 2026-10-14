/* The loft: lie back under the skylight and trace the dome's triangles overhead.
   Preview: drag from one point to the next along each line of the figure (either direction); arrow keys walk a cursor along the lines.
   Full (later): tilt the phone up to the real ceiling.
   After padakarshini "Trace the figure, line by line": every line traced glows and sounds; the whole figure completes it. */
Scene.register("loft", {
  title: "Trace the triangles",
  line: "Lie back. Above you, the dome is made of triangles. Trace them, line by line.",
  full: false,
  voiceAt: "bottom",
  mount(k) {
    const { g } = k.canvas();
    const scene = k.stage.closest(".scene");
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const NOTES = [392, 440, 523.25, 587.33, 659.25, 784, 880, 1046.5, 1174.66, 1318.5, 1568, 1760];
    const KW = 0.7, TK = Math.tanh(KW);
    // the figure: a centre and six points around it, flat-topped; six spokes and six rim lines
    const unit = [[0, 0]]; for (let i = 0; i < 6; i++) unit.push([Math.cos(i * Math.PI / 3), Math.sin(i * Math.PI / 3)]);
    const edges = []; for (let i = 1; i <= 6; i++) edges.push([0, i]); for (let i = 1; i <= 6; i++) edges.push([i, i % 6 + 1]);
    const traced = edges.map(() => 0), lit = edges.map(() => 0);
    const tris = [1, 2, 3, 4, 5, 6].map((i) => ({ e: [i - 1, i % 6, 6 + i - 1], a: 0 }));
    const stars = Array.from({ length: 70 }, () => { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * .95; return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: .4 + Math.random() * 1.2, p: Math.random() * 6 }; });
    let cur = null, ptr = null, down = false, kc = 0, kbd = false, count = 0, done = false, lastSay = "", glowAll = 0;
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Drag from one point to the next to trace each line. Arrow keys work too.");

    const frame = (W, H) => { const R = Math.min(W * .42, (H * .35 - 10) / .9); return { cx: W / 2, cy: H * .37, R }; };
    const warp = (ux, uy, F) => { const r = Math.hypot(ux, uy); if (r < 1e-6) return { x: F.cx, y: F.cy }; const r2 = Math.tanh(r * KW) / TK; return { x: F.cx + ux / r * r2 * F.R, y: F.cy + uy / r * r2 * F.R }; };
    const node = (i, F) => warp(unit[i][0], unit[i][1], F);
    const edgeOf = (a, b) => edges.findIndex(([p, q]) => (p === a && q === b) || (p === b && q === a));
    const neighbours = (a) => edges.filter(([p, q]) => p === a || q === a).map(([p, q]) => (p === a ? q : p));

    function trace(a, b) {
      const e = edgeOf(a, b); if (e < 0) return;
      if (!traced[e]) {
        traced[e] = 1; lit[e] = 0.001; const f = NOTES[count % NOTES.length]; count++;
        k.tone(f, 1.8, 0.05); k.tone(f * 1.5, 1.1, 0.012); k.haptic(8);
        k.progress(count / edges.length);
        if (count >= 4) k.reveal(0);
        if (count >= 8) k.reveal(1);
        if (count >= edges.length) { done = true; say(""); k.done(); }
        else say(edges.length - count <= 3 ? "Nearly whole." : "Line by line. Take your time.");
      }
    }

    // the finger or mouse: start on a point, slide to a neighbouring point
    k.drag(({ x, y, down: d, key }) => {
      if (key || done) return;
      const F = frame(view().W, view().H);
      ptr = { x, y }; kbd = false;
      if (d && !down) { cur = null; let best = 30; for (let i = 0; i < 7; i++) { const n = node(i, F), dd = Math.hypot(n.x - x, n.y - y); if (dd < best) { best = dd; cur = i; } } if (cur === null) say("Start on one of the points."); }
      down = d;
      if (!d) { cur = null; return; }
      if (cur !== null) for (const nb of neighbours(cur)) { const n = node(nb, F); if (Math.hypot(n.x - x, n.y - y) < 22) { trace(cur, nb); cur = nb; break; } }
    });

    // the keys: walk the cursor along the lines; it traces as it goes (fresh lines first when two lie the same way)
    scene.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d || done) return;
      e.preventDefault(); kbd = true; ptr = null;
      const F = frame(view().W, view().H), o = node(kc, F);
      let pick = null, score = -9;
      for (const nb of neighbours(kc)) {
        const n = node(nb, F), L = Math.hypot(n.x - o.x, n.y - o.y), dot = ((n.x - o.x) * d[0] + (n.y - o.y) * d[1]) / L;
        if (dot < 0.45) continue;
        const s = dot + (traced[edgeOf(kc, nb)] ? 0 : 1);
        if (s > score) { score = s; pick = nb; }
      }
      if (pick !== null) { trace(kc, pick); kc = pick; }
    });

    k.loop((dt, t) => {
      const { W, H } = view();
      for (let i = 0; i < lit.length; i++) if (lit[i] > 0 && lit[i] < 1) lit[i] = Math.min(1, lit[i] + dt / .7);
      tris.forEach((tr) => { if (tr.e.every((e) => traced[e])) tr.a = Math.min(1, tr.a + dt / 1.2); });
      if (done) glowAll = Math.min(1, glowAll + dt / 2);
      draw(W, H, t);
    });

    function line(a, b, F) {
      g.beginPath();
      for (let s = 0; s <= 10; s++) { const f = s / 10, p = warp(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, F); s ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }
    }

    function draw(W, H, t) {
      const F = frame(W, H);
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      const amb = g.createRadialGradient(F.cx, F.cy, F.R * .2, F.cx, F.cy, Math.max(W, H) * .8);
      amb.addColorStop(0, "#101B2C"); amb.addColorStop(.55, "#0A1119"); amb.addColorStop(1, "#070B09");
      g.fillStyle = amb; g.fillRect(0, 0, W, H);
      // the rest of the dome, faint, curving away overhead
      g.lineWidth = 1;
      const S = Math.sqrt(3) / 2;
      for (let dir = 0; dir < 3; dir++) {
        const a = dir * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a);
        for (let j = -6; j <= 6; j++) {
          const off = j * S, A = [ca * -7 - sa * off, sa * -7 + ca * off], B = [ca * 7 - sa * off, sa * 7 + ca * off];
          g.strokeStyle = `rgba(226,196,138,${.07 - Math.abs(j) * .006})`; line(A, B, F); g.stroke();
        }
      }
      // the skylight inside the figure: night sky and stars
      g.save(); g.beginPath();
      for (let i = 1; i <= 6; i++) { const p = node(i, F); i === 1 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y); } g.closePath(); g.clip();
      const sky = g.createRadialGradient(F.cx, F.cy, 0, F.cx, F.cy, F.R); sky.addColorStop(0, "#1A2A44"); sky.addColorStop(1, "#0D1626");
      g.fillStyle = sky; g.fillRect(F.cx - F.R * 1.2, F.cy - F.R * 1.2, F.R * 2.4, F.R * 2.4);
      stars.forEach((s) => { const a = k.reduce ? .7 : .45 + .45 * Math.sin(t * 1.3 + s.p); g.fillStyle = `rgba(245,240,232,${Math.min(1, a + glowAll * .3)})`; g.beginPath(); g.arc(F.cx + s.x * F.R, F.cy + s.y * F.R * .9, s.s, 0, Math.PI * 2); g.fill(); });
      // whole triangles warm
      tris.forEach((tr, i) => {
        if (!tr.a) return; const a = node(0, F), b = node(i + 1, F), c = node(i % 6 + 1, F);
        g.fillStyle = `rgba(226,196,138,${tr.a * .1 + glowAll * .06})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.closePath(); g.fill();
      });
      g.restore();
      // the figure's lines: faint until traced, then gold, with light running along them as they're drawn
      g.lineCap = "round";
      edges.forEach(([p, q], i) => {
        const A = unit[p], B = unit[q];
        if (traced[i]) {
          g.shadowColor = "rgba(240,200,120,.9)"; g.shadowBlur = 12; g.strokeStyle = "#E2C48A"; g.lineWidth = 2.6; line(A, B, F); g.stroke(); g.shadowBlur = 0;
          if (lit[i] < 1 && !k.reduce) { const f = lit[i], m = [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f], pp = warp(m[0], m[1], F);
            const hg = g.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, 18); hg.addColorStop(0, "rgba(255,240,200,.9)"); hg.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = hg; g.beginPath(); g.arc(pp.x, pp.y, 18, 0, Math.PI * 2); g.fill(); }
        } else { g.strokeStyle = "rgba(245,240,232,.24)"; g.lineWidth = 1.6; line(A, B, F); g.stroke(); }
      });
      // the line being drawn now
      if (cur !== null && ptr && down) { const n = node(cur, F); g.strokeStyle = "rgba(245,240,232,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(ptr.x, ptr.y); g.stroke(); }
      // the points
      for (let i = 0; i < 7; i++) {
        const n = node(i, F), on = neighbours(i).some((nb) => traced[edgeOf(i, nb)]);
        g.fillStyle = on ? "#F5E6C4" : "rgba(245,240,232,.6)"; g.beginPath(); g.arc(n.x, n.y, on ? 4.5 : 3.5, 0, Math.PI * 2); g.fill();
        if (cur === i && down) { g.strokeStyle = "rgba(245,240,232,.5)"; g.lineWidth = 1.5; g.beginPath(); g.arc(n.x, n.y, 14, 0, Math.PI * 2); g.stroke(); }
      }
      if ((kbd || !ptr) && !done) { const n = node(kc, F), r = k.reduce ? 13 : 13 + Math.sin(t * 3) * 2; g.strokeStyle = "#E2C48A"; g.lineWidth = 2; g.beginPath(); g.arc(n.x, n.y, r, 0, Math.PI * 2); g.stroke(); }
    }
  }
});
