// Side-release buckle: a two-part side-release buckle for webbing that prints flat, sized from the strap width.
// Print: both halves flat, side by side, no supports; the female's roof is a short bridge. PETG or nylon. Not load-rated: bags and straps, never a harness or anything you hang from.
// Every number below is a slider (Params). From the BREPcode catalog: strap-buckle.
const strapW = 25.4;  // [10:52] webbing width, mm
const strapT = 2.5;   // [1:5] webbing thickness, mm
const thick = 8;      // [5:14] buckle thickness, mm
const wall = 1.8;     // [1.2:3] sleeve wall, mm
const armT = 2.2;     // [1.4:3.5] barb arm thickness (stiffness), mm
const barb = 1.2;     // [0.6:2] barb height, mm
const fit = 0.3;      // [0.15:0.6] clearance per side, mm

// x runs along the strap (the male goes in toward +x), y across it, z up
const S = strapW;
const sh = strapT + 0.8;                         // strap slot height
const Wf = S + 12;                               // the female's outside width
const Wc = Wf - 2 * wall;                        // its channel
const hc = thick - 2 * wall;
const Lc = 0.7 * S + 8;                          // channel length
const ww = Math.max(4, Math.min(7, S / 4));      // window length
const xw = Lc - ww - 3;                          // window front edge
const Lf = Lc + 1.5 + sh + 3.5;
// ---- female: a sleeve open at x = 0, windows in the sides, a strap bar at the back
const female = difference(
  translate([0, -Wf / 2, 0], cube([Lf, Wf, thick])),
  translate([-1, -Wc / 2, wall], cube([Lc + 1, Wc, hc])),
  translate([xw, -Wf / 2 - 1, wall], cube([ww, Wf + 2, hc])),
  translate([Lc + 1.5, -(S + 1) / 2, -1], cube([sh, S + 1, thick + 2])),
);
// ---- male: a flat plate that slides into the channel
const hm = hc - 2 * fit;
const Wm = Wc - 2 * fit;
const Lb = 3.5 + sh + 3;                         // its base, outside the sleeve
const Lp = xw + ww - 0.4;                        // arm tips stop short of the channel's end
const gw = Math.max(3, Wm - 2 * armT - 2 * (barb + 0.6));
const slab = (pts) => linearExtrude({ h: hm }, polygon(pts));
const rampL = Math.min(4, ww - 1);
const xb = xw + 0.3;                             // the barb's square back, just behind the window's front edge
const arm = (s) => slab([
  [-0.01, s * (Wm / 2 - armT)], [-0.01, s * Wm / 2], [xb, s * Wm / 2], [xb, s * (Wm / 2 + barb)],
  [xb + rampL, s * Wm / 2], [Lp, s * (Wm / 2 - 0.6)], [Lp, s * (Wm / 2 - armT)],
]);
const male = difference(
  union(
    translate([-Lb, -Wf / 2, 0], cube([Lb + 0.01, Wf, hm])),
    arm(1), arm(-1),
    translate([-0.01, -gw / 2, 0], cube([Lp - 1, gw, hm])),          // the centre tongue
  ),
  translate([-Lb + 3.5, -(S + 1) / 2, -1], cube([sh, S + 1, hm + 2])),
);
// side by side on the bed
return group(translate([2, 0, 0], female), translate([-Lb - 4, Wf + 8, 0], male));
