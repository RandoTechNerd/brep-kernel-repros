// Shower shelf: a corner or straight shower shelf with a front lip, drain holes and screw or tape mounting.
// Print: as shown, shelf flat on the bed, walls up; no supports. PETG or ASA in a shower.
// Every number below is a slider (Params). From the BREPcode catalog: shower-shelf.
const shape = "corner";  // [corner, triangle, straight] shape
const size = 180;        // [60:250] size along each wall (straight: its length), mm
const depth = 100;       // [40:200] straight shelf: how far it sticks out, mm
const plateT = 4;        // [3:8] shelf thickness, mm
const wallH = 70;        // [20:160] back wall height, mm
const wallT = 4;         // [3:8] back wall thickness, mm
const lipH = 14;         // [0:50] front lip height (0 = none), mm
const lipT = 3;          // [2:6] front lip thickness, mm
const drainD = 6;        // [0:12] drain holes (0 = none), mm
const screwD = 4.5;      // [3:6] screw hole diameter, mm
const mount = "screws";  // [screws, tape] how it mounts

// print = as hung: the shelf on the bed (z = 0), walls rising; the corner is at the origin
const R = size;
const straight = shape === "straight", tri = shape === "triangle";
const Dp = straight ? depth : R;
const lip = Math.min(lipH, 40);
const H = Math.max(wallH, lip + 12, plateT + 14);
const g = Math.min(6, H / 6);                         // 45 degree fillet along the inside of each wall
const arcN = (r, a0, a1, n = 36) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / n;
  return [r * Math.cos(t), r * Math.sin(t)];
});
const rc = Math.min(12, R / 4, Dp / 4);
// the shelf outline, and the same outline pulled in by the lip's thickness; both run
// past the walls (e) and are trimmed there, so the lip never shares a face with a wall
const outline = (k) => {
  const e = -1 - k;
  if (straight) return [[k, e], [R - k, e],
    ...arcN(rc - k, 0, Math.PI / 2, 8).map(([x, y]) => [x + R - rc, y + Dp - rc]),
    ...arcN(rc - k, Math.PI / 2, Math.PI, 8).map(([x, y]) => [x + rc, y + Dp - rc])];
  const L = R - k * Math.SQRT2;
  if (tri) return [[e, e], [L - e, e], [e, L - e]];
  return [[e, e], [R - k, e], ...arcN(R - k, 0, Math.PI / 2), [e, R - k]];
};
// slab(): the outline, extruded and hull()ed into a faceted solid, so the drain holes cut fast
const slab = (k, z, h) => hull(translate([0, 0, z], linearExtrude({ h }, polygon(outline(k)))));
const plate = intersection(slab(0, 0, plateT), translate([0, 0, -1], cube([R + 1, Dp + 1, plateT + 2])));

// drain holes on a grid, clear of the walls and the lip
const holes = [];
if (drainD > 0) {
  const m = drainD / 2 + 2.5;
  const x0 = straight ? lipT + m : wallT + g + m;
  const inside = (x, y) => y > wallT + g + m && (straight
    ? x < R - lipT - m && y < Dp - lipT - m
    : x > x0 && (tri ? x + y < R - (lipT + m) * Math.SQRT2 : Math.hypot(x, y) < R - lipT - m));
  const area = straight ? R * Dp : tri ? R * R / 2 : Math.PI * R * R / 4;
  const pitch = Math.max(drainD * 2.2, Math.sqrt(area / 80));
  for (let x = x0; x < R; x += pitch) {
    for (let y = wallT + g + m; y < Dp; y += pitch) {
      if (inside(x, y)) holes.push(translate([x, y, -1], cylinder({ r: drainD / 2, h: plateT + 2, $fn: 16 })));
    }
  }
}
const parts = [holes.length ? difference(plate, ...holes) : plate];

// a profile drawn in (x, z) and stood up as a wall from y0 to y0 + t; and one drawn in (y, z) from x0 to x0 + t
const inXZ = (pts, y0, t) => translate([0, y0 + t, 0], rotate([90, 0, 0], linearExtrude({ h: t }, polygon(pts))));
const inYZ = (pts, x0, t) => translate([x0, 0, 0], rotate([90, 90, 0], linearExtrude({ h: t }, polygon(pts))));
// a back wall, sloping down toward its front end
const wallPts = (len) => [[0, 0], [len, 0], [len, lip + plateT + 2], [len * 0.55, H], [0, H]];
const endA = straight ? R : tri ? R - wallT : Math.sqrt(R * R - wallT * wallT);
parts.push(inXZ(straight ? [[0, 0], [R, 0], [R, lip + plateT + 2], [R - Math.min(40, R * 0.2), H], [Math.min(40, R * 0.2), H], [0, lip + plateT + 2]] : wallPts(endA), 0, wallT));
const filletA = [[wallT - 0.01, plateT - 0.01], [wallT + g, plateT - 0.01], [wallT - 0.01, plateT + g]];
const runA = straight ? R : tri ? R - wallT - g - 1 : Math.sqrt(R * R - (wallT + g) ** 2) - 1;
parts.push(inYZ(filletA, straight ? 0 : wallT - 0.01, runA - (straight ? 0 : wallT - 0.01)));
if (!straight) {
  parts.push(inYZ(wallPts(endA), 0, wallT));
  parts.push(inXZ(filletA, wallT - 0.01, runA - wallT + 0.01));
}
// the front lip: the outline minus the outline pulled in by its thickness
if (lip > 0) {
  const band = difference(slab(0, plateT - 0.01, lip + 0.01), slab(lipT, plateT - 0.5, lip + 1));
  parts.push(intersection(band, translate([0, 0, 0], cube([R + 1, Dp + 1, plateT + lip + 1]))));
}
let part = union(...parts);

// screw holes: teardrops (pointed up) through the walls, countersunk on the inside
if (mount === "screws") {
  const r = screwD / 2;
  const zs = plateT + g + (H - plateT - g) * 0.55;
  const tear = polygon([...Array.from({ length: 25 }, (_, i) => {
    const t = 3 * Math.PI / 4 + i * (3 * Math.PI / 2) / 24;
    return [r * Math.cos(t), r * Math.sin(t)];
  }), [0, r * Math.SQRT2]]);
  const cuts = [];
  const along = straight ? [R * 0.25, R * 0.75] : [Math.min(R * 0.3, endA * 0.45)];
  for (const s of along) {
    cuts.push(translate([s, wallT + 1, zs], rotate([90, 0, 0], linearExtrude({ h: wallT + 2 }, tear))));
    cuts.push(translate([s, wallT + 0.01, zs], rotate([90, 0, 0], cylinder({ r1: 2 * r, r2: r, h: r, $fn: 32 }))));
    if (!straight) {
      cuts.push(translate([-1, s, zs], rotate([90, 90, 0], linearExtrude({ h: wallT + 2 }, tear))));
      cuts.push(translate([wallT + 0.01, s, zs], rotate([0, -90, 0], cylinder({ r1: 2 * r, r2: r, h: r, $fn: 32 }))));
    }
  }
  part = difference(part, ...cuts);
}
// turned so the walls are at the back of the view, still square to the bed
return rotate([0, 0, 180], translate([-R / 2, straight ? 0 : -R / 2, 0], part));
