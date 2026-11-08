// Strap slider: flat strap hardware for webbing: a tri-glide adjuster, a keeper loop, a rectangle ring or a D-ring.
// Print: flat as shown, no supports. PETG or nylon. Not load-rated: bags and straps, not anything you hang from.
// Every number below is a slider (Params). From the BREPcode catalog: strap-slider.
const kind = "slider";  // [slider, keeper, rectangle, dring] which piece
const strapW = 25.4;    // [10:52] webbing width, mm
const strapT = 2.5;     // [1:5] webbing thickness, mm
const bar = 3.5;        // [2:6] bar width, mm
const thick = 3;        // [2:6] part thickness, mm

const sw = strapW + 1;                            // slot length: the webbing plus room
const sh = strapT + 0.8;                          // slot height
const rc = Math.min(2.5, bar);                    // corner rounding
const plate = (w, d) => hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (w / 2 - rc), sy * (d / 2 - rc), 0], cylinder({ r: rc, h: thick, $fn: 24 }))));
const slotAt = (y, h) => translate([-sw / 2, y - h / 2, -1], cube([sw, h, thick + 2]));
const W = sw + 2 * bar;
if (kind === "dring") {
  // a straight bar for the webbing and a half-round loop opposite it
  const R = W / 2;
  // the straight side is the bottom edge; the round half sits on top of it
  const outer = hull(translate([-W / 2, 0, 0], cube([W, R, thick])), translate([0, R, 0], cylinder({ r: R, h: thick, $fn: 64 })));
  const inner = hull(translate([-sw / 2, bar, -1], cube([sw, R - bar, thick + 2])), translate([0, R, -1], cylinder({ r: R - bar, h: thick + 2, $fn: 64 })));
  return translate([0, -R, 0], difference(outer, inner));
}
if (kind === "slider") {
  // two slots either side of a centre bar
  const D = 2 * sh + 3 * bar;
  return difference(plate(W, D), slotAt(-(sh + bar) / 2, sh), slotAt((sh + bar) / 2, sh));
}
// a keeper has one snug slot; a rectangle ring a roomier one
const h = kind === "keeper" ? 2 * sh : Math.max(2 * sh, sw * 0.4);
return difference(plate(W, h + 2 * bar), slotAt(0, h));
