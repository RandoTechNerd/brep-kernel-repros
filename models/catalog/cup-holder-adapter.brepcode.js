// Cup holder adapter: a plug for a car cup holder that holds a bottle too wide for it, a can that rattles in it, or a divided tray.
// Print: upright as shown, no supports (the lid prints upside down beside it). PETG: PLA softens in a hot car.
// Every number below is a slider (Params). From the BREPcode catalog: cup-holder-adapter.
const itemD = 90;    // [20:120] what it holds: its diameter, mm
const holderD = 78;  // [60:100] the car's cup holder, across the top, mm
const taper = 1.5;   // [0:4] plug taper (holders narrow toward the bottom), degrees
const plugH = 50;    // [20:90] how deep it goes into the holder, mm
const cupH = 40;     // [5:150] cup height above the holder, mm
const fit = 1;       // [0.2:3] room around what it holds, mm
const wall = 2.4;    // [1.6:5] wall thickness, mm
const dividers = 0;  // [0:4] compartments (0 = one open cup)
const lid = "no";    // [no, yes] a press-on lid with a drop hole
const lidHole = 40;  // [10:80] lid drop hole, mm

const t = Math.tan(taper * Math.PI / 180);
const rp = holderD / 2 - 0.5;                    // the plug at the holder's rim
const rb = rp - plugH * t;                       // and at its foot
const ri = itemD / 2 + fit;                      // the bore
const rc = ri + wall;                            // the cup's outside
// the outside is one turned profile: stacking a cone on a cylinder of the
// same radius leaves a seam some engines will not close
let outside, zb, top;
if (rc <= rp) {
  // a reducer: one tapered plug, the bore sunk into it
  top = plugH + cupH;
  outside = [[0, 0], [rb, 0], [rp, plugH], [rp, top], [0, top]];
  // where the plug is too thin round the bore, start the bore higher
  zb = ri + 1.2 > rb ? Math.max(2, (ri + 1.2 - rb) / Math.max(t, 1e-3)) : 2;   // a 2 mm floor at least
} else {
  // an expander: plug, a cone out to the cup, the cup
  const coneH = (rc - rp) * 1.1;
  top = plugH + coneH + cupH;
  outside = [[0, 0], [rb, 0], [rp, plugH], [rc, plugH + coneH], [rc, top], [0, top]];
  zb = plugH + (ri - rp) * 1.1 + 1;              // the cone is already as wide as the bore here
}
zb = Math.min(zb, top - 3);
let cup = difference(revolve({ angle: 360, $fn: 96 }, polygon(outside)),
  revolve({ angle: 360, $fn: 96 }, polygon([[0, zb], [ri, zb], [ri, top + 1], [0, top + 1]])));
if (dividers >= 2) {
  const divT = 1.6, divH = top - zb - 2;
  const walls = dividers === 2
    ? [translate([-ri - 0.5, -divT / 2, zb - 0.1], cube([2 * ri + 1, divT, divH]))]
    : Array.from({ length: dividers }, (_, i) => rotate([0, 0, i * 360 / dividers + 90], translate([-divT / 2, 0, zb - 0.1], cube([divT, ri + 0.5, divH]))));
  if (dividers > 2) walls.push(translate([0, 0, zb - 0.1], cylinder({ r: divT, h: divH, $fn: 16 })));
  cup = union(cup, ...walls);
}
if (lid !== "yes") return cup;
// the lid prints upside down: a disc with a ring that pushes into the bore
const R = Math.max(rc, rp);
const cap = difference(
  union(cylinder({ r: R, h: 2, $fn: 96 }), translate([0, 0, 1.9], cylinder({ r: ri - 0.3, h: 5, $fn: 96 }))),
  translate([0, 0, 1.5], cylinder({ r: ri - 1.9, h: 6, $fn: 96 })),
  translate([0, 0, -1], cylinder({ r: Math.min(lidHole / 2, ri - 3), h: 4, $fn: 64 })),
);
return group(cup, translate([2 * R + 8, 0, 0], cap));
