// Pole repair sleeve: a splint sleeve for a broken tent pole, or an end cap for a tent or trekking pole.
// Print: upright as shown (a cap closed end down), no supports. PETG or nylon.
// Every number below is a slider (Params). From the BREPcode catalog: pole-sleeve.
const poleD = 10.25;    // [3:40] pole diameter, mm
const fit = 0.3;        // [0:1] clearance per side, mm
const wall = 1.6;       // [1:4] wall thickness, mm
const length = 100;     // [10:200] length, mm
const kind = "sleeve";  // [sleeve, cap] open sleeve, or a cap closed at one end
const floor = 2;        // [1:8] cap end thickness, mm

const ri = poleD / 2 + fit;
const ro = ri + wall;
const outer = cylinder({ r: ro, h: length, $fn: 64 });
const bore = kind === "cap"
  ? translate([0, 0, Math.min(floor, length - 2)], cylinder({ r: ri, h: length, $fn: 64 }))
  : translate([0, 0, -1], cylinder({ r: ri, h: length + 2, $fn: 64 }));
// a lead-in chamfer at the open end (inside, so it faces up and prints clean)
const ch = Math.min(1, wall * 0.6);
const lead = translate([0, 0, length - ch], cylinder({ r1: ri, r2: ri + ch, h: ch + 0.01, $fn: 64 }));
return difference(outer, bore, lead);
