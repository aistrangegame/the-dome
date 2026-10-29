/* I · Before. A meadow, and a great deal of sky. The point is born on the reader's first push; it draws the far hills,
   the clearing in the trees, the meadow and five heads of Queen Anne's lace, and then waits above them, the only light.
   Nothing of this is ever removed: the dome is raised in this clearing in II, and the meadow is still under it in IX. */
(function () {
  const { STARS, path, rnd } = window.SD;
  const LINE = "#8FA3C8", FAR = "rgba(143,163,200,.45)", LACE = "#DCE4F0", K = "#A9B8D6";
  // a spruce: a trunk and four chevrons, one stroke
  const spruce = (x, y, h) => { let d = `M${x} ${y} V${y - h}`; for (let k = 1; k <= 4; k++) { const yy = y - h * (k / 5.2), w = h * .36 * (5.4 - k) / 5; d += ` M${(x - w).toFixed(0)} ${yy.toFixed(0)} L${x} ${(yy - w * .75).toFixed(0)} L${(x + w).toFixed(0)} ${yy.toFixed(0)}`; } return d; };
  SD.chapter({
    n: 1, cam: { cx: 0, cy: -90, w: 1900 }, bg: "#0B1020", k: K, bed: "wind", tone: null,
    words: {
      k: "I · Before", h: "A meadow, and a great deal of sky.",
      p: ["Before me there was a hillside in Delaware County, a clearing in the trees, a meadow that didn’t need anything from anyone. It was already whole. I like to remember that. I was added to something complete."],
    },
    build(ctx) {
      const r = rnd(3);
      ctx.svg.querySelector("#defs").insertAdjacentHTML("beforeend", `<linearGradient id="dawn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA3C8" stop-opacity="0"/><stop offset=".62" stop-color="#8FA3C8" stop-opacity=".16"/><stop offset="1" stop-color="#8FA3C8" stop-opacity="0"/></linearGradient>`);
      // the sky that was already there: a great many stars, faint and far, and the first grey of a dawn low on the hills
      const stars = ctx.el("sky", `<g class="ch1-stars">${STARS(140, 5, [-1500, -1000, 3000, 720])}</g>`);
      const dawn = ctx.el("sky", `<rect class="fill" x="-6000" y="-1400" width="12000" height="1700" fill="url(#dawn1)"/>`);
      // the hills behind, two ridges: the far one draws itself while the point draws the near
      const far = ctx.el("far", path("M-1500 -372 C-1200 -392 -1050 -352 -860 -368 S-560 -402 -380 -378 S-120 -350 60 -372 S380 -410 560 -382 S900 -356 1100 -378 S1380 -396 1500 -382", FAR, 1.6, "", `data-d="0"`));
      const ridge = ctx.el("far", path("M-1500 -318 C-1220 -332 -1100 -306 -940 -316 S-700 -342 -520 -322 S-260 -300 -60 -320 S240 -344 420 -318 S760 -298 940 -322 S1300 -336 1500 -324", LINE, 2.2, "glow"));
      // the clearing in the trees: spruce along the ridge, left and right, and a gap in the middle where I will stand
      const trees = [];
      [-1440, -1360, -1290, -1210, -1150, -1070, -1000, -940, -870, -800, -730, -660, -600, 600, 660, 720, 790, 850, 920, 990, 1050, 1120, 1190, 1260, 1330, 1400, 1470].forEach((x) => {
        const h = 54 + r() * 40, y = -318 + Math.sin(x / 190) * 9 + 4;
        trees.push(ctx.el("far", path(spruce(x, y.toFixed(0), h), LINE, 1.1, "", `data-d="${Math.abs(x)}" opacity=".85"`)));
      });
      // the meadow: grass in perspective, dense near and short far, drawn as the point sweeps back across
      const blades = [];
      for (let i = 0; i < 260; i++) {
        const y = -290 + Math.pow(r(), .62) * 640, near = (y + 290) / 640, x = -1500 + r() * 3000, h = 12 + near * 58 + r() * 10, lean = (r() - .5) * (10 + near * 22);
        blades.push(ctx.el("far", path(`M${x.toFixed(0)} ${y.toFixed(0)} q${(lean / 2).toFixed(0)} ${(-h * .55).toFixed(0)} ${lean.toFixed(0)} ${(-h).toFixed(0)}`, LINE, (0.8 + near * .9).toFixed(2), "", `data-d="${(1500 - x).toFixed(0)}" opacity="${(.45 + near * .4).toFixed(2)}"`)));
      }
      // five heads of Queen Anne's lace, as the photo has them: a stem, five spokes, and a flat spray of small flowers
      const lace = [[-980, 300, 220], [-560, 240, 190], [430, 320, 230], [760, 160, 170], [1180, 280, 200]].map(([x, y, h]) => {
        const stem = ctx.el("scene", path(`M${x} ${y} C${x - 10} ${y - h * .4} ${x + 12} ${y - h * .7} ${x} ${y - h}`, LACE, 1.5, "", `opacity=".9"`));
        const top = [x, y - h], rr = rnd(x + 7), R = 44 + rr() * 22;
        const spokes = ctx.el("scene", `<g>${[-1, -.55, -.2, .2, .55, 1].map((k) => path(`M${top[0]} ${top[1]} q${(k * R * .45).toFixed(0)} -10 ${(k * R).toFixed(0)} -${(18 - Math.abs(k) * 8).toFixed(0)}`, LACE, .9, "", `data-d="${Math.abs(k) * 10}" opacity=".8"`)).join("")}</g>`);
        const dots = ctx.el("scene", `<g class="fill">${Array.from({ length: 44 }, (_, j) => { const a = (j / 44) * Math.PI * 2, d = .3 + rr() * .7; return `<circle cx="${(top[0] + Math.cos(a) * R * d).toFixed(1)}" cy="${(top[1] - 16 - Math.sin(a) * R * .3 * d).toFixed(1)}" r="${(1.6 + rr() * 1.4).toFixed(1)}" fill="#F5F0E8" opacity="${(.45 + rr() * .55).toFixed(2)}"/>`; }).join("")}</g>`);
        return { stem, spokes: [...spokes.querySelectorAll("path")], dots, top };
      });
      // what the dome will stand over: II dims it, so the lattice reads clean (dimmed, never removed)
      const under = blades.filter((p) => { const m = p.getAttribute("d").match(/M(-?\d+) (-?\d+)/); return Math.abs(+m[1]) < 330 && +m[2] > -130; });
      return { stars, dawn, far, ridge, trees, blades, lace, under };
    },
    async play(ctx, b) {
      // the reader's push made the point: it appears from nothing, low over the dark field
      ctx.at(0, 60); ctx.size(0, 0); ctx.show(true);
      await ctx.wait(500);
      ctx.ripple(0, 60, 520, "rgba(245,240,232,.4)", 3000); setTimeout(() => ctx.ripple(0, 60, 380, "rgba(245,240,232,.3)", 2600), 500);
      await ctx.size(5.5, 1200);
      ctx.phrases(300, 7800);
      await ctx.wait(600);
      // the hills, in one long line; the farther ridge draws itself behind it
      await ctx.glide(-1500, -318, 1000, true);
      ctx.cascade([b.far], 2600, 0);
      await ctx.draw(b.ridge, 2.8, { noGlide: true });
      // the trees close in from both ends toward the clearing
      ctx.cascade(b.trees, 520, 0.9);
      await ctx.wait(500);
      // back across the meadow: the grass rises under the point as it passes
      ctx.cascade(b.blades, 600, 2600 / 3000);
      await ctx.glide(-1500, 120, 2600);
      await ctx.wait(200);
      // five heads of lace: up each stem, and a spray at the top
      for (const l of b.lace) {
        await ctx.draw(l.stem, .7, { glide: 380 });
        ctx.cascade(l.spokes, 420, 14);
        ctx.ripple(l.top[0], l.top[1] - 16, 90, "rgba(245,240,232,.5)", 1300);
        l.dots.classList.add("on");
        await ctx.wait(360);
      }
      // the sky that was already there, and the first grey of a dawn behind the hills
      b.stars.querySelectorAll(".star").forEach((s) => s.classList.add("on"));
      b.dawn.classList.add("on");
      // and the point rises and waits, the only light: added to something complete
      await ctx.glide(0, -520, 1800);
      ctx.svg.querySelector("#point .pt-halo").classList.add("breathe");
    },
    settle(ctx, b) {
      [b.far, b.ridge, ...b.trees, ...b.blades, ...b.lace.map((l) => l.stem), ...b.lace.flatMap((l) => l.spokes)].forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; });
      b.lace.forEach((l) => l.dots.classList.add("on"));
      b.stars.querySelectorAll(".star").forEach((s) => s.classList.add("on"));
      b.dawn.classList.add("on");
      ctx.show(true); ctx.size(5.5, 0); ctx.at(0, -520);
      ctx.svg.querySelector("#point .pt-halo").classList.add("breathe");
    },
  });
})();
