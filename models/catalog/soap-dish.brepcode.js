// Soap dish: a draining soap dish with raised ribs and drain slots, with an optional drip tray it sits in.
// Print: upright as shown, dish and drip tray side by side, no supports. PETG takes hot water and soap better than PLA.
// Every number below is a slider (Params). From the BREPcode catalog: soap-dish.
const width = 110;   // [50:200] outside width at the base, mm
const depth = 80;    // [40:160] outside depth at the base, mm
const height = 20;   // [8:50] dish height, mm
const cornerR = 16;  // [3:80] corner radius (half the depth = round ends), mm
const wall = 2.4;    // [1.6:5] wall thickness, mm
const floor = 2.4;   // [1.6:5] floor thickness, mm
const ribs = 7;      // [0:20] ribs the soap sits on
const ribH = 3;      // [1:8] rib height, mm
const drainW = 3;    // [0:6] drain slot width (0 = none), mm
const tray = "yes";  // [yes, no] drip tray beside it

const k = Math.tan(8.5 * Math.PI / 180);             // the walls lean out 8.5 degrees
const rr = Math.max(wall + 1, Math.min(cornerR, width / 2, depth / 2));
// a rounded box from half-sizes; the corner centres stay put as r changes, so offsets stay concentric
const rbox = (hw, hd, r, z, h, grow) => hull(...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sy]) =>
  translate([sx * Math.max(0, hw - r), sy * Math.max(0, hd - r), z], cylinder({ r1: r, r2: r + grow, h, $fn: 40 }))));
const hw = width / 2, hd = depth / 2;
const fl = Math.min(floor, height - 3);
const ihw = hw - wall + fl * k, ihd = hd - wall + fl * k, ir = rr - wall + fl * k;
const dishBody = difference(
  rbox(hw, hd, rr, 0, height, height * k),
  rbox(ihw, ihd, ir, fl, height - fl + 1, (height - fl + 1) * k),
);

// ribs across the floor, clipped to the inside so they run right into the walls
const rh = Math.min(ribH, height - fl - 1);
const pitch = 2 * ihw / (ribs + 1);
const ribT = Math.max(1.6, Math.min(3, pitch * 0.3));
const parts = [dishBody];
if (ribs > 0) {
  const bar = (x) => translate([x, hd + 1, fl - 0.01], rotate([90, 0, 0], linearExtrude({ h: depth + 2 },
    polygon([[-ribT / 2, 0], [ribT / 2, 0], [ribT / 4, rh + 0.01], [-ribT / 4, rh + 0.01]]))));
  const bars = Array.from({ length: ribs }, (_, i) => bar(-ihw + (i + 1) * pitch));
  parts.push(intersection(union(...bars), rbox(ihw + 0.4, ihd + 0.4, ir + 0.4, fl - 0.02, rh + 0.03, rh * k)));
}
let dish = union(...parts);

// drain slots between the ribs, stopping 3 mm short of the walls
const sw = Math.min(drainW, pitch - ribT - 1);
if (sw >= 1) {
  const m = 3;
  const slotBars = Array.from({ length: ribs + 1 }, (_, j) => translate([-ihw + (j + 0.5) * pitch - sw / 2, -hd, -1], cube([sw, depth, fl + 2])));
  dish = difference(dish, intersection(union(...slotBars), rbox(ihw - m, ihd - m, Math.max(0.5, ir - m), -1.5, fl + 3, 0)));
}
if (tray !== "yes") return dish;

// the drip tray: the dish sits inside it on three low supports
const c = 2 + height * k * 0.4;                      // room round the dish, which leans out as it rises
const tw = Math.max(2, wall * 0.8), tf = Math.max(2, floor * 0.8), sup = Math.max(2.5, ribH * 0.6);
const tH = Math.max(8, Math.min(14, height * 0.6));
const thw = hw + c + tw, thd = hd + c + tw, tr = rr + c + tw;
const nS = Math.max(2, Math.round(depth / 28));
const supports = intersection(
  union(...Array.from({ length: nS }, (_, i) => translate([-thw, -thd + (i + 0.5) * 2 * thd / nS - 1.5, tf - 0.01], cube([2 * thw, 3, sup + 0.01])))),
  rbox(thw - tw + 0.3, thd - tw + 0.3, tr - tw + 0.3, tf - 0.02, sup + 0.03, 0),
);
const trayPart = union(difference(rbox(thw, thd, tr, 0, tH, 0), rbox(thw - tw, thd - tw, tr - tw, tf, tH, 0)), supports);
return group(dish, translate([0, hd + height * k + 10 + thd, 0], trayPart));
