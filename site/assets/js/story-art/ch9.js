/* IX · Whole. A small sky, under a large one. The camera rises until the dome is small in its meadow; the real footage
   opens in a circle over it, the white dot in green, the image the recognition names; the point goes to the middle of it
   and is that dot. Then the 252 lit triangles leave the dome and become the stars over it, keeping their season colours
   faintly: the inner sky becomes the outer one. One triangle, unlit, breathes among them: come and add yours. */
(function () {
  const { rnd, STARS } = window.SD;
  const CREAM = "#F5F0E8";
  SD.chapter({
    n: 9, cam: { cx: 0, cy: -60, w: 1500 }, camEnd: { cx: 0, cy: -620, w: 4200 }, bg: "#06080F", k: CREAM, bed: "night", tone: 528,
    words: {
      k: "IX · Whole", h: "A small sky, under a large one.",
      p: ["I am made of triangles and I am made of them, every guest, the way a curve is made of straight lines. I am not finished. A dome never is while people keep coming up the drive."],
      // the call to action lives on the very last screen only (the close section, right after this one) — not here too
    },
    build(ctx) {
      // the film, in a circle over the dome: an HTML element kept over the canvas (video does not live inside SVG on every phone)
      const film = document.createElement("div"); film.className = "film9"; film.innerHTML = `<video muted playsinline loop preload="none" data-key="rise"></video>`;
      document.body.append(film);
      // the sky they become: one place in the sky for every lit triangle, and one for the triangle still waiting
      const r = rnd(29);
      const spots = [];
      for (let i = 0; i < 300; i++) spots.push([-2000 + r() * 4000, -1900 + Math.pow(r(), .7) * 1150]);
      const wait = ctx.el("top", `<g class="ch9-wait" opacity="0"><path class="breathe" d="M0 -1080 L62 -972 L-62 -972 Z" fill="none" stroke="${CREAM}" stroke-width="2" style="filter:drop-shadow(0 0 8px rgba(245,240,232,.7))"/></g>`);
      // a large sky, under the small one: a far wider, taller field of faint stars than I's clearing ever needed,
      // so the pulled-back view this chapter ends on is not just 252 lit triangles in the dark but a true sky around them
      const wide = ctx.el("sky", `<g class="ch9-wide" opacity="0">${STARS(260, 41, [-2600, -2100, 5200, 1900])}</g>`);
      return { film, video: film.querySelector("video"), spots, wait, wide };
    },
    placeFilm() {
      const b = this.built, cam = SD.engine.layers.lattice.ownerSVGElement.querySelector("#cam"), m = cam.getScreenCTM();
      const c = new DOMPoint(0, -40).matrixTransform(m), e = new DOMPoint(620, -40).matrixTransform(m), rad = Math.hypot(e.x - c.x, e.y - c.y);
      b.film.style.left = (c.x - rad) + "px"; b.film.style.top = (c.y - rad) + "px"; b.film.style.width = b.film.style.height = rad * 2 + "px";
    },
    tris() {
      const list = SD.built[5] ? SD.built[5].tris.filter((t) => t.el).map((t) => ({ el: t.el, c: t.f.c })) : [];
      if (SD.built[4]) list.unshift({ el: SD.built[4].lit, c: SD.built[4].door.c });
      return list;
    },
    async play(ctx, b) {
      ctx.phrases(800, 6000);
      ctx.show(true);
      // the point rises first, and the camera follows it up until the dome is small in its meadow
      const camUp = SD.engine.moveCamera({ cx: 0, cy: -620, w: 4200 }, 4200);
      b.wide.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 3800, fill: "forwards" });
      b.wide.querySelectorAll(".star").forEach((s) => s.classList.add("on"));
      await ctx.glide(0, -40, 2600);
      await camUp;
      // the real footage opens over the dome: the white dot in green
      this.placeFilm(); b.film.classList.add("on");
      const Dome = window.DOME_API; if (b.video && !b.video.getAttribute("src") && Dome) { b.video.poster = Dome.vsrc("rise", "webp"); b.video.src = Dome.vsrc("rise"); b.video.play().catch(() => {}); }
      // and the drawn point gives way to the real one: the white dot in the green
      await ctx.size(9, 1200);
      ctx.chord([523.25, 659.25, 783.99, 1046.5], 7);
      ctx.svg.querySelector("#point").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1600, fill: "forwards" });
      await ctx.wait(1400);
      // the triangles leave the dome and become the stars over it
      const tris = this.tris(), N = tris.length;
      tris.forEach((t, i) => { const s = b.spots[i % b.spots.length]; t.el.style.transformBox = "fill-box"; t.el.style.transformOrigin = "center"; t.el.animate([{ transform: "translate(0px, 0px) scale(1)", opacity: 1 }, { transform: `translate(${(s[0] - t.c[0]).toFixed(0)}px, ${(s[1] - t.c[1]).toFixed(0)}px) scale(.5)`, opacity: .9 }], { duration: 3600 + (i % 7) * 300, delay: (i / N) * 3000, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" }); });
      await ctx.tween(6800, () => { if (Math.random() < .08) ctx.tick(); }, (f) => f);
      // one triangle, still unlit, among them: come and add yours
      b.wait.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1800, fill: "forwards" });
      ctx.ripple(0, -40, 900, "rgba(245,240,232,.35)", 3200);
    },
    settle(ctx, b) {
      b.wide.getAnimations().forEach((a) => a.cancel()); b.wide.setAttribute("opacity", 1); b.wide.querySelectorAll(".star").forEach((s) => s.classList.add("on"));
      this.placeFilm(); b.film.classList.add("on");
      this.tris().forEach((t, i) => { const s = b.spots[i % b.spots.length]; t.el.getAnimations().forEach((a) => a.cancel()); t.el.style.transformBox = "fill-box"; t.el.style.transformOrigin = "center"; t.el.style.transform = `translate(${(s[0] - t.c[0]).toFixed(0)}px, ${(s[1] - t.c[1]).toFixed(0)}px) scale(.5)`; t.el.style.opacity = .9; });
      b.wait.getAnimations().forEach((a) => a.cancel()); b.wait.setAttribute("opacity", 1);
      ctx.show(true); ctx.size(9, 0); ctx.at(0, -40); ctx.svg.querySelector("#point").style.opacity = 0;
    },
  });
})();
