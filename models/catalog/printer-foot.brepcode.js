// Printer feet: riser cups for a printer's feet, or squash-ball damper feet that quieten and steady it.
// Print: upright as shown, no supports. Print four.
// Every number below is a slider (Params). From the BREPcode catalog: printer-foot.
const footD = 25;       // [10:60] printer's foot diameter, mm
const pocketDepth = 6;  // [2:15] how deep the foot sits, mm
const height = 20;      // [8:60] riser height, mm
const ballD = 40;       // [20:70] ball diameter (ball style), mm
const wall = 4;         // [2.4:8] wall thickness, mm
const style = "riser";  // [riser, ball] riser cup or squash-ball damper

const cupR = footD / 2 + 0.3;                         // the printer's foot drops in
if (style === "riser") {
  const top = cupR + wall, bot = top + Math.min(6, height / 3);
  return difference(
    cylinder({ r1: bot, r2: top, h: height, $fn: 64 }),
    translate([0, 0, height - Math.min(pocketDepth, height - 2)], cylinder({ r: cupR, h: pocketDepth + 1, $fn: 64 })),
  );
}
// ball style: a lower cup the ball sits in, and an upper cup that rests on it
const br = ballD / 2;
const lowR = br + 0.5 + wall, lowH = br * 0.6 + 2;
const lower = difference(
  cylinder({ r1: lowR + 2, r2: lowR, h: lowH, $fn: 64 }),
  translate([0, 0, 2], cylinder({ r: br + 0.5, h: lowH, $fn: 64 })),
);
const coneR = br * 0.8;                               // 45 degrees: as tall as it is wide
const upR = Math.max(coneR, cupR) + wall;
const upH = coneR + 2 + pocketDepth;
const upper = difference(
  cylinder({ r: upR, h: upH, $fn: 64 }),
  translate([0, 0, -0.01], cylinder({ r1: coneR, r2: 0.2, h: coneR - 0.2, $fn: 64 })),
  translate([0, 0, upH - pocketDepth], cylinder({ r: cupR, h: pocketDepth + 1, $fn: 64 })),
);
return group(translate([-lowR - 4, 0, 0], lower), translate([upR + 4, 0, 0], upper));
