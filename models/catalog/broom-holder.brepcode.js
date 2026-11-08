// Broom holder: a wall clip that snaps onto a broom, mop or tool handle.
// Print: upright as shown, no supports. PETG flexes without cracking.
// Every number below is a slider (Params). From the BREPcode catalog: broom-holder.
const handleD = 24;    // [10:50] handle diameter, mm
const grip = 0.6;      // [0:2] how much smaller than the handle (grip), mm
const ringT = 3.5;     // [2:6] ring thickness, mm
const height = 25;     // [12:60] clip height, mm
const plateW = 64;     // [40:140] wall plate width, mm
const plateT = 5;      // [3:8] wall plate thickness, mm
const offWall = 3;     // [0:40] distance off the wall, mm
const opening = 0.82;  // [0.6:0.95] mouth width, as a fraction of the handle
const screwD = 4.5;    // [3:6] screw diameter, mm

const r = handleD / 2 - grip;                    // a touch smaller: it grips
const ro = r + ringT;
const cy = plateT + offWall + ro - 0.5;         // ring centre, out from the wall
const mouth = handleD * opening;                 // narrower than the handle: it snaps
const flare = ringT * 0.8;
const pw = Math.max(plateW, 2 * ro + 30);        // room for a screw each side of the ring
const body = union(
  translate([-pw / 2, 0, 0], cube([pw, plateT, height])),
  translate([-ro * 0.6, plateT - 0.5, 0], cube([ro * 1.2, cy - plateT + 0.5, height])),
  translate([0, cy, 0], cylinder({ r: ro, h: height, $fn: 72 })),
);
const k = screwD / 2;
const cuts = [
  translate([0, cy, -1], cylinder({ r, h: height + 2, $fn: 72 })),
  // the mouth, flared so the handle finds its way in
  hull(
    translate([-mouth / 2, cy + r * 0.4, -1], cube([mouth, 0.01, height + 2])),
    translate([-mouth / 2 - flare, cy + ro + 0.5, -1], cube([mouth + 2 * flare, 0.01, height + 2])),
  ),
  ...[-1, 1].flatMap((s) => {
    const x = s * (pw / 2 - 9);
    return [
      translate([x, -1, height / 2], rotate([-90, 0, 0], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 }))),
      translate([x, plateT - k + 0.02, height / 2], rotate([-90, 0, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
    ];
  }),
];
return translate([0, -cy, 0], difference(body, ...cuts));
