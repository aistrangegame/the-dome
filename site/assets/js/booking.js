/* The booking engine, demo edition. Same contract as the Worker (quote → hold → confirm),
   running in the browser with localStorage so the showcase works with no server.
   In production these calls go to /quote, /hold and the Stripe webhook; nothing here takes money. */
window.DomeBooking = (function () {
  const S = window.DOME.sample;
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const seasonOf = (s) => { const m = +s.slice(5, 7); return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter"; };
  const isWeekend = (s) => { const g = new Date(s + "T12:00:00Z").getUTCDay(); return g === 5 || g === 6; };

  function rates() {
    return Object.assign({ base: S.base, weekend: S.weekend, cleaning: S.cleaning, minNights: S.minNights, salesTax: S.salesTax, occupancy: S.occupancy,
      seasonUplift: S.seasonUplift, overrides: {}, policy: "Full refund up to 30 days before arrival; 50% up to 14 days; after that, the deposit is kept." }, get("dome-rates", {}));
  }
  function saveRates(r) { set("dome-rates", r); }
  function bookings() { return get("dome-bookings", []); }
  function holds() { const now = Date.now(); const h = get("dome-holds", []).filter((x) => x.expires > now); set("dome-holds", h); return h; }

  // Price for one night: base → season → weekend → the owners' date override (precedence from docs/booking-architecture.md)
  function nightPrice(s, r = rates()) {
    const o = r.overrides[s] || {};
    if (o.price != null && o.price !== "") return +o.price;
    return r.base + (r.seasonUplift[seasonOf(s)] || 0) + (isWeekend(s) ? r.weekend : 0);
  }
  function nightState(s, r = rates()) {
    const o = r.overrides[s] || {};
    if (o.blocked) return "blocked";
    const taken = (list) => list.some((b) => s >= b.checkin && s < b.checkout && b.status !== "cancelled");
    if (taken(bookings())) return "booked";
    if (taken(holds())) return "held";
    if (s < iso(new Date())) return "past";
    return "open";
  }
  function minNightsFor(s, r = rates()) { const o = r.overrides[s] || {}; return o.min ? +o.min : r.minNights; }

  function quote(checkin, checkout, guests) {
    const r = rates(); const nights = [];
    for (let d = checkin; d < checkout; d = addDays(d, 1)) nights.push({ date: d, price: nightPrice(d, r), state: nightState(d, r) });
    const problems = [];
    if (nights.length < minNightsFor(checkin, r)) problems.push(`A stay starting ${checkin} is at least ${minNightsFor(checkin, r)} nights.`);
    if (nights.some((n) => n.state !== "open")) problems.push("Some of those nights are no longer open.");
    const lodging = nights.reduce((a, n) => a + n.price, 0);
    const taxable = lodging + r.cleaning;
    const lines = [
      { label: `${nights.length} night${nights.length === 1 ? "" : "s"}`, amount: lodging },
      { label: "Cleaning", amount: r.cleaning },
      { label: "NY sales tax (8%)", amount: Math.round(taxable * r.salesTax * 100) / 100 },
      { label: "Delaware County occupancy tax (2%)", amount: Math.round(taxable * r.occupancy * 100) / 100 }
    ];
    const total = Math.round(lines.reduce((a, l) => a + l.amount, 0) * 100) / 100;
    const balanceDue = addDays(checkin, -30);
    const payInFull = balanceDue <= iso(new Date());
    const deposit = payInFull ? total : Math.round(total * 0.5 * 100) / 100;
    return { checkin, checkout, guests, nights, lines, total, deposit, balance: Math.round((total - deposit) * 100) / 100,
      balanceDue: payInFull ? null : balanceDue, payInFull, policy: r.policy, policyVersion: "draft-1", problems, ok: problems.length === 0 && nights.length > 0 };
  }
  function hold(q) {
    const h = holds(); const id = "H" + Math.random().toString(36).slice(2, 8).toUpperCase();
    h.push({ id, checkin: q.checkin, checkout: q.checkout, expires: Date.now() + 35 * 60 * 1000 }); set("dome-holds", h);
    return { id, expires: Date.now() + 35 * 60 * 1000 };
  }
  function confirm(holdId, q, guest) {
    // In production only Stripe's verified checkout.session.completed does this.
    set("dome-holds", holds().filter((x) => x.id !== holdId));
    const b = bookings();
    const code = "DOME-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const booking = { code, checkin: q.checkin, checkout: q.checkout, guests: q.guests, quote: q, guest, status: "deposit paid (test)", at: new Date().toISOString(), test: true };
    b.push(booking); set("dome-bookings", b);
    return booking;
  }
  function ics(b) {
    const d = (s) => s.replace(/-/g, "");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Catskill Mountain Domes//EN", "BEGIN:VEVENT", `UID:${b.code}@catskillmountaindomes`,
      `DTSTAMP:${d(iso(new Date()))}T000000Z`, `DTSTART;VALUE=DATE:${d(b.checkin)}`, `DTEND;VALUE=DATE:${d(b.checkout)}`,
      "SUMMARY:Your stay at Catskill Mountain Domes", "DESCRIPTION:Under the same sky. Your door code and wifi details arrive 24 to 48 hours before you do.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }
  return { rates, saveRates, bookings, holds, nightPrice, nightState, minNightsFor, quote, hold, confirm, ics, iso, addDays, seasonOf };
})();
