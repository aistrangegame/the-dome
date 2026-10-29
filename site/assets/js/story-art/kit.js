/* The dome's own story, drawn: one registry, shared helpers, and the dome itself as data.
   Each chapter (ch1.js … ch9.js) registers with SD.chapter({ n, cam, bg, k, bed, tone, light, words, build, play, settle }).
   The engine (play/story-drawn.html) builds every chapter's elements up front (build), plays each once in order (play),
   and finishes a chapter instantly if the reader pushes on early (settle). Nothing is ever removed from the canvas.

   World: the ground is y = 0; the dome stands on it, centred at x = 0, radius SD.R. The sky is negative y.
   In build/play you get ctx: el(layer, svg), draw(path, secs), glide(x, y, ms, trail), cascade(paths, ms, per), wait(ms),
   tween(ms, fn), fade(el, to, ms), sparks(x, y, n, color, up), ripple(x, y, r, color, ms), show(on), size(r, ms), at(x, y),
   bed(name), chord([hz…]), phrases(delay, span), voices(delay), allWords(). Layers: sky, far, lattice, fills, scene, hero, top. */
(function () {
  const SD = window.SD = window.SD || { chapters: [] };
  SD.chapter = (def) => { SD.chapters.push(def); SD.chapters.sort((a, b) => a.n - b.n); };
  SD.R = 300;
  SD.HEAD = (x, y, r) => `M${x} ${y - r} a${r} ${r} 0 1 0 0.1 0`;
  SD.rnd = (seed) => { let r = seed; return () => (r = (r * 9301 + 49297) % 233280) / 233280; };
  SD.lerp = (a, b, f) => a + (b - a) * f;
  SD.seg = (f, a, b) => Math.max(0, Math.min(1, (f - a) / (b - a)));
  SD.STARS = (n, seed, box, cls = "star") => { const rnd = SD.rnd(seed); return Array.from({ length: n }, () => `<circle class="${cls}" cx="${(box[0] + rnd() * box[2]).toFixed(0)}" cy="${(box[1] + rnd() * box[3]).toFixed(0)}" r="${(0.7 + rnd() * 1.5).toFixed(1)}" fill="#F5F0E8" style="animation-delay:${(rnd() * 5).toFixed(2)}s"/>`).join(""); };
  // a path ready for the point to draw: pathLength 1, hidden until drawn
  SD.path = (d, stroke, w, cls = "", extra = "") => `<path class="ln ${cls}" pathLength="1" d="${d}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;

  /* The dome as data: a geodesic hemisphere (frequency SD.FREQ), seen from a little above, drawn flat.
     Faces come back sorted from the ground up, then round, so the dome fills the way it was raised and the way the
     guests came: one triangle at a time. Each face: { i, pts: [[x,y],[x,y],[x,y]], c: [x,y], ring }.
     Struts: every unique edge, { a: [x,y], b: [x,y], ring }. Coordinates are world units (ground y = 0). */
  SD.FREQ = 6;
  SD.ELEV = 48 * Math.PI / 180;   // the camera looks down at the dome a little, so most of its triangles can be seen
  SD.dome = (function () {
    let cache = null;
    return function () {
      if (cache) return cache;
      const t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((p) => { const l = Math.hypot(...p); return p.map((v) => v / l); });
      const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
      const n = SD.FREQ, faces = [];
      const norm = (p) => { const l = Math.hypot(...p); return p.map((v) => v / l); };
      const mix = (a, b, c, i, j) => norm([0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * (i / n) + (c[k] - a[k]) * (j / n)));
      F.forEach(([ia, ib, ic]) => { const a = V[ia], b = V[ib], c = V[ic];
        for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) {
          faces.push([mix(a, b, c, i, j), mix(a, b, c, i + 1, j), mix(a, b, c, i, j + 1)]);
          if (i + j < n - 1) faces.push([mix(a, b, c, i + 1, j), mix(a, b, c, i + 1, j + 1), mix(a, b, c, i, j + 1)]);
        } });
      // the top of the sphere is the icosahedron vertex 0 → turn so that vertex points straight up (y up)
      const up = V[0], ang = Math.atan2(up[0], up[1]);
      const rot = (p) => { const [x, y, z] = p; return [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang), z]; };
      const R = SD.R, se = Math.sin(SD.ELEV), ce = Math.cos(SD.ELEV);
      // the hemisphere: faces whose every point is above the ground (a little below counts: the real dome sits on a base)
      const out = [];
      faces.map((f) => f.map(rot)).filter((f) => f.every((p) => p[1] > -0.02)).forEach((f) => {
        const pts3 = f.map(([x, y, z]) => [x * R, -(y * ce - z * se) * R, y * se + z * ce]);   // screen x, screen y (up is negative), depth toward the viewer
        const nx = (f[1][1] - f[0][1]) * (f[2][2] - f[0][2]) - (f[1][2] - f[0][2]) * (f[2][1] - f[0][1]);
        const ny = (f[1][2] - f[0][2]) * (f[2][0] - f[0][0]) - (f[1][0] - f[0][0]) * (f[2][2] - f[0][2]);
        const nz = (f[1][0] - f[0][0]) * (f[2][1] - f[0][1]) - (f[1][1] - f[0][1]) * (f[2][0] - f[0][0]);
        const cx3 = f.reduce((s, p) => s + p[0], 0) / 3, cy3 = f.reduce((s, p) => s + p[1], 0) / 3, cz3 = f.reduce((s, p) => s + p[2], 0) / 3;
        const facing = (nx * cx3 + ny * cy3 + nz * cz3) > 0 ? [nx, ny, nz] : [-nx, -ny, -nz];
        const fl = Math.hypot(...facing), toward = (facing[1] * se + facing[2] * ce) / fl;   // how squarely the face meets the view
        if (toward <= 0.01) return;   // the far side of the dome is behind the near side
        const pts = pts3.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]);
        out.push({ pts, c: [+(pts.reduce((s, p) => s + p[0], 0) / 3).toFixed(1), +(pts.reduce((s, p) => s + p[1], 0) / 3).toFixed(1)], h: cy3, depth: cz3 });
      });
      // from the ground up, then round the dome: the order they were raised, and the order the guests fill them
      out.forEach((f) => { f.ring = Math.round(f.h * 9); f.ang = Math.atan2(f.c[1], f.c[0]); });
      out.sort((a, b) => (a.ring - b.ring) || (b.h - a.h) || (a.c[0] - b.c[0]));
      out.forEach((f, i) => (f.i = i));
      // every unique strut
      const struts = new Map();
      out.forEach((f) => [[0, 1], [1, 2], [2, 0]].forEach(([p, q]) => { const a = f.pts[p], b = f.pts[q]; const k = [a.join(","), b.join(",")].sort().join("|"); if (!struts.has(k)) struts.set(k, { a, b, ring: f.ring, y: (a[1] + b[1]) / 2 }); }));
      const S = [...struts.values()].sort((a, b) => (b.y - a.y) || (a.a[0] - b.a[0]));   // lowest first (ground up)
      S.forEach((s, i) => (s.i = i));
      cache = { faces: out, struts: S, top: out.reduce((m, f) => (f.c[1] < m[1] ? f.c : m), [0, 0]) };
      return cache;
    };
  })();
})();
