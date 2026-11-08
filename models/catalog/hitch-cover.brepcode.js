// Hitch cover: a push-in cover for a trailer-hitch receiver: a sprung square plug behind a rounded cap.
// Print: cap down as shown, no supports. PETG or ASA outdoors.
// Every number below is a slider (Params). From the BREPcode catalog: hitch-cover.
const size = 50.8;  // [25:70] receiver opening (inside), mm
const fit = 0.3;    // [-0.4:1] clearance per side (negative = snug; the splits spring), mm
const plugL = 45;   // [20:90] plug length into the receiver, mm
const wall = 3;     // [2:6] plug wall, mm
const lip = 8;      // [3:25] cap reach past the opening, mm
const capT = 6;     // [3:15] cap thickness, mm

const s = size - 2 * fit;                        // the plug's outside
const C = size + 2 * lip;                        // the cap
const rc = Math.min(8, C / 6);
const cap = hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (C / 2 - rc), sy * (C / 2 - rc), 0], cylinder({ r: rc, h: capT, $fn: 32 }))));
const plug = difference(
  translate([-s / 2, -s / 2, capT - 0.01], cube([s, s, plugL + 0.01])),
  translate([-s / 2 + wall, -s / 2 + wall, capT + 2], cube([s - 2 * wall, s - 2 * wall, plugL])),
  // a slit down two opposite sides so the walls spring
  ...[-1, 1].map((sy) => translate([-0.8, sy > 0 ? s / 2 - wall - 1 : -s / 2 - 1, capT + plugL * 0.35], cube([1.6, wall + 2, plugL]))),
);
// a chamfer at the plug's tip finds the receiver
const tip = Math.min(2, wall * 0.6);
const lead = difference(
  translate([-s / 2 - 1, -s / 2 - 1, capT + plugL - tip], cube([s + 2, s + 2, tip + 1])),
  hull(translate([-s / 2, -s / 2, capT + plugL - tip - 0.01], cube([s, s, 0.01])),
    translate([-s / 2 + tip, -s / 2 + tip, capT + plugL], cube([s - 2 * tip, s - 2 * tip, 0.01]))),
);
return difference(union(cap, plug), lead);
