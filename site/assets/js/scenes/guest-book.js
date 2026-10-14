/* The guest book table: write one line.
   Open the book (tap it, or Enter), write one line for the person who sleeps here next, then choose:
   seal it (it folds into an envelope under wax), leave it in the book (the ink settles into the page),
   or let it go (it lifts off as light). Kept on this device only, never sent anywhere.
   After padakarshini "The Letter". */
Scene.register("guest-book", {
  title: "Write one line",
  line: "The book is open on the table. Leave one line for whoever sleeps here next.",
  full: false,
  voiceAt: "top",
  mount(k) {
    const { g } = k.canvas();
    const stage = k.stage;
    const view = () => ({ W: stage.clientWidth, H: stage.clientHeight });
    const KEY = "dome-guest-book-line";
    let state = "closed", open = 0, text = "", choice = null, endT = 0, lastSay = "", wrote = false;
    const motes = [];
    const say = (t) => { if (t !== lastSay) { lastSay = t; k.say(t); } };
    say("Tap the book to open it (or press Enter).");
    k.progress(0.04);

    // the book's place on the table: centred on wide stages; on a phone, closer in, the right page in the middle
    function book(W, H) {
      const ph = Math.min(H * .6, (W < H ? W * .78 : W * .3) * 1.2), pw = ph / 1.2;
      const gx = W < H ? W / 2 - pw / 2 : W / 2, top = H * .335;
      return { pw, ph, gx, top, rx: gx + pw * .04, inner: pw * .12 };
    }

    // the line itself: an input on the page, in ink
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;z-index:1;display:none;flex-direction:column;gap:6px;opacity:0;transition:opacity .9s ease";
    const ta = document.createElement("textarea");
    ta.rows = 3; ta.maxLength = 140; ta.setAttribute("aria-label", "Your line, for the person who sleeps here next");
    ta.placeholder = "For the person who sleeps here next…";
    ta.setAttribute("autocomplete", "off"); ta.setAttribute("enterkeyhint", "done");
    ta.style.cssText = "width:100%;resize:none;border:0;outline:0;background:transparent;color:#2A1F16;font:italic 400 17px/1.55 Lora,Georgia,serif;padding:2px 0;margin:0;user-select:text;-webkit-user-select:text;caret-color:#7A4E24;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.55em - 1px),rgba(122,78,36,.22) calc(1.55em - 1px),rgba(122,78,36,.22) 1.55em);background-attachment:local";
    const note = document.createElement("p");
    note.textContent = "Stays on this device.";
    note.style.cssText = "margin:0;font:500 12px/1.3 'DM Sans',sans-serif;color:rgba(42,31,22,.62)";
    wrap.append(ta, note);
    const row = document.createElement("div");
    row.style.cssText = "position:absolute;z-index:1;left:0;right:0;bottom:16px;display:none;flex-wrap:wrap;justify-content:center;gap:8px;padding:0 12px;opacity:0;transition:opacity .7s ease";
    const btn = (label, c) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label;
      b.style.cssText = "font:500 15px/1 'DM Sans',sans-serif;color:#F5F0E8;background:rgba(7,11,9,.78);border:1px solid rgba(226,196,138,.55);border-radius:999px;padding:11px 16px;cursor:pointer;min-height:42px";
      b.addEventListener("click", () => choose(c)); return b; };
    row.append(btn("Seal it", "seal"), btn("Leave it in the book", "leave"), btn("Let it go", "go"));
    stage.append(wrap, row);
    const stopKeys = (e) => e.stopPropagation();
    [ta, row].forEach((el) => { el.addEventListener("pointerdown", stopKeys); el.addEventListener("click", stopKeys); });

    function place() {
      const { W, H } = view(), b = book(W, H);
      wrap.style.left = (b.rx + b.inner * .7) + "px"; wrap.style.top = (b.top + b.ph * .16) + "px"; wrap.style.width = (b.pw - b.inner * 1.4) + "px";
    }

    ta.addEventListener("input", () => {
      text = ta.value.replace(/\s+/g, " ");
      if (!wrote && text.trim()) { wrote = true; k.reveal(1); }
      const has = text.trim().length > 1;
      if (has && row.style.display !== "flex") { row.style.display = "flex"; requestAnimationFrame(() => (row.style.opacity = 1)); }
      if (!has) { row.style.opacity = 0; row.style.display = "none"; }
      k.progress(.34 + Math.min(.3, text.trim().length / 120));
      say(has ? "When it’s written, choose what happens to it." : "Write one line. Anything you’d want to find here.");
    });
    ta.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); if (text.trim().length > 1) row.querySelector("button").focus(); }
    });

    const openBook = () => {
      if (state !== "closed") return;
      state = "opening"; k.haptic(12); k.noise(.5, .03, 1800, "bandpass"); k.tone(196, 1.6, .03);
    };
    k.tap(openBook);
    // Space opens it too, and never scrolls the page away while the book is in front of you
    const sceneEl = stage.closest(".scene");
    sceneEl.addEventListener("keydown", (e) => { if (e.key === " " && document.activeElement === sceneEl) { e.preventDefault(); openBook(); } });

    function choose(c) {
      if (state !== "write") return;
      text = ta.value.replace(/\s+/g, " ").trim(); if (text.length < 2) return;
      state = "ending"; choice = c; endT = 0; k.haptic(25);
      try { localStorage.setItem(KEY, JSON.stringify({ text, choice: c, at: new Date().toISOString() })); } catch (e) {}
      ta.blur(); wrap.style.opacity = 0; row.style.opacity = 0;
      setTimeout(() => { wrap.style.display = "none"; row.style.display = "none"; stageFocus(); }, 700);
      say(c === "seal" ? "Sealed, for whoever comes next." : c === "leave" ? "It’s in the book now." : "Let it go.");
      if (c === "seal") { k.noise(.4, .03, 1400, "bandpass"); setTimeout(() => k.tone(130, 1.2, .05), 1900); }
      else if (c === "leave") k.tone(262, 2.6, .03);
      else { k.tone(784, 2.8, .03); setTimeout(() => k.tone(1175, 2.8, .02), 400); }
      if (c === "go") buildMotes();
    }
    const stageFocus = () => { const s = stage.closest(".scene"); if (s) s.focus({ preventScroll: true }); };

    // the line laid out on the page, the way the canvas will draw it
    function layout(b, size) {
      g.font = `italic 400 ${size}px Lora, Georgia, serif`;
      const maxW = b.pw - b.inner * 1.4, words = text.split(" "), lines = []; let line = "";
      words.forEach((w) => { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line); return lines;
    }
    function buildMotes() {
      const { W, H } = view(), b = book(W, H), lines = layout(b, 17);
      lines.forEach((ln, li) => { let x = b.rx + b.inner * .7; for (const ch of ln) { const w = g.measureText(ch).width;
        if (ch.trim()) motes.push({ ch, x, y: b.top + b.ph * .16 + 17 * 1.55 * (li + .75), x0: x, y0: 0, d: Math.random() * .9 + (x - b.rx) / b.pw * .6, vx: (Math.random() - .5) * 30, w });
        x += w; } });
      motes.forEach((m) => (m.y0 = m.y));
    }

    k.loop((dt, t) => {
      dt = Math.max(0, dt);                 // the first frame can arrive a hair before the clock starts
      const { W, H } = view();
      if (state === "opening") {
        open = Math.min(1, open + dt * (k.reduce ? 3 : 1.15));
        if (open >= 1) {
          state = "write"; k.reveal(0); k.progress(.34); place(); wrap.style.display = "flex";
          requestAnimationFrame(() => (wrap.style.opacity = 1)); ta.focus({ preventScroll: true });
          say("Write one line. Anything you’d want to find here.");
        }
      }
      if (state === "write") place();
      if (state === "ending") {
        endT += dt; k.progress(.66 + Math.min(.3, endT / 12));
        if (endT > (k.reduce ? 2.2 : 4.6) && state !== "ended") { state = "ended"; k.done(); }
      }
      draw(W, H, t, dt);
    });

    function draw(W, H, t, dt) {
      const b = book(W, H);
      // the room: dark, a lamp's warmth from the upper left
      g.fillStyle = "#070B09"; g.fillRect(0, 0, W, H);
      const lx = W * .12, ly = -H * .05, lamp = g.createRadialGradient(lx, ly, 10, lx + W * .2, ly + H * .4, Math.max(W, H) * .95);
      lamp.addColorStop(0, "rgba(255,196,120,.42)"); lamp.addColorStop(.45, "rgba(226,160,90,.12)"); lamp.addColorStop(1, "rgba(7,11,9,0)");
      // the table
      const ty = H * .26;
      const tg = g.createLinearGradient(0, ty, 0, H); tg.addColorStop(0, "#21160E"); tg.addColorStop(1, "#130C07");
      g.fillStyle = tg; g.fillRect(0, ty, W, H - ty);
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const y = ty + (H - ty) * (i / 9) + 6; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + 4, W * .6, y - 5, W, y + 2); g.stroke(); }
      g.fillStyle = "rgba(226,196,138,.08)"; g.fillRect(0, ty, W, 2);
      g.fillStyle = lamp; g.fillRect(0, 0, W, H);
      // the pen, resting beside the book
      const px = b.gx + b.pw * 1.08, py = b.top + b.ph * .55;
      if (px < W - 10) { g.save(); g.translate(px, py); g.rotate(-1.25); g.fillStyle = "#0E0B08"; g.fillRect(-b.ph * .3, -3, b.ph * .6, 6); g.fillStyle = "#C9A96E"; g.fillRect(b.ph * .18, -3, b.ph * .04, 6); g.restore(); }

      // shadow under the book
      g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.ellipse(b.gx, b.top + b.ph * 1.02, b.pw * 1.15, b.ph * .07, 0, 0, Math.PI * 2); g.fill();
      const page = (x0, w, flip) => {
        const pg = g.createLinearGradient(x0, 0, x0 + w, 0);
        if (flip) { pg.addColorStop(0, "#E9DFC9"); pg.addColorStop(.85, "#E2D6BC"); pg.addColorStop(1, "#BFAF90"); }
        else { pg.addColorStop(0, "#BFAF90"); pg.addColorStop(.12, "#E6DBC3"); pg.addColorStop(1, "#EFE7D4"); }
        g.fillStyle = pg; g.beginPath(); g.moveTo(x0, b.top + 4); g.quadraticCurveTo(x0 + w / 2, b.top - 4, x0 + w, b.top + 4); g.lineTo(x0 + w, b.top + b.ph); g.quadraticCurveTo(x0 + w / 2, b.top + b.ph - 6, x0, b.top + b.ph); g.closePath(); g.fill();
      };
      const sealing = choice === "seal" && state !== "write";
      const closing = choice === "leave" ? Math.max(0, Math.min(1, (endT - 2.2) / 1.8)) : 0;
      // the cover, under the pages
      g.fillStyle = "#3B2416"; g.fillRect(b.gx - b.pw - 8, b.top - 6, b.pw * 2 + 16, b.ph + 12);
      if (open < 1 && state !== "ending") {
        // closed, then the cover swinging open across the gutter
        page(b.gx, b.pw, false);
        const e = open * open * (3 - 2 * open), cw = b.pw * Math.cos(e * Math.PI);
        if (e > 0) page(b.gx - b.pw * e, b.pw * e, true);
        g.fillStyle = "#4A2E1C"; g.beginPath(); g.rect(b.gx + Math.min(0, cw), b.top - 6, Math.abs(cw) + 8, b.ph + 12); g.fill();
        if (e < .5) { g.strokeStyle = "rgba(226,196,138,.55)"; g.lineWidth = 1.2; g.strokeRect(b.gx + b.pw * .14, b.top + b.ph * .12, b.pw * .72, b.ph * .76);
          g.fillStyle = "rgba(226,196,138,.75)"; g.font = "italic 400 15px Lora, Georgia, serif"; g.textAlign = "center"; g.fillText("Guest book", b.gx + b.pw / 2, b.top + b.ph * .5); g.textAlign = "left";
          if (state === "closed" && !k.reduce) { const a = .25 + .2 * Math.sin(t * 2); g.strokeStyle = `rgba(226,196,138,${a})`; g.lineWidth = 2; g.strokeRect(b.gx - 2, b.top - 8, b.pw + 10, b.ph + 16); } }
        return;
      }
      // open: left page with earlier hands (ink only, no words), right page for this line
      page(b.gx - b.pw, b.pw, true); page(b.gx, b.pw, false);
      g.strokeStyle = "rgba(60,40,24,.28)"; g.lineWidth = 1.1;
      for (let i = 0; i < 9; i++) { const y = b.top + b.ph * (.14 + i * .08), x0 = b.gx - b.pw + b.inner * .7, len = (b.pw - b.inner * 1.4) * (.55 + ((i * 37) % 40) / 100);
        if (i === 3 || i === 7) continue;
        g.beginPath(); g.moveTo(x0, y); for (let x = 0; x < len; x += 6) g.lineTo(x0 + x, y + Math.sin(x * .35 + i * 2) * 1.6 + Math.sin(x * .09 + i) * 1.2); g.stroke(); }
      g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(b.gx - 2, b.top, 4, b.ph);

      if (state !== "ending" && state !== "ended") return;
      const lines = layout(b, 17), lh = 17 * 1.55, x0 = b.rx + b.inner * .7, y0 = b.top + b.ph * .16 + lh * .75;
      if (choice === "leave") {
        // the ink settles: wet and dark, then dry brown, sinking into the page; then the book closes over it
        const dry = Math.min(1, endT / 2.2);
        g.fillStyle = `rgba(${26 + dry * 60},${20 + dry * 34},${16 + dry * 14},${.95 - dry * .2})`;
        lines.forEach((ln, i) => g.fillText(ln, x0, y0 + i * lh));
        if (dry < 1) { g.fillStyle = `rgba(255,240,210,${.25 * (1 - dry)})`; lines.forEach((ln, i) => g.fillText(ln, x0 - .6, y0 + i * lh - .6)); }
        // then the ribbon comes down across the page and keeps the place
        if (closing > 0) { const e = closing * closing * (3 - 2 * closing), x1 = b.gx + b.pw * .065, y1 = b.top - 10, len = b.ph * .98 * e;
          g.save(); g.lineCap = "butt"; g.strokeStyle = "#8A2A1E"; g.lineWidth = Math.max(5, b.pw * .022);
          g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + b.pw * .02, y1 + len * .4, x1 - b.pw * .03, y1 + len * .7, x1 + b.pw * .01, y1 + len); g.stroke();
          g.strokeStyle = "rgba(226,196,138,.35)"; g.lineWidth = 1; g.stroke(); g.restore(); }
      } else if (choice === "go") {
        // each letter lifts as a small light and goes up past the lamp
        motes.forEach((m) => { const s = Math.max(0, endT - m.d);
          if (s <= 0) { g.fillStyle = "#2A1F16"; g.fillText(m.ch, m.x, m.y0); return; }
          const up = k.reduce ? 0 : s * s * 40 + s * 20, a = Math.max(0, 1 - s / 3.2);
          const x = m.x + (k.reduce ? 0 : Math.sin(s * 2 + m.d * 9) * 10 + m.vx * s), y = m.y0 - up;
          if (s < .5) { g.fillStyle = `rgba(42,31,22,${1 - s * 2})`; g.fillText(m.ch, x, y); }
          const r = 2 + Math.min(1, s * 2) * 2, hg = g.createRadialGradient(x + m.w / 2, y - 5, 0, x + m.w / 2, y - 5, r * 4);
          hg.addColorStop(0, `rgba(255,236,190,${a * .9})`); hg.addColorStop(1, "rgba(255,236,190,0)"); g.fillStyle = hg; g.beginPath(); g.arc(x + m.w / 2, y - 5, r * 4, 0, Math.PI * 2); g.fill(); });
      } else if (sealing) {
        // the page folds into an envelope, and the wax comes down on it
        const f = Math.min(1, endT / 1.6), lift = Math.min(1, endT / .6);
        const ew = b.pw * .78, eh = ew * .62, cx = b.rx + b.pw / 2 - b.pw * .02, cy = b.top + b.ph * .5 - lift * 6;
        g.save(); g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 14 * lift; g.shadowOffsetY = 6 * lift;
        if (f < 1) { // the sheet with the words, folding down from the top and up from the bottom
          const h = b.ph * .76 * (1 - f) + eh * f, w = (b.pw - b.inner * .6) * (1 - f) + ew * f;
          g.fillStyle = "#F1E9D8"; g.fillRect(cx - w / 2, cy - h / 2, w, h); g.restore();
          g.save(); g.beginPath(); g.rect(cx - w / 2, cy - h / 2, w, h); g.clip(); g.globalAlpha = 1 - f; g.fillStyle = "#2A1F16";
          lines.forEach((ln, i) => g.fillText(ln, x0, y0 + i * lh)); g.restore();
        } else {
          g.fillStyle = "#EDE3CE"; g.fillRect(cx - ew / 2, cy - eh / 2, ew, eh); g.restore();
          g.strokeStyle = "rgba(120,96,64,.45)"; g.lineWidth = 1;
          g.beginPath(); g.moveTo(cx - ew / 2, cy + eh / 2); g.lineTo(cx, cy + eh * .02); g.lineTo(cx + ew / 2, cy + eh / 2); g.stroke();
          const fl = Math.min(1, (endT - 1.6) / .5);
          g.fillStyle = "#E4D8BF"; g.beginPath(); g.moveTo(cx - ew / 2, cy - eh / 2); g.lineTo(cx, cy - eh / 2 + eh * .58 * fl); g.lineTo(cx + ew / 2, cy - eh / 2); g.closePath(); g.fill(); g.stroke();
          const wx = Math.max(0, Math.min(1, (endT - 2.1) / .35));
          if (wx > 0) { const r = ew * .1 * (1.4 - .4 * wx), sy = cy - eh / 2 + eh * .58;
            g.fillStyle = `rgba(122,30,24,${wx})`; g.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rr = r * (1 + Math.sin(i * 2.7) * .08); g.lineTo(cx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } g.closePath(); g.fill();
            g.strokeStyle = `rgba(226,196,138,${wx * .8})`; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, sy, r * .62, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(cx, sy - r * .4); g.lineTo(cx + r * .35, sy + r * .25); g.lineTo(cx - r * .35, sy + r * .25); g.closePath(); g.stroke();
            if (wx >= 1 && endT < 2.6) { k.ripple(cx, sy, .5); endT = Math.max(endT, 2.6); } }
        }
      }
    }
  }
});
