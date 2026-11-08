// Rope winder: a flat winder that keeps rope, paracord, fishing line or a power tool's cord coiled, with a slot to lock the end.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: rope-winder.
const length = 120;  // [40:250] length, mm
const width = 50;    // [20:120] width across the ears, mm
const ear = 22;      // [8:60] ear length at each end, mm
const notch = 12;    // [4:45] how deep the cord sits each side, mm
const thick = 4;     // [2:10] thickness, mm
const slotW = 6;     // [0:16] end-locking slot width (0 = none), mm
const hangD = 8;     // [0:20] hanging hole (0 = none), mm

const n = Math.min(notch, width / 2 - 4);        // the waist never narrower than 8 mm
const e = Math.min(ear, length / 3);
const rc = Math.min(5, e / 3, width / 6);        // corner rounding
// a rounded rectangle from x0 to x1, the full width, thick tall
const pad = (x0, x1) => hull(...[[x0 + rc, -width / 2 + rc], [x1 - rc, -width / 2 + rc], [x0 + rc, width / 2 - rc], [x1 - rc, width / 2 - rc]]
  .map(([x, y]) => translate([x, y, 0], cylinder({ r: rc, h: thick, $fn: 24 }))));
const body = union(
  pad(0, e),
  pad(length - e, length),
  translate([e - 1, -width / 2 + n, 0], cube([length - 2 * e + 2, width - 2 * n, thick])),
);
const cuts = [];
// the end-locking slot runs in from the outer end of the first ear
if (slotW > 0) cuts.push(hull(
  translate([-1, -slotW / 2, -1], cube([0.01, slotW, thick + 2])),
  translate([e * 0.6, 0, -1], cylinder({ r: slotW / 2, h: thick + 2, $fn: 24 }))));
if (hangD > 0) cuts.push(translate([length - e / 2, 0, -1], cylinder({ r: Math.min(hangD, e - 4, width - 8) / 2, h: thick + 2, $fn: 32 })));
return translate([-length / 2, 0, 0], cuts.length ? difference(body, ...cuts) : body);
