// Mini drawer cabinet: a small cabinet with a grid of pull-out drawers, for screws, beads, parts and bits.
// Print: cabinet on its back, drawers upright beside it, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: drawer-cabinet.
const width = 110;   // [50:220] cabinet width, mm
const height = 100;  // [40:220] cabinet height, mm
const depth = 90;    // [40:180] cabinet depth, mm
const rows = 3;      // [1:6] rows of drawers
const cols = 1;      // [1:3] columns of drawers
const wall = 1.6;    // [1.2:3] wall thickness, mm
const fit = 0.4;     // [0.2:1] drawer clearance per side, mm

// effective grid: every slot at least 10 mm high and 14 mm wide
const nr = Math.max(1, Math.min(rows, Math.floor((height - wall) / (10 + wall))));
const nc = Math.max(1, Math.min(cols, Math.floor((width - wall) / (14 + wall))));
const slotW = (width - wall * (nc + 1)) / nc;
const slotH = (height - wall * (nr + 1)) / nr;
// the cabinet lies on its back: x across, y up the cabinet, z is the depth
const cabinet = difference(
  cube([width, height, depth]),
  ...Array.from({ length: nr * nc }, (_, k) => {
    const i = k % nc, j = Math.floor(k / nc);
    return translate([wall + i * (slotW + wall), wall + j * (slotH + wall), wall], cube([slotW, slotH, depth]));
  }),
);
// one drawer: x across, y front (0) to back, z up
const dw = slotW - 2 * fit, dh = slotH - 2 * fit, dd = depth - wall - fit;
const dt = Math.max(1.2, wall * 0.75);
const pw = Math.min(30, dw * 0.45), po = Math.min(6, dh * 0.4);   // pull width and how far it stands out
// rotate([90, 90, 0]) sends the profile's x to y, its y to z, and the extrusion to +x
const pull = translate([(dw - pw) / 2, 0, 0], rotate([90, 90, 0], linearExtrude({ h: pw },
  polygon([[0.01, dh - po - 1.5], [-po, dh - 1.5], [-po, dh], [0.01, dh]]))));
const drawer = union(
  difference(cube([dw, dd, dh]), translate([dt, dt, dt], cube([dw - 2 * dt, dd - 2 * dt, dh]))),
  pull,
);
// lay them out: cabinet first, then drawers, two to a row of the plate
const cellW = Math.max(width, dw) + 8, cellD = Math.max(height, dd + po) + 8;
const pieces = [cabinet, ...Array.from({ length: nr * nc }, () => translate([0, po, 0], drawer))];
const placed = pieces.map((p, k) => translate([(k % 2) * cellW, Math.floor(k / 2) * cellD, 0], p));
const rowsUsed = Math.ceil(pieces.length / 2);
return translate([-cellW + 4, -rowsUsed * cellD / 2 + 4, 0], group(...placed));
