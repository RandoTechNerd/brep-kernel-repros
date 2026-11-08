// Marble run tile: stackable marble run tiles: straight, curve, funnel drop and side exit, sized to your marbles.
// Print: upright as shown, no supports. Marbles are a choking hazard: not for children under 3.
// Every number below is a slider (Params). From the BREPcode catalog: marble-run.
const kind = "straight";  // [straight, curve, funnel, exit] tile type
const tile = 40;          // [25:80] tile size, mm
const height = 30;        // [15:80] tile height, mm
const marbleD = 16;       // [10:26] marble diameter, mm
const drop = 2;           // [0:5] fall across a straight tile, mm

const s = Math.max(tile, marbleD + 12), h = Math.max(height, marbleD * 0.7 + 6);
const rg = marbleD / 2 + 1.5;                             // groove radius: a millimetre and a half of room
const block = translate([-s / 2, -s / 2, 0], cube([s, s, h]));
if (kind === "straight") {
  // a half-pipe whose centre runs along the top, falling a little (never deeper than its centre by much)
  const fall = Math.min(drop, rg * 0.5);
  const a = Math.atan2(fall, s) * 180 / Math.PI;
  const groove = translate([-s / 2 - 2, 0, h], rotate([0, 90 + a, 0], cylinder({ r: rg, h: s + 4, $fn: 48 })));
  return difference(block, groove);
}
if (kind === "curve") {
  // a quarter of a ring centred on one corner, so it enters on one side and leaves on the next
  return difference(block, translate([-s / 2, -s / 2, h], torus({ r: s / 2, tube: rg, $fn: 48 })));
}
const shaftR = marbleD / 2 + 1;
if (kind === "funnel") {
  // a cone down to a shaft straight through, into the tile below
  const fr = Math.min(s / 2 - 2, shaftR + h * 0.6);
  return difference(block,
    translate([0, 0, h - (fr - shaftR) - 0.5], cylinder({ r1: shaftR - 0.5, r2: fr, h: fr - shaftR + 0.51, $fn: 48 })),
    translate([0, 0, -1], cylinder({ r: shaftR, h: h + 2, $fn: 32 })));
}
// exit: a shaft from the top meets a tunnel with a pointed roof running out one side
const tw = marbleD + 3, k = Math.tan(60 * Math.PI / 180);
const wallH = Math.max(2, marbleD * 0.6);
const roof = [[-tw / 2, 0], [tw / 2, 0], [tw / 2, wallH], [0, wallH + tw / 2 * k], [-tw / 2, wallH]];
// the tunnel starts behind the shaft, so the shaft's foot opens fully into it
const back = shaftR + 1;
const tunnel = translate([-back, 0, 2], rotate([90, 90, 0], linearExtrude({ h: s / 2 + 2 + back }, polygon(roof))));
return difference(block, tunnel, translate([0, 0, 2 + wallH - 0.5], cylinder({ r: shaftR, h: h, $fn: 32 })));
