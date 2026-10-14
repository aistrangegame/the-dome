/* The library wall: pull a book.
   Preview: run a finger (or the cursor, or the arrow keys) along the spines, each one ticks and leans as you pass;
   tap one (or press Enter) to pull it: it slides out and opens, and a guest's words come with it. Three books, three voices.
   After "Swipe along the spines" (remembering-plan §4, earth). A lantern goes where your hand goes: the evening the power went out. */
Scene.register("library", {
  title: "Pull a book",
  line: "Shelves of other people’s favourite books, and rain on the glass. Run your hand along them and pull one out.",
  full: false,
  voiceAt: "top",
  mount(k) {
    const { g } = k.canvas();
    const view = () => ({ W: k.stage.clientWidth, H: k.stage.clientHeight });
    const COLS = ["#6E2A22", "#7E5128", "#94683A", "#3B4733", "#2E3A42", "#5E4234", "#B08A55", "#52293A", "#7D6F55", "#43352A", "#A2744F", "#C9A96E", "#344A44", "#8A3F2C"];
    let books = [], lw = 0, lh = 0, shelves = 2, top = 0, sh = 0, cur = null, over = -1, pulls = 0, anim = null, shown = 0, done = false, lastSay = "";
    const pulledAt = new Set(), moss = [];
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Run your finger along the spines (or use the arrow keys). Tap one (or press Enter) to pull it out.");

    function layout(W, H) {
      lw = W; lh = H; shelves = H > W ? 3 : 2; top = H * .3; sh = (H * .95 - top) / shelves;
      let seed = 21; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const left = W > H ? W * .13 : W * .05, right = W - (W > H ? W * .04 : W * .05), sc = Math.max(.6, Math.min(1.1, W / 900));
      books = [];
      for (let s = 0; s < shelves; s++) {
        let x = left + rnd() * 6;
        while (true) {
          const w = (13 + rnd() * 17) * sc; if (x + w > right) break;
          const hh = sh * (.58 + rnd() * .3);
          books.push({ x, w, h: hh, s, col: COLS[Math.floor(rnd() * COLS.length)], band: rnd(), lean: 0, out: 0 });
          x += w + (rnd() < .07 ? 10 * sc : 1.2);
        }
      }
      books.forEach((b, i) => { if (pulledAt.has(i)) b.out = 1; });
      moss.length = 0;
      if (W > H) for (let i = 0; i < 520; i++) { const y = top - 8 + rnd() * (H * .95 - top + 8), edge = W * .1 * (.75 + .25 * Math.sin(y * .05));
        moss.push({ x: rnd() * edge, y, r: 1 + rnd() * 3.2, c: rnd() }); }
    }

    const at = (x, y) => {
      const s = Math.max(0, Math.min(shelves - 1, Math.floor((y - top) / sh)));
      let best = -1, bd = 14;                 // the spine under the finger, or the nearest one across a gap
      for (let i = 0; i < books.length; i++) { const b = books[i]; if (b.s !== s) continue;
        const d = x < b.x ? b.x - x : x > b.x + b.w ? x - b.x - b.w : 0; if (d < bd) { bd = d; best = i; if (!d) break; } }
      return best;
    };

    k.drag(({ x, y, dx, key }) => {
      if (anim) return;
      cur = { x, y };
      const i = at(x, y);
      if (i !== over) {
        over = i;
        if (i >= 0) { books[i].lean = Math.max(-.09, Math.min(.09, (dx || 1) * (key ? .006 : .015))); k.noise(.045, .05, 1500 + Math.random() * 500); k.tone(150 + Math.random() * 40, .09, .03, "triangle"); }
      }
    });
    k.tap(({ x, y, key }) => {
      if (anim && anim.t > 4.4 && !done) anim = null;     // the last book is on its way home; let the next one come
      if (anim || done) return;
      if (key && !cur) cur = { x, y };
      const p = key ? cur : { x, y }, i = at(p.x, p.y);
      if (i < 0) return;
      cur = { x: p.x, y: p.y }; over = i;
      if (pulledAt.has(i)) { say("You’ve opened that one. Try another spine."); return; }
      pulledAt.add(i); pulls++; anim = { i, t: 0 }; k.haptic(15);
      k.noise(.35, .05, 700, "lowpass"); k.tone(110, .6, .04);
    });

    k.loop((dt, t) => {
      const { W, H } = view();
      if (!W || !H) return;
      if (W !== lw || H !== lh) layout(W, H);
      for (let i = 0; i < books.length; i++) books[i].lean *= Math.max(0, 1 - dt * 3);
      if (anim) {
        anim.t += dt;
        const b = books[anim.i]; b.out = Math.min(1, anim.t / .6);
        if (anim.t > 1.4 && shown < pulls) {
          shown = pulls; k.reveal(pulls - 1); k.tone([392, 440, 523.25][pulls - 1], 2.8, .035);
          if (pulls >= 3) { done = true; say(""); k.done(); }
          else say(pulls === 1 ? "Another one. Any spine you like." : "One more.");
        }
        if (anim.t > 5.4) anim = null;
      }
      k.progress(Math.min(1, (shown + (anim && shown < pulls ? Math.min(1, anim.t / 1.4) : 0)) / 3));
      draw(W, H, t, dt);
    });

    function draw(W, H, t, dt) {
      g.fillStyle = "#0A0B09"; g.fillRect(0, 0, W, H);
      // rain on the glass up top, faint
      if (!k.reduce) { g.strokeStyle = "rgba(170,190,200,.07)"; g.lineWidth = 1; g.beginPath();
        for (let i = 0; i < 40; i++) { const x = ((i * 97.3) % W), y = ((t * 220 + i * 53) % (top + 40)) - 40; g.moveTo(x, y); g.lineTo(x - 3, y + 16); } g.stroke(); }
      // the wall behind the shelves
      g.fillStyle = "#15110D"; g.fillRect(0, top - 10, W, H - top + 10);
      // the moss wall, on wide screens
      for (let i = 0; i < moss.length; i++) { const m = moss[i]; g.fillStyle = m.c < .3 ? "#16231A" : m.c < .6 ? "#22351F" : m.c < .88 ? "#2E4527" : "#4A6234"; g.beginPath(); g.arc(m.x, m.y, m.r, 0, Math.PI * 2); g.fill(); }
      // shelves and books
      for (let s = 0; s < shelves; s++) { const y = top + (s + 1) * sh; g.fillStyle = "#3A2A1C"; g.fillRect(0, y - 6, W, 8); g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, y + 2, W, 5); }
      for (let i = 0; i < books.length; i++) { if (anim && anim.i === i && anim.t > .6 && anim.t < 5.2) continue; spine(books[i], i === over && !anim); }
      // the lantern, where your hand is
      const lx = cur ? cur.x : W / 2, ly = cur ? cur.y : top + sh * .6;
      const lg = g.createRadialGradient(lx, ly, 6, lx, ly, Math.max(W, H) * .32);
      lg.addColorStop(0, "rgba(255,196,120,.2)"); lg.addColorStop(1, "rgba(255,196,120,0)"); g.fillStyle = lg; g.fillRect(0, 0, W, H);
      // the rest of the room is in shadow
      const v = g.createRadialGradient(lx, ly, Math.min(W, H) * .2, lx, ly, Math.max(W, H) * .85); v.addColorStop(0, "rgba(7,11,9,0)"); v.addColorStop(1, "rgba(7,11,9,.6)");
      g.fillStyle = v; g.fillRect(0, 0, W, H);
      if (anim && anim.t > .6) openBook(W, H, t);
    }

    function spine(b, hot) {
      const base = top + (b.s + 1) * sh - 6, lift = b.out * 5;
      g.save(); g.translate(b.x + b.w / 2, base); g.rotate(b.lean);
      if (b.out > 0) { g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-b.w / 2 + 3, -b.h + 3, b.w, b.h); }
      g.fillStyle = b.col; g.fillRect(-b.w / 2 - lift * .3, -b.h - lift, b.w + lift * .6, b.h + lift);
      g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(b.w / 2 - b.w * .2 + lift * .3, -b.h - lift, b.w * .2, b.h + lift);
      g.fillStyle = "rgba(255,240,210,.08)"; g.fillRect(-b.w / 2 - lift * .3, -b.h - lift, b.w * .18, b.h + lift);
      g.fillStyle = "rgba(226,196,138,.55)";
      const y1 = -b.h - lift + b.h * (.08 + b.band * .06), y2 = -lift - b.h * (.1 + b.band * .05);
      g.fillRect(-b.w / 2 + 2, y1, b.w - 4, 1.4); g.fillRect(-b.w / 2 + 2, y2, b.w - 4, 1.4);
      if (b.band > .55) { g.fillStyle = "rgba(245,240,232,.5)"; g.fillRect(-b.w * .25, -b.h - lift + b.h * .3, b.w * .5, b.h * .14); }
      if (hot) { g.strokeStyle = "rgba(226,196,138,.75)"; g.lineWidth = 1.2; g.strokeRect(-b.w / 2 - lift * .3, -b.h - lift, b.w + lift * .6, b.h + lift); }
      g.restore();
    }

    // the pulled book comes to you and falls open; its pages hold lines too faint to read, the guest's words come with it
    function openBook(W, H, t) {
      const b = books[anim.i], a = anim.t;
      const fly = ease(Math.min(1, (a - .6) / .8)), back = a > 4.4 ? ease(Math.min(1, (a - 4.4) / .8)) : 0, f = fly * (1 - back);
      const ow = Math.min(W * .72, 520), oh = Math.min(ow * .62, H * .5), cx = W / 2, cy = Math.max(top + oh * .5 + 14, H * .6);
      const sx = b.x + b.w / 2, sy = top + (b.s + 1) * sh - 6 - b.h / 2;
      const x = sx + (cx - sx) * f, y = sy + (cy - sy) * f, open = Math.min(1, Math.max(0, (a - 1.0) / .5)) * (1 - back);
      const w = b.w + (ow - b.w) * f, hh = b.h + (oh - b.h) * f;
      g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(x - w / 2 + 8, y - hh / 2 + 10, w, hh);
      if (open < .02) { g.fillStyle = b.col; g.fillRect(x - Math.max(b.w, w * .5) / 2, y - hh / 2, Math.max(b.w, w * .5), hh); return; }
      // cover, then two pages; the right page swings open
      g.fillStyle = b.col; g.fillRect(x - w / 2 - 6, y - hh / 2 - 6, w + 12, hh + 12);
      const pw = w / 2;
      g.fillStyle = "#EDE4D0"; g.fillRect(x - pw, y - hh / 2, pw, hh);
      const rw = pw * open; g.fillStyle = "#F5EEDC"; g.fillRect(x, y - hh / 2, rw, hh);
      const gs = g.createLinearGradient(x - 16, 0, x + 16, 0); gs.addColorStop(0, "rgba(0,0,0,0)"); gs.addColorStop(.5, "rgba(60,40,20,.28)"); gs.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gs; g.fillRect(x - 16, y - hh / 2, 32, hh);
      g.fillStyle = "rgba(90,70,50,.18)";
      const lines = Math.floor(hh / 14) - 2;
      for (let i = 0; i < lines; i++) { const ly = y - hh / 2 + 18 + i * 14 * (hh - 30) / (lines * 14); const lw1 = pw * (i % 5 === 4 ? .45 : .78), lw2 = rw * (i % 4 === 3 ? .5 : .78);
        g.fillRect(x - pw + pw * .11, ly, lw1, 2); if (rw > pw * .2) g.fillRect(x + pw * .11 * open, ly, lw2, 2); }
      if (!k.reduce && open >= 1 && a < 4.4) {            // one page lifts and settles, like a draught from the door
        const lift = Math.max(0, Math.sin((a - 1.5) * 1.6)) * .3;
        if (lift > .01) {
          g.save(); g.translate(x, y - hh / 2); g.transform(1 - lift, -lift * .18, 0, 1, 0, 0);
          g.fillStyle = "rgba(40,28,16,.18)"; g.fillRect(4, 6, pw, hh);
          g.fillStyle = "#F8F2E2"; g.fillRect(0, 0, pw, hh);
          g.fillStyle = "rgba(90,70,50,.18)";
          for (let i = 0; i < lines; i++) { const ly = 18 + i * 14 * (hh - 30) / (lines * 14); g.fillRect(pw * .11, ly, pw * (i % 4 === 1 ? .5 : .78), 2); }
          g.restore();
        }
      }
    }
    function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  }
});
