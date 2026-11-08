// Guy line tensioner: a flat three-hole tensioner that tightens and holds a tent guy line, tarp cord or clothesline.
// Print: flat as shown, no supports. PETG or nylon outdoors.
// Every number below is a slider (Params). From the BREPcode catalog: line-tensioner.
const cordD = 3;    // [1:9] line diameter (the holes are 0.8 mm bigger), mm
const holes = 3;    // [2:3] holes
const length = 38;  // [20:80] length, mm
const width = 13;   // [7:30] width, mm
const thick = 3.5;  // [2:7] thickness, mm

const r = width / 2;
const h = Math.min(cordD + 0.8, width - 3);     // the hole: the line plus a little, 1.5 mm of plastic either side
const L = Math.max(length, holes * (h + 3) + 4);
const plate = hull(translate([-L / 2 + r, 0, 0], cylinder({ r, h: thick, $fn: 40 })), translate([L / 2 - r, 0, 0], cylinder({ r, h: thick, $fn: 40 })));
// holes spread from end to end, the outer two near the ends
const span = L - 2 * Math.max(r, h / 2 + 3);
const xs = holes === 2 ? [-span / 2, span / 2] : [-span / 2, 0, span / 2];
return difference(plate, ...xs.map((x) => translate([x, 0, -1], cylinder({ r: h / 2, h: thick + 2, $fn: 24 }))));
