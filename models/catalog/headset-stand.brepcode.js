// Headphone stand: a desk stand with a curved saddle for a headband, on a wide base plate.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: headset-stand.
const height = 230;  // [120:300] height, mm
const saddleR = 70;  // [30:150] saddle curve radius, mm
const span = 110;    // [60:160] how far round the saddle reaches, degrees
const stemW = 24;    // [12:60] stem width, mm
const depth = 50;    // [25:120] saddle depth (headband width), mm
const baseW = 120;   // [60:220] base width, mm
const baseD = 110;   // [60:220] base depth, mm
const baseT = 6;     // [3:15] base thickness, mm

// end profile across the headband: x runs across, y runs up; pushed `depth` deep
const s = stemW / 2;
const th = span / 2 * Math.PI / 180;
const R = Math.min(saddleR, height * 0.6);
const cy = height - R;
const E = [R * Math.sin(th), cy + R * Math.cos(th)];   // the saddle's right tip
const sT = Math.max(6, stemW * 0.35);
const rise = Math.tan(55 * Math.PI / 180);
const Jy = Math.max(baseT + 4, E[1] - sT - Math.max(0, E[0] - s) * rise);
const tipY = Math.max(Jy + 1, E[1] - sT);
const arc = Array.from({ length: 33 }, (_, i) => {
  const t = Math.PI / 2 - th + (2 * th) * i / 32;
  return [R * Math.cos(t), cy + R * Math.sin(t)];
});
const outline = [[-s, baseT - 1], [s, baseT - 1], [s, Jy], [E[0], tipY], ...arc, [-E[0], tipY], [-s, Jy]];
const upright = translate([0, depth / 2, 0], rotate([90, 0, 0], linearExtrude({ h: depth }, polygon(outline))));
const r = Math.min(15, baseW / 4, baseD / 4);
const base = hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, j]) =>
  translate([i * (baseW / 2 - r), j * (baseD / 2 - r), 0], cylinder({ r, h: baseT, $fn: 32 }))));
return union(base, upright);
