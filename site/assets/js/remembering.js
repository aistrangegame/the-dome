/* The Remembering (formerly the Awakening): your own dome of thirteen triangles.
   Each place you play on the mountain lights its triangle, in the colour of the season you were there,
   with the one line you kept from it. Kept on this phone only (private and shared never mix).
   Plan: docs/remembering-plan.md §4. */
(function () {
  const KEY = "dome-remembering";
  const SEASON = { spring: "#9CC48A", summer: "#E2C48A", fall: "#D9864E", winter: "#B9CFE4" };
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const season = () => { const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? "spring" : m <= 8 && m >= 6 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter"; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Thirteen triangles stacked as a dome on the ground: 7, then 5, then 1 at the top (place 1 bottom left … 13 the cap).
  function cells() {
    const out = [], s = 30, h = s * Math.sqrt(3) / 2, W = 4 * s;
    [7, 5, 1].forEach((n, ri) => {
      const base = (n + 1) / 2 * s, x0 = (W - base) / 2, y = (2 - ri) * h;
      for (let i = 0; i < n; i++) {
        const x = x0 + (i * s) / 2;
        out.push(i % 2 === 0 ? [[x, y + h], [x + s / 2, y], [x + s, y + h]] : [[x, y], [x + s, y], [x + s / 2, y + h]]);
      }
    });
    // map the stack onto a half-circle seen from the front, so it reads as the dome: rounded shoulders, a low crown
    const G = 3 * h, cx = W / 2, Rd = W / 2;
    const half = (up) => (up <= 2 * h ? 2 * s - (up / h) * s / 2 : (s / 2) * (1 - (up - 2 * h) / h));   // the stack's half-width at that height
    return out.map((t) => t.map(([x, y]) => {
      const up = G - y, th = (up / G) * (Math.PI / 2) * 0.97, hw = half(up);
      const u = hw > 0.01 ? (x - cx) / hw : 0;
      return [cx + u * Rd * Math.cos(th), G - Rd * Math.sin(th) * 1.02];
    }));
  }
  function svg(opts = {}) {
    const st = read(), D = window.DOME, places = D ? D.places : [];
    const cs = cells(), here = opts.here;
    const tri = cs.map((pts, i) => {
      const p = places[i] || {}, got = st[p.slug], col = got ? SEASON[got.season] || SEASON.summer : "none";
      const cls = `t${got ? " lit" : ""}${here === p.slug ? " here" : ""}`;
      return `<polygon class="${cls}" points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ")}" style="${got ? `fill:${col}` : ""}"><title>${esc(p.name || "")}${got ? ` · ${got.season}` : ""}</title></polygon>`;
    }).join("");
    return `<svg class="rm-dome" viewBox="-6 10 132 74" role="img" aria-label="Your dome: ${Object.keys(st).length ? Object.keys(st).map((k) => (places.find((p) => p.slug === k) || {}).name).filter(Boolean).join(", ") + " lit" : "no triangles lit yet"}">${tri}<line x1="-6" y1="${(cells()[0][0][1]).toFixed(1)}" x2="126" y2="${(cells()[0][0][1]).toFixed(1)}" class="ground"/></svg>`;
  }
  function mark(slug, line) {
    const st = read(); const prev = st[slug];
    st[slug] = { at: new Date().toISOString(), season: season(), line: String(line || "").slice(0, 280), seasons: Array.from(new Set([...(prev && prev.seasons || []), season()])) };
    write(st); return st[slug];
  }
  // The lines you kept, in the order you played
  function lines() { const st = read(), D = window.DOME; return Object.entries(st).filter(([, v]) => v.line).sort((a, b) => a[1].at.localeCompare(b[1].at)).map(([k, v]) => ({ place: (D.places.find((p) => p.slug === k) || {}).name || k, line: v.line, season: v.season })); }

  /* The full game opens only on the property (the card you scanned, plus where you are). Off for now so Eric can walk it
     from home; it switches on with PROPERTY set when the site opens to guests. */
  const PROPERTY = null;   // { lat, lon, metres } — Ashrey to set from the property's address when the cards are printed
  async function onProperty() {
    if (!PROPERTY || !navigator.geolocation) return true;
    return new Promise((res) => navigator.geolocation.getCurrentPosition((p) => {
      const R = 6371000, toR = (d) => d * Math.PI / 180, dLat = toR(p.coords.latitude - PROPERTY.lat), dLon = toR(p.coords.longitude - PROPERTY.lon);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(PROPERTY.lat)) * Math.cos(toR(p.coords.latitude)) * Math.sin(dLon / 2) ** 2;
      res(2 * R * Math.asin(Math.sqrt(a)) <= PROPERTY.metres);
    }, () => res(true), { timeout: 6000, maximumAge: 600000 }));
  }

  window.Remembering = { read, mark, svg, lines, season, onProperty, SEASON };
})();
