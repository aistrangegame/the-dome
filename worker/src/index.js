// The Dome Worker — stub. Every route answers 501 until it is built (Phase 1).
// Design: docs/booking-architecture.md

const ROUTES = [
  ["GET", /^\/availability$/],
  ["POST", /^\/quote$/],
  ["POST", /^\/hold$/],
  ["POST", /^\/stripe\/webhook$/],
  ["GET", /^\/cal\/[A-Za-z0-9_-]+\.ics$/],
  ["POST", /^\/words$/],
  ["POST", /^\/tally$/],
  ["GET", /^\/lookup$/],
  ["*", /^\/dash\//],
];

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const known = ROUTES.some(([m, re]) => (m === "*" || m === request.method) && re.test(pathname));
    if (known) return new Response("Not built yet", { status: 501 });
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
  },
};

// One per property: the only gatekeeper for nights. Airtable mirrors, never locks.
export class Property {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch() { return new Response("Not built yet", { status: 501 }); }
  async alarm() { /* releases expired holds; safe to run twice */ }
}
