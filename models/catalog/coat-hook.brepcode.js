// Coat hook: a single wall hook with an upturned tip, screwed on or stuck on with an adhesive strip.
// Print: on its side as shown, no supports; the flat back goes against the wall.
// Every number below is a slider (Params). From the BREPcode catalog: coat-hook.
const reach = 45;       // [20:120] how far it sticks out, mm
const plateH = 70;      // [30:160] back plate height, mm
const width = 22;       // [10:80] hook width, mm
const armT = 8;         // [4:16] arm thickness, mm
const tipH = 14;        // [0:50] how far the tip turns up, mm
const angle = 10;       // [0:40] upward tilt of the arm, degrees
const prongs = 1;       // [1:2] prongs (2 = a short one above)
const plateT = 6;       // [3:12] back plate thickness, mm
const mount = "screw";  // [screw, adhesive] mounting
const screwD = 4.5;     // [3:6.5] screw hole diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it
const t = Math.tan(angle * Math.PI / 180);
const tipT = Math.max(3, armT * 0.8);
const gus = Math.min(armT, reach * 0.3);
const L = Math.max(reach, plateT + gus + tipT + 3);
// one arm: its underside starts at (x0, y0) on the plate and rises to the
// tip; the top comes back along the arm to a chamfer that braces it to the
// plate face. Returns the outline from the plate face round to the plate face.
const armPts = (x0, y0, len, up) => {
  const yb = (x) => y0 + (x - x0) * t;
  const top = yb(len) + armT + up;
  const rt = tipT / 2;
  const tip = up >= rt
    ? Array.from({ length: 13 }, (_, i) => [len - rt + rt * Math.cos(Math.PI * i / 12), top - rt + rt * Math.sin(Math.PI * i / 12)])
    : [[len, top], [len - tipT, top]];
  return [
    [x0, y0], [len, yb(len)], ...tip,
    [len - tipT, yb(len - tipT) + armT],
    [plateT + gus, yb(plateT + gus) + armT],
    [plateT, yb(plateT) + armT + gus],
  ];
};
const rootTop = plateT * t + armT + gus;
const H = Math.max(plateH, rootTop + 14);
const lower = [...armPts(0, 0, L, tipH), [plateT, H], [0, H]];
const parts = [linearExtrude({ h: width }, polygon(lower))];
// the second, shorter prong sits a little under halfway up the plate
const y2 = rootTop + (H - rootTop) * 0.4;
const top2 = y2 + 0.5 * t + armT + gus;
if (prongs > 1) {
  const upper = armPts(plateT - 0.5, y2, Math.max(plateT + gus + tipT + 3, L * 0.6), tipH * 0.7);
  parts.push(linearExtrude({ h: width }, polygon([...upper, [plateT - 0.5, upper[upper.length - 1][1]]])));
}
const piece = parts.length > 1 ? union(...parts) : parts[0];
if (mount !== "screw") return piece;

// countersunk screws through the plate, in whatever clear plate there is
const spans = prongs > 1 ? [[rootTop, y2], [top2 + 1, H]] : [[rootTop, H]];
const ys = spans.filter(([a, b]) => b - a >= 2.6 * screwD)
  .flatMap(([a, b]) => b - a >= 7 * screwD ? [a + (b - a) * 0.3, a + (b - a) * 0.75] : [(a + b) / 2]);
if (!ys.length) ys.push((rootTop + H) / 2);
const zs = width < 45 ? [width / 2] : [width * 0.25, width * 0.75];
const k = Math.min(screwD / 2, plateT - 1);
const holes = ys.flatMap((y) => zs.flatMap((z) => [
  translate([-1, y, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 }))),
  translate([plateT - k + 0.02, y, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]));
return difference(piece, ...holes);
