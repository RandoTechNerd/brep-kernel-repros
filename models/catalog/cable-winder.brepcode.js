// Cable winder: a flat bobbin a cable winds round, with slits in the ends that grip the plug and the tail.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: cable-winder.
const length = 70;   // [30:200] length, mm
const barW = 18;     // [8:80] middle bar width, mm
const endW = 40;     // [15:120] end width, mm
const endL = 10;     // [5:30] end length, mm
const plateT = 3;    // [2:8] thickness, mm
const cableD = 3.5;  // [1.5:12] cable diameter, mm

const ew = Math.max(endW, barW + 6);                 // the ends always stand out past the bar
const el = Math.min(endL, length / 3);
const L = length / 2, B = barW / 2, E = ew / 2;
const outline = [[-L, -E], [-L + el, -E], [-L + el, -B], [L - el, -B], [L - el, -E], [L, -E],
  [L, E], [L - el, E], [L - el, B], [-L + el, B], [-L + el, E], [-L, E]];
const winder = linearExtrude({ h: plateT }, polygon(outline));
// a slit into each end, in the part that stands out past the bar, with a round seat for the cable
const sy = (B + E) / 2, sw = cableD * 0.75, sl = el * 0.7;
const slits = [-1, 1].flatMap((s) => [
  translate([s > 0 ? L - sl : -L - 1, sy - sw / 2, -1], cube([sl + 1, sw, plateT + 2])),
  translate([s * (L - sl), sy, -1], cylinder({ d: cableD + 0.2, h: plateT + 2, $fn: 20 })),
]);
return difference(winder, ...slits);
