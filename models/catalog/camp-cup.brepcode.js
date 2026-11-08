// Camping cup: a flared camping cup with an upright loop handle a carabiner clips through.
// Print: upright as shown, no supports. PETG; layer lines hold grime, so keep it for camp use, and not for hot drinks in PLA.
// Every number below is a slider (Params). From the BREPcode catalog: camp-cup.
const topD = 85;     // [50:120] rim diameter, mm
const bottomD = 70;  // [40:110] base diameter, mm
const height = 90;   // [40:140] height, mm
const wall = 2.4;    // [1.6:4] wall thickness, mm
const loop = "yes";  // [yes, no] loop handle
const loopW = 24;    // [12:40] handle hole width, mm

const rt = topD / 2;
const rb = Math.min(bottomD / 2, rt);              // never wider at the foot: that would overhang
const floor = Math.max(3, wall + 0.6);
const outside = polygon([[0, 0], [rb, 0], [rt, height], [0, height]]);
const bore = polygon([[0, floor], [rb - wall, floor], [rt - wall, height + 1], [0, height + 1]]);
let cup = revolve({ angle: 360, $fn: 96 }, outside);
if (loop === "yes") {
  // a ring standing beside the cup, joined to it by a web; it rises 60 percent of the way
  const hh = height * 0.6;
  const band = Math.max(4, wall + 2);
  const cx = rt + loopW / 2;                       // clear of the flare all the way up
  const web = translate([rb - 2, -band / 2, 0], cube([rt - band / 2 - rb + 2, band, hh]));   // stops at the ring, not across its hole
  const ring = difference(
    translate([cx, 0, 0], cylinder({ r: loopW / 2 + band, h: hh, $fn: 48 })),
    translate([cx, 0, -1], cylinder({ r: loopW / 2, h: hh + 2, $fn: 48 })),
  );
  // turned a quarter round, off the lathe's seam line
  cup = union(cup, rotate([0, 0, 90], union(web, ring)));
}
return difference(cup, revolve({ angle: 360, $fn: 96 }, bore));
