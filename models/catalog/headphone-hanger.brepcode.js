// Under-desk headphone hanger: screws up under a desk and holds headphones (or a bag) in a wide U.
// Print: on its side as shown, no supports. Screws go up through the plate into the desk.
// Every number below is a slider (Params). From the BREPcode catalog: headphone-hanger.
const bandW = 40;    // [15:90] hook width, mm
const drop = 40;     // [15:140] how far below the desk it hangs, mm
const saddleR = 16;  // [6:45] inside radius of the U, mm
const lipH = 14;     // [4:50] front lip height, mm
const plateL = 60;   // [35:140] mounting plate length, mm
const wall = 6;      // [4:12] thickness, mm
const screwD = 4;    // [3:5.5] screw diameter, mm

// side profile: x runs along the desk, y runs up (desk underside at y = 0)
const ro = saddleR + wall;
const dropX = plateL - wall;                     // the drop hangs from the far end
const cx = dropX + wall + saddleR, cy = -drop;
const arc = (r, a0, a1, N = 32) => Array.from({ length: N + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / N;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
});
const outline = [
  [0, 0], [0, -wall], [dropX, -wall], [dropX, cy],
  ...arc(ro, Math.PI, 2 * Math.PI),              // down round the outside of the U
  [cx + ro, cy + lipH], [cx + saddleR, cy + lipH],
  ...arc(saddleR, 2 * Math.PI, Math.PI),         // back round the inside
  [dropX + wall, 0],
];
const piece = linearExtrude({ h: bandW }, polygon(outline));

// screw holes up through the plate, countersunk from below
const k = screwD / 2;
const xs = plateL >= 45 ? [10, dropX - 8] : [plateL / 2 - 4];
const holes = xs.flatMap((x) => [
  translate([x, 1, bandW / 2], rotate([90, 0, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))),
  translate([x, -wall + k - 0.02, bandW / 2], rotate([90, 0, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return translate([0, drop + ro, 0], difference(piece, ...holes));
