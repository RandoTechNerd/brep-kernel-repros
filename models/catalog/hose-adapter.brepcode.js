// Hose adapter: a turned adapter that joins a vacuum or dust-collection hose to a tool port, a pipe or another hose.
// Print: upright, end A on the bed, no supports. Measure both ends: hose labels are nominal sizes, not what the cuff measures.
// Every number below is a slider (Params). From the BREPcode catalog: hose-adapter.
const dA = 57.2;      // [10:160] end A size (what it meets), mm
const fitA = "over";  // [over, into] end A slips over it, or goes into it
const lenA = 40;      // [10:120] end A sleeve length, mm
const dB = 101.6;     // [10:160] end B size (what it meets), mm
const fitB = "into";  // [into, over] end B goes into it, or slips over it
const lenB = 40;      // [10:120] end B sleeve length, mm
const neck = 10;      // [0:80] extra length between the ends, mm
const wall = 2.4;     // [1.6:6] wall thickness, mm
const fit = 0.3;      // [0:1.5] clearance per side, mm
const taper = 1;      // [0:4] friction taper on each sleeve, degrees

const t = Math.tan(taper * Math.PI / 180);
// each sleeve as [inner, outer] radii at its free end and at its root
const sleeve = (d, mode, len) => {
  const grow = len * t / 2;
  if (mode === "over") {                        // its bore takes the thing: loose at the mouth, tight at the root
    const free = d / 2 + fit + grow, root = d / 2 + fit - grow;
    return { free: [free, free + wall], root: [root, root + wall] };
  }
  const free = d / 2 - fit - grow, root = d / 2 - fit + grow;   // it goes in: small at the tip
  // a small insert keeps at least a 1 mm bore
  return { free: [Math.max(1, free - wall), Math.max(1.8, free)], root: [Math.max(1, root - wall), Math.max(1.8, root)] };
};
const A = sleeve(dA, fitA, lenA), B = sleeve(dB, fitB, lenB);
// the cone between them stays steeper than 45 degrees, so it needs no support
const rise = Math.max(Math.abs(B.root[0] - A.root[0]), Math.abs(B.root[1] - A.root[1])) * 1.1 + neck;
const z1 = lenA, z2 = lenA + rise, z3 = z2 + lenB;
// revolve() spins a profile that sits on the axis: the outside, less the bore
// (the bore runs a millimetre past each end so the cut is clean)
const outside = polygon([[0, 0], [A.free[1], 0], [A.root[1], z1], [B.root[1], z2], [B.free[1], z3], [0, z3]]);
const bore = polygon([[0, -1], [A.free[0], -1], [A.free[0], 0], [A.root[0], z1], [B.root[0], z2], [B.free[0], z3],
  [B.free[0], z3 + 1], [0, z3 + 1]]);
return difference(revolve({ angle: 360, $fn: 96 }, outside), revolve({ angle: 360, $fn: 96 }, bore));
