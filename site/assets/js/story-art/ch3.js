/* III · A number. The one chapter that breaks the dark. The camera pulls back and the dome we watched being raised is
   framed as the first photograph on a listing card: a search box, a title bar, five small stars, a row of photo
   rectangles, and a calendar of little squares that fill and empty on the real rhythm of the guests, month by month,
   August 2023 to October 2026. The lattice goes grey. The point becomes a cursor, blinking in the search box. */
(function () {
  const { path } = window.SD;
  const GREY = "#9AA4B2", INK = "#5B6675", BLUE = "#3B82F6";
  const star = (x, y, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }).join(" L");
  SD.chapter({
    n: 3, cam: { cx: 40, cy: 100, w: 2600 }, bg: "#F2F4F7", k: INK, light: true, bed: null, tone: null,
    words: {
      k: "III · A number", h: "A title, a row of photographs, a calendar.",
      p: ["For a while I was a listing. A number on a big website, a title, a row of photographs, a calendar of little squares that filled and emptied. It is a strange thing to be a number. You learn how to be found. You don’t yet learn who you are."],
    },
    build(ctx) {
      // the guests by month, August 2023 to October 2026: how the squares filled
      const months = {}; (window.DOME_REVIEWS || []).forEach((r) => { const k = r.year * 12 + r.month; months[k] = (months[k] || 0) + 1; });
      const keys = Object.keys(months).map(Number).sort((a, b) => a - b), lo = keys[0], hi = keys[keys.length - 1], mx = Math.max(...Object.values(months));
      // the search box, top left, where the point will sit as a caret
      const box = ctx.el("top", path("M-980 -720 h520 a16 16 0 0 1 16 16 v40 a16 16 0 0 1 -16 16 h-520 a16 16 0 0 1 -16 -16 v-40 a16 16 0 0 1 16 -16 Z", GREY, 2.2));
      const lens = ctx.el("top", path("M-480 -698 a12 12 0 1 0 0.1 0 M-471 -689 l12 12", GREY, 2.2));
      // the card: a title bar, five stars, the first photograph framing the dome, four more photographs beside it
      const card = ctx.el("top", path("M-980 -600 h2040 a20 20 0 0 1 20 20 v1500 a20 20 0 0 1 -20 20 h-2040 a20 20 0 0 1 -20 -20 v-1500 a20 20 0 0 1 20 -20 Z", GREY, 2.4));
      const title = ctx.el("top", `<rect class="fill" x="-920" y="-548" width="620" height="22" rx="11" fill="${GREY}" opacity=".55"/>`);
      const stars = ctx.el("top", `<g>${[0, 1, 2, 3, 4].map((i) => path(`M${star(-905 + i * 34, -484, 12)} Z`, GREY, 1.6, "", `data-d="${i * 6}"`)).join("")}</g>`);
      const photo = ctx.el("top", path("M-400 -400 h800 v760 h-800 Z", GREY, 2.4, "", `opacity=".9"`));
      const photos = [0, 1, 2, 3].map((i) => ctx.el("top", path(`M${460 + (i % 2) * 300} ${-400 + Math.floor(i / 2) * 400} h270 v340 h-270 Z`, GREY, 1.8, "", `data-d="${i * 8}" opacity=".7"`)));
      // the calendar: one square per month, thirteen to a row, filled as deep as that month was
      const squares = [];
      for (let k = lo; k <= hi; k++) {
        const i = k - lo, col = i % 13, row = Math.floor(i / 13), x = -920 + col * 148, y = 440 + row * 148, n = months[k] || 0;
        const sq = ctx.el("top", `<g data-k="${k}"><rect x="${x}" y="${y}" width="120" height="120" rx="10" fill="none" stroke="${GREY}" stroke-width="1.4" opacity=".7"/><rect class="sqf" x="${x}" y="${y}" width="120" height="120" rx="10" fill="${GREY}" opacity="0"/></g>`);
        squares.push({ el: sq, fill: sq.querySelector(".sqf"), depth: n / mx, n });
      }
      const yrs = ctx.el("top", `<g font-family="DM Sans, sans-serif" font-size="30" fill="${GREY}" opacity="0" class="fill">${[2023, 2024, 2025, 2026].map((y) => { const k = keys.find((k) => Math.floor((k - 1) / 12) === y); if (k === undefined) return ""; const i = k - lo; return `<text x="${-920 + (i % 13) * 148}" y="${440 + Math.floor(i / 13) * 148 - 18}">${y}</text>`; }).join("")}</g>`);
      // the caret
      const caret = ctx.el("hero", `<rect class="ch3-caret" x="-950" y="-708" width="3" height="40" fill="${BLUE}" opacity="0"/>`);
      // all of it in one group, so the dark can let it recede later (dimmed, never removed; it dissolves in VIII)
      const all = ctx.el("top", `<g class="ch3-card"></g>`);
      [box, lens, card, title, stars, photo, ...photos, ...squares.map((q) => q.el), yrs].forEach((e) => all.append(e));
      return { all, box, lens, card, title, stars: [...stars.querySelectorAll("path")], photo, photos, squares, yrs, caret };
    },
    async play(ctx, b) {
      ctx.phrases(900, 8600);
      // the lattice goes grey: a number does not keep its colour
      ctx.layers.lattice.classList.add("grey");
      if (SD.built[2]) ctx.fade(SD.built[2].crown, 0, 1500);
      ctx.size(4, 600);
      // the point draws the frame around what it was: a photograph of itself, then the card the photograph sits on
      await ctx.draw(b.photo, 1.6, { glide: 700 });
      ctx.cascade(b.photos, 500, 30);
      await ctx.draw(b.card, 2.6, { glide: 500 });
      b.title.classList.add("on");
      ctx.cascade(b.stars, 300, 20);
      await ctx.wait(300);
      // the calendar: the little squares fill and empty, month by month, on the real rhythm
      b.yrs.classList.add("on");
      const per = 4200 / b.squares.length;
      b.squares.forEach((s, i) => setTimeout(() => { s.fill.animate([{ opacity: 0 }, { opacity: .25 + s.depth * .55, offset: .25 }, { opacity: .12 + s.depth * .3 }], { duration: 1500, fill: "forwards", easing: "ease-out" }); ctx.tick(); }, i * per));
      await ctx.tween(4200, (e) => { const i = Math.min(b.squares.length - 1, Math.floor(e * b.squares.length)), s = b.squares[i], r = s.el.firstChild; ctx.at(+r.getAttribute("x") + 60, +r.getAttribute("y") - 30); }, (f) => f);
      await ctx.wait(400);
      // and the point becomes a cursor, blinking in the search box
      await ctx.draw(b.box, 1.2, { glide: 900 });
      ctx.cascade([b.lens], 300, 0);
      await ctx.glide(-948, -688, 500);
      ctx.show(false); b.caret.setAttribute("opacity", 1); b.caret.classList.add("blink");
      ctx.tick();
    },
    settle(ctx, b) {
      [b.box, b.lens, b.card, b.photo, ...b.photos, ...b.stars].forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; });
      b.title.classList.add("on"); b.yrs.classList.add("on");
      b.squares.forEach((s) => { s.fill.getAnimations().forEach((a) => a.cancel()); s.fill.setAttribute("opacity", (.12 + s.depth * .3).toFixed(2)); });
      ctx.layers.lattice.classList.add("grey");
      if (SD.built[2]) SD.built[2].crown.style.opacity = 0;
      ctx.show(false); ctx.size(4, 0); ctx.at(-948, -688); b.caret.setAttribute("opacity", 1); b.caret.classList.add("blink");
    },
  });
})();
