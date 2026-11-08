// Hose guide: a spool that sits on a stake or rebar at a bed corner so the hose rolls past the plants.
// Print: upright as shown, no supports. It spins on the stake; ASA or PETG outdoors.
// Every number below is a slider (Params). From the BREPcode catalog: hose-guide.
const stakeD = 12.7;   // [6:30] stake diameter it drops over, mm
const waistD = 40;     // [24:100] waist diameter (where the hose runs), mm
const flangeD = 70;    // [35:160] flange diameter, mm
const height = 90;     // [40:200] height, mm
const flangeH = 6;     // [3:20] flange thickness, mm
const top = "capped";  // [capped, open] top

const rb = stakeD / 2 + 0.5;                             // the bore: loose, so it spins
const rw = Math.max(waistD / 2, rb + 3);
const rf = Math.max(flangeD / 2, rw + 2);
const fh = Math.min(flangeH, height / 4);
const k = Math.tan(50 * Math.PI / 180);
const dr = Math.min(rf - rw, (height - 2 * fh - 2) / (1 + k));   // how far the flanges stand out
const z1 = fh + dr, z3 = height - fh, z2 = z3 - dr * k;
const spool = revolve(360, polygon([
  [0, 0], [rw + dr, 0], [rw + dr, fh], [rw, z1], [rw, z2], [rw + dr, z3], [rw + dr, height], [0, height],
]));
// a blind bore from below ends in a steep cone (no flat ceiling); open goes right through
const coneH = rb * 1.2;
const boreTop = top === "open" ? height + 1 : Math.max(10, height - 3 - coneH);
const cuts = [translate([0, 0, -1], cylinder({ r: rb, h: boreTop + 1, $fn: 32 }))];
if (top !== "open") cuts.push(translate([0, 0, boreTop - 0.01], cylinder({ r1: rb, r2: 0.2, h: coneH, $fn: 32 })));
return difference(spool, ...cuts);
