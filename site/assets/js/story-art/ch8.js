/* VIII · My own name. Coming home to a name, not a number. April: a dawn comes up behind the hills. The dome comes back
   to full. The listing from III returns, small, and dissolves: the one thing the dome sheds. Then the point writes, in
   cream, under the dome: Catskill Mountain Domes, and becomes the dot on the i. Eric and Mona are not drawn. */
(function () {
  const CREAM = "#F5F0E8", RUST = "#D9864E";
  SD.chapter({
    n: 8, cam: { cx: 0, cy: -60, w: 1500 }, bg: "#231810", k: "#E2B477", bed: "wind", tone: 426,
    words: {
      k: "VIII · My own name", h: "Coming home to a name, not a number.",
      p: ["Then Eric and Mona came, and with them a different idea: that I could be found by my own name, on my own page, with every guest’s words kept here instead of somewhere else. Catskill Mountain Domes. It turns out you can come home without moving an inch."],
      slot: "em_changed",
    },
    build(ctx) {
      ctx.svg.querySelector("#defs").insertAdjacentHTML("beforeend", `<linearGradient id="dawn8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RUST}" stop-opacity="0"/><stop offset=".7" stop-color="${RUST}" stop-opacity=".22"/><stop offset="1" stop-color="${RUST}" stop-opacity="0"/></linearGradient>
        <clipPath id="name8"><rect class="name-reveal" x="-700" y="440" width="0" height="140"/></clipPath>`);
      const dawn = ctx.el("sky", `<rect class="fill" x="-6000" y="-1400" width="12000" height="1700" fill="url(#dawn8)"/>`);
      // the name, in the dome's own cream, with a dotless i waiting for the point
      const name = ctx.el("top", `<g clip-path="url(#name8)"><text class="ch8-name" x="0" y="536" text-anchor="middle" font-family="Lora, serif" font-style="italic" font-weight="500" font-size="78" fill="${CREAM}" opacity=".96">Catskill Mountaın Domes</text></g>`);
      const text = name.querySelector("text"), reveal = ctx.svg.querySelector("#name8 rect");
      return { dawn, name, text, reveal };
    },
    async play(ctx, b) {
      ctx.phrases(700, 7000);
      // the dawn, and the dome back to full
      b.dawn.classList.add("on");
      const ch7 = SD.chapters.find((c) => c.n === 7);
      if (ch7) ctx.fade(ch7.dimmed(), 1, 2600);
      ctx.show(true);
      // the listing comes back, small, and dissolves
      if (SD.built[3]) {
        const card = SD.built[3].all; card.style.transformBox = "fill-box"; card.style.transformOrigin = "center";
        card.animate([{ opacity: .1, transform: "scale(1)" }, { opacity: .55, transform: "scale(.34)", offset: .45 }, { opacity: 0, transform: "scale(.3)" }], { duration: 3400, easing: "ease-in-out", fill: "forwards" });
        ctx.tick(); setTimeout(() => ctx.tick(), 1500);
      }
      await ctx.glide(-690, 536, 2400, true);
      // the point writes the name, left to right
      const len = b.text.getComputedTextLength(), x0 = -len / 2 - 8;
      b.reveal.setAttribute("x", x0);
      await ctx.tween(4200, (e) => { b.reveal.setAttribute("width", ((len + 16) * e).toFixed(1)); ctx.at(x0 + (len + 16) * e, 536 - 18 + Math.sin(e * 60) * 10); if (Math.random() < .2) ctx.tick(); }, (f) => f);
      // and becomes the dot on the i
      const idx = "Catskill Mountaın Domes".indexOf("ı"), ex = b.text.getExtentOfChar(idx);
      await ctx.glide(ex.x + ex.width / 2, 536 - 44, 900);
      await ctx.size(4, 500);
      ctx.chord([440, 554.37, 659.25, 880], 5);
      b.text.animate([{ opacity: .96 }, { opacity: 1, filter: "drop-shadow(0 0 18px rgba(255,241,210,.9))", offset: .3 }, { opacity: .96, filter: "drop-shadow(0 0 0px rgba(255,241,210,0))" }], { duration: 2200, easing: "ease-in-out" });
      ctx.ripple(0, 510, 520, "rgba(245,240,232,.4)", 2600);
    },
    settle(ctx, b) {
      b.dawn.classList.add("on");
      const ch7 = SD.chapters.find((c) => c.n === 7); if (ch7) ch7.dimmed().forEach((el) => { el.getAnimations().forEach((a) => a.cancel()); el.style.opacity = 1; });
      if (SD.built[3]) { const card = SD.built[3].all; card.getAnimations().forEach((a) => a.cancel()); card.style.opacity = 0; }
      const len = b.text.getComputedTextLength(); b.reveal.setAttribute("x", -len / 2 - 8); b.reveal.setAttribute("width", len + 16);
      const idx = "Catskill Mountaın Domes".indexOf("ı"), ex = b.text.getExtentOfChar(idx);
      ctx.show(true); ctx.size(4, 0); ctx.at(ex.x + ex.width / 2, 536 - 44);
    },
  });
})();
