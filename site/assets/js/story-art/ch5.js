/* V · Filling. Two hundred and fifty-two of them wrote it down. The point climbs the dome again and the triangles
   light in the order the guests came, each in the colour of its season (the same data One Triangle at a Time uses),
   each carrying its guest's number. The count climbs beside it. The dome ends this chapter as a map of seasons, with the
   leftover triangles unlit, for the guests still to come. SD.built[5].tris keeps which guest lit which triangle: VI opens
   three of them as windows, and IX lifts them all into the sky. */
(function () {
  const { dome, seg } = window.SD;
  const SEASON = { spring: "#9CC48A", summer: "#E2C48A", fall: "#D9864E", winter: "#B9CFE4" };
  const BEDS = { fall: "wind", summer: "birds", winter: "night", spring: "water" };
  SD.chapter({
    n: 5, cam: { cx: 0, cy: -40, w: 1060 }, bg: "#060A06", k: "#E2C48A", bed: "wind", tone: 320,
    words: {
      k: "V · Filling", h: "Two hundred and fifty-two of them wrote it down.", count: true,
      p: ["They came in every season, and the ones who wrote it down came seventy-six times in fall, sixty-six in summer, fifty-eight in winter, fifty-two in spring. They brought anniversaries and a proposal and a blizzard and their dogs. I held every bit of it, and kept none of it. That’s the job."],
      btns: `<a class="btn" href="build.html">Build me again, one guest at a time</a>`,
    },
    build(ctx) {
      const d = dome();
      // the guests in the order they came (Sarah, the oldest words, first), and the triangles in the order they were raised
      const all = (window.DOME_REVIEWS || []).slice().sort((a, b) => (a.year - b.year) || (a.month - b.month) || (b.n - a.n));
      const sarah = all.find((r) => r.n === 20), guests = sarah ? [sarah, ...all.filter((r) => r !== sarah)] : all;
      const faces = [d.faces[8], ...d.faces.filter((f) => f.i !== 8)];
      const g = ctx.el("fills", `<g class="ch5-tris"></g>`);
      // 252 guests fill 252 of the dome's faces — but not simply the first 252 in ring order, which would leave every
      // unlit face stranded together at the crown (the last rows raised) and read as a hole in the dome rather than
      // room still to grow. Spread the unlit faces evenly through the fill order instead (a guests still to come" face
      // every so often, not all of them in one patch), so every ring gets guests and every ring keeps a little room.
      const restFaces = faces.slice(1), restGuests = guests.slice(1);
      const total = restFaces.length, want = restGuests.length, gap = total - want;
      let gi = 0;
      const tris = [{ r: guests[0], f: faces[0], el: null, path: null }];   // Sarah's triangle, the door, already lit in IV
      const waiting = [];
      restFaces.forEach((f, i) => {
        const skip = gap > 0 && Math.floor((i + 1) * gap / total) !== Math.floor(i * gap / total);
        if (skip || gi >= want) { waiting.push(f); return; }
        const r = restGuests[gi++];
        const t = document.createElementNS("http://www.w3.org/2000/svg", "g"); t.setAttribute("class", "lit-tri"); t.dataset.i = f.i; t.dataset.n = r.n;
        t.innerHTML = `<path d="M${f.pts.map((p) => p.join(" ")).join(" L")} Z" fill="${SEASON[r.season] || "#E2C48A"}" opacity="0"/><text x="${f.c[0]}" y="${f.c[1] + 3}" font-family="DM Sans, sans-serif" font-size="8" font-weight="500" text-anchor="middle" fill="#1A2218" opacity="0">${r.n}</text>`;
        g.append(t);
        tris.push({ r, f, el: t, path: t.firstChild, text: t.lastChild });
      });
      return { d, tris, waiting, g };
    },
    async play(ctx, b) {
      ctx.phrases(700, 7600);
      const count = ctx.words.querySelector(".count");
      ctx.show(true);
      await ctx.glide(b.tris[0].f.c[0], b.tris[0].f.c[1], 900, true);
      await ctx.wait(300);
      // the triangles light in order, on a steady beat, in the colour of each guest's season; the point sweeps with them
      const N = b.tris.length, span = 7600, per = span / N;
      let bed = null;
      b.tris.forEach((t, k) => setTimeout(() => {
        if (t.path) { t.path.animate([{ opacity: 0 }, { opacity: .95, offset: .3 }, { opacity: .6 }], { duration: 900, fill: "forwards", easing: "ease-out" }); t.text.setAttribute("opacity", .5); }
        if (k % 3 === 0) ctx.tick();
        const s = t.r.season; if (BEDS[s] !== bed) { bed = BEDS[s]; ctx.bed(bed); }
      }, k * per));
      let px = b.tris[0].f.c[0], py = b.tris[0].f.c[1];
      await ctx.tween(span + 200, (e, f) => {
        const k = Math.min(N - 1, Math.floor(f * N)), t = b.tris[k];
        px += (t.f.c[0] - px) * .18; py += (t.f.c[1] - py) * .18; ctx.at(px, py);
        count.textContent = Math.min(N, Math.round(f * N));
      }, (f) => f);
      count.textContent = N;
      // the whole dome breathes once, full
      ctx.chord([329.63, 392, 493.88, 587.33, 783.99], 5);
      ctx.ripple(0, -40, 420, "rgba(245,240,232,.5)", 2400);
      b.g.animate([{ opacity: 1 }, { opacity: 1.0, filter: "brightness(1.6)", offset: .3 }, { opacity: 1 }], { duration: 1800, easing: "ease-in-out" });
      await ctx.glide(0, -330, 1200);
    },
    settle(ctx, b) {
      b.tris.forEach((t) => { if (t.path) { t.path.getAnimations().forEach((a) => a.cancel()); t.path.setAttribute("opacity", .6); t.text.setAttribute("opacity", .5); } });
      const c = ctx.words.querySelector(".count"); if (c) c.textContent = b.tris.length;
      ctx.show(true); ctx.size(5.5, 0); ctx.at(0, -330);
    },
  });
})();
