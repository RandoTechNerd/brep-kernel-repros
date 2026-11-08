// Display slot stand: a low wedge with a leaning slot that stands up a record sleeve, trading card, graded slab or game case.
// Print: lying on its side as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: media-stand.
const slotT = 5;       // [0.8:30] slot width (what it holds), mm
const lean = 12;       // [0:30] lean back from upright, degrees
const depth = 60;      // [25:160] depth front to back, mm
const width = 100;     // [20:250] width, mm
const frontH = 10;     // [4:60] height at the front, mm
const backH = 22;      // [6:80] height at the back, mm
const slotDepth = 14;  // [4:60] slot depth, mm

// side profile: x runs front to back, y runs up; printed lying on it, `width` thick
const D = Math.max(depth, slotT + 20);
const a = lean * Math.PI / 180;
const u = [Math.sin(a), Math.cos(a)];            // up the slot, leaning back
const nb = [Math.cos(a), -Math.sin(a)];          // across the slot, toward the back
const k = (backH - frontH) / D;
const topY = (x) => frontH + k * x;
const xs = Math.min(D - slotT - 6, Math.max(D * 0.45, slotT / 2 + 6));
const B = [xs, Math.max(3, topY(xs) - slotDepth)];   // the slot's bottom centre
const Fb = [B[0] - nb[0] * slotT / 2, B[1] - nb[1] * slotT / 2];
const Bb = [B[0] + nb[0] * slotT / 2, B[1] + nb[1] * slotT / 2];
// where a line up the slot from P meets the top
const hit = (P) => { const t = (frontH + k * P[0] - P[1]) / (u[1] - k * u[0]); return [P[0] + t * u[0], P[1] + t * u[1]]; };
const outline = [[0, 0], [D, 0], [D, backH], hit(Bb), Bb, Fb, hit(Fb), [0, frontH]];
return translate([-D / 2, -backH / 2, 0], linearExtrude({ h: width }, polygon(outline)));
