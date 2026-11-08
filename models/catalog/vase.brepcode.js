// Vase: a thin-walled vase, smooth or faceted and twisted, in several classic outlines.
// Print: upright as shown, no supports. PETG holds water best; 3 walls.
// Every number below is a slider (Params). From the BREPcode catalog: vase.
const height = 180;       // [40:250] height, mm
const width = 100;        // [30:200] widest diameter, mm
const shape = "classic";  // [classic, bulb, bud, urn, trumpet, cylinder] outline
const neck = 0.55;        // [0.2:1] opening as a share of the width
const sides = 0;          // [0:12] facets (0 = smooth, 3 to 12 = a polygon)
const twist = 0;          // [0:180] twist over the height (faceted only), degrees
const wall = 1.6;         // [0.8:4] wall thickness, mm
const floor = 2;          // [1.2:6] floor thickness, mm

// the outline: a radius at each height, from control points (height share,
// radius share) passed through smoothly
const R = width / 2;
const k = neck;
const ctrl = {
  classic: [[0, 0.62], [0.38, 1], [0.82, k], [1, Math.min(1, k + 0.12)]],
  bulb: [[0, 0.55], [0.42, 1], [0.85, k * 0.8], [1, k * 0.9]],
  bud: [[0, 0.72], [0.35, 1], [0.78, k], [1, k * 1.15]],
  urn: [[0, 0.55], [0.12, 0.5], [0.55, 1], [0.85, Math.max(k, 0.6)], [1, Math.max(k, 0.6) + 0.1]],
  trumpet: [[0, 0.5], [0.3, 0.52], [1, 1]],
  cylinder: [[0, 1], [1, 1]],
}[shape];
const lerp = (u) => {
  // Catmull-Rom through the control points
  let i = 0;
  while (i < ctrl.length - 2 && u > ctrl[i + 1][0]) i++;
  const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
  const s = (u - p1[0]) / (p2[0] - p1[0]);
  const m1 = (p2[1] - p0[1]) / 2, m2 = (p3[1] - p1[1]) / 2;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p1[1] + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2[1] + (s3 - s2) * m2;
};
const faceted = sides >= 3;
const n = faceted ? Math.max(8, Math.min(16, Math.ceil(twist / 12) + 8)) : 28;
const zs = Array.from({ length: n + 1 }, (_, i) => height * i / n);
// never widen or narrow faster than 45 degrees (a narrowing neck overhangs on
// the inside), a bit less for twisted facets; never thinner than the wall allows
const climb = faceted ? 0.7 : 0.95;
const rs = [];
zs.forEach((z, i) => {
  const want = Math.max(wall + 3, R * lerp(z / height));
  const dz = i === 0 ? 0 : z - zs[i - 1];
  rs.push(i === 0 ? want : Math.max(rs[i - 1] - climb * dz, Math.min(want, rs[i - 1] + climb * dz)));
});
if (!faceted) {
  const outer = zs.map((z, i) => [rs[i], z]);
  const inner = zs.map((z, i) => [rs[i] - wall, z]).filter(([, z]) => z > floor).reverse();
  return revolve(360, polygon([[0, 0], ...outer, ...inner, [rs[0] - wall, floor], [0, floor]]));
}
// faceted: hulls between consecutive turned polygons
const ring = (z, r) => {
  const a0 = twist * Math.PI / 180 * z / height;
  return translate([0, 0, z], linearExtrude({ h: 0.01 }, polygon(Array.from({ length: sides }, (_, i) =>
    [r * Math.cos(a0 + 2 * Math.PI * i / sides), r * Math.sin(a0 + 2 * Math.PI * i / sides)]))));
};
const stack = (dr, z0, top) => union(...zs.slice(0, -1).map((z, i) => {
  const za = Math.max(z, z0), zb = i === n - 1 ? top : zs[i + 1];
  if (zb <= za + 0.02) return null;
  const ra = rs[i] + (rs[i + 1] - rs[i]) * (za - z) / (zs[i + 1] - z) - dr;
  return hull(ring(za, ra), ring(zb - 0.01, rs[i + 1] - dr));
}).filter(Boolean));
// the inner polygon's flats sit a wall's thickness inside the outer's
const dr = wall / Math.cos(Math.PI / sides);
return difference(stack(0, 0, height), stack(dr, floor, height + 1));
