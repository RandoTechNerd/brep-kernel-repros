// Spool hub adapter: a hub that fits a spool's centre hole and turns it on a 608 bearing or a rod.
// Print: flange down as shown, no supports. Press the bearing in from the top.
// Every number below is a slider (Params). From the BREPcode catalog: spool-adapter.
const boreD = 53;      // [20:80] spool hole diameter, mm
const hubL = 12;       // [5:40] how far the hub goes in, mm
const flange = 6;      // [0:20] flange lip past the hole (0 = none), mm
const plateT = 3;      // [2:6] flange thickness, mm
const centre = "608";  // [608, rod] what goes through the middle
const rodD = 8.5;      // [3:30] rod diameter (rod centre), mm

const seat = centre === "608" && boreD >= 27;       // a 608 is 22 across: it needs a hub to live in
const hubR = boreD / 2 - 0.3;                        // slips into the spool's hole
const tall = (flange >= 1 ? plateT : 0) + hubL;
const solid = flange >= 1
  ? union(cylinder({ r: boreD / 2 + flange, h: plateT, $fn: 72 }), translate([0, 0, plateT - 0.01], cylinder({ r: hubR, h: hubL + 0.01, $fn: 72 })))
  : cylinder({ r: hubR, h: hubL, $fn: 72 });
const holeR = seat ? 11.08 : Math.min(rodD / 2 + 0.2, hubR - 3);
const cuts = seat
  ? [translate([0, 0, tall - Math.min(7.2, tall - 1.2)], cylinder({ r: holeR, h: 8, $fn: 64 })),
     translate([0, 0, -1], cylinder({ r: 9.5, h: tall + 2, $fn: 64 }))]   // push the bearing out from below
  : [translate([0, 0, -1], cylinder({ r: holeR, h: tall + 2, $fn: 64 }))];
// lightening holes in the ring between the middle and the hub wall
const band = hubR - holeR - 4;
if (band >= 8) {
  const hr = band / 2 - 1, rc = holeR + 2 + band / 2;
  const n = Math.max(3, Math.floor(2 * Math.PI * rc / (2 * hr + 4)));
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n;
    cuts.push(translate([rc * Math.cos(a), rc * Math.sin(a), -1], cylinder({ r: hr, h: tall + 2, $fn: 32 })));
  }
}
return difference(solid, ...cuts);
