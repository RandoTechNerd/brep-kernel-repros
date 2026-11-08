// Wall plate: a plain switch or outlet cover plate to the standard sizes, one to four gangs.
// Print: face down as shown, no supports. PLA or PETG; screws are the #6-32 ones from the old plate.
// Every number below is a slider (Params). From the BREPcode catalog: wall-plate.
const gangs = 1;           // [1:4] gangs (devices side by side)
const opening = "toggle";  // [toggle, decora, duplex, blank] opening
const last = "same";       // [same, toggle, decora, duplex, blank] opening in the last gang (for a combo plate)
const size = "standard";   // [standard, midway, jumbo] outline size
const faceT = 2.4;         // [1.6:4] face thickness, mm
const depth = 6;           // [4:10] overall depth off the wall, mm
const bevel = 2.5;         // [0:4] edge bevel, mm
const cornerR = 2;         // [0.5:6] corner radius, mm
const screwD = 3.8;        // [3:4.5] screw holes (#6-32), mm

// printed face down: z = 0 is the front, the skirt rises toward the wall.
// Sizes are NEMA WD-6, in inches times 25.4.
const pitch = 1.812 * 25.4;                                  // gang to gang
const W1 = (size === "jumbo" ? 3.5 : size === "midway" ? 3.125 : 2.75) * 25.4;
const H = (size === "jumbo" ? 5.25 : size === "midway" ? 4.875 : 4.5) * 25.4;
const W = W1 + (gangs - 1) * pitch;
const skirt = faceT * 0.75;                              // the rim round the back
const b = Math.min(bevel, faceT + skirt - 0.8, depth - 1);
// a rounded rectangle w x h centred on the origin, from z0 to z0 + t
const slab = (w, h, r, z0, t) => {
  const rr = Math.max(0.4, Math.min(r, w / 2 - 0.1, h / 2 - 0.1));
  return hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
    translate([sx * (w / 2 - rr), sy * (h / 2 - rr), z0], cylinder({ r: rr, h: t, $fn: 24 }))));
};
const outer = b > 0
  ? hull(slab(W - 2 * b, H - 2 * b, cornerR - b * 0.4, 0, 0.01), slab(W, H, cornerR, b, depth - b))
  : slab(W, H, cornerR, 0, depth);
const cavity = slab(W - 2 * skirt, H - 2 * skirt, cornerR - skirt, faceT, depth);
// openings, as outlines, extruded through the face
const roundRect = (w, h, r, n = 6) => {
  const corner = (cx, cy, a0) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (Math.PI / 2) * i / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return [...corner(w / 2 - r, h / 2 - r, 0), ...corner(-w / 2 + r, h / 2 - r, Math.PI / 2),
    ...corner(-w / 2 + r, -h / 2 + r, Math.PI), ...corner(w / 2 - r, -h / 2 + r, 3 * Math.PI / 2)];
};
// a duplex receptacle face: a 1.343 inch circle with flats 1.125 inch apart
const receptacle = (cy) => {
  const r = 1.343 * 25.4 / 2, hh = 1.125 * 25.4 / 2;
  const a = Math.asin(hh / r);
  const side = (a0, a1) => Array.from({ length: 13 }, (_, i) => {
    const t = a0 + (a1 - a0) * i / 12;
    return [r * Math.cos(t), cy + r * Math.sin(t)];
  });
  return [...side(-a, a), ...side(Math.PI - a, Math.PI + a)];
};
const through = (pts, x) => translate([x, 0, -1], linearExtrude({ h: faceT + 2 }, polygon(pts)));
const cuts = [cavity];
const k = Math.min(1.5, faceT - 0.8);                        // countersink for the oval heads
const screwAt = (x, y) => {
  cuts.push(translate([x, y, -1], cylinder({ r: screwD / 2, h: faceT + 2, $fn: 20 })));
  cuts.push(translate([x, y, -0.01], cylinder({ r1: screwD / 2 + k, r2: screwD / 2, h: k + 0.01, $fn: 20 })));
};
for (let i = 0; i < gangs; i++) {
  const x = (i - (gangs - 1) / 2) * pitch;
  const kind = i === gangs - 1 && last !== "same" ? last : opening;
  if (kind === "toggle") {
    cuts.push(through(roundRect(0.406 * 25.4, 0.94 * 25.4, 1.5), x));
    screwAt(x, 2.375 * 25.4 / 2); screwAt(x, -2.375 * 25.4 / 2);
  } else if (kind === "decora") {
    cuts.push(through(roundRect(1.31 * 25.4, 2.63 * 25.4, 1), x));
    screwAt(x, 3.812 * 25.4 / 2); screwAt(x, -3.812 * 25.4 / 2);
  } else if (kind === "duplex") {
    const dy = 1.531 * 25.4 / 2;
    cuts.push(through(receptacle(dy), x), through(receptacle(-dy), x));
    screwAt(x, 0);
  } else {
    // a blank plate screws to the box ears
    screwAt(x, 3.281 * 25.4 / 2); screwAt(x, -3.281 * 25.4 / 2);
  }
}
return difference(outer, ...cuts);
