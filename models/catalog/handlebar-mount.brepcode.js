// Handlebar mount: a bolt-on bar clamp with a phone cradle, a bag hook, or a ring for a pump or U-lock.
// Print: standing as shown (bar axis up), no supports. One M4 bolt and nut close the clamp. PETG.
// Every number below is a slider (Params). From the BREPcode catalog: handlebar-mount.
const top = "phone";  // [phone, hook, ring] what it carries
const barD = 22.2;    // [15:40] bar diameter, mm
const width = 20;     // [12:60] clamp width along the bar, mm
const ringT = 4;      // [3:7] clamp ring thickness, mm
const screwD = 4.4;   // [3:6] clamp bolt hole, mm
const phoneW = 80;    // [55:100] phone width with its case, mm
const phoneT = 12;    // [6:20] phone thickness with its case, mm
const itemD = 25;     // [8:50] ring size (pump or lock shackle), mm
const drop = 30;      // [10:80] hook drop below the bar, mm
const hookW = 30;     // [15:60] hook width (room for handles), mm

// cross-section: the bar runs along z; y is up on the bike, x is fore and aft
const r = barD / 2 + 0.2;                        // a hair of room: the bolt does the gripping
const ro = r + ringT;
const gap = Math.max(2, ringT / 2);              // the split the bolt closes
const earL = 7 + screwD, earT = 4.5;
const plate = (pts) => linearExtrude({ h: width }, polygon(pts));
const box = (x0, y0, x1, y1) => plate([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const parts = [
  cylinder({ r: ro, h: width, $fn: 72 }),
  box(-ro - earL, gap / 2, -r + 0.5, gap / 2 + earT),           // the two ears, behind the bar
  box(-ro - earL, -gap / 2 - earT, -r + 0.5, -gap / 2),
];
const cuts = [
  translate([0, 0, -1], cylinder({ r, h: width + 2, $fn: 72 })),
  translate([-ro - earL - 1, -gap / 2, -1], cube([earL + ringT + 2, gap, width + 2])),
  // the bolt, across both ears
  translate([-ro - earL / 2, gap / 2 + earT + 1, width / 2], rotate([90, 0, 0], cylinder({ r: screwD / 2, h: gap + 2 * earT + 2, $fn: 24 }))),
];
if (top === "phone") {
  // a cradle on a stem above the bar; the phone slides in along the bar and is gripped by its long edges
  const sw = 12, yb = ro + 6;
  const iw = phoneW + 1, wl = 3;
  const inner = wl + phoneT + 1;                 // floor, phone, room
  parts.push(box(-sw / 2, r + 1, sw / 2, yb + 0.01));
  parts.push(box(-iw / 2 - wl, yb, iw / 2 + wl, yb + wl));
  for (const s of [-1, 1]) {
    parts.push(plate([[s * iw / 2, yb], [s * (iw / 2 + wl), yb], [s * (iw / 2 + wl), yb + inner + wl], [s * iw / 2, yb + inner + wl]]));
    parts.push(plate([[s * (iw / 2 - 4), yb + inner], [s * (iw / 2 + 0.01), yb + inner], [s * (iw / 2 + 0.01), yb + inner + wl], [s * (iw / 2 - 4), yb + inner + wl]]));
  }
  parts.push(translate([0, 0, 0], linearExtrude({ h: 2 }, polygon([[-iw / 2, yb], [iw / 2, yb], [iw / 2, yb + inner + wl], [-iw / 2, yb + inner + wl]]))));
} else if (top === "hook") {
  // a stem down from the bar, then a squared J that bag handles sit in
  const sw = 10, yb = -(ro + drop), ht = 6, tipH = 14;
  parts.push(box(-sw / 2, yb, sw / 2, -r - 1));
  parts.push(box(-sw / 2, yb - ht, hookW + sw / 2, yb + 0.01));
  parts.push(box(hookW + sw / 2 - 6, yb - ht, hookW + sw / 2, yb + tipH));
} else {
  // a second ring beside the bar, its mouth facing away, for a pump or a lock shackle
  const ri = itemD / 2, rr = ri + 3;
  const cx = ro + rr - 1.5;
  parts.push(translate([cx, 0, 0], cylinder({ r: rr, h: width, $fn: 64 })));
  cuts.push(translate([cx, 0, -1], cylinder({ r: ri, h: width + 2, $fn: 64 })));
  cuts.push(translate([cx + ri * 0.5, -ri * 0.8, -1], cube([rr, ri * 1.6, width + 2])));
}
return difference(union(...parts), ...cuts);
