// Wall planter: a half-oval pocket planter on a flat back plate with a keyhole to hang it.
// Print: standing upright on its floor as shown, no supports. No drain hole by default, for indoor walls.
// Every number below is a slider (Params). From the BREPcode catalog: wall-planter.
const width = 120;   // [50:240] width, mm
const depth = 60;    // [25:120] how far it stands off the wall, mm
const height = 90;   // [30:200] pocket height, mm
const wall = 2.2;    // [1.2:5] wall thickness, mm
const plateUp = 25;  // [20:60] back plate above the pocket, mm
const screwD = 4.5;  // [3:6] screw size for the keyhole, mm
const drain = 0;     // [0:20] drain hole (0 = none), mm

const bt = wall + 1.5;                                   // back plate thickness
const a = width / 2, b = Math.max(depth - bt, 8);        // the half-oval's semi-axes
const halfOval = (sa, sb, y0, n = 40) => [
  ...Array.from({ length: n + 1 }, (_, i) => {
    const t = Math.PI * i / n;
    return [sa * Math.cos(t), y0 + sb * Math.sin(t)];
  }),
];
// the pocket: from the plate face out and round, extruded straight up
const outer = linearExtrude({ h: height }, polygon([[a, 0], ...halfOval(a, b, bt), [-a, 0]]));
const cavity = translate([0, 0, wall], linearExtrude({ h: height }, polygon(halfOval(a - wall, b - wall, bt))));
const pocket = difference(outer, cavity);

// the back plate, up past the pocket, with a keyhole through it above the soil
const plate = translate([-a, 0, 0], cube([width, bt, height + plateUp]));
const headR = screwD * 0.95, slotL = screwD * 1.3, slotR = screwD * 0.55;
const zk = height + (plateUp - headR - slotL - slotR) / 2 + headR;   // centre of the round head
const through = (x, z, r) => translate([x, -1, z], rotate([-90, 0, 0], cylinder({ r, h: bt + 2, $fn: 24 })));
const keyhole = union(
  through(0, zk, headR),
  translate([-slotR, -1, zk], cube([2 * slotR, bt + 2, slotL])),
  through(0, zk + slotL, slotR),
);
let part = difference(union(pocket, plate), keyhole);
if (drain > 0) part = difference(part, translate([0, bt + b / 2, -1], cylinder({ r: drain / 2, h: wall + 2, $fn: 24 })));
return part;
