// Tape dispenser: a desk tape dispenser with a serrated tear edge, a hub for the roll's core and an axle pin.
// Print: all three pieces as shown, no supports. The hub slides into the roll, the pin through the hub, and the pin drops into the notches.
// Every number below is a slider (Params). From the BREPcode catalog: tape-dispenser.
const tapeW = 19;    // [9:52] tape width, mm
const coreD = 25.4;  // [20:80] roll core inside diameter, mm
const rollD = 65;    // [35:150] largest roll diameter, mm
const side = 6;      // [3:12] side wall thickness, mm
const foot = 10;     // [0:30] extra foot each side, mm
const axleD = 8;     // [5:12] axle pin diameter, mm

// body side profile: x runs front to back, y runs up; pushed across the tape's width along z
const ar = axleD / 2;
const R = rollD / 2;
const flr = Math.min(4, side);
const za = R + flr + 3;                          // axle height: the roll clears the floor
const noseL = Math.max(14, axleD * 2);
const xa = noseL + R + 4;                        // axle position
const L = xa + R + 10;
const tw = tapeW + 1.5;                          // room for the roll between the side walls
const W = tw + 2 * side;
const hTop = za + ar + 6;
const sideProfile = [[0, 0], [L, 0], [L, za * 0.8], [Math.min(L - 2, xa + 14), hTop], [xa - 14, hTop], [noseL + 2, za], [0, za]];
let body = translate([0, W, 0], rotate([90, 0, 0], linearExtrude({ h: W }, polygon(sideProfile))));
if (foot > 0) {
  const fr = Math.min(8, foot);
  body = union(body, hull(...[[fr, fr - foot], [L - fr, fr - foot], [fr, W + foot - fr], [L - fr, W + foot - fr]].map(([x, y]) =>
    translate([x, y, 0], cylinder({ r: fr, h: 4, $fn: 32 })))));
}
// the trough for the roll, and a U-notch through each side wall for the pin
const aw = axleD + 0.6;
const cuts = [
  translate([noseL, side, flr], cube([L - noseL - 6, tw, hTop])),
  translate([xa - aw / 2, -foot - 1, za], cube([aw, W + 2 * foot + 2, hTop])),
  translate([xa, -foot - 1, za], rotate([-90, 0, 0], cylinder({ r: aw / 2, h: W + 2 * foot + 2, $fn: 32 }))),
];
// serrations: vertical V-grooves across the nose's front face, whose top edge cuts the tape
const pitchT = Math.max(2.5, side * 0.5);
const nT = Math.max(2, Math.floor(W / pitchT));
for (let i = 0; i < nT; i++) {
  const y = (W - nT * pitchT) / 2 + (i + 0.5) * pitchT;
  cuts.push(translate([0, 0, -1], linearExtrude({ h: za + 2 }, polygon([[-1, y - pitchT / 2 - 0.2], [1.6, y], [-1, y + pitchT / 2 + 0.2]]))));
}
body = difference(body, ...cuts);
// the hub fills the core; the pin goes through the hub and rests in the notches
const hr = coreD / 2 - 0.3, hl = tw - 1;
const bore = ar + 0.3;
const hub = hr - bore < 7
  ? difference(cylinder({ r: hr, h: hl, $fn: 64 }), translate([0, 0, -1], cylinder({ r: bore, h: hl + 2, $fn: 32 })))
  : union(
    difference(cylinder({ r: hr, h: hl, $fn: 64 }), translate([0, 0, -1], cylinder({ r: hr - 2.4, h: hl + 2, $fn: 64 }))),
    difference(cylinder({ r: bore + 2.4, h: hl, $fn: 32 }), translate([0, 0, -1], cylinder({ r: bore, h: hl + 2, $fn: 32 }))),
    ...[0, 120, 240].map((a) => rotate([0, 0, a], translate([bore + 1.5, -1.2, 0], cube([hr - bore - 2.5, 2.4, hl])))),
  );
const pin = cylinder({ r: ar, h: W - 0.5, $fn: 32 });
return translate([-L / 2, -W / 2, 0], group(body, translate([L + hr + 10, W / 2, 0], hub), translate([L + 2 * hr + ar + 18, W / 2, 0], pin)));
