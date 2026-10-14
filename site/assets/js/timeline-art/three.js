/* The first three moments: the proposal, Scrabble by lantern, the harvest supermoon. */
(function () {
  const { HEAD, STARS, lerp, seg } = window.TL;

  TL.register("A proposal", {
    vb: [100, 110, 460, 410], ground: 470, hero: [262, 296], bed: "night",
    under: STARS(30, 7, [100, 110, 460, 190]),
    strokes: [
      { beat: "place", d: "M100 470 H560", t: .9, c: "thin" },
      { beat: "place", d: "M366 470 C366 306 552 306 552 470", t: 1.3 },
      { beat: "place", d: "M390 420 L459 470 L528 420 M380 446 L459 384 L538 446 M414 358 L459 384 L504 358 M459 330 V384", t: 1.1, c: "thin" },
      // she stands, a hand rising to her mouth
      { beat: "people", d: HEAD(206, 236, 17), t: .45, c: "cream" },
      { beat: "people", d: "M200 258 C186 322 184 420 178 470 M212 258 C226 322 230 420 236 470 M178 470 Q207 477 236 470", t: 1.2, c: "cream" },
      { beat: "people", d: "M211 270 C230 286 234 262 218 250", t: .45, c: "cream" },
      // he kneels on one knee, reaching up with the ring
      { beat: "people", d: HEAD(330, 312, 15), t: .45, c: "cream" },
      { beat: "people", d: "M334 330 C352 352 357 384 350 404 C336 398 322 398 314 402 C313 426 312 448 312 470 M350 404 C356 430 360 452 362 468 C374 470 384 470 394 470", t: 1.4, c: "cream" },
      { beat: "people", d: "M328 340 C308 330 290 314 272 302", t: .6, c: "cream" }
    ],
    // the point becomes the ring; the ring's light opens into a circle around the two of them
    heroSvg: `<circle class="fill breathe" cx="262" cy="296" r="80" fill="url(#gl)"/>
      <circle class="h-halo" cx="262" cy="296" r="1" fill="url(#gl)" stroke="#E2C48A" stroke-width="1.4" opacity="0"/>
      <circle class="h-ring" cx="262" cy="296" r="1" fill="none" stroke="#F5DCA8" stroke-width="3.2"/>
      <path class="ln" pathLength="1" d="M253 284 L262 271 L271 284 L262 291 Z"/>
      <path class="ln thin" pathLength="1" d="M262 252 V234 M290 266 L303 253 M234 266 L221 253 M298 296 H314 M226 296 H210"/>
      <path class="glint" d="M262 262 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 Z" fill="#FFF8E6"/>`,
    swell(svg, f) {
      const a = seg(f, 0, .4), b = seg(f, .35, 1);
      svg.querySelector(".h-ring").setAttribute("r", (1 + 10 * a).toFixed(2));
      const h = svg.querySelector(".h-halo");
      h.setAttribute("cx", lerp(262, 278, b).toFixed(1)); h.setAttribute("cy", lerp(296, 352, b).toFixed(1)); h.setAttribute("r", (11 + 168 * b).toFixed(1));
      h.setAttribute("opacity", b ? (0.9 - b * 0.35).toFixed(2) : 0); h.setAttribute("fill-opacity", (0.35 * (1 - b)).toFixed(2));
    },
    fills: `<path class="fill" d="M366 470 C366 306 552 306 552 470 Z" fill="rgba(245,240,232,.06)"/>`,
    burst: { x: 262, y: 290, n: 18 }, tone: [523.25, 659.25, 783.99]
  });

  TL.register("Scrabble by lantern", {
    vb: [60, 20, 480, 540], ground: 452, hero: [300, 190], bed: "room",
    strokes: [
      { beat: "place", d: "M70 452 H530 M112 452 L98 548 M488 452 L502 548", t: 1.0, c: "thin" },
      { beat: "place", d: "M168 440 L226 384 H374 L432 440 Z M188 421 H412 M208 402 H392 M254 384 L224 440 M300 384 V440 M346 384 L376 440", t: 1.3, c: "thin" },
      { beat: "place", d: "M300 24 V84 M300 84 a12 12 0 1 0 0.1 0 M268 110 H332 L342 128 H258 Z", t: .9 },
      { beat: "place", d: "M266 128 V232 Q300 250 334 232 V128 M283 128 V236 M317 128 V236 M258 232 H342 L332 250 H268 Z", t: 1.2 },
      // three of them, bent over the board
      { beat: "people", d: HEAD(176, 346, 17) + " M162 362 C140 392 140 424 148 452 M172 368 C198 392 222 404 244 414", t: 1.3, c: "cream" },
      { beat: "people", d: HEAD(424, 346, 17) + " M438 362 C460 392 460 424 452 452 M428 368 C402 392 378 404 356 414", t: 1.3, c: "cream" },
      { beat: "people", d: HEAD(300, 304, 14) + " M268 372 C274 346 288 334 300 334 C312 334 326 346 332 372 M280 350 C270 362 264 374 260 384 M320 350 C330 362 336 374 340 384", t: 1.1, c: "cream" }
    ],
    // the point becomes the flame, and its light falls on the board
    heroSvg: `<path class="fill" d="M262 252 L150 452 H450 L338 252 Z" fill="url(#beam)"/>
      <circle class="fill flick" cx="300" cy="186" r="210" fill="url(#gl)"/>
      <g class="h-flame" transform="translate(300 214) scale(0)"><path class="flame" d="M0 0 C-14 -16 -6 -34 0 -54 C6 -34 14 -16 0 0 Z" fill="#FFE2A8"/><path class="flame b" d="M0 0 C-6 -8 -3 -18 0 -30 C3 -18 6 -8 0 0 Z" fill="#FFF8E6"/></g>
      ${[0, 1, 2, 3, 4].map((i) => `<circle class="fill mote" cx="${240 + i * 30}" cy="${430 - i * 9}" r="1.6" fill="#FFE9C2" style="animation-delay:${i * 1.2}s"/>`).join("")}`,
    swell(svg, f) { svg.querySelector(".h-flame").setAttribute("transform", `translate(300 214) scale(${f.toFixed(3)})`); },
    fills: `<g class="fill" font-family="Lora, serif" font-size="15" fill="#1A2218" text-anchor="middle">${[..."LANTERN"].map((c, i) => `<g transform="translate(${225 + i * 25} 408)"><rect x="-10" y="-11" width="20" height="20" rx="3" fill="#F2E3C4"/><text y="5">${c}</text></g>`).join("")}</g>`,
    burst: { x: 300, y: 190, n: 12, warm: true }, tone: [392, 493.88, 587.33]
  });

  TL.register("The harvest supermoon", {
    vb: [20, 60, 560, 500], ground: 540, hero: [300, 250], heroFrom: [300, 352], bed: "fire",
    under: STARS(44, 11, [20, 60, 560, 230]),
    sky: "M-600 392 L20 392 L110 318 L184 352 L270 286 L352 336 L438 292 L580 386 L1200 386 V-600 H-600 Z",
    strokes: [
      { beat: "place", d: "M20 392 L110 318 L184 352 L270 286 L352 336 L438 292 L580 386", t: 1.5 },
      { beat: "place", d: "M226 520 Q300 552 374 520 M238 516 L248 494 M292 526 L294 500 M346 518 L336 496", t: 1.0, c: "thin" },
      // two of them by the fire, tea in hand
      { beat: "people", d: HEAD(160, 418, 16) + " M152 436 C138 464 140 496 148 526 C170 520 186 512 196 500 M158 448 C172 466 184 474 190 480", t: 1.4, c: "cream" },
      { beat: "people", d: HEAD(440, 418, 16) + " M448 436 C462 464 460 496 452 526 C430 520 414 512 404 500 M442 448 C428 466 416 474 410 480", t: 1.4, c: "cream" },
      { beat: "people", d: "M184 478 h14 v14 h-14 Z M402 478 h14 v14 h-14 Z", t: .5, c: "thin" }
    ],
    // the point rises from behind the ridge and becomes the moon
    heroSvg: `<g clip-path="url(#sky)"><circle class="fill breathe" cx="300" cy="250" r="270" fill="url(#gl)"/>
      <circle class="h-moon" cx="300" cy="352" r="3" fill="url(#moon)"/>
      <path class="ln" pathLength="1" d="M300 250 m-138 0 a138 138 0 1 0 276 0 a138 138 0 1 0 -276 0"/>
      <path class="ln thin" pathLength="1" d="M248 206 a18 18 0 1 0 0.1 0 M342 272 a26 26 0 1 0 0.1 0 M300 168 a9 9 0 1 0 0.1 0 M232 290 a11 11 0 1 0 0.1 0"/></g>
      <g transform="translate(300 510)"><path class="fill flame" d="M0 0 C-22 -24 -6 -46 0 -76 C6 -46 22 -24 0 0 Z" fill="#FFB25E"/><path class="fill flame b" d="M0 0 C-10 -12 -4 -26 0 -42 C4 -26 10 -12 0 0 Z" fill="#FFF0C8"/></g>
      <path class="fill steam" pathLength="1" d="M191 470 c-7 -9 7 -13 0 -24 c-7 -9 7 -13 0 -24 M409 470 c-7 -9 7 -13 0 -24 c-7 -9 7 -13 0 -24" fill="none" stroke="rgba(245,240,232,.6)" stroke-width="1.4"/>`,
    swell(svg, f) { const m = svg.querySelector(".h-moon"); m.setAttribute("r", (3 + 135 * f).toFixed(1)); m.setAttribute("cy", (352 - 102 * Math.min(1, f * 1.15)).toFixed(1)); },
    fills: "",
    burst: { x: 300, y: 250, n: 10, warm: true }, tone: [329.63, 415.3, 493.88]
  });
})();
