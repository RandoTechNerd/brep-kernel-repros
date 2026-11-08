// Mirror clip: a screw-on clip that holds a frameless mirror, glass or acrylic panel by its edge.
// Print: lying on its side as shown, no supports. PETG or ASA; four or more clips for a mirror, deeper ones along the top.
// Every number below is a slider (Params). From the BREPcode catalog: mirror-clip.
const mirrorT = 6.35;  // [2:12] mirror or panel thickness, mm
const clear = 0.8;     // [0.2:2.5] room around the mirror in the channel, mm
const lipH = 8;        // [3:30] how far the lip laps over the mirror, mm
const lipT = 3;        // [2:6] front lip thickness, mm
const backT = 3;       // [1.5:10] how far the mirror stands off the wall, mm
const width = 20;      // [8:60] clip width, mm
const screwD = 4;      // [2.5:6] screw hole diameter, mm

// side profile: x out from the wall, y up the wall; extruded across the clip's width (z), printed lying on it
const gapX = mirrorT + clear;
const D = backT + gapX + lipT;                        // total depth from the wall
const blockH = Math.max(2 * screwD + 6, 12);          // the screw block under the mirror's edge
const yT = blockH + lipH;
const c = Math.min(1.5, lipT / 2);
const lead = Math.min(1, lipT / 3, lipH / 4);
const outline = polygon([
  [0, 0], [D - c, 0], [D, c],                         // bottom front corner, chamfered
  [D, yT - c], [D - c, yT],                           // top of the lip, chamfered
  [backT + gapX + lead, yT], [backT + gapX, yT - lead],  // a lead-in on the lip's inside edge
  [backT + gapX, blockH], [backT, blockH],            // the channel the edge sits in
  [backT, yT], [0, yT],                               // the back wall behind the mirror
]);
const body = linearExtrude({ h: width }, outline);

// a teardrop screw hole through the block (front to back), pointed up in print, countersunk on the front
const r = screwD / 2;
const tear = polygon([...Array.from({ length: 25 }, (_, i) => {
  const t = 3 * Math.PI / 4 + i * (3 * Math.PI / 2) / 24;
  return [r * Math.cos(t), r * Math.sin(t)];
}), [0, r * Math.SQRT2]]);
// rotate([90, 90, 0]) sends the profile's x to y, its y to z, and the extrusion to +x
const hole = translate([-1, blockH / 2, width / 2], rotate([90, 90, 0], linearExtrude({ h: D + 2 }, tear)));
const sink = translate([D + 0.01, blockH / 2, width / 2], rotate([0, -90, 0], cylinder({ r1: 2 * r, r2: r, h: r, $fn: 32 })));
return translate([-D / 2, -yT / 2, 0], difference(body, hole, sink));
