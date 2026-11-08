// Toothpaste squeezer: a slit slider (or a winding key) that squeezes the last of the toothpaste, cream or paint out of a tube.
// Print: flat as shown (the key stands on its grip), no supports. PLA or PETG.
// Every number below is a slider (Params). From the BREPcode catalog: toothpaste-squeezer.
const tubeW = 60;        // [20:120] flattened tube width (slit length), mm
const slitW = 2.4;       // [1:6] slit gap, mm
const plateT = 7;        // [4:16] slider thickness, mm
const depth = 24;        // [14:50] slider front-to-back size, mm
const grip = 18;         // [8:40] finger pad size each side, mm
const style = "slider";  // [slider, key, both] style

const L = tubeW + 2;                                  // slit length, a millimetre of room each side
const gap = Math.min(slitW, depth / 3);

// the slider: a bar with a round finger pad at each end
const padR = Math.max(depth / 2 + 2, grip / 2 + 4);
const xPad = L / 2 + 3 + padR * 0.7;
const pad = (sx) => translate([sx * xPad, 0, 0], cylinder({ r: padR, h: plateT, $fn: 48 }));
const barShape = hull(
  translate([-xPad, -depth / 2, 0], cube([2 * xPad, depth, plateT])),
  pad(-1), pad(1),
);
// the slit, with a 45 degree lead-in along its top edges so the tube finds it
const lead = Math.min(1.5, plateT / 3);
const slitCut = union(
  hull(translate([-L / 2 + gap / 2, 0, -1], cylinder({ r: gap / 2, h: plateT + 2, $fn: 16 })),
    translate([L / 2 - gap / 2, 0, -1], cylinder({ r: gap / 2, h: plateT + 2, $fn: 16 }))),
  translate([-L / 2, 0, plateT - lead], rotate([90, 90, 0], linearExtrude({ h: L }, polygon([[-gap / 2, 0], [gap / 2, 0], [gap / 2 + lead + 0.01, lead + 0.01], [-gap / 2 - lead - 0.01, lead + 0.01]])))),
);
// a shallow thumb dish in each pad
const dimple = (sx) => translate([sx * xPad, 0, plateT + padR * 2.2 - Math.min(1.6, plateT / 4)], sphere({ r: padR * 2.2, $fn: 64 }));
const slider = difference(barShape, slitCut, dimple(-1), dimple(1));

// the key: a slotted post standing on a flat paddle grip; the slot is as
// long as the tube is wide, because the crimped end goes in along the post
const postR = Math.max(7, gap / 2 + 5);
const finH = Math.min(26, 14 + grip / 2), finT = Math.max(5, Math.min(8, plateT));
const slotZ = finH + 2;
const postH = slotZ + L + 4;
const finW = 2 * postR + 2 * grip;
const fc = Math.min(6, grip / 2);
const fin = translate([0, finT / 2, 0], rotate([90, 0, 0], linearExtrude({ h: finT }, polygon([
  [-finW / 2, 0], [finW / 2, 0], [finW / 2, finH - fc], [finW / 2 - fc, finH], [-finW / 2 + fc, finH], [-finW / 2, finH - fc]]))));
const post = union(
  cylinder({ r: postR, h: postH - 2, $fn: 40 }),
  translate([0, 0, postH - 2.01], cylinder({ r1: postR, r2: postR - 2, h: 2.01, $fn: 40 })),
);
const keyPart = difference(union(post, fin),
  translate([-gap / 2, -postR - 1, slotZ], cube([gap, 2 * postR + 2, postH])));

if (style === "key") return keyPart;
if (style === "both") return group(slider, translate([0, depth / 2 + padR + postR + 12, 0], keyPart));
return slider;
