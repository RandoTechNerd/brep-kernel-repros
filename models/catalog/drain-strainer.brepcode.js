// Drain strainer: a hair catcher or sink strainer: a perforated cup with a cone flange and a lift post, or a flat drain cover.
// Print: as shown, no supports: a strainer cup upright as it sits; a flat cover upside down, its plug pointing up. PETG takes hot water best.
// Every number below is a slider (Params). From the BREPcode catalog: drain-strainer.
const cupD = 38;     // [16:110] cup diameter (drops into the drain), mm
const depth = 22;    // [2:80] cup depth (under 8 = a flat cover, this being its plug), mm
const flangeD = 56;  // [24:170] flange diameter (rests on the rim), mm
const wall = 1.8;    // [1.2:4] wall thickness, mm
const floorT = 2;    // [1.2:5] floor thickness, mm
const holeD = 2.5;   // [1.2:6] floor hole size, mm
const slits = 12;    // [0:36] slits round the side
const slitW = 1.8;   // [1:4] slit width, mm
const postH = 10;    // [0:40] lift post height above the rim (0 = none), mm
const postD = 7;     // [4:14] lift post diameter, mm

const cupR = cupD / 2;
const flR = Math.max(flangeD / 2, cupR + 7);         // at least a 7 mm ledge to rest on
const fT = floorT;
const cover = depth < 8;                                // shallow: a flat cover with a short plug
// Everything is built from convex pieces, each hull()ed into a faceted solid:
// the many small holes then cut it in well under a second.
const disc = (r, z, h) => hull(translate([0, 0, z], cylinder({ r, h, $fn: 72 })));
let solid, cavity, top;
if (cover) {
  // printed upside down: the cover flat on the bed (its top face down), the plug that sits in the drain pointing up
  const c = Math.min(0.8, fT / 3);
  solid = union(
    hull(cylinder({ r1: flR - c, r2: flR, h: c, $fn: 72 }), translate([0, 0, c], cylinder({ r: flR, h: fT - c, $fn: 72 }))),
    disc(cupR, fT - 0.01, depth + 0.01),
  );
  cavity = disc(cupR - wall, fT, depth + 1);
  top = fT + depth;
} else {
  const s = Math.tan(49 * Math.PI / 180);               // the flange climbs at 49 degrees: steeper than 45
  const e = wall * Math.sqrt(1 + s * s);                // its thickness measured straight up
  const rim = depth + (flR - cupR) * s;
  const zi = depth + e - wall * s;                      // where the inside of the cup meets the flange
  solid = union(
    disc(cupR, 0, depth + 0.01),
    hull(translate([0, 0, depth], cylinder({ r1: cupR, r2: flR, h: rim - depth, $fn: 72 })),
      translate([0, 0, rim - 0.01], cylinder({ r: flR, h: e + 0.01, $fn: 72 }))),
  );
  cavity = union(
    disc(cupR - wall, fT, zi - fT + 0.01),
    hull(translate([0, 0, zi], cylinder({ r1: cupR - wall, r2: flR + 0.01, h: rim + e - zi, $fn: 72 })),
      translate([0, 0, rim + e - 0.01], cylinder({ r: flR + 1, h: 1, $fn: 72 }))),
  );
  top = rim + e;
}

const cuts = [cavity];
// floor holes in rings, as many as fit with 1.6 mm of plastic between them
const pR = postH > 0 && !cover ? postD / 2 : 0;
const pitch = Math.max(holeD + 1.6, Math.sqrt(cupR * cupR / 40));
const inner = Math.max(pR + holeD / 2 + 1.2, 0);
const outer = cupR - wall - holeD / 2 - 0.8;
for (let rr = outer; rr >= inner - 0.01; rr -= pitch) {
  const n = rr < pitch / 2 ? 1 : Math.floor(2 * Math.PI * rr / pitch);
  for (let i = 0; i < n; i++) {
    const t = 2 * Math.PI * (i + (Math.round(rr / pitch) % 2) * 0.5) / n;
    cuts.push(translate([rr * Math.cos(t), rr * Math.sin(t), -1], cylinder({ r: holeD / 2, h: fT + 2, $fn: 12 })));
  }
}
// slits up the side, pointed at the top so they print
const z0 = fT + 1.5, z1 = depth - 2 - slitW / 2;
const w = Math.min(slitW, 2 * Math.PI * (cupR - wall) / Math.max(1, slits) - 1.5);
if (!cover && slits > 0 && w >= 0.8 && z1 - z0 > 3) {
  const prof = polygon([[-w / 2, z0], [w / 2, z0], [w / 2, z1], [0, z1 + w / 2], [-w / 2, z1]]);
  for (let i = 0; i < slits; i++) {
    cuts.push(rotate([0, 0, i * 360 / slits], translate([0, -(cupR - wall - 1), 0], rotate([90, 0, 0], linearExtrude({ h: wall + 2 }, prof)))));
  }
}
let part = difference(solid, ...cuts);
// the lift post, with a small flared grip on top
if (pR > 0) {
  const pTop = top + postH;
  part = union(part,
    translate([0, 0, fT - 0.1], cylinder({ r: pR, h: pTop - fT - 1.9, $fn: 24 })),
    translate([0, 0, pTop - 2.01], cylinder({ r1: pR, r2: pR + 1.5, h: 1.51, $fn: 24 })),
    translate([0, 0, pTop - 0.51], cylinder({ r: pR + 1.5, h: 0.51, $fn: 24 })));
}
return part;
