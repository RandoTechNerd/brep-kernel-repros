// Christmas tree: a tiered tabletop Christmas tree, round or low-poly and twisting, on a stand.
// Print: upright as shown, no supports. Green PLA, or swap colour for the stand.
// Every number below is a slider (Params). From the BREPcode catalog: christmas-tree.
const height = 140;  // [40:250] height, mm
const width = 90;    // [30:200] width of the lowest branches, mm
const tiers = 4;     // [2:8] tiers of branches
const sides = 8;     // [0:12] facets (0 = round)
const twist = 15;    // [0:45] turn at each tier (faceted), degrees
const trunkH = 12;   // [0:40] trunk height below the branches, mm
const trunkD = 14;   // [5:40] trunk diameter, mm
const standD = 50;   // [0:150] stand diameter (0 = none), mm

// the lowest skirt flares out from the trunk at a little over 45 degrees; the
// rest sit on a cone (the core) above it, each a short 45-degree underside and
// a long slope back in to the core, so the silhouette is the stepped cone of a
// tree, every skirt starts inside the one below, and nothing overhangs
const rt = trunkD / 2;
const z0 = (standD > 0 ? 3 : 0) + trunkH;          // underside of the lowest skirt
const H = height - z0;
const R = Math.max(rt + 2, Math.min(width / 2, rt + 0.45 * H / 1.05));   // too wide for its height flares less
const zw0 = z0 + 1.05 * (R - rt);                  // the lowest skirt's widest ring
const step = (height - zw0) / Math.max(1, tiers - 0.4);
const lip0 = Math.min(R * 0.32, step * 0.85);
const Rc = R - lip0;                                 // the core's radius at zw0, down to a point at the top
const core = (z) => Math.max(0.4, Rc * (1 - (z - zw0) / (height - zw0)));
const tiersOut = Array.from({ length: tiers }, (_, i) => {
  const top = i === tiers - 1;
  if (i === 0) {
    const zt = top ? height : Math.min(height, zw0 + step * 0.9);
    return { zb: z0, rin: rt, Rk: R, zw: zw0, zt, rTop: top ? 0.4 : core(zt) };
  }
  const zb = zw0 + (i - 0.5) * step;
  const zt = top ? height : Math.min(height, zb + step * 1.4);
  const rin = core(zb) * 0.95;
  const lip = Math.max(0.5, Math.min(lip0 * (1 - 0.4 * (i - 1) / Math.max(1, tiers - 2)), (zt - zb - 1.5) / 1.05));
  return { zb, rin, Rk: rin + lip, zw: zb + 1.05 * lip, zt, rTop: top ? 0.4 : core(zt) };
});
const facet = sides >= 3;
const ring = (z, r, a) => translate([0, 0, z], linearExtrude({ h: 0.01 }, polygon(Array.from({ length: sides }, (_, i) =>
  [r * Math.cos(a + 2 * Math.PI * i / sides), r * Math.sin(a + 2 * Math.PI * i / sides)]))));
const tierSolid = (t, i) => facet
  ? hull(ring(t.zb, t.rin, twist * Math.PI / 180 * i), ring(t.zw, t.Rk, twist * Math.PI / 180 * i), ring(t.zt - 0.01, t.rTop, twist * Math.PI / 180 * i))
  : revolve(360, polygon([[0, t.zb], [t.rin, t.zb], [t.Rk, t.zw], [t.rTop, t.zt], [0, t.zt]]));
const parts = tiersOut.map(tierSolid);
// the trunk runs up into the lowest tier
parts.push(cylinder({ r: rt, h: z0 + 2, $fn: 32 }));
if (standD > 0) parts.push(cylinder({ r: Math.max(standD / 2, rt + 3), h: 3, $fn: 64 }));
return union(...parts);
