/* VI · Their worlds. Different worlds, set down inside me for a few nights. Three of the lit triangles open like windows
   (each the triangle of the guest who lived it), and inside each a whole world is drawn: the ring, the Scrabble lantern,
   the blizzard. The first two come back from the timeline's own drawings (timeline-art/three.js), because nothing given
   here is lost. Then the point rises out of the dome and becomes the one moon above all three windows. */
(function () {
  const { path, HEAD } = window.SD;
  const GOLD = "#E2C48A", CREAM = "#F5F0E8", NIGHT = "#070B14";
  // the blizzard, drawn to the timeline's contract: the drive, a figure clearing it, and snow
  const BLIZZARD = {
    vb: [40, 60, 520, 460], hero: [300, 250],
    under: Array.from({ length: 70 }, (_, i) => { const r = (i * 7919) % 523; return `<circle class="fall" cx="${40 + (r * 1.97) % 520}" cy="${60 + (r * 3.1) % 420}" r="${1.4 + (i % 3) * .7}" fill="#DCE8F5" style="animation-delay:${(i % 10) * .5}s"/>`; }).join(""),
    strokes: [
      { beat: "place", d: "M40 470 C180 440 300 400 560 380", t: 1.2, c: "thin" },
      { beat: "place", d: "M40 430 C180 400 300 360 560 340", t: 1.0, c: "thin" },
      { beat: "place", d: "M120 300 C160 240 240 220 300 230 C360 240 400 280 420 330", t: 1.0 },
      { beat: "people", d: HEAD(330, 338, 15) + " M322 354 C310 384 306 414 310 440 M338 354 C352 384 356 414 352 440 M330 368 C300 380 280 390 262 410 M262 410 L240 440 M236 444 l24 -6", t: 1.4, c: "cream" },
    ],
    heroSvg: `<circle class="fill breathe" cx="300" cy="250" r="190" fill="url(#cool)"/>`,
    fills: `<path class="fill" d="M60 470 C180 440 300 400 540 380 L540 420 C300 440 180 480 60 500 Z" fill="rgba(220,232,245,.18)"/>`,
    swell() {},
  };
  SD.chapter({
    n: 6, cam: { cx: 0, cy: -130, w: 1240 }, bg: "#070B14", k: GOLD, bed: "night", tone: 341,
    words: {
      k: "VI · Their worlds", h: "Different worlds, set down inside me for a few nights.",
      p: ["This is the part I find hardest to explain. Every guest arrived carrying a whole life and set it down in me for two or three nights. No two lives were alike. The sky above them was the same one.",
        [101, "Kaitlyn", "I chose this location for a proposal, and it did not disappoint."],
        [92, "Corinne", "there were several scrabble games played by lantern."],
        [57, "Gabriela", "Also big shoutout for getting someone to clear the snow from the driveway in the morning after the blizzard."],
        [119, "Sherry", "watching the harvest supermoon rise above the mountains while we sat around the firepit, sipping tea."]],
    },
    build(ctx) {
      ctx.svg.querySelector("#defs").insertAdjacentHTML("beforeend", `<radialGradient id="gl"><stop offset="0" stop-color="rgba(255,226,170,.55)"/><stop offset="1" stop-color="rgba(255,226,170,0)"/></radialGradient>
        <radialGradient id="cool"><stop offset="0" stop-color="rgba(200,224,245,.5)"/><stop offset="1" stop-color="rgba(200,224,245,0)"/></radialGradient>
        <radialGradient id="moon" cx=".42" cy=".38"><stop offset="0" stop-color="#FFF1D2"/><stop offset=".7" stop-color="#F2C98A"/><stop offset="1" stop-color="#D9864E"/></radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,226,170,.32)"/><stop offset="1" stop-color="rgba(255,226,170,0)"/></linearGradient>
        <radialGradient id="moon6"><stop offset="0" stop-color="#FFF1D2" stop-opacity=".5"/><stop offset=".4" stop-color="#F2C98A" stop-opacity=".12"/><stop offset="1" stop-color="#F2C98A" stop-opacity="0"/></radialGradient>`);
      const ART = (window.TL && window.TL.art) || {};
      const worlds = [[101, ART["A proposal"]], [92, ART["Scrabble by lantern"]], [57, BLIZZARD]];
      // each window opens square to the viewer, an equilateral pane standing on the guest's own triangle; two windows too
      // close together are eased apart so neither hides the other
      const WR = 128, placed = [];
      const windows = worlds.map(([n, art], w) => {
        const tri = SD.built[5] && SD.built[5].tris.find((t) => t.r.n === n);
        if (!tri || !art) return null;
        const f = tri.f; let c = [f.c[0], f.c[1]];
        placed.forEach((q) => { const dx = c[0] - q[0], dy = c[1] - q[1], d = Math.hypot(dx, dy) || 1; if (d < WR * 2.1) { const push = WR * 2.1 - d; c = [c[0] + dx / d * push, c[1] + dy / d * push]; } });
        placed.push(c);
        const up = f.pts.reduce((m, p) => m + p[1], 0) / 3 > f.pts.reduce((m, p) => Math.min(m, p[1]), 1e9) + 14;   // most faces here point up
        const tp = up ? `0 ${-WR} L${(WR * .866).toFixed(1)} ${WR * .5} L${(-WR * .866).toFixed(1)} ${WR * .5}` : `0 ${WR} L${(WR * .866).toFixed(1)} ${-WR * .5} L${(-WR * .866).toFixed(1)} ${-WR * .5}`;
        const [vx, vy, vw, vh] = art.vb, s = Math.min(WR * 1.5 / vw, WR * 1.5 / vh), ox = vx + vw / 2, oy = vy + vh / 2;
        const S = (x) => String(x || "").replace(/\{i\}/g, "6" + w);
        const g = ctx.el("hero", `<g class="ch6-window" transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})" opacity="0"><g class="pane" style="transform-box:fill-box;transform-origin:center"><clipPath id="win6${w}"><path d="M${tp} Z"/></clipPath>
          <g clip-path="url(#win6${w})"><path d="M${tp} Z" fill="${NIGHT}" opacity=".94"/>
            <g class="mini" transform="translate(0 ${up ? 6 : -6}) scale(${s.toFixed(4)}) translate(${-ox} ${-oy})">${S(art.under)}${S(art.fills)}<g class="hero">${S(art.heroSvg)}</g>
              <g class="strokes">${art.strokes.map((k) => `<path class="ln ${k.c || ""}" pathLength="1" d="${k.d}" stroke="${k.c === "cream" ? CREAM : GOLD}" stroke-width="${k.c === "cream" ? 3.4 : k.c === "thin" ? 1.6 : 2.8}" fill="none" ${k.c === "thin" ? 'opacity=".75"' : ""}/>`).join("")}</g></g></g>
          <path d="M${tp} Z" fill="none" stroke="${GOLD}" stroke-width="1.8" style="filter:drop-shadow(0 0 5px rgba(226,196,138,.6))"/></g></g>`);
        const pane = g.querySelector(".pane"); pane.style.transform = "scale(.02)";
        return { n, art, g, pane, c, strokes: [...g.querySelectorAll(".strokes path")], fills: [...g.querySelectorAll(".fill")], hero: g.querySelector(".hero") };
      }).filter(Boolean);
      const moon = ctx.el("hero", `<g class="ch6-moon" opacity="0"><circle cx="0" cy="-560" r="200" fill="url(#moon6)"/><circle class="moon-disc" cx="0" cy="-560" r="1" fill="url(#moon)"/><path class="ln thin" pathLength="1" d="M-32 -596 a14 14 0 1 0 0.1 0 M26 -548 a18 18 0 1 0 0.1 0 M-10 -520 a8 8 0 1 0 0.1 0" stroke="rgba(26,34,24,.25)" stroke-width="1.2" fill="none"/></g>`);
      return { windows, moon, disc: moon.querySelector(".moon-disc"), craters: moon.querySelector(".ln") };
    },
    async play(ctx, b) {
      ctx.phrases(600, 5200); ctx.voices(5000);
      ctx.show(true);
      for (const w of b.windows) {
        // the point goes to that guest's triangle, and it opens like a window
        await ctx.glide(w.c[0], w.c[1], 900, true);
        ctx.ripple(w.c[0], w.c[1], 120, "rgba(226,196,138,.6)", 1400);
        w.g.setAttribute("opacity", 1);
        w.pane.animate([{ transform: "scale(.02)" }, { transform: "scale(1)" }], { duration: 1100, easing: "cubic-bezier(.3,.9,.3,1)", fill: "forwards" });
        await ctx.wait(500);
        // and the world inside draws itself, quickly: the place, then the people
        ctx.cascade(w.strokes, 700, 160);
        await ctx.wait(700 + 160 * w.strokes.length);
        w.fills.forEach((x) => x.classList.add("on"));
        w.hero.querySelectorAll(".ln").forEach((p) => (p.style.strokeDashoffset = 0));
        try { w.art.swell(w.g, 1); } catch (e) {}
        w.g.classList.add("alive");
        ctx.chord([w.n === 101 ? 523.25 : w.n === 92 ? 392 : 329.63], 2.4);
        await ctx.wait(500);
      }
      // the sky above them was the same one: the point rises out of the dome and becomes the moon
      await ctx.glide(0, -560, 1800, true);
      b.moon.setAttribute("opacity", 1);
      ctx.chord([329.63, 415.3, 493.88], 5);
      await ctx.tween(2200, (e) => { b.disc.setAttribute("r", (1 + 61 * e).toFixed(1)); }, (f) => 1 - Math.pow(1 - f, 3));
      b.craters.style.strokeDashoffset = 0;
      ctx.show(false);
    },
    settle(ctx, b) {
      b.windows.forEach((w) => { w.pane.getAnimations().forEach((a) => a.cancel()); w.pane.style.transform = "scale(1)"; w.g.setAttribute("opacity", 1); w.strokes.forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; }); w.fills.forEach((x) => x.classList.add("on")); w.hero.querySelectorAll(".ln").forEach((p) => (p.style.strokeDashoffset = 0)); try { w.art.swell(w.g, 1); } catch (e) {} w.g.classList.add("alive"); });
      b.moon.setAttribute("opacity", 1); b.disc.setAttribute("r", 62); b.craters.style.strokeDashoffset = 0;
      ctx.show(false); ctx.at(0, -560);
    },
  });
})();
