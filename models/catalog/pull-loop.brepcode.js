// Zipper pull: a big finger loop for a zip, a plug or a pull cord, with a ring hole or a snap-on cord clip.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: pull-loop.
const loopD = 28;       // [14:50] finger hole, mm
const band = 4;         // [2.5:8] band width round the hole, mm
const attach = "ring";  // [ring, clip] small hole or cord clip
const holeD = 4;        // [2:12] ring hole or cord diameter, mm
const tabL = 14;        // [6:40] tab length, mm
const thick = 4;        // [2:10] thickness, mm

// lying flat: the finger hole at the origin, the tab out along +x
const Ro = loopD / 2 + band;
const tw = holeD + 2 * Math.max(3, band);        // tab width
const tx = Ro + tabL;                            // the tab's attachment centre
const outer = hull(cylinder({ r: Ro, h: thick, $fn: 48 }), translate([tx, 0, 0], cylinder({ r: tw / 2, h: thick, $fn: 32 })));
const cuts = [translate([0, 0, -1], cylinder({ r: loopD / 2, h: thick + 2, $fn: 48 })),
  translate([tx, 0, -1], cylinder({ r: holeD / 2 + (attach === "clip" ? 0.1 : 0.2), h: thick + 2, $fn: 24 }))];
// a cord clip: a mouth narrower than the cord, so it snaps on
if (attach === "clip") cuts.push(translate([tx, -holeD * 0.36, -1], cube([tw, holeD * 0.72, thick + 2])));
return translate([-tx / 2, 0, 0], difference(outer, ...cuts));
