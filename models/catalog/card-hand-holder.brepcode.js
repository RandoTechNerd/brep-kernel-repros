// Playing card holder: a bar with a pinching V-slot (or stepped rows of them) that holds a hand of cards upright.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: card-hand-holder.
const length = 180;      // [60:250] length, mm
const height = 22;       // [12:45] front row height, mm
const slots = 1;         // [1:3] rows
const slotTop = 2.6;     // [1:14] slot width at the top, mm
const slotBottom = 0.6;  // [0.3:13] slot width at the bottom (the pinch), mm
const slotDepth = 15;    // [5:35] slot depth, mm
const rise = 12;         // [0:25] each row higher than the last by, mm
const base = 34;         // [18:70] base depth (front to back, one row), mm

// end profile: x runs front to back, y runs up; pushed along the length
const st = Math.max(slotTop, slotBottom + 0.2);
const band = st + 12;                            // depth each extra row adds
const D = base + (slots - 1) * band;
const yc = (k) => base / 2 + k * band;           // slot k's centre
const top = (k) => height + k * rise;
const prof = [[0, 0], [D, 0], [D, top(slots - 1)]];
for (let k = slots - 1; k >= 1; k--) prof.push([yc(k) - band / 2, top(k)], [yc(k) - band / 2, top(k - 1)]);
prof.push([Math.min(4, base / 6), top(0)], [0, top(0) - Math.min(4, base / 6)]);
// a profile (x, y) pushed along x from 0 to the length
const along = (pts, h) => rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h }, polygon(pts))));
const bar = along(prof, length);
const sd = (k) => Math.min(slotDepth, top(k) - 3);
const cuts = Array.from({ length: slots }, (_, k) => translate([-1, 0, 0], along([[yc(k) - st / 2, top(k) + 1], [yc(k) - slotBottom / 2, top(k) - sd(k)],
  [yc(k) + slotBottom / 2, top(k) - sd(k)], [yc(k) + st / 2, top(k) + 1]], length + 2)));
return translate([-length / 2, -D / 2, 0], difference(bar, ...cuts));
