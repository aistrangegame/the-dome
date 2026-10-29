/* II · Raised by hand. Straight lines, lifted into a curve. Two pairs of hands; the first struts drawn flat on the meadow
   and lifted into place one at a time; then the rings rise faster than the eye can follow while the point climbs the
   outside of the dome, until the last strut closes at the top and the point becomes the hub there. This is the only time
   the lattice is drawn. Every later chapter lights, dims or lifts these same lines. */
(function () {
  const { path, dome, R } = window.SD;
  const WOOD = "#D9A066", HUB = "#FFE2A8", CREAM = "#F5F0E8", K = "#E2B477";
  SD.chapter({
    n: 2, cam: { cx: 0, cy: -30, w: 1040 }, bg: "#1A1410", k: K, bed: "room", tone: 174,
    words: {
      k: "II · Raised by hand", h: "Straight lines, lifted into a curve.",
      p: ["Struts, hubs, triangles. Cody and Nicole built me by hand, one triangle at a time, until a round thing stood up out of nothing but straight pieces. That is the trick of a dome: no single part is curved. The curve is what they make together."],
      slot: "cn_began",
    },
    build(ctx) {
      const d = dome();
      ctx.svg.querySelector("#defs").insertAdjacentHTML("beforeend", `<radialGradient id="hub2"><stop offset="0" stop-color="#FFE2A8" stop-opacity=".9"/><stop offset=".3" stop-color="#FFE2A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></radialGradient>`);
      // two pairs of hands, from the left and the right, reaching in to the rim: a forearm, a palm, four fingers and a
    // thumb each, cream, never a face. sx mirrors; y is the wrist's height
    const hand = (sx, y) => { const m = (x) => (sx * x).toFixed(0); return `M${m(500)} ${y + 90} C${m(452)} ${y + 56} ${m(410)} ${y + 24} ${m(368)} ${y} M${m(368)} ${y} c${m(-2)} -14 ${m(10)} -22 ${m(26)} -22 c${m(12)} 0 ${m(24)} 4 ${m(34)} 10 M${m(328)} ${y - 12} l${m(38)} -16 M${m(326)} ${y - 6} l${m(42)} -7 M${m(326)} ${y} l${m(40)} 3 M${m(330)} ${y + 6} l${m(34)} 12 M${m(360)} ${y + 2} l${m(26)} 18`; };
    const hands = [[-1, 150], [-1, 62], [1, 150], [1, 62]].map(([sx, y], i) => ctx.el("scene", path(hand(sx, y), CREAM, 2.1, "ch2-hand", `data-d="${i * 14}" opacity=".95" stroke-linecap="round"`)));
    // the struts, lowest first (the order they were raised), and a hub at every joint
      const lat = ctx.el("lattice", `<g class="lattice-g"></g>`);
      const struts = d.struts.map((s, i) => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("class", "ln strut"); p.setAttribute("pathLength", "1"); p.setAttribute("d", `M${s.a[0]} ${s.a[1]} L${s.b[0]} ${s.b[1]}`); p.setAttribute("stroke", WOOD); p.setAttribute("stroke-width", "1.35"); p.dataset.d = i; p.dataset.i = i; lat.append(p); return p; });
      const seen = new Map(); d.struts.forEach((s) => [s.a, s.b].forEach((p) => seen.set(p.join(","), p)));
      const hubs = ctx.el("lattice", `<g class="hubs">${[...seen.values()].map((p) => `<circle class="fill" cx="${p[0]}" cy="${p[1]}" r="1.7" fill="${HUB}"/>`).join("")}</g>`);
      // the first six struts are lifted from the meadow: they start flat, below where they belong
      const first = struts.slice(0, 6); first.forEach((p) => (p.style.transform = "translate(0px, 150px)"));
      // the glow the top hub gives off when the last strut closes
      const crown = ctx.el("hero", `<circle class="fill ch2-crown" cx="${d.top[0]}" cy="${d.top[1]}" r="150" fill="url(#hub2)"/>`);
      return { d, hands, lat, struts, hubs: [...hubs.querySelectorAll("circle")], first, crown };
    },
    async play(ctx, b) {
      ctx.svg.querySelector("#point .pt-halo").classList.remove("breathe");
      ctx.phrases(600, 9000);
      // hands come in from both sides
      ctx.cascade(b.hands, 900, 20);
      await ctx.glide(-120, 290, 1400, true);
      // the first struts: each drawn straight on the meadow, then lifted into its place
      b.lat.classList.add("glow");
      for (const p of b.first) {
        await ctx.draw(p, .34, { glide: 260, ease: (f) => f });
        p.animate([{ transform: "translate(0px, 150px)" }, { transform: "translate(0px, 0px)" }], { duration: 650, easing: "cubic-bezier(.3,.9,.3,1)", fill: "forwards" });
        ctx.tick();
        await ctx.wait(120);
      }
      await ctx.wait(500);
      // then faster than the eye: ring after ring rises from the ground while the point climbs the outside of the dome
      if (SD.built[1]) ctx.fade(SD.built[1].under, .12, 1800);
      const rest = b.struts.slice(6), N = rest.length, span = 5600;
      rest.forEach((p, i) => (p.dataset.d = i));
      ctx.cascade(rest, 420, span / N);
      b.hubs.forEach((h, i) => setTimeout(() => h.classList.add("on"), 300 + (i / b.hubs.length) * span));
      const se = Math.sin(SD.ELEV), ce = Math.cos(SD.ELEV);
      await ctx.tween(span + 300, (e, f) => {
        const h = Math.min(1, f * 1.04), a = -Math.PI / 2 + f * Math.PI * 4.5, r = Math.sqrt(Math.max(0, 1 - h * h)) * 1.06;
        ctx.at(Math.cos(a) * r * R, -(h * ce - Math.sin(a) * r * se) * R - 8);
        if (Math.random() < .25) ctx.tick();
      }, (f) => f);
      // the last strut closes at the top, and the point becomes the hub there
      await ctx.glide(b.d.top[0], b.d.top[1], 500);
      await ctx.size(9, 700);
      b.crown.classList.add("on");
      ctx.sparks(b.d.top[0], b.d.top[1], 16, HUB, true);
      ctx.chord([174.61, 261.63, 349.23, 523.25]);
      // the whole lattice glows once, from the top down
      b.struts.forEach((p) => { const dist = Math.hypot((+p.getAttribute("d").split(/[ ML]+/)[1]) - b.d.top[0], (+p.getAttribute("d").split(/[ ML]+/)[2]) - b.d.top[1]); p.animate([{ stroke: WOOD }, { stroke: "#FFF1D2", offset: .3 }, { stroke: WOOD }], { duration: 1400, delay: dist * 1.6, easing: "ease-in-out" }); });
      await ctx.wait(1800);
      b.lat.classList.remove("glow");
      await ctx.size(5.5, 900);
      // the hands rest, lighter, and stay: they are part of the drawing now
      ctx.fade(b.hands, .3, 2600);
    },
    settle(ctx, b) {
      [...b.struts, ...b.hands].forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; });
      b.first.forEach((p) => (p.style.transform = "none"));
      b.hubs.forEach((h) => h.classList.add("on"));
      b.crown.classList.add("on"); b.lat.classList.remove("glow");
      b.hands.forEach((h) => (h.style.opacity = .3));
      if (SD.built[1]) SD.built[1].under.forEach((p) => (p.style.opacity = .12));
      ctx.svg.querySelector("#point .pt-halo").classList.remove("breathe");
      ctx.show(true); ctx.size(5.5, 0); ctx.at(b.d.top[0], b.d.top[1]);
    },
  });
})();
