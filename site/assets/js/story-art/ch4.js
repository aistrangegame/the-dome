/* IV · The first ones. The door opened, and I found out what I was for. The dark comes back, and with it the gold.
   Headlights come up the drive; a car; three figures walk to the door, two tall, one small. The door is the lowest
   triangle at the front of the dome, and the point goes into it and becomes the light in the doorway, falling on the
   three of them. That triangle is the first to fill: gold, with the guest's number inside it. August 2023. */
(function () {
  const { path, dome, HEAD } = window.SD;
  const GOLD = "#E2C48A", THIN = "rgba(226,196,138,.75)", CREAM = "#F5F0E8", LIGHT = "#FFF1D2";
  SD.chapter({
    n: 4, cam: { cx: 150, cy: 120, w: 1500 }, bg: "#0F0A06", k: GOLD, bed: "birds", tone: 210,
    words: {
      k: "IV · The first ones", h: "The door opened, and I found out what I was for.",
      p: ["Summer, 2023. The oldest words I have are from a family: Sarah, Matthew and their daughter Zoey. I had been standing for a while by then, but I think that was when I began.",
        [20, "Sarah", "I had an absolutely enchanting stay at the unique dome in the Catskills with my fiancé Matthew and our daughter Zoey."]],
    },
    build(ctx) {
      const d = dome(), door = d.faces[8];   // the lowest triangle at the front: the door
      ctx.svg.querySelector("#defs").insertAdjacentHTML("beforeend", `<radialGradient id="door4"><stop offset="0" stop-color="${LIGHT}" stop-opacity=".85"/><stop offset=".25" stop-color="${LIGHT}" stop-opacity=".3"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></radialGradient>
        <linearGradient id="beam4" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${LIGHT}" stop-opacity=".5"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></linearGradient>`);
      // the drive: from the bottom right of the meadow up to the door
      const drive = ctx.el("scene", path("M980 760 C820 700 700 640 560 560 S300 420 180 330 S60 262 24 236", THIN, 1.4, "", `opacity=".9"`));
      const drive2 = ctx.el("scene", path("M1040 720 C880 660 760 600 620 520 S360 384 240 296 S110 236 50 214", THIN, 1.1, "", `opacity=".6"`));
      // the car and its two cones of light, which travel up the drive together
      const car = ctx.el("scene", `<g class="ch4-car" opacity="0"><path class="ln" pathLength="1" d="M-46 0 h92 M-40 0 v-16 l12 -14 h44 l16 14 v16 M-30 -30 v16 M8 -30 v16 M-32 0 a8 8 0 1 0 0.1 0 M32 0 a8 8 0 1 0 0.1 0" fill="none" stroke="${CREAM}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke-dashoffset:0"/>
        <path class="fill beam" d="M-50 -20 L-330 -84 L-330 24 Z" fill="url(#beam4)"/><path class="fill beam" d="M-50 -6 L-330 -4 L-330 100 Z" fill="url(#beam4)" opacity=".7"/></g>`);
      // the door, and the light that will stand in it
      const doorPath = ctx.el("hero", path(`M${door.pts[0].join(" ")} L${door.pts[1].join(" ")} L${door.pts[2].join(" ")} Z`, LIGHT, 2.6, "glow"));
      const glowC = ctx.el("hero", `<circle class="ch4-glow" cx="${door.c[0]}" cy="${door.c[1] - 10}" r="1" fill="url(#door4)" opacity="0"/>`);
      const lit = ctx.el("fills", `<g class="lit-tri" data-i="8"><path d="M${door.pts.map((p) => p.join(" ")).join(" L")} Z" fill="${GOLD}" opacity="0"/><text x="${door.c[0]}" y="${door.c[1] + 6}" font-family="DM Sans, sans-serif" font-size="13" font-weight="500" text-anchor="middle" fill="#1A2218" opacity="0">20</text></g>`);
      // three of them walk to the door: two tall, one small, drawn by the point
      const people = [
        // Matthew
        { head: HEAD(-128, 302, 13), body: "M-134 318 C-142 352 -144 392 -140 420 M-122 318 C-114 352 -112 392 -114 420 M-128 332 C-150 352 -156 372 -160 392 M-128 332 C-110 350 -102 360 -96 372" },
        // Sarah
        { head: HEAD(-84, 306, 13), body: "M-90 322 C-96 354 -98 392 -96 420 M-78 322 C-74 354 -72 392 -74 420 M-84 338 C-100 356 -106 370 -108 384 M-84 338 C-70 352 -60 356 -50 358" },
        // Zoey, holding a hand
        { head: HEAD(-44, 350, 9), body: "M-48 360 C-52 384 -54 404 -52 420 M-40 360 C-38 384 -36 404 -36 420 M-44 368 C-48 362 -50 360 -50 358 M-44 368 C-38 376 -34 382 -30 386" },
      ].map((p) => ({ head: ctx.el("scene", path(p.head, CREAM, 2.8, "", `opacity=".95"`)), body: ctx.el("scene", path(p.body, CREAM, 2.8, "", `opacity=".95"`)) }));
      return { d, door, drive, drive2, car, doorPath, glowC, lit, litPath: lit.querySelector("path"), litText: lit.querySelector("text"), people };
    },
    async play(ctx, b) {
      ctx.phrases(900, 7000); ctx.voices(8600);
      // the gold comes back
      ctx.layers.lattice.classList.remove("grey");
      if (SD.built[3]) { SD.built[3].caret.classList.remove("blink"); SD.built[3].caret.setAttribute("opacity", 0); ctx.fade(SD.built[3].all, .1, 2400); }
      ctx.show(true); ctx.at(-948, -688); ctx.size(5.5, 400);
      // the drive, drawn down from the door and away, as a road is seen from a house
      await ctx.glide(24, 236, 1300, true);
      b.drive.animate([{ strokeDashoffset: -1 }, { strokeDashoffset: 0 }], { duration: 1600, easing: "ease-in-out", fill: "forwards" });
      b.drive2.animate([{ strokeDashoffset: -1 }, { strokeDashoffset: 0 }], { duration: 1600, delay: 150, easing: "ease-in-out", fill: "forwards" });
      await ctx.wait(1700);
      // headlights up the drive: the first colour since the hands
      b.car.setAttribute("opacity", 1); b.car.querySelectorAll(".beam").forEach((x) => x.classList.add("on"));
      const L = b.drive.getTotalLength();
      await ctx.tween(2600, (e) => { const q = b.drive.getPointAtLength(L * e * .86); const q2 = b.drive.getPointAtLength(L * Math.min(1, e * .86 + .02)); const ang = Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI; b.car.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(ang + 180).toFixed(1)}) scale(${(0.55 + 0.45 * e).toFixed(3)})`); }, (f) => 1 - Math.pow(1 - f, 2));
      b.car.querySelectorAll(".beam").forEach((x) => x.classList.remove("on"));
      await ctx.wait(300);
      // three of them, drawn walking to the door
      for (const p of b.people) { await ctx.draw(p.head, .4, { glide: 300 }); await ctx.draw(p.body, 1.0, { glide: 120 }); }
      await ctx.wait(400);
      // the door: the lowest triangle at the front
      await ctx.draw(b.doorPath, 1.1, { glide: 500 });
      // the point goes in, and becomes the light in the doorway
      await ctx.glide(b.door.c[0], b.door.c[1] - 10, 600);
      ctx.chord([220, 277.18, 329.63, 440]);
      await ctx.tween(1500, (e) => { b.glowC.setAttribute("r", (1 + 330 * e).toFixed(1)); b.glowC.setAttribute("opacity", (0.95 - .25 * e).toFixed(2)); b.litPath.setAttribute("opacity", (e * .9).toFixed(2)); }, (f) => 1 - Math.pow(1 - f, 3));
      ctx.sparks(b.door.c[0], b.door.c[1], 14, LIGHT, true);
      b.litText.setAttribute("opacity", .9);
      ctx.size(5.5, 400);
      await ctx.wait(600);
      await ctx.glide(b.door.c[0], b.door.c[1] - 70, 900);
    },
    settle(ctx, b) {
      ctx.layers.lattice.classList.remove("grey");
      if (SD.built[3]) { SD.built[3].caret.classList.remove("blink"); SD.built[3].caret.setAttribute("opacity", 0); SD.built[3].all.style.opacity = .1; }
      [b.drive, b.drive2, b.doorPath, ...b.people.flatMap((p) => [p.head, p.body])].forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; });
      const L = b.drive.getTotalLength(), q = b.drive.getPointAtLength(L * .86), q2 = b.drive.getPointAtLength(L * .88), ang = Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI;
      b.car.setAttribute("opacity", 1); b.car.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(ang + 180).toFixed(1)})`);
      b.glowC.setAttribute("r", 331); b.glowC.setAttribute("opacity", .7); b.litPath.setAttribute("opacity", .9); b.litText.setAttribute("opacity", .9);
      ctx.show(true); ctx.size(5.5, 0); ctx.at(b.door.c[0], b.door.c[1] - 70);
    },
  });
})();
