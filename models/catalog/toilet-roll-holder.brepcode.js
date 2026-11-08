// Toilet roll holder: a wall arm the toilet roll slides onto, with a flared tip, screwed or taped to the wall.
// Print: lying on its wall plate as shown, the post straight up; no supports. PETG or PLA.
// Every number below is a slider (Params). From the BREPcode catalog: toilet-roll-holder.
const postD = 36;        // [20:50] post diameter (a toilet roll core is about 42 mm inside), mm
const postL = 125;       // [60:245] post length out from the wall, mm
const flare = 2.5;       // [0:6] how far the tip flares out (radius), mm
const wall = 3;          // [2:6] post wall thickness, mm
const plateW = 50;       // [40:120] wall plate width, mm
const plateH = 96;       // [60:180] wall plate height, mm
const plateT = 5;        // [3:10] wall plate thickness, mm
const screwD = 4.5;      // [3:6] screw hole diameter, mm
const mount = "screws";  // [screws, tape] how it mounts

// print = lying on the wall plate: the post points straight up (+z), out from the wall
const R = postD / 2;
const rootW = Math.min(6, plateT + 2);                // a cone at the root takes the load into the plate
const top = plateT + postL;
const fl = Math.max(0, flare), rise = fl * 1.25;      // the flare climbs steeper than 45 degrees
const band = Math.min(4, postL / 15);
const cap = Math.min(2, band);
const z0 = top - band - rise;
// the post's outside, lathed: root cone, shaft, flare, a short band and a chamfered end
const tip = fl >= 0.2 ? [[R, z0], [R + fl, z0 + rise]] : [];
const outside = revolve(360, polygon([
  [0, plateT - 0.5], [R + rootW, plateT - 0.5], [R + rootW, plateT], [R, plateT + rootW],
  ...tip, [R + fl, top - cap], [R + fl - cap, top], [0, top],
]));
// hollow inside, open to the wall side, with a 45 degree pointed roof
const ri = Math.max(2, R - wall);
const roofZ = top - Math.max(3, wall) - ri;
const inside = revolve(360, polygon([[0, -1], [ri, -1], [ri, roofZ], [0, roofZ + ri]]));

// the wall plate, with its top edge chamfered on the room side
const hp = Math.max(plateH, postD + 2 * rootW + (mount === "screws" ? 6 * screwD + 12 : 6));
const rc = Math.min(10, plateW / 4), ch = Math.min(1.2, plateT / 3);
const corners = (r1, r2, z, h) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (plateW / 2 - rc), sy * (hp / 2 - rc), z], cylinder({ r1, r2, h, $fn: 32 })));
const plate = hull(...corners(rc, rc, 0, plateT - ch), ...corners(rc, rc - ch, plateT - ch, ch));

let part = difference(union(plate, outside), inside);
if (mount === "screws") {
  const r = screwD / 2;
  const y = (hp / 2 + R + rootW) / 2;                 // halfway between the root and the plate end
  const holes = [-1, 1].flatMap((s) => [
    translate([0, s * y, -1], cylinder({ r, h: plateT + 2, $fn: 24 })),
    translate([0, s * y, plateT - r - 0.01], cylinder({ r1: r, r2: 2 * r, h: r + 0.02, $fn: 24 })),
  ]);
  part = difference(part, ...holes);
}
return part;
