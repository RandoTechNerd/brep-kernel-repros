// Self-watering seed starter: a water reservoir, a drop-in tray of square seats and tapered square pots, filled by a spout or a twist-in soda bottle.
// Print: reservoir upright, tray flat, pots upright; no supports. PETG for the reservoir. Set assembled to no to see the parts laid out.
// Every number below is a slider (Params). From the BREPcode catalog: seed-starter.
const cols = 3;           // [1:5] pots across
const rows = 3;           // [1:5] pots deep
const pitch = 52;         // [40:80] pot spacing, mm
const potTop = 48;        // [30:75] pot width at the rim, mm
const potBot = 36;        // [20:70] pot width at the floor, mm
const potH = 50;          // [25:90] pot height, rim included, mm
const potCorner = 5;      // [1:12] pot corner chamfer at the rim, mm
const potWall = 1.2;      // [0.8:3] pot wall, mm
const potFloor = 1.2;     // [0.8:3] pot floor, mm
const flange = 1.6;       // [1:4] how far the rim flange sticks out past the pot, mm
const flangeT = 1.6;      // [1:3] rim flange thickness, mm
const slotW = 1.6;        // [0:3] drain slot width (0 = solid floor), mm
const trayT = 2.4;        // [1.6:4] tray thickness, mm
const leadIn = 1.5;       // [0:4] how much each seat flares at the top, mm
const seatClear = 0.4;    // [0.1:1] gap between pot and seat, per side, mm
const wall = 3;           // [2:6] reservoir wall, mm
const floorT = 1.6;       // [1:4] reservoir floor, mm
const ledgeW = 3;         // [2:5] ledge the tray rests on, mm
const trayGap = 0.3;      // [0.1:1] tray clearance in its pocket, per side, mm
const margin = 1;         // [0:10] extra space around the pot grid, mm
const resH = 58;          // [40:120] reservoir height, mm
const cornerR = 14;       // [4:30] reservoir corner radius, mm
const grooves = "yes";    // [yes, no] two decorative grooves round the reservoir
const notch = 12;         // [0:20] finger notch radius at the sides (0 = none), mm
const water = "spout";    // [spout, bottle] water in by a pour-in spout or a twist-in bottle
const spoutW = 44;        // [25:80] spout width, mm
const spoutOut = 26;      // [12:40] spout depth out from the wall, mm
const spoutH = 30;        // [12:55] spout height, mm
const neckD = 27.4;       // [20:40] bottle thread diameter (27.4 = soda / water bottle), mm
const sockH = 14;         // [8:24] socket depth the bottle twists into, mm
const levelZ = 14;        // [6:30] water level the bottle keeps, from the floor, mm
const cradleR = 34;       // [20:50] bottle shoulder cradle radius at the top, mm
const bottleD = 80;       // [55:120] bottle body diameter, keeps the bottle clear of the pots (1 L 80, 2 L 110), mm
const assembled = "yes";  // [yes, no] assembled (no = parts laid out for printing)

// ---- shared shapes
const rbox = (w, d, h, r) => fillet({ r, edges: "z" }, cube([w, d, h], { center: true }));
const oct = (s, c) => {                                   // a square of side s with its corners chamfered by c
  const a = s / 2, b = s / 2 - c;
  return polygon([[b, -a], [a, -b], [a, b], [b, a], [-b, a], [-a, b], [-a, -b], [-b, -a]]);
};
// A square frustum with chamfered corners, made exact by planing each of the eight sides with a tilted cube, one at a time.
const taperOct = (s0, c0, s1, c1, z0, z1) => {
  const h = z1 - z0, big = Math.max(s0, s1) + 6, L = 2 * big + 4 * h + 20;
  const ap = (s, c, k) => (k % 2 === 0 ? s / 2 : (s - c) / Math.SQRT2);   // apothem of side k (even = flat, odd = chamfer)
  let t = translate([0, 0, z0], linearExtrude({ h }, oct(big, c1 * big / s1)));
  for (let k = 0; k < 8; k++) {
    const a0 = ap(s0, c0, k), a1 = ap(s1, c1, k), tilt = Math.atan((a1 - a0) / h) * 180 / Math.PI;
    t = difference(t, rotate([0, 0, 45 * k], translate([a0, 0, z0], rotate([0, tilt, 0], translate([0, -L / 2, -L / 2], cube([L, L, L]))))));
  }
  return t;
};

// ---- the grid
const gridW = cols * pitch + 2 * margin, gridD = rows * pitch + 2 * margin;
const pocketW = gridW, pocketD = gridD;                    // the tray pocket holds the grid
const innerW = pocketW - 2 * ledgeW, innerD = pocketD - 2 * ledgeW;
const W = pocketW + 2 * wall, D = pocketD + 2 * wall;
const seatXY = [];
for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rows; j++) {
    seatXY.push([(i - (cols - 1) / 2) * pitch, (j - (rows - 1) / 2) * pitch]);
  }
}

// ---- one pot: a square frustum, a rim flange, a hollow, slots across the floor.
// The frustums are planed (taperOct), not hull({ exact: true }) of two squares:
// a hulled pot built in 1 s at the origin but 10 s at some grid positions on
// the Rust kernel, the same shape to 0.1 % of its volume.
const bodyTopZ = potH - flangeT;
const sideAt = (z) => potBot + (potTop - potBot) * z / bodyTopZ;   // pot width at height z
const makePot = () => {
  let p = union(
    taperOct(potBot, potCorner * potBot / potTop, potTop, potCorner, 0, bodyTopZ + 0.5),
    translate([0, 0, bodyTopZ], linearExtrude({ h: flangeT }, oct(potTop + 2 * flange, potCorner + flange * 0.6))),
  );
  const inBot = sideAt(potFloor) - 2 * potWall, inTop = sideAt(potH + 1) - 2 * potWall, cIn = Math.max(0.6, potCorner - potWall * 0.6);
  p = difference(p, taperOct(inBot, cIn * inBot / inTop, inTop, cIn, potFloor, potH + 1));
  if (slotW > 0) {
    const reach = (inBot - 4) / 2, cuts = [];
    for (let k = -1; k <= 1; k++) cuts.push(translate([k * reach * 0.6 - slotW / 2, -reach, -1], cube([slotW, 2 * reach, potFloor + 2])));
    p = difference(p, ...cuts);
  }
  return p;
};

// ---- tray: a sheet with square seats that flare at the top (the lead-in), sitting flush with the rim
const trayW = pocketW - 2 * trayGap, trayD = pocketD - 2 * trayGap;
const seatW = potTop + 2 * seatClear;                      // the seat clears the pot at its widest point
let tray = translate([0, 0, trayT / 2], rbox(trayW, trayD, trayT, Math.max(1, cornerR - wall - trayGap)));
const k0 = seatW, k1 = seatW + 2 * leadIn, slope = (k1 - k0) / trayT;
const seat = taperOct(k0 - slope, potCorner + seatClear, k1 + slope, potCorner + seatClear + leadIn, -0.5, trayT + 0.5);
for (const [x, y] of seatXY) {
  tray = difference(tray, translate([x, y, 0], seat));     // one seat at a time keeps the exact kernel
}

// ---- reservoir: rounded square, cavity, tray pocket, grooves, finger notches
const trayZ = resH - trayT;                                   // tray top flush with the rim
let body = fillet({ r: 2, edges: "bottom" }, translate([0, 0, resH / 2], rbox(W, D, resH, cornerR)));
body = difference(body, translate([0, 0, floorT + (resH + 1) / 2], rbox(innerW, innerD, resH + 1, Math.max(1, cornerR - wall - ledgeW))));
body = difference(body, translate([0, 0, trayZ + (resH + 1) / 2], rbox(pocketW, pocketD, resH + 1, Math.max(1, cornerR - wall))));
if (grooves === "yes") {
  for (const gz of [resH * 0.32, resH * 0.40]) {
    const band = difference(translate([0, 0, gz], rbox(W + 4, D + 4, 1.2, cornerR + 2)), translate([0, 0, gz], rbox(W - 1.6, D - 1.6, 2, cornerR - 0.8)));
    body = difference(body, band);
  }
}
if (notch > 0) body = difference(body, translate([0, 0, resH], rotate([0, 90, 0], cylinder({ r: notch, h: W + 10, center: true, $fn: 64 }))));

// ---- water in: a pour-in spout, or a twist-in bottle socket that holds the level at levelZ
const frontY = -D / 2;
if (water === "spout") {
  const sb = translate([0, frontY - spoutOut / 2 + 1, spoutH / 2], rbox(spoutW, spoutOut + 2, spoutH, 6));
  const sh = translate([0, frontY - spoutOut / 2 + 1 + wall / 2, floorT + spoutH / 2], rbox(spoutW - 2 * wall, spoutOut + 2 - wall, spoutH, Math.max(1, 6 - wall)));
  // through the wall AND the ledge under the tray: the cavity starts wall + ledgeW in
  const mouth = translate([-(spoutW - 2 * wall - 6) / 2, frontY - 2, floorT], cube([spoutW - 2 * wall - 6, wall + ledgeW + 4, spoutH - floorT - 3]));
  body = difference(difference(difference(union(body, sb), sh), mouth), translate([0, 0, floorT + (resH + 1) / 2], rbox(innerW, innerD, resH + 1, Math.max(1, cornerR - wall - ledgeW))));
} else {
  const rb = neckD / 2 + 0.2, rc = rb / Math.cos(Math.PI / 12), outerR = rc + 3;
  // The bottle stands upside down over the socket, so its axis sits far enough out that
  // neither the cradle nor the bottle itself reaches over the pots. A bridge carries the
  // water channel back to the reservoir, and a foot keeps a full bottle from tipping it.
  const cy = frontY - Math.max(bottleD / 2, cradleR + 2) - 3;
  const topZ = levelZ + sockH;
  const tower = translate([0, cy, 0], cylinder({ r: outerR, h: topZ, $fn: 96 }));
  const foot = translate([0, cy, 0], cylinder({ r: Math.max(outerR + 6, bottleD * 0.4), h: floorT + 1.4, $fn: 96 }));
  const bridgeW = 14 + 2 * wall;
  const bridge = translate([-bridgeW / 2, cy, 0], cube([bridgeW, frontY + wall / 2 - cy, levelZ + 1 + wall]));
  const cradleTop = topZ + (cradleR - outerR) * 1.1;
  const cradle = difference(
    translate([0, cy, topZ - 0.5], cylinder({ r1: outerR, r2: cradleR + 2, h: cradleTop - topZ + 0.5, $fn: 96 })),
    translate([0, cy, topZ - 0.01], cylinder({ r1: rc + 0.8, r2: cradleR, h: cradleTop - topZ + 0.02, $fn: 96 })));   // throat clears the socket's corners
  const bore = translate([0, cy, levelZ], rotate([0, 0, 15], cylinder({ r: rc, h: sockH + 0.6, $fn: 12 })));
  const channel = translate([-7, cy, floorT], cube([14, frontY + wall + ledgeW + 3 - cy, levelZ - floorT + 1]));
  const under = translate([0, cy, floorT], cylinder({ r: rc - 2, h: levelZ - floorT + 0.5, $fn: 48 }));
  body = difference(difference(difference(union(body, tower, foot, bridge, cradle), bore), under), channel);
}

// ---- assembly or print layout
const green = "#4e9a64", cream = "#e9e2d0";
const potZ = resH + flangeT - potH;                           // the flange rests on the tray top
if (assembled === "yes") {
  return group(
    colorize(green, body),
    translate([0, 0, trayZ], colorize(cream, tray)),
    ...seatXY.map(([x, y]) => translate([x, y, potZ], colorize(cream, makePot()))),
  );
}
const lay = pitch + 6;
return group(
  colorize(green, body),
  translate([W + 20, 0, 0], colorize(cream, tray)),
  ...seatXY.map(([x, y], i) => translate([(i % cols - (cols - 1) / 2) * lay, D / 2 + 30 + lay / 2 + Math.floor(i / cols) * lay, 0], colorize(cream, makePot()))),
);
