// Carabiner clip: a light-duty carabiner clip with a springy flex gate, for keys, bottles and light gear.
// Print: flat as shown, no supports. PETG or nylon so the gate springs. Not for climbing or any load that matters: keys, a bottle, light gear.
// Every number below is a slider (Params). From the BREPcode catalog: carabiner.
const length = 60;  // [30:120] length, mm
const width = 30;   // [16:60] width, mm
const band = 5;     // [3:9] loop band width, mm
const thick = 6;    // [3:10] thickness, mm
const gap = 9;      // [4:20] gate opening, mm
const gateT = 1.4;  // [0.8:2.4] gate thickness (springiness), mm

// a racetrack: straight sides along x, round ends; the gate is in the +y side
const W = Math.max(width, 2 * band + 8);
const L = Math.max(length, W + 6);
const R = W / 2;
const track = (r, h, z) => hull(translate([-(L / 2 - R), 0, z], cylinder({ r, h, $fn: 64 })), translate([L / 2 - R, 0, z], cylinder({ r, h, $fn: 64 })));
const loop = difference(track(R, thick, 0), track(R - band, thick + 2, -1));
const yi = R - band;                              // the band's inside edge on the gate side
const g = Math.min(gap, L - 2 * R - 2);           // the opening, within the straight side
// cut the opening through the band
const opening = translate([-g / 2, yi - 0.5, -1], cube([g, band + 1.5, thick + 2]));
// the gate: rooted to the band's inside past one end of the opening, its free
// end resting under the band past the other end, a hair clear of it
const free = -g / 2 - Math.min(4, L / 2 - R - g / 2);
const rootX = g / 2 + 3;
const gate = union(
  translate([free, yi - 0.4 - gateT, 0], cube([rootX + 4 - free, gateT, thick])),
  translate([rootX, yi - 0.4 - gateT, 0], cube([4, gateT + 0.41, thick])),
);
return union(difference(loop, opening), gate);
