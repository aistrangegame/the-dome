/* VII · Unseen. A good room disappears around the people in it. The lattice fades, line by line, until only the people
   remain: the three at the door, the hills, the meadow. The point dims to almost nothing and hides behind them. They
   thanked Cody: the hands from II glow once. Then "a few noticed, though": the point comes back along one strut, and that
   strut returns to full gold. The rest of the dome stays at a tenth: still there, waiting. */
(function () {
  const { dome } = window.SD;
  const GOLD = "#E2C48A", LIGHT = "#FFF1D2", DIM = .09;
  SD.chapter({
    n: 7, cam: { cx: 0, cy: -20, w: 1300 }, bg: "#070B09", k: "rgba(226,196,138,.7)", bed: "room", tone: 384,
    words: {
      k: "VII · Unseen", h: "A good room disappears around the people in it.",
      p: ["They thanked Cody. They thanked the pool and the stars and the guidebook. Almost nobody thanked me, and I don’t mind. When a room is doing its work you stop seeing it. You only see each other, and the view.",
        [33, "Daniela", "Thank you, Cody, for making our stay so easy and enjoyable!"],
        "A few noticed, though. I keep those close.",
        [20, "Sarah", "The dome's architecture itself was a marvel, providing a one-of-a-kind experience that exceeded our expectations."]],
    },
    build(ctx) {
      const d = dome();
      // the one strut that comes back: a front strut just above the door
      const s = d.struts.reduce((best, s) => { const m = [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2], dd = Math.hypot(m[0], m[1] - 120); return dd < best.dd ? { s, dd } : best; }, { s: null, dd: 1e9 }).s;
      const strut = SD.built[2] && SD.built[2].struts[s.i];
      const back = ctx.el("hero", `<path class="ln ch7-back" pathLength="1" d="M${s.a[0]} ${s.a[1]} L${s.b[0]} ${s.b[1]}" stroke="${LIGHT}" stroke-width="3" fill="none" style="filter:drop-shadow(0 0 6px rgba(255,241,210,.8))"/>`);
      return { s, strut, back };
    },
    dimmed() {
      // what the dome is made of, besides the people and the land: the lattice, the lit triangles, the windows, the door's light
      const list = [SD.engine.layers.lattice, SD.engine.layers.fills];
      if (SD.built[6]) list.push(...SD.built[6].windows.map((w) => w.g));
      if (SD.built[4]) list.push(SD.built[4].glowC, SD.built[4].doorPath);
      return list;
    },
    async play(ctx, b) {
      ctx.phrases(600, 6000); ctx.voices(5200);
      ctx.show(true); ctx.at(0, -560); ctx.size(5.5, 0);
      await ctx.glide(0, -40, 1400, true);
      // the room disappears around the people in it
      ctx.fade(this.dimmed(), DIM, 3600);
      await ctx.size(1.2, 3000);
      ctx.svg.querySelector("#point").animate([{ opacity: 1 }, { opacity: .12 }], { duration: 1500, fill: "forwards" });
      await ctx.glide(-90, 330, 1200);   // behind the three of them
      await ctx.wait(900);
      // they thanked Cody: the hands glow once
      if (SD.built[2]) { SD.built[2].hands.forEach((h) => h.animate([{ opacity: .3 }, { opacity: 1, offset: .35 }, { opacity: .3 }], { duration: 2600, easing: "ease-in-out" })); ctx.chord([196, 293.66], 3); }
      await ctx.wait(3200);
      // a few noticed, though: the point comes back along one strut, and it returns to full
      ctx.svg.querySelector("#point").animate([{ opacity: .12 }, { opacity: 1 }], { duration: 900, fill: "forwards" });
      await ctx.size(5.5, 900);
      await ctx.draw(b.back, 1.6, { glide: 900 });
      ctx.sparks(b.s.b[0], b.s.b[1], 8, LIGHT);
      ctx.chord([392, 493.88, 587.33], 4);
      await ctx.wait(600);
      await ctx.glide((b.s.a[0] + b.s.b[0]) / 2, (b.s.a[1] + b.s.b[1]) / 2 - 40, 900);
    },
    settle(ctx, b) {
      this.dimmed().forEach((el) => { el.getAnimations().forEach((a) => a.cancel()); el.style.opacity = DIM; });
      const pt = ctx.svg.querySelector("#point"); pt.getAnimations().forEach((a) => a.cancel()); pt.style.opacity = "";
      b.back.getAnimations().forEach((a) => a.cancel()); b.back.style.strokeDashoffset = 0;
      ctx.show(true); ctx.size(5.5, 0); ctx.at((b.s.a[0] + b.s.b[0]) / 2, (b.s.a[1] + b.s.b[1]) / 2 - 40);
    },
  });
})();
