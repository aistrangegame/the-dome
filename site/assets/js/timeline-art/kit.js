/* The timeline's drawings: one registry, shared helpers. Each moment registers its drawing by its exact title in
   window.DOME.timeline. The engine (timeline.html) draws it in beats; see docs/timeline-motion.md for the contract.

   TL.register("Exact title", {
     vb: [x, y, w, h],          // the framing (viewBox) of the drawing, in drawing units
     ground: y,                 // the ground line, where the dome's lattice rises from
     hero: [x, y],              // the heart of the moment: where the point goes to become it
     heroFrom: [x, y],          // optional: where the point waits before it becomes the heart (the moon rises from here)
     bed: "night|room|fire|water|wind|meadow|birds",   // the sound under it, when sound is on
     under: "<svg…>",           // optional: drawn first, quietly (stars, snow); class "star" twinkles after the bloom
     sky: "path d",             // optional: a clip (url(#sky)) so things can sit behind a ridge
     strokes: [{ beat: "place"|"people", d: "path", t: seconds, c: ""|"thin"|"cream" }],
     heroSvg: "<svg…>",         // the heart: shapes the point becomes; class "ln" strokes draw after the swell
     swell(svg, f) { },         // f 0…1: grow the heart from the point (use classes "h-…", never ids)
     fills: "<svg…>",           // class "fill" appears in the bloom
     film: { key: "turn", r: 150 },   // optional: a real drone clip, shown inside a circle at the heart
     burst: { x, y, n, warm },  // sparks at the bloom
     tone: [hz, hz, hz],        // the chord at the bloom
     css: "…"                   // optional extra CSS for this moment's living loops (scope with .tl-{i})
   });
   In any string, url(#gl) url(#cool) url(#moon) url(#beam) url(#sky) are this moment's own gradients, and "{i}" becomes
   this moment's number (for any id you add). Living classes after the bloom: flame, flame b, breathe, flick, steam, mote, glint, star, drift, fall. */
(function () {
  const TL = window.TL = window.TL || { art: {} };
  TL.register = (title, def) => { TL.art[title] = def; };
  TL.HEAD = (x, y, r) => `M${x} ${y - r} a${r} ${r} 0 1 0 0.1 0`;
  TL.STARS = (n, seed, box) => { let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280; return Array.from({ length: n }, () => `<circle class="star" cx="${(box[0] + rnd() * box[2]).toFixed(0)}" cy="${(box[1] + rnd() * box[3]).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" style="animation-delay:${(rnd() * 4).toFixed(2)}s"/>`).join(""); };
  TL.lerp = (a, b, f) => a + (b - a) * f;
  TL.seg = (f, a, b) => Math.max(0, Math.min(1, (f - a) / (b - a)));   // the part of f between a and b, as 0…1
})();
